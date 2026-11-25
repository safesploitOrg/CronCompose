# 🕒 CronCompose

CronCompose is a browser-only Linux cron schedule builder, validator and crontab formatter. No backend, external runtime dependencies, command execution or telemetry.

**Website:** https://cron.git.safesploit.com/ (existing configured domain; this candidate is not deployed)

## Features

- Five-field Cronie-style schedule editor, live explanation and field-specific validation.
- Right-aligned, fixed-position interactive weekdays, regular presets and special strings. The live explanation sits alongside the selector on wide editors.
- Optional Extended Scheduling: first, second, third, fourth or last weekday of a month and the last calendar day. Uses a weekly/daily trigger plus a GNU date/POSIX shell condition.
- User/system crontab formatting, output redirection and simple/detailed comments.
- Local theme, density and expanded-section preferences; no command or username persistence.

---

## Local development

Requires Node.js 22+, Python 3 for the local HTTP server, and GNU/Linux with GNU Coreutils for shell integration tests. On macOS run the shell tests in a GNU/Linux VM/container. There are no npm dependencies.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm run serve
```

Open http://127.0.0.1:8000/. ES modules require HTTP(S), not opening `index.html` directly.

Run `npm run test:unit` or `npm run test:extended` separately. See [testing](docs/testing.md).

---

## Scheduling notes

This is a bounded subset of traditional five-field Cronie syntax, not a universal cron parser. Named month/day abbreviations, lists, ranges and steps are supported; Quartz, seconds, year fields, randomisation and `L`, `W`, `#` extensions are not. Syntactic validity does not guarantee a calendar match, command success or safety.

Extended conditions require `/bin/sh`, GNU `date` in a trusted PATH, and matching schedule/command timezones. Percent signs in extended user commands are rejected; place these commands in a separate script. The generated expression alone is only the trigger. Copy the complete crontab line.

See [Cronie crontab(5)](https://man7.org/linux/man-pages/man5/crontab.5%40%40cronie.html).

---

## Deployment

The single CI/Pages workflow tests the exact revision, scans it, packages `public/` and deploys only from `main` after required jobs pass. Configure **Settings → Pages → Build and deployment → Source → GitHub Actions** and retain `cron.git.safesploit.com` in Pages custom-domain settings. The CNAME file is retained but is not sufficient to configure a custom domain with an Actions deployment.

Before enabling production publishing, review the documented Playwright exception and obtain the project-owner T2 release approval. See [operations](docs/operations.md), [security](SECURITY.md) and [architecture](ARCHITECTURE.md).

---

## Licence

The original repository contains an empty `LICENSE`; the owner must select a licence. No licence terms have been invented.
