#!/usr/bin/env node
/**
 * CKW static CI checks — no side effects, stdlib only. Exits 1 on any failure.
 *
 *   - Manifests parse and carry required fields (plugin.json, marketplace.json, package.json)
 *   - hooks/hooks.json wires SessionStart to ckw-session-init.js, and that file exists
 *   - Every command in commands/ckw/ is referenced in help.md AND docs/USER-GUIDE.md
 *
 * (A full `claude plugin validate` can be run locally where the CLI is available;
 *  this is the CI-safe subset that needs no external tooling.)
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const p = (rel) => path.join(root, rel);
const errors = [];
const fail = (m) => errors.push(m);

function readJSON(rel) {
  try {
    return JSON.parse(fs.readFileSync(p(rel), "utf8"));
  } catch (e) {
    fail(`${rel}: ${e.message}`);
    return null;
  }
}

// 1. Manifests
const plugin = readJSON(".claude-plugin/plugin.json");
if (plugin && !plugin.name) fail("plugin.json: missing required field 'name'");
const market = readJSON(".claude-plugin/marketplace.json");
if (market && !(Array.isArray(market.plugins) && market.plugins.length)) {
  fail("marketplace.json: missing non-empty 'plugins' array");
}
readJSON("package.json");

// 2. Hook wiring
const hooks = readJSON("hooks/hooks.json");
if (hooks) {
  const ss = hooks.hooks && hooks.hooks.SessionStart;
  if (!Array.isArray(ss) || ss.length === 0) {
    fail("hooks.json: no SessionStart entry");
  } else {
    const cmd = ss.flatMap((e) => e.hooks || []).map((h) => h.command || "").join(" ");
    if (!cmd.includes("ckw-session-init.js")) {
      fail("hooks.json: SessionStart does not reference ckw-session-init.js");
    }
  }
}
if (!fs.existsSync(p("hooks/ckw-session-init.js"))) fail("hooks/ckw-session-init.js is missing");

// 3. Command coverage — every command documented in help.md and USER-GUIDE.md
const help = fs.readFileSync(p("commands/ckw/help.md"), "utf8");
const guide = fs.readFileSync(p("docs/USER-GUIDE.md"), "utf8");
const commands = fs
  .readdirSync(p("commands/ckw"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => "/ckw:" + f.replace(/\.md$/, ""));
for (const name of commands) {
  if (!help.includes(name)) fail(`help.md is missing a reference to ${name}`);
  if (!guide.includes(name)) fail(`docs/USER-GUIDE.md is missing a reference to ${name}`);
}

if (errors.length) {
  console.error("CI static checks FAILED:");
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(1);
}
console.log(`CI static checks passed (${commands.length} commands covered).`);
