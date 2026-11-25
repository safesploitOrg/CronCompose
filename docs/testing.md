# 🧪 Testing

## Commands and enforcement

| Check | Command / CI job | Gate |
| --- | --- | --- |
| JavaScript syntax, HTML structural checks, CSP, local assets and focused unsafe API checks | `npm run lint` | Blocking |
| Cron parser, all 127 non-empty weekday sets, output and preferences | `npm run test:unit` | Blocking |
| All common extended presets plus all 35 ordinal/weekday combinations and month end | `npm run test:extended` | Blocking |
| Dependency audit | `npm audit --audit-level=high` | Blocking |
| Git secret scan | Gitleaks, verified SHA-256 archive | Blocking |
| JavaScript SAST | CodeQL and SARIF result gate | Blocking, any finding |
| Browser regression | `python3 tests/browser/smoke.py` | Local only, excluded from CI by request |

Local check: `npm run check`. The shell suite exercises actual `/bin/sh` and GNU date, freezing only the current-date read via a test PATH shim and independently computing expected dates from a calendar. The relevant cron escaped-percent transformation is modelled; the actual cron daemon is not invoked. Covers leap/non-leap February, 30-/31-day months, fifth weekday occurrences, December rollover, quote handling, redirection, skip/failure paths and real current date.

---

## Browser matrix

Install Python Playwright and its Chromium runtime separately in a local environment. `CHROMIUM_PATH=/path/to/chromium python3 tests/browser/smoke.py` can use an installed Chromium. The suite checks desktop, tablet, mobile and screenshot-like widths; button bounds and right alignment, wide/narrow editor layout, extended lock, output and storage. Playwright is deliberately not installed or run in GitHub Actions. Full Firefox/WebKit, automated accessibility, keyboard/focus and zoom review are outstanding. Full standards-grade HTML/CSS linting is not provided by the focused source checker.

See [exceptions](exceptions.md). A passing unit suite alone does not establish SFW release readiness.
