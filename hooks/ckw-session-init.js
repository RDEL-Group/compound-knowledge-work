/**
 * CKW Session Init Hook
 *
 * Detects CKW project directories at session start and surfaces
 * project status so users don't need to manually invoke a command.
 *
 * Reads STATE.md to get project name, phase, and status.
 * Outputs a context message that gets injected into the conversation.
 * Silently no-ops if not in a CKW project directory.
 *
 * Registration:
 *   - Marketplace installs: shipped via hooks/hooks.json (auto-discovered).
 *   - npx installs: registered in settings.json by bin/install.js.
 * Both point SessionStart (matcher "startup|resume") at this file. This is
 * the single cross-platform hook — Node is guaranteed wherever Claude Code runs.
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

// Catches both action-item forms CKW commands emit:
//   1. [ACTION REQUIRED: description]        (ckw-executor form — text inside brackets)
//   2. [ACTION REQUIRED] trailing text ...   (adopt-project / new-project / plan-phase form)
//      including markdown-emphasised **[ACTION REQUIRED]** variants.
function findActionItems(content) {
  const items = [];
  for (const line of content.split("\n")) {
    // Require the opening bracket so prose mentions ("action required soon")
    // don't register as items — both documented forms bracket the marker.
    if (!/\[ACTION REQUIRED/i.test(line)) continue;

    let text;
    const bracketed = line.match(/\[ACTION REQUIRED[:\s]+([^\]]+)\]/i);
    if (bracketed && bracketed[1].trim()) {
      // Form 1: description lives inside the brackets after the colon.
      text = bracketed[1].trim();
    } else {
      // Form 2: strip through the marker (and any closing bracket / colon / **),
      // then take the trailing text.
      text = line
        .replace(/.*ACTION REQUIRED[\]:*\s]*/i, "")
        .replace(/^[-*\s]+/, "")
        .trim();
    }

    if (text) items.push(text);
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

      // Suggest next command based on the STATE.md status field.
      // Covers the canonical status enum; values commands write today are
      // scoped / in-progress / reviewing / complete / paused.
      switch (status) {
        case "scoped":
          lines.push("Project scoped. Run /ckw:brainstorm to explore the approach, or /ckw:plan-phase to break the next phase into tasks.");
          break;
        case "planned":
          lines.push("Phase planned. Run /ckw:execute-phase to start drafting.");
          break;
        case "in-progress":
        case "executing":
          lines.push("Work in progress. Run /ckw:execute-phase to continue, or /ckw:resume-work for full context.");
          break;
        case "drafted":
          lines.push("Drafts complete. Run /ckw:review-phase to run a quality check.");
          break;
        case "reviewing":
          lines.push("Content under review. Check REVIEW_REPORT.md, then /ckw:execute-phase --revisions for any P1 fixes.");
          break;
        case "reviewed":
          lines.push("Review complete. Run /ckw:compound to capture what worked, or /ckw:complete-project to close out.");
          break;
        case "complete":
          lines.push("Project complete. Run /ckw:compound to capture additional learnings, or /ckw:search-solutions to reuse patterns.");
          break;
        case "paused":
          lines.push("Project paused. Run /ckw:resume-work to pick up with handoff context.");
          break;
        default:
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
