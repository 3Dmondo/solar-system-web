# Repository Instructions

These instructions apply to every session in this repository.

## Current Project Snapshot

- Static React, TypeScript, and Vite app intended for GitHub Pages.
- Experience starts in a solar-system overview, not a single-body close-up.
- The mocked scene includes the Sun, all 8 planets, and the Moon.
- Interaction currently centers on orbit controls, double click or double tap focus, a minimal HUD, a help overlay, a star background, and mocked orbital trails.
- Custom rendering passes exist for Venus, Earth, Moon, and Saturn. The remaining bodies use shared texture-driven materials.
- `pnpm lint`, `pnpm test`, and `pnpm build` currently pass.
- `pnpm test:e2e` is not a trusted source of truth until Playwright browsers are installed and the overview-first flow is covered by the smoke test.

## Working Agreement

- Keep AI-facing markdown concise, current-state-first, and aligned with the code.
- Prefer small, reviewable increments over large multi-feature changes.
- After each implementation step, stop and wait for user inspection before continuing.
- When a decision changes the plan, update the relevant docs in the same step as the code.
- When docs describe future work, label it clearly as planned or deferred.

## Documentation Set

- `AGENTS.md`: repository-wide instructions for agents.
- `README.md`: quick entry point for humans and agents.
- `docs/vision.md`: product goals, current experience, next experience, and non-goals.
- `docs/architecture.md`: actual stack, module map, runtime behavior, and known gaps.
- `docs/roadmap.md`: milestone status and sequencing.
- `docs/bug-reporting.md`: bug-reporting workflow for preparing solver-ready reports.
- `docs/bug-solving.md`: bug-solving workflow for resolving saved reports.
- `docs/bugs/*.md`: open bug reports for later triage or fixing.
- `docs/bugs/solved/*.md`: resolved bug reports with closeout notes.
- `docs/tasks/*.md`: actionable milestone checklists.
- `docs/decisions/*.md`: durable architectural or workflow decisions.

## Documentation Expectations

- `docs/vision.md` must reflect current product goals, milestone scope, and non-goals.
- `docs/architecture.md` must reflect the actual chosen stack and structural decisions.
- `docs/roadmap.md` must reflect the current milestone sequence and status at a high level.
- `docs/bug-reporting.md` must reflect the current bug-reporting workflow.
- `docs/bug-solving.md` must reflect the current bug-solving and closeout workflow.
- `docs/bugs/*.md` should capture one open bug per file with enough detail for a later solving agent.
- `docs/bugs/solved/*.md` should capture resolved reports with root cause, fix summary, verification, and remaining risks.
- `docs/tasks/*.md` must reflect the actionable checklist for the current or recently open milestone.
- `docs/decisions/*.md` should capture durable architectural or workflow decisions.

## Delivery Expectations

- Favor maintainable code and clear module boundaries.
- Keep rendering logic, data logic, and UI logic separated.
- Preserve mobile and desktop usability from the start.
- Treat test coverage as a project requirement and expand it as features are added.
- Treat the checked-in code as the source of truth when docs and plans drift apart.

## Session Behavior

- At the start of a task, read `AGENTS.md` plus the relevant docs and source files before making changes.
- When the user reports a bug, read `docs/bug-reporting.md` before writing a report or beginning bug triage.
- Bug-reporting sessions should inspect the current session context, relevant docs, and likely source files before asking questions.
- Bug-reporting sessions should ask focused required clarifying questions only for details not clear from context or code before creating `docs/bugs/*.md`.
- When asked to fix, investigate, close, or follow up on a saved bug report, read `docs/bug-solving.md` before changing code.
- Solved bug reports should be closed out in place first, then moved to `docs/bugs/solved/` with `git mv` when available.
- Before editing files, briefly state the step being implemented.
- After finishing a step, summarize what changed, how it was verified, and what should be inspected.
- Do not start the preview server just for user inspection; suggest the preview command and let the user run it unless they explicitly ask the agent to start it.
- Do not continue automatically past a milestone or review checkpoint without user confirmation.

## Practical Notes

- The project uses `pnpm`.
- The app is intended for static hosting on GitHub Pages.
- `vite.config.ts` uses `./` locally and `/solar-system-web/` during GitHub Actions builds.
- Early milestones use mocked data that should later be replaced behind a stable abstraction.
