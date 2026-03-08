# AGENTS.md

This file defines task-specific agent behavior for local Codex integrations.

## PR Review Agent

When the task is reviewing a GitHub Pull Request, use the prompt at:
- `www/pr-review-agent.md`

Execution rule:
- Follow `www/pr-review-agent.md` as the primary instruction source for PR review tasks.
- Investigate context before commenting.
- Use only the tools listed in that file for PR review runs.

## Branch PR Agent

When the task is validating a branch and creating a Pull Request to `master`, use:
- `www/branch-pr-agent.md`

Execution rule:
- Follow `www/branch-pr-agent.md` as the primary instruction source for branch validation and PR creation tasks.
- Validate lint and unit tests before creating PR.
- Do not create PR if validations fail.
