/**
 * CKW Context Monitor Hook
 *
 * Tracks context window usage and warns when reference materials
 * are consuming too much space, leaving insufficient room for
 * actual work.
 *
 * This hook runs as a Claude Code PreToolUse hook to monitor
 * file reads and estimate cumulative context loading.
 *
 * Configuration: Add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "matcher": "Read|Glob|Grep",
 *       "hook": "node hooks/ckw-context-monitor.js"
 *     }]
 *   }
 * }
 */

const fs = require("fs");
const path = require("path");

// Rough token estimation: ~4 chars per token for English prose
const CHARS_PER_TOKEN = 4;
const MAX_CONTEXT_TOKENS = 200000;
const WARNING_THRESHOLD = 0.6; // Warn at 60% context usage
const CRITICAL_THRESHOLD = 0.8; // Critical at 80%

// State file for tracking cumulative usage across tool calls
const STATE_FILE = path.join(process.cwd(), ".planning", ".context-usage.json");

function getUsageState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {
    // Ignore parse errors
  }
  return { files_loaded: {}, total_estimated_tokens: 0, session_start: new Date().toISOString() };
}

function saveUsageState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function estimateTokens(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.ceil(stats.size / CHARS_PER_TOKEN);
  } catch {
    return 0;
  }
}

function main() {
  // Read hook input from stdin
  let input = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => (input += chunk));
  process.stdin.on("end", () => {
    try {
      const hookData = JSON.parse(input);
      const toolName = hookData.tool_name || "";
      const toolInput = hookData.tool_input || {};

      // Only track file reads
      if (toolName === "Read" && toolInput.file_path) {
        const state = getUsageState();
        const filePath = toolInput.file_path;

        if (!state.files_loaded[filePath]) {
          const tokens = estimateTokens(filePath);
          state.files_loaded[filePath] = {
            tokens,
            loaded_at: new Date().toISOString(),
          };
          state.total_estimated_tokens += tokens;
          saveUsageState(state);

          const usagePercent = state.total_estimated_tokens / MAX_CONTEXT_TOKENS;

          if (usagePercent >= CRITICAL_THRESHOLD) {
            // Output warning to stderr (visible in Claude Code)
            console.error(
              `⚠️  CKW Context: ${Math.round(usagePercent * 100)}% estimated usage. ` +
                `Consider using reference summaries instead of full documents.`
            );
          } else if (usagePercent >= WARNING_THRESHOLD) {
            console.error(
              `📊 CKW Context: ${Math.round(usagePercent * 100)}% estimated usage. ` +
                `${Math.round((1 - usagePercent) * MAX_CONTEXT_TOKENS)} tokens remaining.`
            );
          }
        }
      }

      // Always allow the tool to proceed
      process.stdout.write(JSON.stringify({ decision: "approve" }));
    } catch {
      // On any error, approve and move on
      process.stdout.write(JSON.stringify({ decision: "approve" }));
    }
  });
}

main();
