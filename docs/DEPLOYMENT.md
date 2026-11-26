# Public Deployment

## Cloudflare Pages projects

The two sites are independently deployed through Cloudflare Pages and connected to the GitHub repository `senih25/open-agentic-web-challenge`.

| Site | Pages project | Production origin | Build command | Output directory |
|---|---|---|---|---|
| TrustMesh caller | `trustmesh-agentic-web` | https://trustmesh-agentic-web.pages.dev | `npm run pages:build:trustmesh` with both origin variables | `dist/trustmesh-site` |
| Open Housing Guide partner | `trustmesh-open-housing-guide` | https://trustmesh-open-housing-guide.pages.dev | `npm run pages:build:partner` with both origin variables | `dist/partner-demo-site` |

Both projects use the repository root as their build root, Node.js 24 via `.nvmrc`, and the `main` branch for production deployments. Pages may also show preview deployment records for pull requests or Dependabot branches; those are not the production origins.

## Verified production release

- GitHub PR: https://github.com/senih25/open-agentic-web-challenge/pull/18
- Main commit: `20c9b9676ba12382830c8da882a4baaebe103b7e`
- TrustMesh production deployment: Cloudflare deployment `3f40a901`, completed successfully.
- Open Housing Guide production deployment: Cloudflare deployment `a3aaa9c8`, completed successfully.
- Both deployments were built from the same `main` commit.
- Both stable production URLs returned HTTP 200 in the normal Chrome profile.
- Both pages returned no browser console errors or warnings in the inspected production session.

The pages are publicly reachable. The user-facing chat does not start a real model until the visitor configures their own AI provider key.

## Required build environment

Both projects must use the same values:

- `TRUSTMESH_ORIGIN=https://trustmesh-agentic-web.pages.dev`
- `PARTNER_ORIGIN=https://trustmesh-open-housing-guide.pages.dev`

The caller build publishes the partner origin in `allowed_peers`, the HOCON peer URL and link label. The partner build publishes the caller origin in the partner action bridge's `callerOrigins`. Do not change one project's variables without changing the other and rebuilding both.

## Build commands

Caller project:

```sh
TRUSTMESH_ORIGIN=https://trustmesh-agentic-web.pages.dev PARTNER_ORIGIN=https://trustmesh-open-housing-guide.pages.dev npm run pages:build:trustmesh
```

Partner project:

```sh
TRUSTMESH_ORIGIN=https://trustmesh-agentic-web.pages.dev PARTNER_ORIGIN=https://trustmesh-open-housing-guide.pages.dev npm run pages:build:partner
```

The commands sync the patched runtime, regenerate public manifests and resolved networks, and build only the relevant site.

## CORS and headers

CORS is enabled only for public discovery/execution artifacts: `agent-manifest.json`, resolved `*.network.json`, `links.json`, `.well-known/*`, `bridge/*` and `runtime/*`. Other paths receive baseline security headers without blanket CORS.

CORS makes public artifacts fetchable; it is not authorization. Runtime origin policy and explicit user consent remain mandatory.

## Public-origin smoke test

From a machine with Node.js 24 and network access:

```powershell
npm ci
npm run test:public
```

The command checks both production page roots and public discovery/runtime/bridge artifacts, CORS response headers, caller `allowed_peers`, the caller's partner network URL, the partner network's public front agent, and the bridge's exact `callerOrigins` allowlist.

The public conformance checker can also be run directly:

```powershell
node packages/conformance/scripts/check_partner.mjs https://trustmesh-open-housing-guide.pages.dev/open_housing_guide --origin https://trustmesh-agentic-web.pages.dev
```

The partner bridge HTML path is canonicalized by Cloudflare Pages from `/bridge/action-bridge.html` to `/bridge/action-bridge` on the same origin. The checker follows this same-origin redirect and confirms the bridge resource is available.

## Release limitations

Public hosting and cross-origin artifact discovery are verified, but this is not yet proof of a complete real-model task. A provider-backed chat conversation, browser-driven discovery consent, exact field approval, partner invocation and final synthesized response must still be demonstrated with a real provider key in a clean browser session.

Do not enable the deterministic local mock on public origins. A real provider-backed model workflow must be tested separately. The demo dataset remains fictional and read-only.
