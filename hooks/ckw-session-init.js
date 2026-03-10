/**
 * CKW Session Init Hook
 *
 * Detects CKW project directories at session start and surfaces
 * project status so users don't need to manually invoke a command.
 *
 * Reads STATE.md to get project name, phase, and status.
 * Outputs context message that gets injected into the conversation.
 * Silently no-ops if not in a CKW project directory.
 *
 * Configuration: Add to ~/.claude/settings.json:
 * {
 *   "hooks": {
 *     "SessionStart": [{
 *       "matcher": "startup|resume",
 *       "hooks": [{
 *         "type": "command",
 *         "command": "node ~/.claude/hooks/ckw-session-init.js"
 *       }]
 *     }]
 *   }
 * }
 */

const fs = require("fs");
const path = require("path");

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split("\n")) {
    const kvMatch = line.match(/^(\w[\w_]*):\s*(.+)$/);
    if (kvMatch) {
      result[kvMatch[1]] = kvMatch[2].trim();
    }
  }

  return result;
}

function findActionItems(content) {
  const items = [];
  const regex = /\[ACTION REQUIRED[:\s]*([^\]]*)\]/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) items.push(match[1].trim());
  }
  return items;
}

function main() {
  let input = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => (input += chunk));
  process.stdin.on("end", () => {
    try {
      const hookData = JSON.parse(input);
      const cwd = hookData.cwd || process.cwd();

      const stateFile = path.join(cwd, "STATE.md");

      // Not a CKW project — exit silently
      if (!fs.existsSync(stateFile)) {
        process.exit(0);
        return;
      }

      const stateContent = fs.readFileSync(stateFile, "utf-8");
      const state = parseYamlFrontmatter(stateContent);
      const actionItems = findActionItems(stateContent);

      const project = state.project || "Unknown Project";
      const currentPhase = state.current_phase || "?";
      const phasesTotal = state.phases_total || "?";
      const status = state.status || "unknown";

      // Build context message
      const lines = [];
      lines.push(`CKW Project: ${project}`);
      lines.push(`Phase ${currentPhase}/${phasesTotal} — Status: ${status}`);

      if (actionItems.length > 0) {
        lines.push("");
        lines.push(`Action items (${actionItems.length}):`);
        for (const item of actionItems.slice(0, 5)) {
          lines.push(`  - ${item}`);
        }
        if (actionItems.length > 5) {
          lines.push(`  ... and ${actionItems.length - 5} more`);
        }
      }

      lines.push("");

      // Suggest next command based on status
      if (status === "planned") {
        lines.push("Ready to execute. Run /ckw:execute-phase to start drafting.");
      } else if (status === "in-progress" || status === "executing") {
        lines.push("Execution in progress. Run /ckw:execute-phase to continue.");
      } else if (status === "drafted") {
        lines.push("Drafts complete. Run /ckw:review-phase to review.");
      } else if (status === "reviewed") {
        lines.push("Review complete. Run /ckw:compound to capture learnings, or /ckw:complete-project to close out.");
      } else {
        lines.push("Run /ckw:progress for full project status.");
      }

      process.stdout.write(lines.join("\n"));
    } catch {
      // On any error, exit silently — don't block session start
    }

    process.exit(0);
  });
}

main();
