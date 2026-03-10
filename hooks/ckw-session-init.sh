#!/bin/bash
#
# CKW Session Init Hook
#
# Detects CKW project directories at session start and surfaces
# project status so users don't need to manually invoke a command.
#
# Reads STATE.md to get project name, phase, and status.
# Outputs context message that gets injected into the conversation.
# Silently no-ops if not in a CKW project directory.
#
# Configuration: Add to ~/.claude/settings.json:
# {
#   "hooks": {
#     "SessionStart": [{
#       "matcher": "startup|resume",
#       "hooks": [{
#         "type": "command",
#         "command": "bash ~/.claude/hooks/ckw-session-init.sh"
#       }]
#     }]
#   }
# }

# Read hook input from stdin into a temp file (so we can parse it robustly)
HOOK_INPUT=$(mktemp)
cat > "$HOOK_INPUT"

# Extract cwd from JSON using python3 (handles special chars in Google Drive paths)
CWD=$(python3 -c "import sys,json; print(json.load(open(sys.argv[1])).get('cwd',''))" "$HOOK_INPUT" 2>/dev/null)
rm -f "$HOOK_INPUT"

# Fallback to current directory if parsing fails
if [ -z "$CWD" ]; then
  CWD="$(pwd)"
fi

STATE_FILE="$CWD/STATE.md"

# Not a CKW project — exit silently
if [ ! -f "$STATE_FILE" ]; then
  exit 0
fi

# Parse YAML frontmatter from STATE.md
# Extract values between --- markers
FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$STATE_FILE" | sed '1d;$d')

get_value() {
  echo "$FRONTMATTER" | sed -n "s/^${1}:[[:space:]]*//p" | head -1
}

PROJECT=$(get_value "project")
CURRENT_PHASE=$(get_value "current_phase")
PHASES_TOTAL=$(get_value "phases_total")
STATUS=$(get_value "status")

# Defaults
PROJECT="${PROJECT:-Unknown Project}"
CURRENT_PHASE="${CURRENT_PHASE:-?}"
PHASES_TOTAL="${PHASES_TOTAL:-?}"
STATUS="${STATUS:-unknown}"

# Build output
echo "CKW Project: $PROJECT"
echo "Phase $CURRENT_PHASE/$PHASES_TOTAL — Status: $STATUS"

# Find action items — extract the text after [ACTION REQUIRED]
# Handles both plain [ACTION REQUIRED] and markdown **[ACTION REQUIRED]**
ACTION_LINES=$(grep 'ACTION REQUIRED' "$STATE_FILE" 2>/dev/null)
if [ -n "$ACTION_LINES" ]; then
  ACTION_COUNT=$(echo "$ACTION_LINES" | wc -l | tr -d ' ')
  echo ""
  echo "Action items ($ACTION_COUNT):"
  echo "$ACTION_LINES" | head -5 | while IFS= read -r line; do
    # Strip everything up to and including [ACTION REQUIRED] and optional ** or ]
    clean=$(echo "$line" | sed 's/.*ACTION REQUIRED[]*]*[[:space:]]*//' | sed 's/^\*\*[[:space:]]*//' | sed 's/^[[:space:]]*//')
    if [ -n "$clean" ]; then
      echo "  - $clean"
    fi
  done
fi

echo ""

# Suggest next command based on status
case "$STATUS" in
  planned)
    echo "Ready to execute. Run /ckw:execute-phase to start drafting." ;;
  in-progress|executing)
    echo "Execution in progress. Run /ckw:execute-phase to continue." ;;
  drafted)
    echo "Drafts complete. Run /ckw:review-phase to review." ;;
  reviewed)
    echo "Review complete. Run /ckw:compound to capture learnings, or /ckw:complete-project to close out." ;;
  paused)
    echo "Project paused. Run /ckw:resume-work to pick up with handoff context." ;;
  *)
    echo "Run /ckw:progress for full project status." ;;
esac

exit 0
