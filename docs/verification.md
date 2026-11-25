# Verification report - 0.1.0-alpha.4

**Outcome:** Local test-harness portability fix completed. Native macOS verification and hosted CI remain outstanding. No remote changes or deployment performed.

## Scope and baseline

- Profile B with applicable D deployment controls; T1 test infrastructure change. Existing T2 parser/deployment release-review requirements remain.
- Alpha.3 baseline: 87/87 tests passed locally on Linux. Owner-supplied macOS output shows all 48 original unit tests passed; shell integration failed at setup because BSD date was selected.
- Root cause: the suite probed `date --version` and subsequently hard-coded `/usr/bin/date`, both unsuitable for the default macOS BSD executable.
- Changed files: `tests/helpers/gnu-date.js` (new), `tests/unit/gnu-date.test.js` (new), `tests/integration/extended.test.js`, `package.json`, `package-lock.json`, `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `CHANGELOG.md`, `docs/testing.md`, `docs/verification.md`.
- The resolver verifies GNU Coreutils, searches absolute PATH directories for `date` and `gdate`, and accepts a validated absolute `GNU_DATE` override. The fixture and live-date case use the same executable. Failure to locate GNU date remains blocking.
- `public/` and `.github/` are byte-identical to alpha.3. No runtime behaviour, dependencies, CI jobs or deployment permissions changed.

---

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Baseline | PASS | `npm run check`: 87/87 before changes |
| npm install | PASS | `npm ci --ignore-scripts --no-audit --no-fund` |
| Focused source checks | PASS | `npm run lint` within `npm run check` |
| Unit tests | PASS | 54/54 including six GNU date resolver regressions |
| Shell integration | PASS | 39/39 within `npm run check` on Linux, Node 22.16.0, GNU Coreutils 9.7 |
| Combined quality check | PASS | 93/93, zero skipped |
| Simulated Homebrew PATH | PASS | All 39 shell integration tests with a BSD-style date stub ahead of system PATH and a real GNU date binary symlinked as `gdate` in a directory containing spaces; selected gdate logged |
| Invalid override | PASS (expected failure) | `GNU_DATE` pointed to BSD-style date stub; integration suite exited nonzero with actionable error |
| Dependency audit | PASS | `npm audit --audit-level=high --fetch-retries=0 --fetch-timeout=6000`: zero vulnerabilities |
| Runtime and CI diff | PASS | SHA-256 equality for every file under `public/` and `.github/` |
| Native macOS / Homebrew runtime | NOT RUN | Linux environment; simulated discovery is not native platform verification |
| Chromium, accessibility, Firefox/WebKit | NOT RUN | No UI changes; inherited browser verification outstanding |
| Gitleaks, CodeQL, hosted CI and Pages | NOT RUN | Existing workflow unchanged, no push/deploy |

---

## Security and release status

No skipped integration tests or softened gates. No new runtime dependencies or app-side code changes. The resolver executes a verified local executable from the developer-controlled PATH or explicit absolute override, never user input from the web application. Existing Playwright exception, full browser/accessibility checks, hosted security scans, cron daemon testing, empty licence and human owner release approval remain outstanding. No repository or deployment action was taken.
