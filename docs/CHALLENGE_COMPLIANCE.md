# Challenge Compliance Matrix

## Normative baseline

- Challenge: Open Agentic Web Challenge.
- Submission period: 11 November 2026 – 11 January 2027, 08:00 Pacific Time (16:00 UTC).
- Normative profile: MVP Profile 0.2, 6 November 2026.
- Pinned upstream commit: `fd872b9221aeb8ff762b75a5badbf84b23c133cc`.
- Exact source file: `spec/pinned/worldwide_agentic_web_mvp_spec.md`.
- SHA-256: `5d12f6f7a6fe50cb34aebd4258af3e8ff6bd81f286e4ade232b8c9b3583f222a`.
- The moving 18 November 2026 Profile 0.3 document is not substituted for the challenge-start baseline.

## Evidence-based status

| ID | Requirement | Current evidence | Status |
|---|---|---|---|
| C-01 | Public agent-site manifest and resolved network JSON | Both local sites generate `agent-manifest.json`, resolved network JSON, links and runtime assets. Partner checker validates public artifacts locally. External HTTPS hosting is outstanding. | Partial |
| C-02 | Browser runtime parses and executes graph in a normal browser | Runtime assets load in normal Chrome. Deterministic browser mock path is covered by tests; a real provider-backed browser chat run is not yet verified. | Partial |
| C-03 | UI permits user/agent interaction | Caller and partner pages render in Chrome. Keyboard-only completion and the full live chat composer flow still require browser QA. | Partial |
| C-04 | Peer network loads and runs in caller browser | A separate-origin partner manifest/network/bridge is fetched and validated by the local conformance checker. Actual model-driven peer invocation in a clean browser remains unverified. | Partial |
| C-05 | Peer consent, private-context filtering and per-hop policy | Gateway/runtime tests cover separate discovery/data consent, deny-by-default private context, exact field projection, payload digest mismatch, and fail-closed missing consent UI. Full browser E2E remains open. | Partial |
| C-06 | MCP baseline and same-site registered actions | The adapted runtime includes its MCP client and registered site-action mechanism. No live MCP test server workflow has been demonstrated yet. | Partial |
| C-07 | Invalid networks rejected before model invocation | Upstream-derived network builder/validator is retained with provenance. TrustMesh-specific positive/negative fixture coverage still needs expansion. | Partial |
| C-08 | Third-party SDK/API/data permissions and licenses | Apache-2.0 license and NOTICE/provenance documentation are present. Full dependency/SBOM and media rights review remains outstanding. | Partial |
| C-09 | Original work and meaningful post-start changes documented | TrustMesh-specific consent gateway, site UI, two-origin bridge integration, runtime patches and mock test are in the repository. Final change-log/review evidence remains outstanding. | Partial |
| C-10 | Public HTTPS site available during judging | No public production deployment is verified. | Not started |
| C-11 | English project description and testing instructions | English README and repeatable local demo runbook exist. Final Devpost copy and public judge URLs remain outstanding. | Partial |
| C-12 | Public YouTube video under 2 minutes with entrant explanation | Must be personally recorded by the entrant and checked after upload. | User action required |
| C-13 | Screenshots and media rights audit | Browser visuals were inspected locally; final clean screenshots and media-rights evidence are not yet packaged. | Not started |
| C-14 | Devpost registration and submission before deadline | Requires the entrant's account confirmation and final submission action. | User action required |

## Verified local checks

- TypeScript project checks: passing.
- Unit/security tests: 26 tests across 4 files passed at the latest local run.
- Both production Vite builds: passed at the latest local build.
- Partner conformance checker: all partner manifest, resolved network, links, action bridge, bridge manifest and bridge action resources returned HTTP 200; caller-origin allowlist matched the actual caller Origin.
- Both local pages loaded in the connected Chrome profile with no console error or warning messages at the time of inspection.

These checks do not establish public deployment, real-LLM behavior, full browser-driven cross-site execution, or full Profile 0.2 conformance.

## Profile 0.2 implementation notes

- Public site publishes `agent-manifest.json`, resolved network definition and `links.json` with CORS for the local two-origin test.
- Network representation preserves the Neuro SAN data model; JSON is a valid serialization of HOCON.
- Remote peer artifacts are fetched and validated using a separate local origin.
- MCP client support and site actions are present in the adapted runtime; a live external MCP happy path still needs evidence.
- Local site actions register purpose, input schema and effect; state-changing actions require a confirmation callback.
- Private context is deny-by-default across peer boundaries.
- Execution limits and cancellation are inherited from the adapted reference runtime; TrustMesh-specific negative-path coverage remains in progress.
- Unknown write outcomes must never be independently retried by the browser runtime.

## Judging criteria

- **Design:** complete, coherent product experience and usable critical workflow.
- **Potential impact:** a concrete privacy problem and reusable conformance/developer assets.
- **Quality of idea:** meaningful open-agentic-web interoperability with enforceable user control.

No prize outcome can be guaranteed. The objective is demonstrable quality, reproducible evidence, transparent limitations and rule compliance.
