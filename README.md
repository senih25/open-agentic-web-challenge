# TrustMesh — Open Agentic Web Challenge

**An open agentic web network with consent-bound delegation, origin-aware execution and verifiable disclosure receipts.**

TrustMesh is an independently built challenge entry for the Cognizant Open Agentic Web Challenge. It demonstrates how two ordinary websites can publish portable agent networks while keeping cross-site disclosure under explicit user control.

## The product

A visitor starts on TrustMesh, the caller website. Its browser runtime can discover the independent Open Housing Guide network published on a second origin. Before the peer is contacted, the visitor reviews the destination. After the public network has been fetched and validated, a second review binds the exact request payload and chosen fields to a disclosure decision. Peer calls receive only the approved projection; private browser context and credentials are not forwarded.

The partner is deliberately read-only and uses fictional sample data. It cannot submit applications, assess eligibility, contact an agency or claim that a real service has been checked.

## Why it is different

- **Two-stage, origin-aware consent:** approval to discover a peer is separate from approval to send an exact data payload.
- **Approval-bound payloads:** field allowlists and SHA-256 payload digests are checked again before dispatch.
- **Deny-by-default private context:** browser cookies, local storage, provider credentials and private runtime context are not sent to peer networks.
- **Read-only peer bridge:** the partner only exposes explicitly registered read capabilities to the caller.
- **Fail-closed policy:** missing consent UI, invalid payloads and unapproved origins stop the invocation.
- **Reviewable evidence:** consent receipts record the fields shared or withheld without storing the sample values.
- **Reusable verification:** an automated two-origin checker exercises manifest, network, CORS and bridge publication.

## Current implementation status

The two-site MVP is deployed on separate public HTTPS origins through Cloudflare Pages. Both production builds completed from the merged `main` commit, and both pages load in the normal Chrome profile without console errors or warnings. The public partner manifest, resolved network, links, action bridge, bridge manifest and bridge actions pass the cross-origin conformance checker from the real TrustMesh caller origin. A repeatable public-origin smoke check is available as `npm run test:public`.

**The entry is deployed, but not yet submission-complete.** A real provider-backed chat run and browser-driven two-stage peer handoff have not yet been verified; the live sites currently require a visitor-supplied AI provider key. Final screenshots, the entrant's personally recorded sub-2-minute demo video, and the Devpost submission remain release gates. The built-in browser mock is deterministic test scaffolding, not a real LLM, and is blocked for public origins.

Conformance is claimed only for the specific checks listed in [the compliance matrix](docs/CHALLENGE_COMPLIANCE.md), not for the full challenge profile.

## Judge-facing workflow

1. Two independently hosted sites publish a public `agent-manifest.json`, a resolved network definition and their browser runtime assets.
2. A visitor asks the TrustMesh front agent to find public information.
3. The caller runtime validates the peer manifest and network before invocation.
4. The visitor reviews the peer origin and approves discovery.
5. The caller shows a second consent screen for the exact proposed fields and payload.
6. The visitor approves or rejects. Rejection prevents the partner call.
7. The peer receives only the approved projection and returns fictional read-only guidance.
8. The caller reports the result and records a redacted receipt.

## Repository layout

```text
apps/trustmesh-site/        Caller website and TrustMesh agent
apps/partner-demo-site/     Independent Open Housing Guide partner
packages/web-runtime/       Browser runtime adapter and profile tests
packages/delegation-gateway/Consent, payload projection and receipt logic
packages/conformance/       Upstream-derived network builder/checker
config/networks/            Canonical HOCON network sources
scripts/                    Runtime sync, network generation and E2E checks
spec/pinned/                Exact challenge-start MVP Profile 0.2 source
docs/                       Product, architecture, security and release evidence
```

## Run locally

Requirements: Node.js 24 and npm.

Install dependencies:

```powershell
npm ci
```

Start the caller in terminal 1:

```powershell
npm run dev
```

Start the independent partner in terminal 2:

```powershell
npm run dev:partner
```

Open the two distinct local origins:

- http://127.0.0.1:4173/
- http://localhost:4174/

Run the complete local acceptance gate:

```powershell
npm run check
```

This performs TypeScript checks, unit/security tests, two-origin manifest/CORS/bridge verification and production builds for both sites. See [the demo runbook](docs/DEMO_RUNBOOK.md), [public deployment notes](docs/DEPLOYMENT.md), and the [90-second video script](docs/VIDEO_SCRIPT.md) for repeatable testing and submission preparation.

## Normative baseline and provenance

The repository pins **MVP Profile 0.2 (6 November 2026)**, the challenge-start specification identified in the repository's source history. The moving Profile 0.3 document is not silently substituted for the challenge-start baseline. See [the pinned specification](spec/pinned/README.md), [the compliance matrix](docs/CHALLENGE_COMPLIANCE.md) and [upstream provenance](docs/UPSTREAM_PROVENANCE.md).

Cognizant Agentic Web and nsDeploy-derived files retain their Apache-2.0 notices. The project does not imply endorsement by Cognizant, Mozilla, MIT, AWS or other upstream authors.

## Security

See [the threat model](docs/THREAT_MODEL.md) and [security reporting policy](SECURITY.md). Do not place secrets, API keys, browser cookies, private datasets or personal data in public manifests, HOCON, test fixtures, issues or screenshots.

## Roadmap and release gates

The competition deadline is 11 January 2027 at 08:00 Pacific Time. A release is not complete until the two sites are publicly deployed over HTTPS, a real model-backed workflow is recorded, an independent browser can complete the peer handoff, and the submission media and Devpost entry are reviewed. See [the roadmap](docs/ROADMAP.md).

## License

Apache-2.0 for TrustMesh-authored code and documentation, subject to the notices and provenance of incorporated upstream-derived components.
