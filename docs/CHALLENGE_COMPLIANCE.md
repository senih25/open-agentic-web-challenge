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
| C-01 | Public agent-site manifest and resolved network JSON | Both HTTPS origins publish their public manifest, resolved network, links and runtime assets. `npm run test:public` validates both origins, CORS, caller peer URL, bridge manifest and exact caller-origin allowlist. | Verified for public artifact publication |
| C-02 | Browser runtime parses and executes graph in a normal browser | Runtime modules load on both production sites in the normal Chrome profile. Deterministic mock behavior is covered by tests; real provider-backed model execution remains unverified. | Partial |
| C-03 | UI permits user/agent interaction | Both production UIs load in normal Chrome; both chat composer inputs have the accessible name “Ask the site assistant”. A complete live model-backed task still needs verification. | Partial |
| C-04 | Peer network loads and runs in caller browser | Independent HTTPS peer metadata, resolved network, bridge and CORS pass the public conformance checker from the real caller origin. A model-driven peer invocation in a clean browser remains unverified. | Partial |
| C-05 | Peer consent, private-context filtering and per-hop policy | Gateway/runtime tests cover discovery/data consent separation, deny-by-default private context, exact field projection, payload digest mismatch and fail-closed missing consent UI. Full browser-driven handoff is not yet verified. | Partial |
| C-06 | MCP baseline and same-site registered actions | The adapted runtime includes its MCP client and registered site-action mechanism. No live third-party MCP test-server workflow has been demonstrated. | Partial |
| C-07 | Invalid networks rejected before model invocation | Upstream-derived network builder/validator is retained with provenance. TrustMesh-specific positive/negative fixture coverage still needs expansion. | Partial |
| C-08 | Third-party SDK/API/data permissions and licenses | Apache-2.0 license and NOTICE/provenance documentation are present. Full dependency/SBOM and media-rights review remains outstanding. | Partial |
| C-09 | Original work and meaningful post-start changes documented | TrustMesh-specific consent gateway, UI, two-origin bridge integration, runtime patches, deterministic mock tests, pinned baseline and provenance are in Git history. Final independent review/change log remains open. | Partial |
| C-10 | Public HTTPS site available during judging | Both Cloudflare Pages production deployments completed successfully from main commit `20c9b9676ba12382830c8da882a4baaebe103b7e`; both stable HTTPS origins returned HTTP 200 in Chrome and the public smoke check. Long-term uptime monitoring during judging is not yet configured. | Partial |
| C-11 | English project description and testing instructions | English README, local runbook, public deployment runbook and public judge URLs exist. Final Devpost-specific description and submission package still need review. | Partial |
| C-12 | Public YouTube video under 2 minutes with entrant explanation | Must be personally recorded by the entrant, uploaded and checked after publication. | User action required |
| C-13 | Screenshots and media rights audit | Production pages have been inspected in Chrome, but final screenshot assets and a media-rights inventory are not yet packaged. | Not started |
| C-14 | Devpost registration and submission before deadline | Requires the entrant's account confirmation and final submission action. | User action required |

## Verified local and public checks

- TypeScript project checks: PASS.
- Unit/security tests: 26 tests across 4 files PASS.
- `npm run test:two-origin`: PASS from a clean runtime directory; syncs runtime, builds the two networks, verifies two distinct origins and partner resources.
- Both production Vite builds: PASS.
- `npm audit --audit-level=high`: 0 vulnerabilities in the tested dependency tree.
- GitHub Actions CI on PR #18: repository hygiene PASS; build, unit tests and two-origin conformance PASS.
- Cloudflare Pages production deployment: both sites deployed successfully from main commit `20c9b9676ba12382830c8da882a4baaebe103b7e`.
- `npm run test:public`: PASS. Both roots and 11 public resources returned HTTP 200 with expected CORS; caller allowlists the exact partner origin and partner bridge allows only the exact caller origin.
- Upstream partner checker against the public HTTPS peer: PASS. It emitted one non-fatal same-origin canonical-path redirect warning for `/bridge/action-bridge.html` to `/bridge/action-bridge`; the checker follows it and validates the final resource.
- Both production pages loaded in the connected normal Chrome profile. The inspected caller and partner pages had no console errors or warnings.
- Both pages expose an accessible chat composer input named “Ask the site assistant”.

These checks establish public publication and cross-origin artifact discoverability. They do not establish a real-LLM conversation, complete browser-driven consent/peer execution, long-term service availability, or full Profile 0.2 conformance.

## Profile 0.2 implementation notes

- Both public sites publish `agent-manifest.json`, resolved network definitions and `links.json` with CORS for cross-origin discovery.
- Network representation preserves the Neuro SAN data model; JSON is a valid serialization of HOCON.
- Remote peer artifacts are fetched and validated from an independent HTTPS origin.
- MCP client support and site actions are present in the adapted runtime; a live external MCP happy path still needs evidence.
- Local site actions register purpose, input schema and effect; state-changing actions require a confirmation callback.
- Private context is deny-by-default across peer boundaries.
- Execution limits and cancellation are inherited from the adapted reference runtime; TrustMesh-specific negative-path coverage remains in progress.
- Unknown write outcomes must never be independently retried by the browser runtime.
- The deterministic browser mock is restricted to loopback-only builds and is not used on public pages.

## Judging criteria

- **Design:** complete, coherent product experience and usable critical workflow.
- **Potential impact:** a concrete privacy problem and reusable conformance/developer assets.
- **Quality of idea:** meaningful open-agentic-web interoperability with enforceable user control.

No prize outcome can be guaranteed. The objective is demonstrable quality, reproducible evidence, transparent limitations and rule compliance.
