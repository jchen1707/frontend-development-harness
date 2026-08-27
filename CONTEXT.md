# frontend-development-harness

The domain glossary for the application built in this harness. It defines the words, not the
implementation. Standards live in `docs/architecture.md`; the layering rules live in the nested
`CLAUDE.md` files.

`docs/agents/domain.md` records the harness-level ambiguities this repo has already resolved
("agent", "component", "service"). This file covers the application domain.

This harness ships with no application domain of its own. Replace the worked example below with
the real terms as the first feature slice lands.

## How to write an entry

- **One entry per term**, defined as the thing it is, not as the code that implements it.
- **List the words it is not.** An `_Avoid_` line is what stops a synonym drifting back in
  through a ticket title or a variable name.
- **Qualify collisions every time.** Where a word already means something else in this repo,
  say which sense is unqualified and spell out the others in full.

## Language

**Health check** _(worked example — replace)_:
The probe the app makes against the backend's `/healthz` to show whether it is reachable. It
reports reachability only, and says nothing about whether any feature behind it works.
_Avoid_: ping, status, heartbeat.

Unqualified "project" in `src/`, in tickets and in commits is ambiguous in this repo and always
needs its qualifier:

- **Linear project** — the `project` field on a Linear issue. Always write both words.
- **project slug** — the directory name Claude Code uses under `~/.claude/projects/`. Never
  just "project".
