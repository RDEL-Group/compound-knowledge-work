---
description: Search for relevant solutions, patterns, and templates from past projects. Queries the knowledge base by keywords, type, industry, or tags to surface reusable learnings.
---

# /ckw:search-solutions — Search the Knowledge Base

## Purpose
Search for relevant solutions, patterns, and templates from past projects and imported references. Surfaces reusable learnings so you can build on what worked before instead of starting from scratch. This is the discovery layer for CKW's compounding knowledge.

## Usage
```
/ckw:search-solutions <query>
/ckw:search-solutions competitive analysis
/ckw:search-solutions --type pattern
/ckw:search-solutions --tag rfp --industry cpg
/ckw:search-solutions --confidence high
```

- `<query>`: Free-text search (searched against titles, tags, and body content)
- `--type`: Filter by solution type (pattern | template | methodology | checklist | insight | all). `all` — or omitting the flag — searches every type.
- `--tag`: Filter by tag
- `--industry`: Filter by industry tag
- `--confidence`: Filter by confidence level (high | medium | low)

Filters can be combined: `--type pattern --tag competitive --confidence high`

## What This Command Does

Search project-local solutions, shared knowledge repos, and reference indexes. This is a lightweight command — no agent spawn needed.

### Step 1: Determine Search Locations

Build the list of directories to search:

1. **Project-local solutions:** `docs/solutions/` in the current project (if exists)
2. **Shared knowledge repos:** Each path in `~/.ckw/config.json` → `knowledge_repos[]` (if any configured)
3. **Reference index:** `reference/.index/` in the current project (if exists)

If none of these locations exist:
```
No knowledge base found.

Solutions are captured via /ckw:compound after completing project phases.
Reference summaries are created via /ckw:import-reference.

To connect a shared knowledge repo, add its path to ~/.ckw/config.json → knowledge_repos.
```

### Step 2: Collect Solution Files

For each search location, find all `.md` files that have YAML frontmatter.

Read each file's frontmatter to extract searchable metadata:
- `title` — Solution name
- `type` — pattern, template, methodology, checklist, insight
- `tags` — Array of keyword tags
- `source_project` — Where this was captured
- `source_phase` — Which phase
- `created` — Date created
- `confidence` — high, medium, low
- `reuse_context` — When to use this solution

For reference index files (`reference/.index/`), extract:
- `title` — Document name
- `type` — Set to "reference"
- `tags` — From the summary's key topics
- `tokens_estimated` — Token count
- `sections` — Major sections list

### Step 3: Apply Filters

Filter the collected files:

1. **`--type` filter:** Match `type` field exactly (skip filtering when `all`, or when the flag is omitted)
2. **`--tag` filter:** Match any tag in the `tags` array (case-insensitive)
3. **`--industry` filter:** Match any tag containing the industry term
4. **`--confidence` filter:** Match `confidence` field exactly
5. **Free-text query:** Search against title, tags (joined), reuse_context, and the first 500 words of body content. Match if any search term appears (case-insensitive).

### Step 4: Rank Results

Sort matching results by:
1. **Tag match count** (more matching tags = higher rank)
2. **Confidence level** (high > medium > low)
3. **Recency** (newer solutions first)
4. **Source proximity** (project-local > shared repo > reference index)

### Step 5: Display Results

**If results found:**
```
Found [N] results matching "[query]":

  1. CASINO Framework for Competitive Positioning         [high confidence]
     Type: methodology | Source: CPG RFP (2025-11) | Tags: competitive, positioning, rfp
     "Use when building competitive positioning sections in proposals"
     → docs/solutions/casino-framework.md

  2. Competitor Matrix Template                            [medium confidence]
     Type: template | Source: SaaS Proposal (2025-09) | Tags: competitive, template
     "Structured comparison grid for 3-7 competitors"
     → [shared] team-knowledge/solutions/patterns/competitor-matrix.md

  3. Market Analysis — Competitor Report                   [reference]
     Type: reference | Tokens: ~2,100 | Sections: executive summary, methodology, findings
     → reference/.index/competitor-analysis.md

Load a solution into context? (Enter number, or skip)
```

If the user selects a number, read the full file and display it.

**If no results:**
```
No results found for "[query]" [with filters: type=[type], tag=[tag]].

Try:
  • Broader search terms
  • Remove filters: /ckw:search-solutions [query]
  • Check available solutions: /ckw:search-solutions --type all
  • Import references: /ckw:import-reference [path]
  • Capture learnings: /ckw:compound
```

**If many results (>10):**
Show the top 10 and note:
```
Showing top 10 of [N] results. Narrow with filters:
  /ckw:search-solutions [query] --type pattern --confidence high
```

### Step 6: Offer Integration

After displaying results, offer actionable next steps based on context:

**If a CKW project is active (STATE.md exists):**
```
Tip: The planner auto-surfaces relevant solutions during /ckw:plan-phase.
These results will be available to the researcher agent when planning your next phase.
```

**If no project is active:**
```
Start a project to use these solutions:
  /ckw:new-project     Scope a new project
  /ckw:adopt-project   Import an existing project
```

## Pipeline Mode

**`--headless` behavior:** No change. This command is already non-interactive — it searches and displays results without prompting. The "Load a solution into context?" offer (Step 5) is skipped in headless mode; results are displayed only.

## Error Handling

- **No search locations exist** → Explain how to create solutions and configure repos (see Step 1)
- **config.json missing** → "CKW config not found at ~/.ckw/config.json. Solutions search works without it, but shared repos won't be searched."
- **Shared repo path doesn't exist** → "Shared repo path [path] not found. Check ~/.ckw/config.json → knowledge_repos."
- **Malformed frontmatter** → Skip the file, continue searching. Don't report individual parse failures unless `--verbose`.
- **Empty solution files** → Skip silently
- **Permission errors on shared repo** → "Can't read shared repo at [path]. Check file permissions."
