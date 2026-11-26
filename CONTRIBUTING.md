# Contributing

Every change references an issue. Use short-lived branches named `feat/<issue>-<slug>`, `fix/<issue>-<slug>` or `docs/<issue>-<slug>`. Open focused PRs to main; no direct main commits after bootstrap.

Definition of Done: acceptance criteria met; pinned-profile conformance preserved; tests pass; provenance/license clear; no secrets/private data/unlicensed assets; accessibility and failure states covered; docs/evidence updated; CI green.

Use TypeScript strict mode for runtime/application code. Validate all trust-boundary data. Avoid untyped remote payloads and dynamic manifest code execution. Tests must not depend on production credentials.
