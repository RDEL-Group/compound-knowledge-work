---
description: Review all drafted content for a phase against requirements and quality standards. Produces P1/P2/P3 prioritized issues and auto-generates revision task plans for must-fix items.
---

# /ckw:review-phase — Quality Gate on Drafted Content

## Purpose
Review all drafted content for a phase against requirements, preferences, and quality standards. Produces a structured review report with P1/P2/P3 prioritized issues and auto-generates revision task plans for P1 (must-fix) issues.

## Usage
```
/ckw:review-phase <N>
```

- `N`: Phase number (required)

## What This Command Does

Spawn the **ckw-reviewer** agent with a fresh context to review all drafted content for a phase.

### Step 1: Validate Readiness

Check that the phase has drafted content:

1. Read PHASE-PLAN.md to get the list of expected tasks and output files
2. Check `drafts/` for the expected output files
3. Check `.planning/phases/{NN}-{phase-name}/` for task summaries

**If no drafts found:**
```
Phase [N] has no drafted content yet.
Run /ckw:execute-phase [N] to start drafting.
```

**If partial drafts (some tasks incomplete):**
```
Only [completed] of [total] tasks are drafted for Phase [N]:
  ✅ Task 1: [name] → drafts/[file].md
  ✅ Task 2: [name] → drafts/[file].md
  ❌ Task 3: [name] → not drafted yet

Review what's available now, or wait until all tasks complete?
```

Wait for user confirmation before proceeding with partial review.

### Step 2: Gather Context

**Always load (T1):**
- PROJECT.md — Project scope and vision
- STATE.md — Current decisions and progress
- Phase CONTEXT.md — Locked preferences from brainstorm (if exists)

**Phase-level (T2):**
- REQUIREMENTS.md — Filter to this phase's requirement IDs only
- ROADMAP.md — This phase's entry (for phase goals)

**Review materials (T3):**
- All draft files for the phase (from `drafts/`)
- All task summaries (`.planning/phases/{NN}-{phase-name}/{N}-SUMMARY.md`)
- PHASE-PLAN.md — What each task was supposed to produce

**Do NOT load:**
- Reference materials — reviewer works from requirements and context, not source docs
- Drafts from other phases
- Prior REVIEW_REPORT.md (each review is fresh)

### Step 3: Spawn Reviewer

Spawn the **ckw-reviewer** agent with all gathered context. The agent runs 6 review checks:

1. Requirements Coverage
2. Completeness
3. Coherence
4. Evidence & Specificity
5. Tone & Voice
6. Readability

See `agents/ckw-reviewer.md` for the full review process.

### Step 3a: Optional Stress-Test Review (High-Stakes Phases)

Check CONTEXT.md for stakes context. If the phase involves high-consequence output — board materials, client deliverables, regulatory submissions, public-facing content, or content where decisions with significant financial/operational impact depend on it — offer to run a stress-test review alongside the standard review.

**If stakes context suggests high-stakes (or if unclear), ask the user:**
```
Based on CONTEXT.md, this phase looks high-stakes: [brief reason].
Want me to run a stress-test review alongside the standard review?
This adds a devil's advocate + risk assessment pass.
```

**If the user confirms (or if stakes are clearly high):**
Spawn the **ckw-reviewer-stress** agent in parallel with the standard reviewer (or after it if already spawned). The stress-test agent uses the same T1/T2/T3 context but runs completely different checks — devil's advocate, risk assessment, and audience pressure testing.

See `agents/ckw-reviewer-stress.md` for the stress-test process.

**If the user declines or stakes are clearly low:** Skip. Proceed with standard review only.

### Step 4: Save Outputs

The reviewer produces:

1. **REVIEW_REPORT.md** → `.planning/phases/{NN}-{phase-name}/REVIEW_REPORT.md`
   - P1/P2/P3 issue tables
   - Requirements coverage matrix
   - Overall assessment

2. **Revision task plans** (only if P1 issues found) → `.planning/phases/{NN}-{phase-name}/R{N}-PLAN.md`
   - One per draft file with P1 issues
   - Same format as regular task plans
   - References original draft + task plan

3. **Stress-test report** (only if stress-test ran) → `.planning/phases/{NN}-{phase-name}/REVIEW-stress.md`
   - Devil's advocate challenges, risk assessment, audience pressure points
   - P1 items from the stress-test should also generate revision task plans (append to the R{N}-PLAN series)

### Step 5: Update STATE.md

Update the YAML frontmatter:
```yaml
status: reviewing
phase_[N]_status: reviewing
last_updated: [ISO date]
```

Update the Current Status section:
```
Phase [N] ([name]) reviewed — [P1 count] P1 issues, [P2 count] P2, [P3 count] P3. [Overall assessment].
```

### Step 6: Save Progress

**If local/git repo:**
```bash
git add .planning/phases/{NN}-{phase-name}/REVIEW_REPORT.md
git add .planning/phases/{NN}-{phase-name}/R*-PLAN.md
git add STATE.md
git commit -m "CKW: Phase [N] reviewed — [P1 count] P1 issues"
```

**If Google Drive / cloud storage:** Skip git. Files are auto-saved by Drive.

### Step 7: Report Results

**If P1 issues found:**
```
Review complete for Phase [N]: [Phase Name]

📊 Overall: Needs revision

P1 (Must Fix):    [count] issues across [N] drafts
P2 (Should Fix):  [count] issues
P3 (Nice to Fix): [count] issues

⚡ [count] revision tasks generated:
  • R1: [description] → fixes in drafts/[file].md
  • R2: [description] → fixes in drafts/[file].md

Next:
  /ckw:execute-phase [N] --revisions    Apply P1 fixes
  /ckw:publish-proof --phase [N]        Publish to Proof for team review
  /ckw:progress                         Full project status

Full report: .planning/phases/{NN}-{phase-name}/REVIEW_REPORT.md

[If stress-test ran:]
🔍 Stress-test review:
  • [N] challenges (devil's advocate)
  • [N] risks flagged
  • [N] audience pressure points
  See REVIEW-stress.md for details
```

**If no P1 issues:**
```
Review complete for Phase [N]: [Phase Name]

📊 Overall: Strong

P1 (Must Fix):    0 issues ✅
P2 (Should Fix):  [count] issues
P3 (Nice to Fix): [count] issues

✅ No critical issues. Phase is ready for completion or compounding.

Next:
  /ckw:publish-proof --phase [N] --with-review    Publish to Proof with review comments
  /ckw:compound --phase [N]                       Capture learnings from this phase
  /ckw:execute-phase [N+1]                        Move to next phase
  /ckw:progress                                   Full project status

Full report: .planning/phases/{NN}-{phase-name}/REVIEW_REPORT.md

[If stress-test ran:]
🔍 Stress-test review:
  • [N] challenges (devil's advocate)
  • [N] risks flagged
  • [N] audience pressure points
  See REVIEW-stress.md for details
```

## Error Handling

- **Phase doesn't exist in ROADMAP.md** → "Phase [N] isn't in the roadmap. Available phases: [list]."
- **No phase plan exists** → "Phase [N] hasn't been planned yet. Run /ckw:plan-phase [N] first."
- **No drafts found** → "Phase [N] has no drafted content. Run /ckw:execute-phase [N] first."
- **REVIEW_REPORT.md already exists** → "Phase [N] has already been reviewed. Run a fresh review (overwrites), or view the existing report?"
- **Phase already marked complete** → "Phase [N] is marked complete. Review anyway? This won't change the completion status."
