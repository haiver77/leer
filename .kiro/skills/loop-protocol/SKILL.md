---
name: loop-protocol
description: Shared rules for the iterative multi-agent app refinement loop — folder layout, file naming, latest-file resolution, review dimensions, and the stop rule. Load this before acting as the Architect, Developer, Customer Review, or Orchestrator agent.
---

# Loop Protocol

This skill is the single source of truth for the iterative multi-agent app
refinement workflow. Four agents collaborate to turn a high-level app idea into
a well-defined, customer-focused, implementation-ready solution with working
code:

- **Architect** — turns an input into a functional + technical specification.
- **Developer** — turns a specification into an implementation/deployment plan
  and real, working code.
- **Customer Review** — a demanding customer who scores the result and either
  approves it or writes the requirements for the next iteration.
- **Orchestrator** — seeds the first input and drives the loop by delegating to
  the three specialists.

All agents MUST follow the rules below exactly. Consistent file naming is what
makes the loop work.

## Folder & File Layout

All paths are relative to the current workspace root.

```
<workspace-root>/
  loops/
    1_input.md            # the idea / requirements for iteration 1 (seeded by Orchestrator)
    1_specification.md    # Architect output for iteration 1
    1_plan.md             # Developer output for iteration 1
    2_input.md            # Customer Review output when iteration 1 NEEDS_WORK
    2_specification.md
    2_plan.md
    ...
    FINAL_REVIEW.md       # Customer Review output when APPROVED (loop ends)
  app/                    # the application code the Developer generates & evolves in place
```

- Every markdown artifact lives in `loops/`. Never write these artifacts to the
  workspace root.
- All generated application code lives in `app/` and evolves in place across
  iterations (do not create per-iteration code folders).

## File Naming Rules

Markdown artifacts use a numeric iteration prefix `N` (starting at 1):

| Artifact                | File name            | Author          |
| ----------------------- | -------------------- | --------------- |
| Idea / requirements     | `N_input.md`         | Orchestrator (N=1) / Customer Review (N>=2) |
| Specification           | `N_specification.md` | Architect       |
| Implementation plan     | `N_plan.md`          | Developer       |
| Final accepted review   | `FINAL_REVIEW.md`    | Customer Review |

Within a single iteration `N`, all three artifacts share the same prefix:
`N_input.md` -> `N_specification.md` -> `N_plan.md`. When Customer Review is not
satisfied, it writes `(N+1)_input.md`, starting the next iteration.

## Resolving the "Latest" File

To find the current iteration, list `loops/` and take the **highest numeric
prefix** present for the relevant artifact type. Examples:

- Architect reads the latest `N_input.md` (highest `N`) and writes
  `N_specification.md` with the **same** `N`.
- Developer reads the latest `N_specification.md` and writes `N_plan.md` with
  the **same** `N`.
- Customer Review reads the latest `N_specification.md`, `N_plan.md`, and the
  current `app/`, then either writes `FINAL_REVIEW.md` or `(N+1)_input.md`.

Never guess the number — always derive it from the files that actually exist in
`loops/`.

## Six Review Dimensions

The Customer Review agent evaluates the solution across exactly these six
dimensions, each scored 1-10 (10 = excellent):

1. **Business value** — does it solve a real problem and create measurable value?
2. **Features / functionality** — completeness and correctness of capabilities.
3. **User experience (UX)** — flows, friction, clarity, accessibility.
4. **User interface (UI)** — visual quality, consistency, polish.
5. **Modern design standards** — current best practices, responsiveness, a11y, performance.
6. **Competitive / market attractiveness** — how it stacks up against competitors and how attractive/usable it is to real customers.

## Scoring Table Template

Customer Review must include a table in this exact shape:

```
| Dimension                     | Score (1-10) | Justification                 |
| ----------------------------- | ------------ | ----------------------------- |
| Business value                |              |                               |
| Features / functionality      |              |                               |
| User experience (UX)          |              |                               |
| User interface (UI)           |              |                               |
| Modern design standards       |              |                               |
| Competitive / attractiveness  |              |                               |
| **Overall (average)**         |              |                               |
```

## Stop Rule (Quality Gate)

The loop STOPS (solution APPROVED) when **both** conditions hold:

- **Overall score >= 8.0** (average of the six dimensions), AND
- **Every individual dimension >= 7**.

Otherwise the solution is **NEEDS_WORK** and the loop continues.

- On APPROVED: Customer Review writes `loops/FINAL_REVIEW.md` (summary + scores +
  what was accepted) and does NOT create a new input file. The loop ends.
- On NEEDS_WORK: Customer Review writes `loops/(N+1)_input.md` containing
  prioritized recommendations, enhancements, and new/updated requirements that
  carry forward everything still valid from the previous input plus the new
  demands. The loop continues.

Be a genuinely demanding customer: do not award a passing score until the
solution is clearly polished, competitive, and attractive. Early iterations
should realistically fail the gate.
