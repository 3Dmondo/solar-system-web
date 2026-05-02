# Bug Reporting Workflow

Use this guide when the user reports a bug and wants help preparing a report for a later bug-solving agent.

## Reporter Role

- Gather, clarify, and document the bug before attempting a fix.
- Inspect the current session context, relevant docs, and likely source files before asking questions.
- Ask only focused questions for details that cannot be determined from the user report, session context, docs, or code.
- Do not begin implementation or speculative debugging unless the user explicitly asks for it.
- Create one open report file per bug under `docs/bugs/` after the report is clear enough to be useful.
- If `docs/bugs/` does not exist yet, create it when writing the first report.
- Solver agents should use `docs/bug-solving.md` and move resolved reports to `docs/bugs/solved/`.

## Inspect First

Before asking the user follow-up questions, gather what can be known locally.

- Read the current conversation context for reproduction clues, expected behavior, recent changes, and user intent.
- Check `AGENTS.md`, relevant docs, and any open milestone or task file that may describe the affected behavior.
- Search or inspect likely source files, tests, routes, components, data providers, or scripts connected to the reported symptom.
- Record code or doc facts in the report as evidence, but keep unverified inferences clearly labeled.
- Ask the user only for missing information that materially affects reproduction, scope, environment, impact, or expected behavior.

## Clarifying Questions

Start from what the user already provided and what the codebase inspection revealed. Ask about only the missing items that materially affect reproduction, scope, or likely cause.

- Impact: who is affected, how severe it is, and whether there is a workaround.
- Actual behavior: what happened, including visible UI state, errors, logs, or unexpected data.
- Expected behavior: what should have happened instead.
- Reproduction: exact steps, starting route or state, inputs, timing, and whether it happens consistently.
- Environment: browser, device, viewport, deployed site or local dev server, branch or commit if known.
- Frequency: always, sometimes, once, only after refresh, only on mobile, only at a specific simulation time, or similar.
- Evidence: screenshots, console output, network errors, test failures, or debug overlay observations.
- Recent changes: what changed shortly before the bug appeared, if known.
- Unknowns: anything important that remains unconfirmed after reasonable questioning.

Prefer a short follow-up question over a long checklist. If a detail is clear from context or code, do not ask for it again. If the user cannot answer something, record it as unknown instead of blocking the report.

## Report File

Name report files as:

```text
docs/bugs/YYYY-MM-DD-short-slug.md
```

Use the current local date for `YYYY-MM-DD`. Keep the slug short, lowercase, and hyphenated.

Open reports stay in `docs/bugs/`. After a solver resolves the bug, the solver updates the report with closeout notes and moves it to `docs/bugs/solved/`.

Use one of these status values: `Reported`, `In Progress`, `Resolved`, or `Deferred`.

## Report Template

```markdown
# Bug: Short descriptive title

Status: Reported
Date: YYYY-MM-DD

## Summary

One or two sentences describing the user-visible problem and impact.

## Environment

- App surface:
- Browser/device:
- Route or URL:
- Build/deploy context:
- Relevant time or data state:

## Steps To Reproduce

1. 
2. 
3. 

## Actual Behavior

Describe what happens, including any error text, console output, visual state, or timing.

## Expected Behavior

Describe what should happen instead.

## Evidence

- Screenshots:
- Console/log output:
- Network/debug observations:
- Related files or code areas:

## Frequency And Scope

Describe whether this is consistent, intermittent, environment-specific, or limited to certain data or UI states.

## Recent Changes

Record any known recent changes that may be relevant, or write `Unknown`.

## Suspected Area

Optional. Record likely subsystem, component, or data path only when there is evidence. Otherwise write `Unknown`.

## Open Questions

- 
```

## Before Handing Off

- Confirm the report can be understood without the original chat.
- Keep assumptions explicit in `Open Questions` or `Suspected Area`.
- Do not mark a root cause as confirmed unless it was actually verified.
- Leave bug fixing and solved-report moves to `docs/bug-solving.md`.
- Tell the user what report file was created and which details should be inspected.
