# Installing Cordy Desktop on Windows

Applies to: Cordy Desktop, Windows x64 only. There is no Windows-on-ARM
build — if you're on an ARM64 device (e.g. a Surface with a Snapdragon chip),
this installer will not run.

中文版本: [install-windows.zh-CN.md](install-windows.zh-CN.md)

## What you'll see: Windows SmartScreen

When you run the installer, Windows will block it with a dialog titled:

> **Windows protected your PC**
>
> Microsoft Defender SmartScreen prevented an unrecognized app from starting.
> Running this app might put your PC at risk.

At this point only a **More info** link and a **Don't run** button are
visible. Click **More info** and the dialog expands to show:

> App: `cordy-desktop-<version>-win-x64.exe`
> Publisher: Unknown publisher

with two buttons: **Run anyway** and **Don't run**.

## Why this happens

SmartScreen flags this installer because it carries no code-signing
certificate. Cordy Desktop does not have one yet — this is not a scan result
about the file's contents, it's a reputation/signature check, and an unsigned
binary fails it regardless of what's inside. See
[SECURITY.md](../SECURITY.md) for the project's current signing status.

## Before you proceed: verify the file

Confirm the installer you downloaded matches what was actually published,
**before** you click "Run anyway":

1. Download `SHASUMS256.txt` from the same release.
2. Compare it against the installer's hash — see
   [verify.md](verify.md) for the exact PowerShell command.

A matching hash means the file is intact and came from this repository's
release. It does not mean the app is safe to run — see the note at the end of
[verify.md](verify.md).

## How to proceed

Once the hash matches:

1. Run the installer again if the dialog closed.
2. Click **More info**.
3. Click **Run anyway**.

Do not disable SmartScreen, Windows Defender, or any other protection to get
around this dialog. The click path above is the only step needed.

## Related

- [Verify your download](verify.md)
- [SECURITY.md](../SECURITY.md) — known, documented security state of all products
