# Local Demo and Two-Origin Verification

## Prerequisites

- Node.js 24
- npm
- A modern browser
- No API key is required for local deterministic mock tests; a real browser conversation requires a visitor's own provider key

## Start the two independent origins

Open two terminals in the repository root.

Terminal 1:

```powershell
npm run dev
```

Terminal 2:

```powershell
npm run dev:partner
```

Open these distinct local origins in a normal browser:

- TrustMesh caller site: http://127.0.0.1:4173/
- Independent partner site: http://localhost:4174/

These are separate origins. Do not replace one hostname with the other: the hostnames are intentionally different even though both resolve to loopback.

## Optional local mock mode

The mock is deterministic test scaffolding and is not a real language model. It must never be deployed publicly.

```powershell
$env:TRUSTMESH_DEMO_MOCK = "true"
npm run networks:build
Remove-Item Env:TRUSTMESH_DEMO_MOCK
```

The builder rejects mock mode if either configured origin is not a loopback host. Production builds omit this flag and retain the published BYOK configuration.

## Automated local and public checks

Local two-origin conformance:

```powershell
npm run test:two-origin
```

Public production deployment smoke check:

```powershell
npm run test:public
```

The public check validates both roots, manifest/network/links/runtime/bridge resources, CORS headers, the caller's peer allowlist and the partner bridge's exact caller-origin allowlist.

## Complete local acceptance gate

```powershell
npm run check
```

This runs TypeScript checks, unit/security tests, the local two-origin check and production builds for both sites.

## What the current public demo does not prove

- A real model's tool selection, reasoning or natural-language synthesis.
- The full browser-driven two-stage peer consent and execution journey.
- A live external MCP service or production credentials.
- Publisher identity or a signed, non-repudiable receipt.
- Devpost eligibility confirmation, video ownership or final submission.

Do not describe a mock response as a real LLM response. Do not present fictional sample records as official services.
