# Challenge Compliance Matrix

## Normative baseline
- Challenge: Open Agentic Web Challenge.
- Submission period: 11 November 2026 – 11 January 2027, 08:00 Pacific Time (16:00 UTC).
- Normative profile: MVP Profile 0.2, 6 November 2026.
- Pinned upstream commit: `fd872b9221aeb8ff762b75a5badbf84b23c133cc`.
- Exact source file: `spec/pinned/worldwide_agentic_web_mvp_spec.md`.
- SHA-256: `5d12f6f7a6fe50cb34aebd4258af3e8ff6bd81f286e4ade232b8c9b3583f222a`.
- The moving 18 November 2026 Profile 0.3 document is not used as the normative baseline.

## Requirements and evidence

| ID | Requirement | Required evidence | Status |
|---|---|---|---|
| C-01 | Public agent-site manifest and resolved network JSON | deployed URLs + Profile 0.2 validator report | Not started |
| C-02 | Browser runtime parses and executes graph in normal browser | browser E2E + demo | Not started |
| C-03 | UI permits user/agent interaction | deployed UI + screenshots | Not started |
| C-04 | Peer network load and execution in caller browser | independent-origin E2E | Not started |
| C-05 | Peer consent, private-context filtering and per-hop policy | conformance/security tests | Not started |
| C-06 | MCP baseline and same-site registered actions | MCP test server + action tests | Not started |
| C-07 | Invalid networks rejected before model invocation | negative fixtures | Not started |
| C-08 | Third-party SDK/API/data permissions and licenses | provenance and license inventory | Not started |
| C-09 | Original work and meaningful post-start changes documented | commit history + change log | In progress |
| C-10 | Public HTTPS site available during judging | deployment smoke checks | Not started |
| C-11 | English project description and testing instructions | submission package | Not started |
| C-12 | Public YouTube video under 2 minutes, browser footage and entrant explanation | final URL + review checklist | Not started |
| C-13 | Screenshots and media rights audit | screenshot/media set | Not started |
| C-14 | Devpost registration and submission by deadline | Devpost confirmation | User action required |

## Profile 0.2 implementation notes
- Public site must publish `agent-manifest.json`, resolved network definition and `links.json` with CORS as specified.
- Network representation must preserve Neuro SAN model; JSON is a valid serialization of the HOCON data model.
- Remote peer network agents are loaded and run in the caller's browser after required approval.
- MCP is the baseline for tools/data; approval is required before third-party MCP discovery/calls.
- Local site actions must declare name, purpose, JSON Schema, effect and handler; validate arguments and show destination/arguments before write or irreversible operations.
- Private context is deny-by-default across agent-site boundaries.
- Execution must be bounded by finite composition depth, invocation count, remote-call count, concurrency and elapsed time.
- Unknown outcome after a write begins must not be independently retried by the browser runtime.

## Judging criteria
- Design: complete, coherent product experience.
- Potential impact: credible specific user problem plus reusable community tools/services.
- Quality of idea: creative non-obvious use of open agentic websites and evidence of understanding.

No prize outcome can be guaranteed. The objective is demonstrable quality and rule compliance.
