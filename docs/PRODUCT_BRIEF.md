# Product Brief — TrustMesh

## Product thesis
TrustMesh is a trust and delegation layer for the open agentic web. It makes cross-site agent collaboration understandable, permissioned and inspectable.

## Target user
A person asking one agentic website to coordinate a bounded task with agents published by other websites.

## Problem
Users cannot easily reason about which remote agent is being invoked, what it can do, what data it receives, which side effects are possible, or what happened after approval.

## Hero workflow
User asks: "Compare two public service options using information from two independent demo sites and show your evidence."

1. Front agent plans a bounded research request.
2. Browser runtime fetches and validates its public network definition.
3. Front agent requests delegation to the partner website.
4. Consent UI shows exact origin, agent, capability, purpose, data payload preview, effect and expiry.
5. User approves or rejects; rejection is terminal for that attempt.
6. Runtime invokes only the approved declared capability.
7. Result is validated against a strict schema and treated as untrusted.
8. Front agent produces an evidence-backed comparison.
9. Receipt panel displays events and supports JSON export plus integrity verification.

## Promise
"Agents can work across the web. You stay in control of what they can access and do."

## Judging alignment
- Design: complete coherent workflow, not a chat-only proof of concept.
- Potential impact: reusable trust components, fixtures and documentation that the community can adopt.
- Quality of idea: consent, bounded delegation and proof are the product, not decorative features around an LLM.
- Execution: real two-origin browser interoperability, tests, accessible UI and visible success/failure states.

## Scope
### Must ship
Two origins; public profile-conformant JSON; browser runtime; user interface; consent-bound delegation; useful research workflow; redacted verifiable receipts; conformance/security/browser tests; public deployment and all submission artifacts.

### Should ship
Bring-your-own-key configuration; optional approved MCP capabilities; responsive accessible UI; third-party interoperability test target.

### Excluded before submission
Autonomous payments; unbounded background agents; cross-origin session/cookie access; central registry dependency; desktop-only submission; unsupported claims of cryptographic identity or tamper-proof audit.

## Success metrics
- First task completion in under 3 minutes on a clean browser.
- 100% cross-origin requests have explicit scoped approval.
- Zero credentials or private profile data in manifests, network requests, logs or receipts.
- 100% invalid/unsupported fixtures are rejected before model invocation.
- Reproducible two-origin demo in a current clean browser.
- Every judge-facing claim has test or live-demo evidence.
