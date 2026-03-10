/**
 * CKW Status Line Hook
 *
 * Displays current project status in Claude Code's status line.
 * Shows the current phase, task progress, and any blockers.
 *
 * Configuration: Add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "Notification": [{
 *       "matcher": ".*",
 *       "hook": "node hooks/ckw-statusline.js"
 *     }]
 *   }
 * }
 */

const fs = require("fs");
const path = require("path");

function getProjectStatus() {
  const stateFile = path.join(process.cwd(), "STATE.md");

  if (!fs.existsSync(stateFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(stateFile, "utf-8");

    // Parse YAML frontmatter
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) return null;

    const yaml = yamlMatch[1];
    const status = {};

    // Simple YAML parsing for key fields
    for (const line of yaml.split("\n")) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        status[match[1]] = match[2].trim();
      }
    }

    return status;
  } catch {
    return null;
  }
}

function formatStatusLine(status) {
  if (!status) return "CKW: No project";

  const project = status.project || "Unknown";
  const phase = status.current_phase || "?";
  const phasesTotal = status.phases_total || "?";
  const projectStatus = status.status || "unknown";

  return `CKW: ${project} — Phase ${phase}/${phasesTotal} [${projectStatus}]`;
}

function main() {
  const status = getProjectStatus();
  const statusLine = formatStatusLine(status);

  // Output the status line
  process.stdout.write(
    JSON.stringify({
      iconColor: status ? "#4CAF50" : "#9E9E9E",
      text: statusLine,
    })
  );
}

main();
