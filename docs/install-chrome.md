# Installing Cordy for Chrome

中文版本: [install-chrome.zh-CN.md](install-chrome.zh-CN.md)

## Install from the Chrome Web Store

This is the supported way to install Cordy for Chrome:

**https://chromewebstore.google.com/detail/cordy/kdpfbabcgdgcddadcdacejaaepgkajih**

The Store carries the current version. Installing from it gets you automatic
updates and no Chrome warnings — use it unless you have a specific reason not
to.

## There is no download for the extension here

**No build of Cordy for Chrome is currently published in this repository.** The
Chrome Web Store above is the only place to get it. This page stays because the
extension's changelog is published here, and because the question "where is the
.zip?" has a real answer below.

If a `.zip` is attached to a future release, it will be a **verification
artifact, not an alternate way to install** — a copy of the exact package that
was submitted for Chrome Web Store review, so it can be audited.

Chrome does not let ordinary users install a packed extension from an
arbitrary source anyway. Since Chrome 33 on Windows and Chrome 44 on macOS,
Chrome blocks installing extensions except through the Chrome Web Store unless
you turn on Developer mode yourself. Such a zip cannot be double-clicked or
dragged into Chrome to install it.

## Developer mode: for people who genuinely need it

This applies only if you have obtained a package some other way — there is
nothing to download here today. To load an unpacked build:

1. Verify its SHA-256 against the checksum published with it — see
   [verify.md](verify.md).
2. **Unzip it** to a folder you'll keep. Chrome loads from this folder every
   time it starts, so don't delete it after installing.
4. Open `chrome://extensions`.
5. Enable **Developer mode** (top-right toggle).
6. Click **Load unpacked**.
7. Select the unzipped folder.

### What you give up by doing this

- **No automatic updates.** You must repeat these steps for every new version.
- **A permanent warning.** Chrome shows a "Disable developer mode extensions"
  banner every time it starts, for as long as any unpacked extension is
  loaded.

Only use this path if you understand and accept both of those.

## Related

- [Verify your download](verify.md)
- [SECURITY.md](../SECURITY.md) — known, documented security state of all products
