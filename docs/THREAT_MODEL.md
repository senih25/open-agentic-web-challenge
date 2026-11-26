# Threat Model

## Assets
User intent, private context, model credentials, browser cookies/profile, site action handlers, public manifest integrity, availability and receipt privacy.

## Adversaries
Compromised agent site; prompt-injection content; malformed/oversized manifest; malicious MCP server; origin confusion/redirect attacker; consent replay; accidental leakage in logs or demo media.

## Controls
Strict schema and size/depth limits; HTTPS-only remote discovery; explicit origin and capability consent; redirect checks; no manifest code execution; payload minimization; request-digest-bound short-lived consent; credential isolation; schema-validated outputs; safe text rendering; request limits and cancellation; redaction; CSP/security headers; dependency pinning and secret scanning; negative tests.

## Residual risks
A browser runtime cannot make model output inherently trustworthy. Users can approve harmful actions; consent UX must be specific. External CORS may fail. Desktop adapters expand attack surface. Hashes alone do not prove authorship or non-repudiation.
