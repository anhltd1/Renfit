# AI-DLC (AI-Driven Development Life Cycle)

When the user invokes AI-DLC (for example, a message starting with
"Using AI-DLC, ..."), read and follow
`.aidlc/aidlc-rules/aws-aidlc-rules/core-workflow.md` to start the workflow,
and load the detailed rules from `.aidlc/aidlc-rules/aws-aidlc-rule-details/`
as the core workflow references them.

**Path override**: the core workflow's docs directory (referred to as `aidlc-docs/` in the rule
files) lives at `.kiro/aidlc-docs/` in this project, not at the workspace root. It was relocated
there so Kiro steering/skills can reference it directly (see `.kiro/steering/project-summary.md`
and `.kiro/steering/aidlc-workflow.md`). Whenever a rule file says to read or write
`aidlc-docs/...`, use `.kiro/aidlc-docs/...` instead. Application code still always goes to the
workspace root, never into this docs folder.

Do not activate the AI-DLC workflow unless the user explicitly invokes it.
