# Architecture — TrustMesh

## Product workflow
TrustMesh implements a consent-carrying service handoff between independent Agentic Web sites. The caller loads the partner's declarative agent network in the visitor's browser under MVP Profile 0.2, and the user controls each external-origin contact.

## Components
1. Public TrustMesh site: public `agent-manifest.json`, resolved network JSON, `links.json`, browser runtime and user interface.
2. Profile-aware network validator: validates front-agent identity, graph references, schemas, supported definitions and size/depth before any model call.
3. Browser orchestrator: bounded front-agent execution, delegation, streaming, cancellation and accurate error propagation.
4. Disclosure gateway: field allowlist, purpose, origin, agent, capability and payload binding; explicit per-origin consent.
5. Independent partner demo site: a second origin with its own public manifest/network/runtime and a narrow service-information capability.
6. Receipt engine: versioned, redacted events, canonical payload digest and integrity verification.
7. Conformance/security harness: positive/negative fixtures, two-origin browser tests and adversarial cases.
8. Optional PBT-G adapter: separate, local, user-approved capability integration; never a hosted runtime dependency.

## Trust boundaries
- Browser page ↔ public manifest/network JSON.
- TrustMesh origin ↔ peer origin.
- Browser runtime ↔ user's selected inference router.
- Browser runtime ↔ third-party MCP endpoint.
- Untrusted peer instructions/model output ↔ caller policy and UI.
- User consent ↔ site action dispatch.

## Profile 0.2 invariants
- Published networks are declarative HOCON/JSON data; do not depend on local includes or substitutions after publication.
- Private context (`sly_data`) is deny-by-default between agent sites. Explicitly name any fields allowed downstream/upstream.
- Peer agents run in the caller's browser on the caller's router/model and execution limits.
- The caller's credential never goes to the peer site, prompts, manifests, actions, traces or receipts.
- Every third-party-origin contact requires origin + purpose and approval by default; every further hop repeats policy and consent.
- Third-party MCP discovery/calls are approval-gated.
- Same-site write/irreversible actions require validated arguments and display of destination + arguments before execution.
- Unknown outcome after a write begins is reported as unknown; browser runtime does not independently retry.
- Execution is bounded by composition depth, agent invocations, remote calls, concurrency and elapsed time.
- Never bypass browser CORS/origin controls.

## Consent binding (TrustMesh extension)
A TrustMesh approval record is scoped to:
- target origin and requested peer-network URL;
- exact public manifest and resolved-network content digest;
- agent name and capability/tool name;
- validated schema identifier/version;
- canonical request payload digest and explicit field allowlist;
- declared effect/purpose and short expiry;
- one execution attempt (no reusable wildcard approval by default).

A consent decision is not an authentication of the peer publisher and does not imply the partner's instructions are safe.

## Receipt semantics
Record origin, network digest, agent/capability, field names shared/withheld, payload digest, consent outcome, timestamps, tool outcome and result digest. Do not store raw sensitive values, credentials or full user prompts. A digest detects accidental mutation relative to the retained receipt/checkpoint; it does not prove who created the receipt.

## Optional PBT-G boundary
PBT-G may support local, explicitly approved browser capabilities. Do not expose shell, broad DOM, filesystem, profile or generic browser-control tools to any remote agent. The public flow must work without the desktop app.
