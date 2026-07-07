#!/usr/bin/env node
/**
 * CKW version manager — the single source of truth for the plugin version.
 *
 *   node scripts/bump-version.js            Show every version site + consistency
 *   node scripts/bump-version.js --check    Exit 1 if any site disagrees (CI gate)
 *   node scripts/bump-version.js 1.0.1      Set every version site to 1.0.1
 *
 * Sites: package.json, .claude-plugin/plugin.json,
 * .claude-plugin/marketplace.json (marketplace metadata + the plugin entry),
 * bin/install.js (VERSION const), and the README version badge.
 * package.json is the canonical version for reads. Writes are value-only
 * (regex), so existing file formatting is preserved. Stdlib only.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const p = (rel) => path.join(root, rel);

// In these JSON files every "version" key IS the plugin version
// (marketplace.json carries it in both metadata and the plugin entry).
const JSON_FILES = ["package.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"];

const TEXT_SITES = [
  { file: "bin/install.js", label: "bin/install.js", re: /const VERSION = "([^"]+)"/, repl: (v) => `const VERSION = "${v}"` },
  { file: "README.md", label: "README badge", re: /version-(\d+\.\d+\.\d+)-green/, repl: (v) => `version-${v}-green` },
];

function jsonVersions(rel) {
  const o = JSON.parse(fs.readFileSync(p(rel), "utf8"));
  const out = [];
  if (o.version !== undefined) out.push([rel, o.version]);
  if (o.metadata && o.metadata.version !== undefined) out.push([`${rel} (metadata)`, o.metadata.version]);
  if (Array.isArray(o.plugins)) {
    o.plugins.forEach((pl, i) => {
      if (pl && pl.version !== undefined) out.push([`${rel} (plugins[${i}])`, pl.version]);
    });
  }
  return out;
}

function readAll() {
  const out = [];
  for (const f of JSON_FILES) out.push(...jsonVersions(f));
  for (const s of TEXT_SITES) {
    const m = fs.readFileSync(p(s.file), "utf8").match(s.re);
    out.push([s.label, m ? m[1] : null]);
  }
  return out;
}

function setAll(v) {
  for (const f of JSON_FILES) {
    const t = fs.readFileSync(p(f), "utf8");
    fs.writeFileSync(p(f), t.replace(/("version"\s*:\s*")[^"]*"/g, `$1${v}"`));
  }
  for (const s of TEXT_SITES) {
    const t = fs.readFileSync(p(s.file), "utf8");
    if (!s.re.test(t)) throw new Error(`version pattern not found in ${s.file}`);
    fs.writeFileSync(p(s.file), t.replace(s.re, s.repl(v)));
  }
}

const all = readAll();
const canonical = all.find(([n]) => n === "package.json")[1];
const mismatches = all.filter(([, v]) => v !== canonical);
const arg = process.argv[2];

if (!arg) {
  console.log("CKW version sites:");
  for (const [n, v] of all) console.log(`  ${v === canonical ? "✓" : "✗"} ${n}: ${v ?? "(not found)"}`);
  console.log(
    mismatches.length
      ? `\nInconsistent — ${mismatches.length} site(s) disagree with package.json (${canonical}).`
      : `\nAll consistent at ${canonical}.`
  );
  process.exit(0);
}

if (arg === "--check") {
  if (mismatches.length) {
    console.error(`Version mismatch (canonical package.json = ${canonical}):`);
    for (const [n, v] of mismatches) console.error(`  ✗ ${n}: ${v ?? "(not found)"}`);
    process.exit(1);
  }
  console.log(`Versions consistent at ${canonical}.`);
  process.exit(0);
}

const v = arg.replace(/^v/, "");
if (!/^\d+\.\d+\.\d+$/.test(v)) {
  console.error(`Not a valid X.Y.Z version: "${arg}"`);
  process.exit(1);
}
setAll(v);
console.log(`Set all version sites to ${v}. Remember to update CHANGELOG.md.`);
