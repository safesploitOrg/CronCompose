# ⚠️ SFW Exceptions and release decisions

## EX-001 — Temporary exclusion of Playwright from CI

- Requirement: SFW v1.1 §§6, 12, 13, 14; Profile B browser/E2E verification.
- Scope: CronCompose initial modernisation; Playwright CI explicitly excluded by project owner in the design discussion.
- Reason: prior environment/browser automation limitations; prioritise deterministic unit and shell integration checks.
- Owner: repository maintainer (human owner); approval of formal record and tracking issue pending.
- Proposed review/expiry: before first public release or 25 December 2026, whichever occurs first; owner to approve or amend.
- Impact: UI regressions, accessibility or cross-browser issues could remain undetected in CI.
- Compensating controls: local Chromium regression suite, manual browser matrix, blocking non-browser tests, security checks.
- Restoration criteria: reliable Chromium CI for critical journeys, with Firefox/WebKit and accessibility verification appropriate to Profile B/T2.
- Release decision: pending; no AI waiver or self-approval. Formal exception details, tracking issue, residual risk and owner release sign-off are not yet recorded as approved.

---

## Remaining verification debt

Full HTML/CSS validation, full accessibility matrix, independent cron-daemon integration, initial remote CI execution and Pages smoke/rollback are not yet verified. Owner to track and disposition these gaps before release.
