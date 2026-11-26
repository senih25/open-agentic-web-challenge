# Competitive Positioning — TrustMesh

## Challenge landscape snapshot

The official upstream Agentic Websites directory already includes projects focused on:
- agent/site discovery and conformance (Agent Atlas, Rayo);
- agent safety checks and runtime guardrails (Agent Customs, ScopeGate Studio, Agent Crash Test);
- signatures and manifest verification (NandaSeal Trust Studio);
- workflow composition (MeshWeave Studio);
- verifiable evidence and revision history (Brief Desk);
- privacy-preserving cross-site workflows (Trip Relay, BacaJelas).

A generic "agent security dashboard", a consent modal, or a hash-chained audit log is not sufficiently differentiated by itself.

## Chosen product wedge

**Consent-Carrying Service Handoff**: a user can hand a bounded service request from one independent agentic website to another with a field-by-field disclosure preview, explicit purpose, origin-bound approval, and a receipt showing exactly which structured fields were shared and which were withheld.

TrustMesh is a usable user-facing workflow, not just a scanner or protocol visualizer.

## Differentiation
1. **Field-level disclosure UX:** explain each requested data field, the reason, whether it is required, and whether it is shared. Default to the minimum payload.
2. **Consent-to-payload binding:** the approval is bound to exact origin, manifest/network digest, agent, capability, input schema, canonical payload digest, declared effect and expiration.
3. **Evidence-first service handoff:** user sees the result, sources, action boundary and next step; no agent claims an operation succeeded without a verified result.
4. **Receipt with withheld-data proof:** receipt records field names and disposition (shared/withheld), not raw values; it records digest and policy version to allow review without collecting personal data.
5. **Compatibility-first:** network manifests, peer resolution, local browser execution, MCP and consent follow the pinned Profile 0.2. The distinctive layer is an application and a stricter policy, not a competing protocol.

## Hero scenario

A user asks a primary site to assemble a service request. The primary agent discovers an independent partner's public network, explains why the partner is needed, shows a field-level preview, and requests scoped approval. The partner network runs in the caller's browser per Profile 0.2. Only explicitly allowed fields are passed. The partner returns a structured result and authoritative links. The caller creates a redacted receipt showing what was sent, what was withheld, which consent was given, and what result came back.

## Product integrity
- Do not ask users for real sensitive data in the demo. Use synthetic fixtures.
- Do not assert that a hash proves identity or non-repudiation.
- Do not imply the peer agent is trustworthy merely because its public network validates.
- Do not expose unapproved actions, credentials, cookies, localStorage or DOM to a peer.
- The user controls consent and can reject without loss of local state.
