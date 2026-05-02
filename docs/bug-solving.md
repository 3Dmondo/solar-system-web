# Bug Solving Workflow

Use this guide when the user asks to fix, investigate, close, or follow up on a saved bug report.

## Solver Role

- Start from an existing `docs/bugs/*.md` report unless the user explicitly asks for live triage instead.
- Read `AGENTS.md`, the bug report, and any relevant docs before changing code.
- Inspect the likely source files and tests before assuming the root cause.
- Reproduce the bug when feasible, or record why reproduction was not possible.
- Fix the smallest confirmed issue that resolves the reported behavior.
- Add or update regression coverage when the bug can be protected by automated tests.

## Workflow

1. Read the report and identify the reported behavior, expected behavior, environment, evidence, and open questions.
2. Inspect relevant docs, source files, tests, routes, components, data providers, or scripts connected to the symptom.
3. Reproduce the bug with the reported steps when feasible. If not feasible, state the limitation before implementing a fix.
4. Implement a targeted fix that preserves unrelated behavior.
5. Add or update focused regression coverage for the failing path when practical.
6. Run the smallest verification set that proves the fix, then broaden to `pnpm lint`, `pnpm test`, or `pnpm build` when the change risk warrants it.
7. Update the bug report with closeout details, then move it to `docs/bugs/solved/` after the fix is complete.

## Closeout

Before moving the report, update its contents so a later agent can understand what happened without reading the whole chat or diff.

- Use one of these status values: `Reported`, `In Progress`, `Resolved`, or `Deferred`.
- Set `Status: Resolved` when the fix is complete and verified.
- Add or update:
  - root cause
  - fix summary
  - changed files
  - verification commands and results
  - remaining risks or follow-ups
- Keep the original report details intact unless they were factually wrong. If they were wrong, correct them with a note instead of silently rewriting history.
- Do not mark a root cause as confirmed unless it was verified through code, reproduction, tests, or other evidence.

Move the closed report from:

```text
docs/bugs/YYYY-MM-DD-short-slug.md
```

to:

```text
docs/bugs/solved/YYYY-MM-DD-short-slug.md
```

Use `git mv` when available so Git can preserve rename history. Create `docs/bugs/solved/` if it does not exist yet.

## Documentation Updates

Update broader docs only when the fix changes durable project knowledge.

- Update `docs/architecture.md` when runtime structure, module boundaries, data flow, or contracts change.
- Update `docs/roadmap.md` or `docs/tasks/*.md` when milestone status, scope, or deferred work changes.
- Update `docs/decisions/*.md` when the fix establishes or changes a durable architectural or workflow decision.
- Update `docs/bug-reporting.md` or this guide only when the bug lifecycle workflow itself changes.

If the fix is a narrow implementation correction with no durable behavior or process change, the solved bug report closeout is enough.

## Guardrails

- Do not broaden the bug fix into unrelated refactors or feature work.
- Do not discard open questions; either answer them with evidence or carry them forward as remaining risks.
- Do not move the report to `docs/bugs/solved/` until the fix, verification, and closeout notes are complete.
- After finishing the bug-fix step, summarize what changed, how it was verified, and what should be inspected.
