#!/usr/bin/env node

/**
 * Compound Knowledge Work (CKW) — Installer
 *
 * Installs the CKW plugin into the current project or globally.
 * Sets up commands, agents, skills, and hooks for Claude Code.
 *
 * Usage: npx compound-knowledge-work@latest
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PLUGIN_NAME = "compound-knowledge-work";
const VERSION = "0.1.0";
const CKW_HOME = path.join(require("os").homedir(), ".ckw");

// ─── Helpers ───────────────────────────────────────────────────────────────

function ask(rl, question, defaultVal) {
  return new Promise((resolve) => {
    const prompt = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultVal || "");
    });
  });
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║     Compound Knowledge Work (CKW) v" + VERSION + "        ║");
  console.log("║                                                  ║");
  console.log("║  Spec-driven knowledge work with compounding     ║");
  console.log("║  institutional memory.                           ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");

  // Step 1: Personalization
  const userName = await ask(rl, "What's your name?", "");
  console.log(`\nHi ${userName}! Let's get CKW set up.\n`);

  // Step 2: Shared knowledge repo
  console.log("CKW stores cross-project learnings in a shared team repo.");
  console.log("This is where solutions, skills, templates, and playbooks live");
  console.log("so your whole team benefits from compounded knowledge.\n");
  const knowledgeRepoPath = await ask(
    rl,
    "Path to your team's shared knowledge repo (or press Enter to skip for now)",
    ""
  );

  // Step 3: Install location
  console.log("\nWhere should CKW install its commands and agents?\n");
  console.log("  1) This project only (current directory)");
  console.log("  2) Globally (available in all projects)");
  const installChoice = await ask(rl, "\nChoose 1 or 2", "1");
  const isGlobal = installChoice === "2";

  const installDir = isGlobal
    ? path.join(require("os").homedir(), ".claude")
    : path.join(process.cwd(), ".claude");

  // Step 4: Install
  console.log("\nInstalling CKW...\n");

  const pluginRoot = path.resolve(__dirname, "..");

  // Copy commands
  const commandsSrc = path.join(pluginRoot, "commands", "ckw");
  const commandsDest = path.join(installDir, "commands", "ckw");
  if (fs.existsSync(commandsSrc)) {
    copyDir(commandsSrc, commandsDest);
    const commandCount = fs.readdirSync(commandsSrc).filter((f) => f.endsWith(".md")).length;
    console.log(`  ✓ ${commandCount} commands installed → ${commandsDest}`);
  }

  // Copy agents
  const agentsSrc = path.join(pluginRoot, "agents");
  const agentsDest = path.join(installDir, "agents");
  if (fs.existsSync(agentsSrc)) {
    copyDir(agentsSrc, agentsDest);
    const agentCount = fs.readdirSync(agentsSrc).filter((f) => f.endsWith(".md")).length;
    console.log(`  ✓ ${agentCount} agents installed → ${agentsDest}`);
  }

  // Copy built-in skills
  const skillsSrc = path.join(pluginRoot, "skills");
  const skillsDest = path.join(installDir, "skills");
  if (fs.existsSync(skillsSrc)) {
    copyDir(skillsSrc, skillsDest);
    const skillDirs = fs
      .readdirSync(skillsSrc, { withFileTypes: true })
      .filter((d) => d.isDirectory()).length;
    console.log(`  ✓ ${skillDirs} built-in skills installed → ${skillsDest}`);
  }

  // Copy hooks
  const hooksSrc = path.join(pluginRoot, "hooks");
  const hooksDest = path.join(installDir, "hooks");
  if (fs.existsSync(hooksSrc)) {
    copyDir(hooksSrc, hooksDest);
    console.log(`  ✓ Hooks installed → ${hooksDest}`);
  }

  // Register SessionStart hook in settings.json
  const settingsPath = path.join(installDir, "settings.json");
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch (e) {
      // If settings.json is malformed, preserve raw content and warn
      console.log(`  ⚠ settings.json exists but couldn't be parsed — skipping hook registration`);
      console.log(`    You can manually add the SessionStart hook later.`);
      settings = null;
    }
  }

  if (settings !== null) {
    if (!settings.hooks) settings.hooks = {};
    if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];

    const isWindows = process.platform === "win32";
    const hookCmd = isWindows
      ? `node ~/.claude/hooks/ckw-session-init.js`
      : `bash ~/.claude/hooks/ckw-session-init.sh`;
    const alreadyRegistered = settings.hooks.SessionStart.some(
      (entry) =>
        entry.hooks &&
        entry.hooks.some((h) => h.command && h.command.includes("ckw-session-init"))
    );

    if (!alreadyRegistered) {
      settings.hooks.SessionStart.push({
        matcher: "startup|resume",
        hooks: [{ type: "command", command: hookCmd }],
      });
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log(`  ✓ SessionStart hook registered → ${settingsPath}`);
    } else {
      console.log(`  ○ SessionStart hook already registered`);
    }
  }

  // Set up ~/.ckw/
  ensureDir(CKW_HOME);

  // Create config.json (with projects registry for path aliases)
  const configPath = path.join(CKW_HOME, "config.json");
  let config;
  if (fs.existsSync(configPath)) {
    // Preserve existing config (especially projects registry)
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.version = VERSION;
    config.user = { name: userName };
    if (knowledgeRepoPath && !config.knowledge_repos.includes(knowledgeRepoPath)) {
      config.knowledge_repos.push(knowledgeRepoPath);
    }
    config.install_type = isGlobal ? "global" : "local";
    config.install_path = installDir;
  } else {
    config = {
      version: VERSION,
      user: { name: userName },
      knowledge_repos: knowledgeRepoPath ? [knowledgeRepoPath] : [],
      projects: {},
      install_type: isGlobal ? "global" : "local",
      install_path: installDir,
      created_at: new Date().toISOString(),
    };
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`  ✓ Config created → ${configPath}`);

  // Create SYSTEM.md if it doesn't exist
  const systemMdPath = path.join(CKW_HOME, "SYSTEM.md");
  if (!fs.existsSync(systemMdPath)) {
    const systemMd = `# CKW System — Personal Preferences

## About Me
- **Name:** ${userName}
- **Setup date:** ${new Date().toISOString().split("T")[0]}

## Communication Style
<!-- How you prefer Claude to interact with you -->
<!-- e.g., "Direct and concise", "Walk me through reasoning", etc. -->

## Workflow Preferences
<!-- Your preferred working patterns -->
<!-- e.g., "Always start with a project plan", "I like to see outlines before full drafts" -->

## Quality Standards
<!-- What "good" looks like to you -->
<!-- e.g., "Formal tone for client-facing work", "Use data to support claims" -->

---
*This file evolves over time via /ckw:compound. Each project's learnings can update these preferences.*
`;
    fs.writeFileSync(systemMdPath, systemMd);
    console.log(`  ✓ Personal SYSTEM.md created → ${systemMdPath}`);
  } else {
    console.log(`  ○ Personal SYSTEM.md already exists → ${systemMdPath}`);
  }

  // Done
  console.log("\n══════════════════════════════════════════════════");
  console.log("  CKW installed successfully!");
  console.log("══════════════════════════════════════════════════\n");
  console.log("  Quick start:");
  console.log("    /ckw:new-project     Start a new knowledge work project");
  console.log("    /ckw:adopt-project   Import an existing project into CKW");
  console.log("    /ckw:quick           Run a quick ad-hoc task");
  console.log("    /ckw:help            See all available commands");
  console.log("");

  if (!knowledgeRepoPath) {
    console.log("  Note: No shared knowledge repo configured yet.");
    console.log("  You can add one later in ~/.ckw/config.json\n");
  }

  rl.close();
}

main().catch((err) => {
  console.error("Installation failed:", err.message);
  process.exit(1);
});
