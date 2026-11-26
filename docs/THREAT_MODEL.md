# Threat Model

## Assets
User intent and personal context; model credentials; browser cookies/profile; field-level service request; site action handlers; published manifests; consent state; execution receipts.

## Adversaries
Compromised peer agent site; prompt injection embedded in peer instructions/results; malicious MCP endpoint; malformed/oversized/deep network graph; origin confusion and redirect attack; consent replay or payload substitution; malicious site action; accidental disclosure in logs, screenshots or receipts.

## Controls
- Strict network/schema validation and size/depth limits before model invocation.
- HTTPS-only production peer fetches; correct base/path resolution; origin/purpose consent for every third-party origin.
- Revalidate actual fetch destinations; do not bypass CORS or browser policy.
- Private context deny-by-default; field allowlist and minimization before every peer dispatch.
- Approval bound to origin, network digest, agent, capability, exact payload digest, effect and expiry.
- No credentials, cookies, localStorage, arbitrary DOM or browser profile data passed to peers.
- Validate inputs/outputs; escape remote content; treat all peer instructions and output as untrusted.
- User-visible destination and arguments before every local write/irreversible action.
- Unknown write outcome is never independently retried by the browser runtime.
- Bounded turns, agent calls, peer calls, concurrency, elapsed time, response bytes and cancellation.
- Redact logs/receipts; CSP, secure headers, dependency pinning and secret scanning.
- Adversarial tests cover each trust boundary and negative case.

## Residual risks
The runtime cannot make a malicious peer trustworthy. A user may approve a deceptive request; UI must disclose field values and effects. Browser BYOK is not isolated from other JavaScript on the same origin. CORS is not authorization. Receipt hashes do not prove publisher identity or non-repudiation. External services may become unavailable.

## Security reporting
Do not publish exploitable vulnerabilities in public issues. Follow SECURITY.md.
