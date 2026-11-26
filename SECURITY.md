# Security Policy

## Supported version

Security fixes are developed against the current default branch. There are no separate supported release branches yet.

## Reporting a vulnerability

Do not disclose exploitable vulnerabilities, secrets, personal data, or proof-of-concept exploit details in a public issue.

Use GitHub's private vulnerability reporting / security advisory workflow for this repository when it is enabled. Include the affected commit, component, impact, reproducible steps and a suggested mitigation. Do not include real user data or live credentials.

If private reporting is unavailable, contact the repository maintainer through a private GitHub channel before publishing details. Public disclosure should be coordinated after a fix or mitigation is available.

## Scope

In-scope areas include:
- Cross-origin peer discovery, redirects, CORS and origin validation.
- Consent replay, payload substitution, private-context leakage and credential handling.
- Manifest/network parser and schema-validation failures.
- Site-action authorization and write confirmation.
- Agent execution limits, sandboxing, receipt integrity and data exposure.

Do not test against third-party services, upstream projects or public websites without their authorization. Use the local demo origins and synthetic fixtures.
