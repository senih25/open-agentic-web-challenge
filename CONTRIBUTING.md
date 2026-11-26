# Contributing

## Branches and pull requests

- Use short-lived branches named `feat/<issue>-<topic>`, `fix/<issue>-<topic>`, `docs/<issue>-<topic>`, or `chore/<issue>-<topic>`.
- Every pull request links an issue and describes the observable evidence.
- Do not push directly to `main` for feature work.
- Keep the pinned MVP Profile 0.2 baseline unchanged unless a separately reviewed profile update is explicitly intended.

## Definition of Done

A change is complete only when:
1. TypeScript checks pass.
2. Unit and security tests pass.
3. The two-origin test passes where network publication, CORS, manifests or bridges are affected.
4. Both production builds pass.
5. Security/privacy implications and upstream provenance are reviewed.
6. The compliance matrix and runbook reflect what was actually verified.
7. The PR includes screenshots or browser evidence for user-facing changes and clearly lists unverified behavior.

Run the local acceptance gate with `npm run check`.

## Security

Never commit API keys, cookies, personal data, private browser context, or real user requests. Use synthetic data in fixtures and screenshots. Follow [SECURITY.md](SECURITY.md) for vulnerability reports.

## Upstream code

Retain Apache-2.0 license and NOTICE files for Agentic Web/nsDeploy-derived files. Keep the local upstream checkout untracked and excluded from public Git history. Document all changes to copied runtime code in `docs/UPSTREAM_PROVENANCE.md`.
