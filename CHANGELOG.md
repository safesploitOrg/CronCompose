# 📝 Changelog

## [0.1.0-alpha.5] — Unreleased

- Detect Ubuntu 25.10+ GNU Coreutils `gnudate` alongside `date` and Homebrew `gdate`. The default Rust uutils executable is not accepted as GNU date.
- Add three resolver regressions for Ubuntu-style discovery, Rust-only rejection and explicit `gnudate` override; retain all mandatory shell integration tests and the existing `ubuntu-latest` runner.
- Document the distinction between the test resolver and the target cron host's GNU `date` requirement. No production web assets or CI workflow changes.

---

## [0.1.0-alpha.4] — Previous unpublished candidate

- Resolve GNU `date` or Homebrew `gdate` automatically for shell integration tests on Linux/macOS, with an optional absolute `GNU_DATE` override.
- Use the verified executable for both frozen and real-date integration cases; fail clearly if GNU Coreutils is unavailable.
- Add resolver regression tests. Production web assets, generated cron conditions and CI enforcement are unchanged.

---

## [0.1.0-alpha.3] — Previous unpublished candidate

- Keep all five cron fields visible during Extended Scheduling; calendar fields stay disabled and only the interactive weekday selector is hidden.
- Group consecutive weekday names into ranges in both summaries and schedule explanations, without changing generated cron syntax.
- Add unit coverage for every non-empty weekday combination and update browser regressions for the retained disabled field and stable geometry.

---

## [0.1.0-alpha.2] — Previous unpublished candidate

- Right-aligned the weekday label, summary, seven-button selector and helper text beneath the Weekday field.
- Placed the live schedule explanation alongside the selector when the editor has sufficient width; retained a stacked layout for narrow editors.
- Preserved fixed button geometry, extended-mode hiding/locking and local presentation preferences.
- Extended the local browser regression suite to check alignment, responsive layout and stable geometry.

---

## [0.1.0-alpha.1] — Previous unpublished candidate

- Reworked workspace UI with fixed weekday button geometry, interactive days and local presentation preferences.
- Added Cronie-style parser, native presets, aliases, user/system formatting and help reference.
- Added extended monthly scheduling and shell integration tests.
- Moved static website to `public/`; added CI-gated GitHub Pages deployment and SFW v1.1 documentation.
- Playwright CI intentionally excluded pending documented exception and restoration.

---

## Unversioned history — 2024-11-03 to 2024-11-04

- 2024-11-03: initial repository and original cron builder (`d174528`, `f99256c`).
- 2024-11-04: custom domain added and updated (`027df0a`, `35b07e1`).

The historical commits were not assigned formal versions in this candidate. The proposed alpha version is not a published tag.
