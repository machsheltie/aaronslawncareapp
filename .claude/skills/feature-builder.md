# Feature Builder — Task Orchestration Skill

This skill manages the feature expansion build process. It ensures tasks are completed in order, marked off, and the next task is automatically identified and started.

---

## How to Use This Skill

This skill is triggered automatically when completing work on the feature expansion. After finishing any task:

1. **Read the TODO file** at `docs/TODO.md`
2. **Mark the completed task** as `[x]`
3. **Find the next uncompleted task** (first `[ ]` in the list)
4. **Read the relevant phase spec** from `docs/phases/phase-{N}-*.md`
5. **Begin work** on the next task immediately

---

## Workflow Per Task

### Before starting a task:
1. Read `docs/TODO.md` to confirm which task is next
2. Read the phase spec for that task's phase (ONLY that phase — don't read all phases)
3. If starting a new phase, read the phase spec top to bottom
4. If continuing within a phase, just reference the specific section needed

### While working on a task:
- Follow the phase spec for implementation details
- Use the acceptance criteria as a checklist
- Run type checks (`npx tsc --noEmit`) after code changes
- Run builds (`npm run build`) at phase completion

### After completing a task:
1. Update `docs/TODO.md` — mark the task `[x]`
2. If it's the last task in a phase, update `docs/MASTER_PLAN.md` — mark phase as COMPLETE
3. Announce: "Completed [task]. Next up: [next task description]"
4. Begin the next task unless the user says otherwise

---

## Phase Spec Locations

| Phase | Spec File |
|-------|-----------|
| 1 | `docs/phases/phase-1-database.md` |
| 2 | `docs/phases/phase-2-documents-hub.md` |
| 3 | `docs/phases/phase-3-rescheduling.md` |
| 4 | `docs/phases/phase-4-customer-enhancements.md` |
| 5 | `docs/phases/phase-5-follow-up-reminders.md` |
| 6 | `docs/phases/phase-6-quote-scheduling.md` |
| 7 | `docs/phases/phase-7-dashboard-expansion.md` |
| 8 | `docs/phases/phase-8-contracts.md` (BLOCKED) |

---

## Important Rules

- **One phase spec at a time.** Don't load all 8 specs into context. Read only the one you're working on.
- **Mark tasks as you go.** Don't batch-mark at the end.
- **Build check at end of each phase.** Run `npx tsc --noEmit && npm run build` before moving to next phase.
- **Phase 8 is BLOCKED.** Skip it and announce "Phase 8 blocked — waiting on contract template from Stacey."
- **If a task fails or is unclear, ask the user** rather than guessing.
- **Commit at the end of each phase** (not after every task — that's too granular).

---

## Context Management

To avoid losing focus on long documents:
- Phase specs are deliberately kept short (under 100 lines each)
- TODO.md is a flat checklist — scan for the first `[ ]`
- MASTER_PLAN.md is just an index — don't re-read it every time
- Only read the phase spec when starting a NEW phase or if you need to reference specific details
