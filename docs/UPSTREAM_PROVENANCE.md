# Upstream Provenance and Runtime Risk Review

## Source checkout
- Repository: https://github.com/cognizant-ai-labs/agentic-web
- Local-only checkout path: `_upstream/` (excluded from Git history).
- Inspected checkout commit: `c607e5fd8d6a327ad02bf4c371ce4f809264e747`.
- Commit date: 2026-11-25T13:31:39-08:00.
- Repository license: Apache License 2.0.

## Derived build and conformance tooling
The following Agentify Website tools/templates are copied into `packages/conformance/` with their Apache-2.0 source provenance retained in the repository NOTICE:
- `scripts/build_network.mjs`
- `scripts/check_partner.mjs`
- `scripts/serve_site.mjs`
- HOCON network template and bridge templates.

TrustMesh customizes the shared network template's peer rules to describe the two-stage consent model. The build and partner-check scripts remain upstream-derived and are not represented as TrustMesh-original.

## Browser runtime
The Agentify Website runtime is a modified copy of the nsDeploy browser runtime. Its README identifies the base as nsDeploy commit `53a787c` (2026-11-11), under Apache-2.0. The original license is retained in `packages/web-runtime/LICENSE-NSDEPLOY.txt`.

TrustMesh patches:
- `runner.js`: state-changing local actions require a confirmation callback; partner networks can receive only read-only bridge actions; peer discovery/data consent are separate; private `sly_data` is never sent to peers; the approved JSON's exact leaf paths and SHA-256 digest are revalidated before invocation.
- `engine.js`: missing consent UI/callback fails closed rather than granting an implicit allow.
- `index.js`: runtime descriptions and tool labels explain that writes and irreversible actions require review before dispatch.

The generated bundle is retained under `packages/web-runtime/generated/` and follows the upstream provenance above.

## Known limitations and review gates
- The peer runtime can validate network structure and policy, but it cannot prove the identity or good intent of an independently hosted publisher.
- The receipt digest detects modification of the receipt relative to its stored digest; it is not a digital signature or proof of non-repudiation.
- Current TrustMesh demo data is fictional and must not be presented as official service, legal, eligibility or availability data.
- No live third-party MCP integration or publisher-funded model router is exposed in the current static MVP. Direct BYOK is used.
- Public deployment and clean-browser interoperability must be verified before claiming end-to-end public operation.
