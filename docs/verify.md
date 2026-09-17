# Verify your download

Every release in this repository carries a `SHASUMS256.txt` file listing the
SHA-256 hash of every asset in that release. Check your download against it
before you run or install anything.

Related: [Windows install](install-windows.md) ·
[macOS install](install-macos.md) · [Chrome install](install-chrome.md)

## Windows (PowerShell)

```powershell
Get-FileHash -Algorithm SHA256 <file>
```

Compare the `Hash` value in the output against the matching line in
`SHASUMS256.txt`.

## macOS

```sh
shasum -a 256 <file>
```

Compare the output against the matching line in `SHASUMS256.txt`.

## Linux

```sh
sha256sum -c SHASUMS256.txt
```

Run this in the folder containing both the downloaded file and
`SHASUMS256.txt`. It checks every listed file at once and prints `OK` or
`FAILED` for each.

## Verifying with the GitHub CLI

Releases in this repository are published as GitHub **Immutable Releases**,
which can carry a Sigstore attestation. If [`gh`](https://cli.github.com) is
installed, you can check that instead of, or in addition to, the checksum:

```sh
gh release verify <tag> --repo DS-Studio/cordy-releases
```

Omit `<tag>` to verify the latest release. This confirms the release carries
a valid signed attestation and lists the assets and digests it covers.

For a single downloaded file, you can verify its build provenance directly:

```sh
gh attestation verify <file> --repo DS-Studio/cordy-releases
```

Both commands need a `gh` version that supports attestations; update `gh` if
either command is not recognized.

## What this does and doesn't prove

A matching checksum, and a passing `gh release verify` / `gh attestation
verify`, prove the file is **intact** — it's the exact bytes this repository
published, not corrupted in transit and not swapped for something else.

They do **not** prove the file is **safe**. Binaries in this repository are
currently unsigned: Windows installers carry no code-signing certificate, and
macOS builds are not notarized. Verifying the hash does not remove the
SmartScreen or Gatekeeper warnings described in the install guides above —
it just confirms you're about to run the file this project actually built.
