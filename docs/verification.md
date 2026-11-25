# 🧾 Verification report — 0.1.0-alpha.2

**Outcome:** Updated local candidate; required local quality checks passed. Remote CI and browser verification remain incomplete. No repository or deployment mutations performed.

## Scope and baseline

- Application profile B with applicable D deployment controls. This revision is a T0 presentation change plus associated tests/documentation; the existing candidate retains T2 parser and deployment release-review requirements.
- Baseline `0.1.0-alpha.1`: `npm run check` passed all 84 tests before the change.
- Changes: `public/index.html`, `public/assets/css/style.css`, `tests/browser/smoke.py`, `package.json`, `package-lock.json`, `ARCHITECTURE.md`, `CHANGELOG.md`, `README.md`, `docs/testing.md` and this report. No parser, shell-condition, preference-storage, formatting or workflow implementation changes.
- The selector is right-aligned, with explanation to its left when the editor content is at least 580px wide. At smaller widths they stack. Hidden weekday controls continue to leave the full width available to extended/startup schedule feedback.

---

## Local evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Reproducible npm install | PASS | `npm ci --ignore-scripts --no-audit --no-fund` |
| Focused lint/structural checks | PASS | `npm run lint` |
| Unit tests | PASS | `npm run test:unit`: 45/45; includes all 127 non-empty weekday sets |
| Shell integration | PASS | `npm run test:extended`: 39/39; GNU Coreutils 9.7 and `/bin/sh` |
| Combined check | PASS | `npm run check`: 84/84, no skips |
| npm audit | PASS | `npm audit --audit-level=high --fetch-retries=0 --fetch-timeout=6000`: exit 0, 0 vulnerabilities; empty npm dependency graph |
| CSS syntax | PASS | tinycss2 parsed 133 rules and declarations, including container query; not full CSS conformance |
| Layout markup | PASS | BeautifulSoup confirmed shared feedback wrapper, seven day buttons and Monday–Sunday order |
| Workflow YAML | PASS | PyYAML BaseLoader parsed both workflow and Dependabot configuration; checked gate dependencies and Pages write permission isolation |
| SARIF gate | PASS (synthetic) | Clean fixture accepted; missing report, finding and failed invocation rejected |
| Browser test Python syntax | PASS | `ast.parse` on updated regression suite |
| Browser regression | NOT RUN (blocked) | Attempted `CHROMIUM_PATH=/usr/bin/chromium python3 tests/browser/smoke.py`; Chromium navigation failed with `ERR_BLOCKED_BY_ADMINISTRATOR` before loading site |
| Full HTML/CSS conformance and accessibility | NOT RUN | Focused structural and CSS syntax checks only |
| Gitleaks | NOT RUN | Binary unavailable; attempt to reach pinned release archive failed with DNS resolution error |
| CodeQL | NOT RUN | Scanner unavailable locally; synthetic gate test is not a real scan |
| Actual cron daemon, remote GitHub Actions, Pages and rollback | NOT RUN | No push, remote workflow dispatch or deployment performed |

The updated local browser suite checks right alignment, fixed seven-button positions in document coordinates (independent of scrolling), stacked/side-by-side layout, full-width extended feedback, restored regular layout, output and preference storage at the existing four viewports. Geometry and accessibility are not independently verified because the browser could not load the site.

---

## Security and release decision

No regression was observed in the executed checks. The inherited Playwright exclusion, scanner verification debt, full browser/accessibility matrix and empty licence remain outstanding. Playwright stays outside CI per `docs/exceptions.md`; formal exception and T2 owner release sign-off remain pending. Existing CI continues to require unit tests, shell integration tests, dependency audit, Gitleaks and CodeQL before packaging and deployment. The actual hosted workflow has not been executed against this candidate. Only `public/` is published by the configured workflow. No changes to trust boundaries or deployment permissions were made.

The candidate is not verified as release-ready under the full SFW baseline. Run the hosted pipeline and required local/manual browser checks before approving publication.
