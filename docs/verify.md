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
`SHASUMS256.txt`. PowerShell prints the hash in **upper case** and the file
lists it in lower case — that difference is only formatting. To compare them
directly:

```powershell
(Get-FileHash -Algorithm SHA256 <file>).Hash.ToLower()
```

## macOS

```sh
shasum -a 256 <file>
```

Compare the output against the matching line in `SHASUMS256.txt`.

## Linux

```sh
sha256sum --ignore-missing -c SHASUMS256.txt
```

Run this in the folder containing both the downloaded file and
`SHASUMS256.txt`. `SHASUMS256.txt` covers every asset in the release, including
ones you did not download, so `--ignore-missing` is what you want — without it
`sha256sum` reports every file you skipped as a failure and the output looks
alarming even when your download is fine.

## Verifying with the GitHub CLI

Releases in this repository are published as GitHub **Immutable Releases**,
which can carry a Sigstore attestation. If [`gh`](https://cli.github.com) is
installed, you can check that instead of, or in addition to, the checksum:

```sh
gh release verify <tag> --repo DS-Studio/cordy-releases
```

Omit `<tag>` to verify the latest release. This confirms the release carries a
valid signed attestation, and prints the SHA-256 of every asset it covers — so
you can check your download against that output instead of `SHASUMS256.txt` if
you prefer a signed source for the digests.

`gh attestation verify <file>` does **not** work here, and will return a 404.
That command looks for a per-file SLSA *build provenance* attestation, which is
produced by a build workflow. These builds happen in private repositories that
publish no provenance, so the only attestation that exists is the release-level
one above, covering the release and its asset digests. Requires `gh` 2.x with
attestation support (verified against gh 2.98.0).

## What this does and doesn't prove

A matching checksum, and a passing `gh release verify` / `gh attestation
verify`, prove the file is **intact** — it's the exact bytes this repository
published, not corrupted in transit and not swapped for something else.

They do **not** prove the file is **safe**. Binaries in this repository are
currently unsigned: Windows installers carry no code-signing certificate, and
macOS builds are not notarized. Verifying the hash does not remove the
SmartScreen or Gatekeeper warnings described in the install guides above —
it just confirms you're about to run the file this project actually built.
