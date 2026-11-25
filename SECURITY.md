# 🔐 Security

## Security model

CronCompose runs locally in a static browser page. Inputs are untrusted. No runtime package dependencies, telemetry, backend, automatic command execution or user data transmission. The browser may contact its hosting service when loading the page; external documentation links are user-initiated.

| Risk | Control |
| --- | --- |
| DOM injection | Render text through `textContent` and input/textarea values; no dynamic HTML |
| Cron structural injection | Bounded fields, reject command line breaks and NUL; validate system username |
| Shell wrapping errors | POSIX shell quoting, reject user percent signs for extended mode, regression tests |
| Calendar error | Separate trigger and guard; independent calendar fixtures, fail closed on date failure |
| Sensitive data persistence | Allowlist theme/density/layout/section names only |
| Supply chain | No npm dependencies; committed lock; SHA-pinned CI actions and hash-verified scanner |
| Deployment compromise | Gate same revision; deploy-only OIDC and Pages write permissions |

Residual risks: generated commands may themselves be unsafe, calendar validity is limited to supported syntax, shell/dialect/timezone differences exist, and static-host HTTP header control is limited. Meta CSP is not a substitute for server-side headers (notably `frame-ancestors`). No claim of complete security or release readiness.

---

## Vulnerability policy and reporting

Please use GitHub private vulnerability reporting if enabled, or contact the repository owner through an agreed private channel. Do not disclose secrets or exploit details in public issues.

SFW v1.1 applies. Exposed credentials, active exploitation and reachable critical findings block release. Gitleaks findings and any CodeQL SARIF finding block CI pending review; no silent allowlists. `npm audit` blocks high/critical dependency findings; lower findings must be triaged under SFW. Review exceptions and owner approval before deployment. See [testing](docs/testing.md) and [exceptions](docs/exceptions.md).
