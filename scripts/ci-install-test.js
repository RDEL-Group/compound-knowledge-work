#!/usr/bin/env node
/**
 * CKW installer smoke test — cross-platform (Linux/macOS/Windows), stdlib only.
 *
 * Runs `bin/install.js --defaults` non-interactively into a throwaway directory
 * (with HOME/USERPROFILE redirected so it can't touch a real ~/.ckw), then asserts
 * the SessionStart hook it registered points at a file that actually exists on disk.
 * This is the regression guard for the v1.0.0 bug where the default install
 * registered a hook path that was never populated.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const install = path.join(process.cwd(), "bin", "install.js");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ckw-ci-"));

try {
  cp.execFileSync(process.execPath, [install, "--defaults"], {
    cwd: dir,
    stdio: "inherit",
    env: { ...process.env, HOME: dir, USERPROFILE: dir },
  });

  // --defaults installs project-local, so settings.json lands in <dir>/.claude
  const settingsPath = path.join(dir, ".claude", "settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

  let cmd = null;
  for (const entry of settings.hooks.SessionStart) {
    for (const h of entry.hooks || []) {
      if ((h.command || "").includes("ckw-session-init")) cmd = h.command;
    }
  }
  if (!cmd) throw new Error("SessionStart hook was not registered in settings.json");

  const m = cmd.match(/node "(.+)"/);
  if (!m) throw new Error(`could not parse hook command: ${cmd}`);
  if (!fs.existsSync(m[1])) throw new Error(`registered hook file does not exist: ${m[1]}`);

  console.log(`OK: installer registered a hook that exists on disk → ${m[1]}`);
} finally {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}
