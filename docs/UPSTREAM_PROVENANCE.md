# Upstream Provenance and Runtime Risk Review

## Source checkout
- Repository: https://github.com/cognizant-ai-labs/agentic-web
- Local-only checkout: `_upstream/` (ignored by Git; not redistributed)
- Checkout commit: `c607e5fd8d6a327ad02bf4c371ce4f809264e747`
- Commit date: 2026-11-25T13:31:39-08:00
- Upstream repository license: Apache License 2.0.
- The source checkout is for inspection and building, not a vendored dependency.

## Tools inspected
The starter includes `skills/agentify-website/scripts/build_network.mjs`, `check_partner.mjs`, and `serve_site.mjs`. They are used as conformance/build/hosting references and can be run from the ignored local checkout. They are not copied into the public package at this stage.

## Runtime inspected
The agentify-website runtime identifies itself as a modified copy of the nsDeploy browser runtime (Apache-2.0) at nsDeploy commit `53a787c` (2026-11-11). The skill's runtime README explains several downstream modifications, including local actions, peer network execution in caller browser, router/step-limit inheritance, and UI changes.

## Known incompatibility to resolve before product runtime adoption
The inspected skill runtime's documentation says same-site `write` actions run immediately and only `irreversible` actions require confirmation. The pinned MVP Profile 0.2 requires the runtime to show the user the destination and arguments before a `write` or `irreversible` operation (spec section 3.1). Therefore the upstream runtime cannot be accepted unchanged as TrustMesh's production runtime without a tested patch or a compliant alternative.

The skill's linking guide also documents that the peer consent card displays only the first 140 characters while the peer receives the full request, and an "Always allow" choice can skip future cards for the host until reload. TrustMesh must not adopt this relaxed behavior as its default. Its own UI/policy must bind approval to exact target network, capability and payload and ensure the exact payload shown is what is dispatched.

## Provenance discipline
- Keep `_upstream/` excluded from the public Git history.
- If upstream code is copied later, copy only the required files, keep original license and notices, add a changed-file notice, pin source commit, record hashes and document local modifications.
- Inspect any nested dependency license separately.
- No source code is represented as TrustMesh-original unless independently implemented.
