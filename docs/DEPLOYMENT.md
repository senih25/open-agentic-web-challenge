# Public Deployment

## Cloudflare Pages projects

The public deployment uses two separate Cloudflare Pages projects connected to the GitHub repository `senih25/open-agentic-web-challenge`.

| Site | Pages project | Production origin | Build command | Output directory |
|---|---|---|---|---|
| TrustMesh caller | `trustmesh-agentic-web` | https://trustmesh-agentic-web.pages.dev | `npm run pages:build:trustmesh` with both origin variables | `dist/trustmesh-site` |
| Open Housing Guide partner | `trustmesh-open-housing-guide` | https://trustmesh-open-housing-guide.pages.dev | `npm run pages:build:partner` with both origin variables | `dist/partner-demo-site` |

Both projects use the repository root as their build root and Node.js 24 via `.nvmrc`. Production deployments are enabled from `main`; preview deployments are disabled until the cross-origin preview configuration is separately designed.

Build environment values must match exactly on both projects:

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

The commands sync the patched runtime, regenerate public manifests and resolved networks, and build only the relevant site. Both commands were run locally with the production HTTPS origins and the generated origins were verified.

## CORS and headers

Static CORS headers are applied only to the public artifacts required for discovery and execution: `agent-manifest.json`, resolved `*.network.json`, `links.json`, `.well-known/*`, `bridge/*` and `runtime/*`. All other paths receive baseline security headers without blanket CORS.

CORS makes public artifacts fetchable; it is not authorization. Runtime origin policy and explicit user consent remain mandatory.

## Release sequence

1. Merge the reviewed pull request to `main`.
2. Confirm both Cloudflare Pages builds complete from the same commit.
3. Open both production URLs in a clean browser.
4. Verify the caller manifest allows the exact partner origin and references the partner network URL.
5. Run the partner checker against the public origin using the actual caller Origin.
6. Confirm browser console/network behavior and record screenshots.
7. Do not enable the deterministic local mock on public origins. A real provider-backed model workflow must be tested separately.

## Known deployment limitation

The local release candidate has not demonstrated a real provider-backed model conversation. A public static deployment does not, by itself, prove the model can select tools correctly, complete the user consent workflow or synthesize peer evidence. That workflow remains an explicit release-evidence gate.
