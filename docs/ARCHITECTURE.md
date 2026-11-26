# Architecture — TrustMesh

## Components
1. Public TrustMesh site: standard web page, agent network JSON and browser runtime.
2. Profile-aware network validator: validate references, agent graph and supported definitions before model calls.
3. Browser orchestrator: bounded front-agent execution, streaming, delegation, errors and cancellation.
4. Delegation gateway: origin binding, capability allowlist, payload minimization, explicit approval and effect classification.
5. Partner demo site: independent origin exposing a narrow research capability.
6. Receipt engine: ordered events, redaction, canonical serialization and integrity verification.
7. Conformance/security harness: profile fixtures, schema tests, multi-origin tests and adversarial cases.
8. Optional PBT-G adapter: local user-approved browser capability boundary; not required by hosted site.

## Trust boundaries
- Browser page ↔ fetched public manifest.
- TrustMesh origin ↔ partner origin.
- Browser runtime ↔ model router/provider.
- Browser runtime ↔ MCP server.
- Untrusted agent output ↔ local site action.
- Approval UI ↔ capability dispatch.

## Mandatory security rules
- Manifest is declarative data; never eval/import/execute manifest-supplied code.
- Validate URL scheme, origin, redirects, references and response size.
- CORS is transport permission, not user authorization.
- Bind consent to origin + manifest digest + agent + capability + payload digest/schema + effect + expiry.
- Never forward model credentials, cookies, localStorage or browser-profile data.
- Validate every request and response schema.
- Bound time, model calls, tool calls, delegation depth, history and payload size.
- Treat model and remote output as untrusted.
- Do not claim hash-chain integrity equals digital signature or non-repudiation.

## Profile-first rule
The pinned official MVP profile is normative for network schema, runtime behavior, MCP baseline, site actions, LLM routing and cross-site composition. TrustMesh can add stricter policy but must preserve interoperability.

## PBT-G boundary
Optional local adapter only. Never expose a general-purpose local shell or arbitrary browser automation to remote agents. Hosted demo must run without desktop software.
