<!-- This file's download tables are generated from manifest.json by scripts/render.mjs. -->
<!-- Edit manifest.json, not the region between the BEGIN/END markers. -->

# Cordy Releases

Public downloads, changelog, and issue tracker for the Cordy family of products.

**No product source code is hosted here.** This repository exists so the
published builds can be downloaded, verified, and discussed in one place.

- Product site and documentation — https://cordy.dsdev.cn
- Changelog — [CHANGELOG.md](CHANGELOG.md)
- 中文说明 — [README.zh-CN.md](README.zh-CN.md)

## Downloads

<!-- BEGIN:DOWNLOADS -->

### Cordy Desktop 0.5.3

Released 2026-09-17 · [Release notes](https://github.com/DS-Studio/cordy-releases/releases/tag/desktop-v0.5.3)

| Platform | Architecture | File | Size | SHA-256 |
| --- | --- | --- | --- | --- |
| Windows | x64 | [cordy-Setup-0.5.3.exe](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3.exe) | 112.3 MB | `785338759ac0` |
| macOS | arm64 | [cordy-Setup-0.5.3.dmg](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3.dmg) | 130.7 MB | `4609064b04b0` |
| macOS | arm64 | [cordy-Setup-0.5.3.zip](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3.zip) | 126.2 MB | `14c2feaf7d54` |
| Linux | x64 | [cordy-Setup-0.5.3-linux-x64.AppImage](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-x64.AppImage) | 137.4 MB | `546b1ec39169` |
| Linux | arm64 | [cordy-Setup-0.5.3-linux-arm64.AppImage](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-arm64.AppImage) | 138.4 MB | `44547751054c` |
| Linux | x64 | [cordy-Setup-0.5.3-linux-x64.deb](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-x64.deb) | 108.5 MB | `a7cc16e503c8` |
| Linux | arm64 | [cordy-Setup-0.5.3-linux-arm64.deb](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-arm64.deb) | 103.6 MB | `310a9c7e2227` |

> Windows x64 and macOS Apple Silicon only. Windows installers are not code-signed and macOS builds are not notarized, so your operating system will warn you on first run.

### Cordy for Chrome

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/cordy/kdpfbabcgdgcddadcdacejaaepgkajih)**

Install from the Chrome Web Store — it is the only supported way to install this extension, and it keeps itself updated.

_No public build yet._

> Any .zip attached to a release is a verification artifact for auditing the reviewed package, not an alternate install path.

### CordyAI

_No public build yet._

> No publicly downloadable build yet. The changelog is published here ahead of the first public build.

### Tabmori

_No public build yet._

> No publicly downloadable build yet.

<!-- END:DOWNLOADS -->

## Verify your download

Every release carries a `SHASUMS256.txt` file listing the SHA-256 of each asset.
Check your download against it before running it — [docs/verify.md](docs/verify.md)
has the command for each platform.

Builds are **not currently code-signed**. A checksum proves a file is intact and
matches what was published; it does not prove the file is safe. Download only
from this repository's [releases](https://github.com/DS-Studio/cordy-releases/releases).

## Installing

Your operating system will warn you about these builds, because they carry no
code-signing certificate yet. These pages explain exactly what you will see and
what to do:

- [Windows](docs/install-windows.md) ([中文](docs/install-windows.zh-CN.md))
- [macOS](docs/install-macos.md)
- [Chrome extension](docs/install-chrome.md) ([中文](docs/install-chrome.zh-CN.md))

## Reporting a problem

Open an issue using one of the [product-specific forms](https://github.com/DS-Studio/cordy-releases/issues/new/choose).
Include the product version and your platform — the forms ask for both.

For a security vulnerability, do not open an issue. Follow [SECURITY.md](SECURITY.md).

## Release tags

Each product has its own tag prefix, so one repository can carry all of them:

| Product | Tag | Example |
| --- | --- | --- |
| Cordy Desktop | `desktop-v*` | `desktop-v0.5.4` |
| Cordy for Chrome | `chrome-v*` | `chrome-v2.5.4` |
| CordyAI | `app-v*` | `app-v0.5.0` |
| Tabmori | `tabmori-v*` | `tabmori-v0.1.0` |

GitHub's "Latest" badge is a single repository-wide pointer with no per-product
concept, so it tracks **Cordy Desktop**. For any other product, use its tag or
the table above.

Published releases are immutable: assets and tags are frozen once published and
carry an automatic build attestation. How a release is produced, and what that
immutability costs when something goes wrong, is written down in
[docs/releasing.md](docs/releasing.md).

## License

Proprietary — see [LICENSE.md](LICENSE.md) and [TERMS.md](TERMS.md).
