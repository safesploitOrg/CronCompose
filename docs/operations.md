# 🚀 Operations

## Enable GitHub Pages

1. Review source and local test evidence; obtain documented owner approval for the T2 release and temporary browser CI exception.
2. Configure branch rules to require `Quality and cron tests`, `Secret scanning (Gitleaks)` and `CodeQL security gate`. Require review where applicable.
3. Open Settings → Pages and choose GitHub Actions as publishing source. Retain the existing custom domain in settings and verify DNS/HTTPS.
4. Restrict `github-pages` environment deployment to `main`; require human approval if supported.
5. Push the reviewed candidate or run the workflow on `main` (owner-authorised action only).
6. Verify the deployed URL, CSS/JS/favicon, cron presets, extended output and HTTPS. Confirm only public assets are exposed.

---

## Rollback and monitoring

Revert to a previously tested commit through a reviewed change and rerun the gated workflow. Verify custom-domain availability and HTTPS. Review dependencies/action updates and security scan findings; use periodic availability checks if desired. No application runtime logs or user analytics are collected.
