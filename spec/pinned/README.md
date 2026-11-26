# Pinned Challenge Specification

## Normative baseline

- Source repository: https://github.com/cognizant-ai-labs/agentic-web
- File: `docs/worldwide_agentic_web_mvp_spec.md`
- Pinned commit: `fd872b9221aeb8ff762b75a5badbf84b23c133cc`
- Commit author date: 2026-11-10T15:50:31Z
- Challenge submission-period start: 2026-11-11 20:00 Pacific (2026-11-12T04:00:00Z)
- Pinned document profile: **MVP Profile 0.2 | 6 November 2026**
- Retrieval method: GitHub commit history filtered to the specification path and bounded by the submission start timestamp.
- SHA-256: `5d12f6f7a6fe50cb34aebd4258af3e8ff6bd81f286e4ade232b8c9b3583f222a`

The exact source document is stored as `worldwide_agentic_web_mvp_spec.md`.

## Version determination

The last specification-file commit before the submission-period start is `fd872b9`, dated 10 November 2026. Its content declares MVP Profile 0.2. A later current-main version identifies itself as Profile 0.3 (18 November 2026), after the contest opened. Therefore this project uses the pinned 0.2 document as the normative baseline unless the organizer publishes a binding clarification.

## Reproduction

PowerShell:

```powershell
Get-FileHash .\spec\pinned\worldwide_agentic_web_mvp_spec.md -Algorithm SHA256
```

Do not use the moving upstream `main` branch as the challenge baseline.
