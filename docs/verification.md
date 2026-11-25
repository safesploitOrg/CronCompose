# Verification report - 0.1.0-alpha.5

**Outcome:** GNU date discovery compatibility fix implemented and locally verified. Native Ubuntu 26.04 and macOS, hosted CI for the revised candidate, browser verification and release approval remain outstanding. No remote changes or deployment performed.

## Scope and baseline

- SFW Profile B with applicable D deployment controls; T1 test infrastructure change. Existing T2 parser/deployment release review remains required.
- Investigated PR #1 (`staging`, head `785d54c7cc08422cf36ae6d442178d6dfc2fd8e7`), run [45639316871](https://github.com/safesploitOrg/CronCompose/actions/runs/45639316871), job `139293227253`. The runner reports `ubuntu-26.04`; source validation, 54 unit tests, Gitleaks and CodeQL passed. Integration failed before executing cases; audit/package/deployment skipped.
- Root cause: the resolver searched `date` and `gdate`, not Ubuntu's `gnudate`. Ubuntu 25.10+ defaults to Rust uutils for most commands and retains GNU-prefixed binaries ([Ubuntu release notes](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/)). The hosted log did not print the executable versions; the precise selection is inferred from the image and source. The missing-name failure was independently reproduced using a simulated Ubuntu-style PATH.
- Changed files: `tests/helpers/gnu-date.js`, `tests/unit/gnu-date.test.js`, `package.json`, `package-lock.json`, `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `CHANGELOG.md`, `docs/testing.md`, `docs/verification.md`.
- Production `public/`, integration test file and `.github/` are unchanged. GNU identity verification and failure-on-missing semantics remain. The generated shell commands still require GNU `date` on the target host; CI discovery does not change their runtime requirements.

---

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Baseline normal GNU Linux | PASS | `npm run check`, 93/93 |
| Baseline simulated Ubuntu | FAIL (expected reproduction) | Only Rust-style `date` stub and real GNU binary named `gnudate` in PATH; alpha.4 rejected discovery |
| Reproducible npm install | PASS | `npm ci --ignore-scripts --no-audit --no-fund` |
| Source validation | PASS | `npm run lint` via `npm run check` |
| Unit tests | PASS | 57/57, including three additional Ubuntu resolver regressions |
| Shell integration | PASS | 39/39 with actual `/bin/sh` and GNU Coreutils 9.7 on Linux, Node 22.16.0 |
| Combined quality check | PASS | `npm run check`, 96/96, no skipped tests |
| Simulated Ubuntu PATH | PASS | 39/39 with Rust-style `date` stub and actual GNU date symlinked as `gnudate`; fixture-only discovery PATH |
| Simulated Homebrew PATH | PASS | 39/39 with BSD-style `date` stub and actual GNU date symlinked as `gdate`; fixture-only discovery PATH |
| Rust-only and explicit Rust override | PASS (expected rejection) | New unit regressions preserve blocking failure |
| Dependency audit | PASS | `npm audit --audit-level=high --fetch-retries=0 --fetch-timeout=6000`, zero vulnerabilities |
| Public assets and workflow diff | PASS | `diff -qr` for both directories; unchanged |
| Native Ubuntu 26.04/macOS | NOT RUN | Simulated discovery is not native runtime verification |
| Browser/accessibility | NOT RUN | No UI changes; inherited verification outstanding |
| Gitleaks/CodeQL on alpha.5 and remote CI | NOT RUN | Prior revision passed remote security gates; updated revision not pushed |

---

## Security and release status

No tests skipped or gates weakened; no dependencies or production code changes. No new vulnerability findings from the executed checks. The existing temporary Playwright exclusion, full browser/accessibility verification, cron daemon tests, empty licence, updated hosted security checks and owner release approval remain outstanding. On a target using uutils, ensure generated guards use GNU date before installation; do not assume uutils compatibility from this suite. No remote actions were taken. Revert the scoped patch if needed; no state migration is involved.
