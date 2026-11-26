# Local Demo and Two-Origin Verification

## Prerequisites

- Node.js 24
- npm
- A modern browser
- No API key is required for the local deterministic mock demonstration

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

Open these URLs in a normal browser:

- TrustMesh caller site: http://127.0.0.1:4173/
- Independent partner site: http://localhost:4174/

These are separate origins. Do not replace one hostname with the other: the hostnames are intentionally different even though both resolve to loopback.

## Optional local mock mode

The mock is deterministic and is not a real language model. It must never be deployed publicly.

```powershell
$env:TRUSTMESH_DEMO_MOCK = "true"
npm run networks:build
Remove-Item Env:TRUSTMESH_DEMO_MOCK
```

The builder rejects mock mode if either configured origin is not a loopback host. Production builds omit this flag and retain the published BYOK configuration.

## Automated two-origin check

```powershell
npm run test:two-origin
```

The check builds both public networks, starts the local servers if they are not already running, checks their manifests, and runs the upstream-derived partner conformance checker with the actual caller Origin. It verifies public manifest/network/links/bridge retrieval and the partner bridge's caller-origin allowlist.

## Test and production build

```powershell
npm run check
```

This runs TypeScript checks, unit/security tests, and production builds for both sites.

## What the local demo does not prove

- Public HTTPS hosting or availability from an external network.
- A real model's tool selection, reasoning, or natural-language synthesis.
- A live external MCP service or production credentials.
- Publisher identity or a signed, non-repudiable receipt.
- Devpost eligibility confirmation, video ownership, or final submission.

Do not describe a mock response as a real LLM response. Do not present fictional dataset entries as official services.
