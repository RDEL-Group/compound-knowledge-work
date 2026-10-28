# Style: Reporting Runbook

<!-- Classification test: a rule that changes wording, sentence construction, or tone goes in VOICE; a rule that changes the claim, support, organization, or readiness standard goes in STYLE; reader knowledge goes in AUDIENCE. Split mixed guidance without duplicating it. -->
<!-- HOW TO USE: Style is what this kind of document must prove, how it is organized, and when it is ready to send. This file covers the steps in a reporting runbook and the metric bullets it gives a current client (see AUDIENCE-current-client.md). Each gap is marked SLOT in square brackets. -->

## Base rules

<!-- Seeded from MPL's de-AI style pass (solution: de-ai-style-pass-client-docs.md). Identical in all three STYLE files: change all three, or use a project override. These sit in STYLE because each is a pass/fail release check, not a matter of taste. -->

Apply these at draft time, not as a cleanup pass. Retrofitting costs a full revision cycle. Check order: structure and support first, the mechanical checks below second, any banned-word list last.

1. **No em-dashes, anywhere.** The most recognizable AI-writing tell, even when used correctly. Use colons, commas, periods, or parentheses. En-dashes in numeric or date ranges (Oct 12–18) are fine, and empty table cells use an en-dash.
2. **No superfluous or flowery language.** Cut rhetorical flourishes, vivid metaphors, punchline sentences, and self-referential scaffolding ("the reasoning follows", "detail in the sections below").
3. **No provenance narration.** Never write "based on our research into..." or "from our conversation on...". State the content directly.
4. **No named individuals.** Documents are addressed to the organization, not a person. Name organizations only (client, agency, vendors). Creator or talent names in ad or file names count as individuals.
5. **Calibrate register against a human-edited sample, not abstract style rules.** Use the Register reference in VOICE.md. Match its structure too: [SLOT: the reference's structural habits, for example bold lead-in paragraphs, numbered sections, a summary table up top].

### Mechanical verification (run before delivering)

```bash
grep -c '—' document.md                    # must be 0
grep -inE 'NAME1|NAME2|NAME3' document.md  # edit: names of everyone in this project; an unedited line proves nothing
```

Docs, Slides, or HTML: extract the text to a file first. A language pass must never move a number, so compare dollar figures before and after:

```bash
grep -oE '\$[0-9][0-9,.]*' original.md | tr -d ',' | sort | uniq -c > /tmp/o.txt
grep -oE '\$[0-9][0-9,.]*' revised.md  | tr -d ',' | sort | uniq -c > /tmp/r.txt
diff /tmp/o.txt /tmp/r.txt   # only intentionally added or removed figures should appear
```

## Reporting runbook rules

1. **Steps are verifiable.** Every step says what you will see when it worked, or names a check another person can repeat. A step nobody can check is not finished.
2. **Label the attribution lens on every metric.** Name the source: "in-platform", "Triple Whale", "Shopify". Unlabeled mixed lenses are how a client later finds two ROAS numbers that disagree and trusts neither.
3. **Result plus action, two sentences per bullet at most.** The first says what happened, with the number. The second says what changes because of it. A bullet with no second half is reporting, not management. Cut it or finish it.
4. **Recommendations, not unilateral declarations.** Anything that needs client input, new production, or a strategy change reads "Our recommendation: X", with the reasoning, and ends with the open decision ("renew, shift, or split"). Declarative voice is for actions already completed and routine in-mandate optimizations (flag those as routine in a note). Manual check, per bullet: "does this assume a client decision that has not happened?"

Bullets compress and round: 4.50x quietly becomes 4.5x, then 5x. Trace every figure:

```bash
grep -oE '[$+]?[0-9][0-9,.]*[%x]?' bullets.txt | sort -u   # every figure must trace to the source data table
```

**Ready to send when:** the base checks pass, every step has a check, every metric names its lens, every bullet has a result and an action, and every recommendation ends with its open decision.

## Confirmed lessons

*Do not turn one-off choices into permanent rules.*

<!-- Add a lesson only after the writer confirms it. Record the mechanism or consequence, with date and source. -->
