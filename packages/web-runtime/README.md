# TrustMesh browser runtime

This folder contains the browser-side Agentic Web runtime used by both public TrustMesh sites. The runtime runs in the visitor's browser: a peer network is fetched from its published manifest and HOCON/JSON, validated, compiled, and invoked locally using the caller's browser, model/router and execution limits. No remote agent server is required for peer composition.

## Provenance and license

The runtime is derived from the Agentify Website runtime distributed in the Cognizant Agentic Web starter (Apache-2.0), which in turn identifies its nsDeploy browser-runtime base at commit `53a787c` dated 11 November 2026. Original Apache notices are retained in `LICENSE.txt`; the repository-level provenance and source commit are recorded in `docs/UPSTREAM_PROVENANCE.md` and `NOTICE`.

Do not remove upstream notices. Any future copied or adapted file must have provenance recorded and its license reviewed before redistribution.

## TrustMesh security modifications

### Site actions
- Local `read` actions may execute without a confirmation dialog.
- Every local `write` and `irreversible` action requires a pre-dispatch confirmation callback.
- If the confirmation callback is missing, state-changing action tools are not offered.
- The confirmation callback receives the action name, origin, effect, and validated arguments before any action starts.
- A declined action does not invoke its handler.
- Timeouts and uncertain write outcomes remain `unknown`; the browser runtime does not automatically retry them.

### Peer action bridge
- Peer networks cannot call the caller site's local actions.
- In TrustMesh MVP, a partner bridge exposes only explicitly registered `read` actions.
- Partner bridge action caller origins are exact origins, not wildcard permissions.
- No write-capability bridge is exposed to a peer.

### Cross-origin peer consent
1. Before a third-party origin is contacted, the runtime asks for approval to retrieve that origin's public manifest and exact named network. The initial approval contains no user request text or private context.
2. After the network is fetched and validated, the runtime asks for a separate field-level data disclosure decision.
3. The consent callback must return a projected JSON object, receipt ID, payload digest, shared-field list and withheld-field list.
4. Immediately before invocation, the runtime parses the JSON again, checks that the leaf paths exactly equal the approved list, checks that shared and withheld paths are disjoint, and recomputes SHA-256 over the exact bytes to be sent.
5. A mismatch fails closed. The peer receives only that approved JSON payload.
6. `sly_data` is empty for every peer call in the TrustMesh MVP.
7. Each additional peer/MCP hop uses the runtime's origin policy and consent flow.

A remembered origin-level "Always allow" response is normalized to a one-time allow by the TrustMesh UI wrapper. It cannot bypass the per-request field disclosure step.

## Runtime layout

- `index.js`: browser runtime entry and UI mounting.
- `engine.js`: top-level network loading, peer resolution, consent lifecycle and orchestration.
- `runner.js`: model tool loop, local site action gating and peer dispatch.
- `actions.js` / `action-transport.js`: typed site action registry, validation, bridge transport and confirmation.
- `remote.js`: fetch-and-run-locally peer network loading.
- `sandbox.js` / `sandbox-worker.js`: sandboxed coded tool execution.
- `generated/`: upstream-generated browser runtime bundle artifacts; retain their provenance.

## Maintenance

The runtime is copied to each site's `public/runtime/` directory by:

```sh
npm run sync:runtime
```

Do not edit the copies under either site's `public/runtime/` by hand. Edit `packages/web-runtime/`, run the full test/build checks, and sync both sites.
