# Open Agentic Web Challenge — TrustMesh

**A browser-native, permissioned agent network with portable delegation and verifiable execution receipts.**

TrustMesh is a public, open-source agentic website built for the Cognizant Open Agentic Web Challenge. It demonstrates independent websites publishing discoverable agent networks, browser-side execution, human-approved cross-site delegation, and reviewable execution receipts.

> Status: foundation created; implementation in progress. Conformance is NOT claimed until the pinned challenge profile passes the acceptance suite.

## Product thesis

Agents should be able to collaborate across the web without silently inheriting a user's permissions. TrustMesh makes each delegation's origin, capability, payload scope, side effects, approval and outcome visible.

## Judge-facing hero workflow

1. Two independently hosted sites publish public agent-network JSON and browser runtime files.
2. A visitor asks the TrustMesh front agent to run a bounded research workflow.
3. The runtime validates its network before any model call.
4. TrustMesh requests delegation to the partner site's research agent.
5. A consent panel displays origin, purpose, exact capability, data preview, effect and expiry.
6. The user approves or rejects; rejection blocks dispatch.
7. The partner agent returns schema-validated structured evidence.
8. The front agent synthesizes the evidence.
9. A redacted execution receipt records origins, manifest digests, consent events, capability calls and outcomes.

## Differentiators

- Consent-first cross-origin delegation bound to origin, manifest digest, agent, capability, payload and expiry.
- Declarative manifests; remote JSON is never executed as code.
- Strict schema validation and capability allowlisting.
- Redacted, verifiable execution receipts.
- Reusable conformance and adversarial test fixtures released for the community.
- Optional PBT-G integration as a local safety adapter, never a hosted-runtime dependency.

## Challenge deliverables

- Public, profile-conformant `.json` agent-network file.
- Browser runtime using standard web technologies.
- User/agent interaction interface.
- Successful interaction with an independent agentic website.
- Public HTTPS deployment, English description and test instructions.
- Public YouTube demo under two minutes, with the entrant personally explaining the project.
- Screenshots and rule-compliant original/licensed media.

See [compliance matrix](docs/CHALLENGE_COMPLIANCE.md), [product brief](docs/PRODUCT_BRIEF.md), [architecture](docs/ARCHITECTURE.md), [threat model](docs/THREAT_MODEL.md), [roadmap](docs/ROADMAP.md).

## Repository layout

```
apps/trustmesh-site/       Public agentic website and UI
apps/partner-demo-site/    Independent second-origin website
packages/web-runtime/      Profile-compatible browser runtime adapter
packages/delegation-gateway/ Consent, origin and capability policy
packages/receipts/         Redacted execution receipts and verification
packages/conformance/      Profile validators and fixtures
spec/pinned/               Exact challenge profile and source metadata
docs/                      Architecture, compliance, threat model, demo
tests/integration/         Two-origin end-to-end tests
tests/security/            Adversarial policy tests
```

## Development principles

- Build against the exact challenge-start MVP Profile 0.2/0.3, not moving upstream main.
- Never evaluate executable code from a fetched manifest.
- Never send model credentials, cookies, local storage or browser-profile data to another origin.
- Bind approval to an exact request and expire it.
- Treat remote agent output as untrusted data.
- Enforce timeouts, call budgets, depth limits, cancellation and payload limits.
- Keep the public network definition separate from confidential site policy.
- The public website must work in a normal browser without PBT-G or Desktop Commander.

## Existing PBT-G components

Potential adapters only; do not copy private implementation wholesale:
- `senih25/browser-edition-desktop`
- `senih25/pbt-native-core`
- `senih25/pbtg-browser-qa-guard`

Use only code with clear provenance, redistribution rights and compatible licenses. Keep the contest submission's original work and post-start changes auditable.

## License

TBD pending provenance and dependency review. No license is implied until a LICENSE file is added.
