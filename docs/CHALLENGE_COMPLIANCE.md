# Challenge Compliance Matrix

## Normative baseline
- Challenge: Open Agentic Web Challenge.
- Submission period: 11 November 2026 – 11 January 2027, 08:00 Pacific Time (16:00 UTC).
- The official rules freeze the specification at the beginning of the submission period. Official FAQ currently identifies MVP Profile 0.2/0.3 as equivalent apart from link/typo fixes. Exact historical source commit must be pinned before conformance claims.
- Submission: public site URL, public network JSON, browser runtime, UI, text description, public YouTube demo under two minutes, screenshots and English testing instructions.

## Requirements and evidence

| ID | Requirement | Required evidence | Status |
|---|---|---|---|
| C-01 | Public conforming agent-network JSON | deployed URL + validator report | Not started |
| C-02 | Browser runtime executes network in current browser | browser E2E + demo | Not started |
| C-03 | Users/agents interact with network | deployed UI + screenshots | Not started |
| C-04 | Site can interact with an independent agentic site | two-origin E2E | Not started |
| C-05 | Runtime/network behavior follows pinned profile | conformance suite | Not started |
| C-06 | Invalid network fails closed before model invocation | negative test fixtures | Not started |
| C-07 | Third-party SDK/API/data use is authorized | license/provenance register | Not started |
| C-08 | Original work and significant post-start changes documented | dated commits + changelog | Not started |
| C-09 | Public HTTPS site available throughout judging | deployment smoke checks | Not started |
| C-10 | English description and testing instructions | submission package | Not started |
| C-11 | Public YouTube video under 2 minutes, browser footage, entrant explanation | final URL + review checklist | Not started |
| C-12 | Screenshots supplied; no unlicensed marks/music/assets | screenshot/media audit | Not started |
| C-13 | Entrant joins and submits on Devpost by deadline | Devpost confirmation | User action required |

## Pinning procedure
1. Identify official Git commit that was current at 11 Nov 2026, 20:00 Pacific.
2. Save exact specification file in `spec/pinned/`.
3. Record source URL, commit SHA, retrieval date and SHA-256.
4. Build against pinned text, not upstream main.
5. Document later clarifications separately; ask organizer when ambiguity affects judging.

## Judging criteria
- Design: complete product experience.
- Potential impact: credible specific user problem and shared community tools/services.
- Quality of idea: creative non-obvious use of open agentic websites and evidence of domain understanding.

No prize outcome can be guaranteed. The objective is strong evidence, not unsupported claims.
