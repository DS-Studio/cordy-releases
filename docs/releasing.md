# Releasing

How a build that already exists in a private product repository becomes a public
download here. One command does the work; this page is about the parts that will
bite you.

## The command

```bash
node scripts/publish.mjs <desktop|chrome|app|tabmori> <version> [--dry-run]
```

It downloads the assets from the private repository's own published release,
checks them against a hard-coded allowlist, recomputes every SHA-256 and
cross-checks them against the source checksum file, scans the release notes for
internal strings, stages a **draft**, prints the full plan, and publishes only
after you type the exact tag.

Always run `--dry-run` first. It performs every check and writes the exact
release body to `tmp/<tag>-notes.md` without creating anything.

Assets always come from the private release, never from a local build
directory. If something is missing there, upload it there first — that is what
makes the result reproducible instead of depending on one machine's disk.

## The leak-scan term list

`scripts/leakscan.mjs` checks two things: pattern rules that live in the file,
and a list of forbidden literal terms that deliberately does **not**.

Put the terms in `.leakterms` at the repo root (gitignored, see
`.leakterms.example`), or in `LEAKSCAN_TERMS` for CI. Without them the scan
reports `PARTIAL` and `publish.mjs` refuses to publish, because the half that
catches internal vocabulary would be missing.

Do not commit the list, and do not commit an encoded version of it either. An
earlier version of this repository kept the terms base64-encoded in
`leakscan.mjs` on the theory that encoding hid them. It does not — base64 is an
encoding, not a secret — and the file's own comment gave the decode command. The
whole list shipped publicly in a tool built to prevent exactly that.

## Publishing is irreversible, and so is the tag

Immutable Releases is enabled on this repository. Once a draft is promoted:

- every asset and the tag are frozen — they cannot be edited or replaced;
- **the tag name is burned forever, even if you delete the release.** GitHub
  answers a later attempt with `tag_name was used by an immutable release` and
  `Cannot create ref due to creations being restricted`.

So deleting a bad release does **not** let you republish it under the same tag.
Your only options are a new version, or a suffixed tag such as
`chrome-v2.5.4-r2`. Get the draft right before promoting; that is the entire
reason the flow is draft-first.

Drafts are safe: they carry no tag, generate no archives, and can be deleted and
recreated freely.

## Known failure modes

**`gh release upload` fails with HTTP 500 "Error saving asset".** Observed
repeatedly on one file that uploaded fine with a plain POST to
`uploads.github.com` — same bytes, same name, same credentials. `publish.mjs`
now falls back to a direct upload automatically. Nothing to do.

**An asset is stuck in state `starter`.** A failed upload leaves a stub that
holds the name and *reports the full expected size while containing no bytes*.
`gh release upload --clobber` cannot replace it, and every retry 500s until it
is deleted. Never treat a size match alone as proof an asset arrived — check
`state == "uploaded"`. `publish.mjs` purges these automatically.

**A resumed run.** If a run dies between creating the draft and promoting it,
just run the same command again. The draft is reused, assets already uploaded
are skipped, and only what is missing is sent.

## What GitHub attaches by itself

Every published release carries three files nobody uploaded:

- `Source code (zip)` and `Source code (tar.gz)`
- `Release attestation (json)`

They are generated from the tag **in this repository**, so they contain this
repository's own README, changelog, docs and scripts — about 63 KB of text. They
do not contain product source code, which is not part of this repository. There
is no setting to suppress them, so every release body ends with a note saying
what they are.

## After publishing

`publish.mjs` updates `manifest.json`, re-renders both READMEs, and appends a
back-link to the private release. Review the diff and commit it.

Then verify the public surface for real:

```bash
node scripts/linkcheck.mjs --readme
```

A self-consistent render is not proof. `manifest.json` can describe a release
that no longer exists, and the READMEs will happily advertise downloads behind a
dead tag — only a real request catches that.

## If a released build turns out to be broken

You cannot edit or withdraw it. You can:

1. publish a fixed version under a new tag;
2. mark the broken release as a pre-release so it loses the Latest badge;
3. edit its notes to say plainly what is wrong and which version to use instead;
4. open a pinned issue.

Do not delete it — that burns the tag and removes a version people may already
depend on, without removing it from their machines.
