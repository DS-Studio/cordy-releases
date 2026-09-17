# Security Policy

## Reporting a vulnerability

Report security vulnerabilities privately through GitHub Security Advisories:

**https://github.com/DS-Studio/cordy-releases/security/advisories/new**

Please do **not** open a public issue for a vulnerability, and do not disclose
it publicly until a fix has been published.

Include, as far as you can: the affected product and version, the platform you
reproduced it on, the impact, and the steps needed to reproduce it. A proof of
concept helps. Do not include credentials, API keys, or personal data in your
report.

You can expect an acknowledgement within a few working days. This is a small
team; there is no bug bounty programme.

## Scope

In scope: the published builds of Cordy Desktop, Cordy for Chrome, CordyAI, and
Tabmori, and the contents of the releases in this repository — including a
report that a published asset does not match its checksum.

Out of scope: product source code (not hosted here), self-hosted deployments you
control, and the known, documented state described below.

## Known and documented

These are disclosed rather than reported:

- Windows installers are not code-signed, so SmartScreen warns on first run.
- macOS builds are signed with a development identity and are not notarized, so
  Gatekeeper blocks them by default.
- No product currently ships an auto-updater. Updates are manual.

Code signing is planned. Until it ships, verify every download against
`SHASUMS256.txt` — see [docs/verify.md](docs/verify.md).

## Supported versions

Only the most recent published release of each product receives security fixes.
Older releases remain downloadable for reference but are not maintained.
