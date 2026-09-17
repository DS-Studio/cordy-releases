# Installing Cordy Desktop on macOS

Applies to: Cordy Desktop, **Apple Silicon (arm64) only**. There is no
Intel (x86_64) build — this app will not run on an Intel Mac.

The build is signed with a local "Apple Development" identity, not a
Developer ID, and it is **not notarized**. Gatekeeper blocks it by default.

## What you'll see: Gatekeeper's malware warning

The first time you open the app, macOS shows:

> **Apple could not verify "Cordy Desktop" is free of malware that may harm
> your Mac or compromise your privacy.**

with two buttons: **Done** and **Move to Trash**.

There is no "Open Anyway" button on this dialog. Click **Done** — do not
click "Move to Trash".

## Why this happens

Gatekeeper requires apps to be notarized (scanned by Apple's automated
service) before it will open them without a warning. Cordy Desktop is
code-signed with a local development identity but has not gone through
notarization yet, so Gatekeeper treats it the same as an unidentified app.

## How to proceed

After clicking **Done**:

1. Open **System Settings**.
2. Go to **Privacy & Security** in the sidebar.
3. Scroll down to the **Security** section. You'll see a note that "Cordy
   Desktop" was blocked.
4. Click **Open Anyway**.
5. The malware warning reappears, now with an **Open** button. Click **Open**.
6. Enter your administrator password or confirm with Touch ID if prompted.

macOS remembers this approval, so you won't see the warning again for this
build. A future version with a different signature will trigger it again.

## Which macOS versions this applies to

Verified against Apple's own support article on opening apps from an
unidentified developer (support.apple.com, article 102445) as fetched today;
its current screenshots and steps are for **macOS Sequoia**.

Apple removed the old Control-click → **Open** shortcut starting with
Sequoia — you now have to go through System Settings as described above. If
you're still on **macOS Ventura (13)** or **Sonoma (14)**, Control-clicking
the app and choosing **Open** may still work as a faster path, but the
System Settings steps above work on all three.

If a later macOS version changes this flow, follow Apple's current
instructions rather than this page: search "open a Mac app from an
unidentified developer" on support.apple.com.

## Before you proceed: verify the file

Confirm the `.dmg` or `.zip` you downloaded matches what was published:

1. Download `SHASUMS256.txt` from the same release.
2. Compare it against your download — see [verify.md](verify.md) for the
   exact `shasum` command.

A matching hash means the file is intact and came from this repository's
release. It does not mean the app is safe to run — see the note at the end of
[verify.md](verify.md).

Do not disable Gatekeeper (for example with `spctl --master-disable`) to get
around this warning. The click path above is the only step needed, and it
only applies to this one app.

## Related

- [Verify your download](verify.md)
- [SECURITY.md](../SECURITY.md) — known, documented security state of all products
