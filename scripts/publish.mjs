#!/usr/bin/env node
/**
 * publish.mjs — mirror one already-built private release into the public
 * DS-Studio/cordy-releases repository.
 *
 * The public release is always assembled from the bytes the private product
 * repository already published: this script downloads those assets with `gh`,
 * checks them against a hard-coded allowlist, re-computes every SHA-256, scans
 * the release notes for internal strings, creates a DRAFT release, prints a
 * plan, and only promotes the draft after the operator types the exact tag.
 * It never reads from a local build directory and never uploads "whatever is
 * there".
 *
 * Usage:
 *   node scripts/publish.mjs <desktop|chrome|app|tabmori> <version> [options]
 *
 * Options:
 *   --dry-run            run steps 1-5 and print the plan, create nothing
 *   --notes <file>       release-notes body (default: the matching CHANGELOG.md
 *                        section)
 *   --changelog <file>   changelog to read instead of ./CHANGELOG.md
 *
 * The source repositories are private, but their names are not a secret, so
 * they are named here directly. Reading them still requires an authenticated
 * `gh` CLI with access; a stranger gains nothing from the slug.
 *
 * Requires an authenticated `gh` CLI. Node standard library only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import * as readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { scanText, formatFindings } from './leakscan.mjs';
import { renderReadmes } from './render.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_REPO = 'DS-Studio/cordy-releases';
const MANIFEST_PATH = path.join(REPO_ROOT, 'manifest.json');
const STAGING_ROOT = path.join(REPO_ROOT, 'tmp');
const CHECKSUMS_FILE = 'SHASUMS256.txt';

/**
 * A checksum file the source release may carry, under any of the names the
 * product repositories have used: SHASUMS256.txt, SHA256SUMS-platforms.txt,
 * checksums-2.5.4.txt. These are cross-checked against, never republished —
 * this script writes its own SHASUMS256.txt over the assets it actually ships.
 */
function isChecksumFile(name) {
  return /^(?:shasums256|sha256sums[\w.-]*|checksums?[\w.-]*)\.txt$/i.test(name);
}

/** Assets uploaded for completeness but not listed as a user download. */
const MANIFEST_EXCLUDED_SUFFIXES = ['.blockmap'];

const DESKTOP_OS = { win: 'Windows', mac: 'macOS', linux: 'Linux' };

/**
 * The only assets that may ever be published, per product. Anything missing or
 * anything extra aborts the run.
 */
const EXPECTED_ASSETS = {
  desktop: {
    manifestId: 'desktop',
    displayName: 'Cordy Desktop',
    publishable: true,
    privateRepo: 'DS-Studio/cordy-desktop',
    privateTagTemplate: 'v{version}',
    publicTagPrefix: 'desktop',
    // GitHub's "Latest" badge is repository-wide, so it tracks Cordy Desktop.
    latest: true,
    // Present in the source release, deliberately not republished. Update-feed
    // metadata would be misleading (no product ships an updater), and the build
    // provenance report is an internal QA artifact. Checksum files are tolerated
    // automatically by isChecksumFile().
    ignorePattern: (version) => [
      'latest.yml',
      'latest-mac.yml',
      'latest-linux.yml',
      `cordy-${version}-platform-builds.json`,
    ],
    // The x64 token differs per extension because electron-builder's ${arch}
    // macro resolves through getArtifactArchName(arch, ext): AppImage/rpm get
    // "x86_64", deb/snap get "amd64", everything else keeps "x64". arm64 is
    // never rewritten. These are the names the build actually emits — do not
    // "tidy" them into a uniform x64, or the allowlist check below will abort.
    assetPattern: (version) => {
      // 0.5.3 was packaged before the artifactName fix, as cordy-Setup-*, with
      // the Linux arch suffixes added by hand after the build. Publish those
      // bytes under the names they were actually built and checksummed with.
      // Renaming at publish time is the exact step that made 0.5.3
      // unrepeatable, so this script does not do it — not even to tidy up.
      if (version === '0.5.3') {
        return [
          `cordy-Setup-${version}.dmg`,
          `cordy-Setup-${version}.dmg.blockmap`,
          `cordy-Setup-${version}.zip`,
          `cordy-Setup-${version}.zip.blockmap`,
          `cordy-Setup-${version}-linux-x64.AppImage`,
          `cordy-Setup-${version}-linux-arm64.AppImage`,
          `cordy-Setup-${version}-linux-x64.deb`,
          `cordy-Setup-${version}-linux-arm64.deb`,
        ];
      }
      return [
        `cordy-desktop-${version}-win-x64.exe`,
        `cordy-desktop-${version}-win-x64.exe.blockmap`,
        `cordy-desktop-${version}-mac-arm64.dmg`,
        `cordy-desktop-${version}-mac-arm64.zip`,
        `cordy-desktop-${version}-linux-x86_64.AppImage`,
        `cordy-desktop-${version}-linux-arm64.AppImage`,
        `cordy-desktop-${version}-linux-amd64.deb`,
        `cordy-desktop-${version}-linux-arm64.deb`,
      ];
    },
    describeAsset: (file) => {
      // Handles both naming schemes: the 0.5.3-era cordy-Setup-* names, where
      // macOS carries no platform token at all, and the current
      // cordy-desktop-<version>-<os>-<arch> names.
      const tagged = /-(win|mac|linux)-(x64|x86_64|amd64|arm64)\./.exec(file);
      if (tagged) {
        // Normalise the platform-idiomatic token back to one display label, so
        // the download table reads x64 / arm64 regardless of package format.
        return { os: DESKTOP_OS[tagged[1]], arch: tagged[2] === 'arm64' ? 'arm64' : 'x64' };
      }
      if (/\.exe(\.blockmap)?$/i.test(file)) return { os: 'Windows', arch: 'x64' };
      // The 0.5.3 dmg/zip were Apple Silicon only and said so nowhere in the
      // filename; every macOS build this project has produced is arm64.
      if (/\.(dmg|zip)(\.blockmap)?$/i.test(file)) return { os: 'macOS', arch: 'arm64' };
      throw new Error(`cannot classify desktop asset: ${file}`);
    },
  },
  chrome: {
    manifestId: 'chrome',
    displayName: 'Cordy for Chrome',
    publishable: true,
    privateRepo: 'DS-Studio/cordy-chrome',
    privateTagTemplate: 'v{version}',
    publicTagPrefix: 'chrome',
    latest: false,
    // WXT emits cordy-<version>-chrome.zip — product name first, target last.
    // This is the name the extension was built, checksummed and submitted under.
    assetPattern: (version) => [`cordy-${version}-chrome.zip`],
    describeAsset: () => ({ os: 'Chrome', arch: '—' }),
  },
  app: {
    manifestId: 'app',
    displayName: 'CordyAI',
    publishable: false,
    refusal: 'CordyAI has no publishable artifact: every release APK is unsigned and no signing configuration exists. '
      + 'Publish the CordyAI changelog through manifest.json and CHANGELOG.md instead.',
  },
  tabmori: {
    manifestId: 'tabmori',
    displayName: 'Tabmori',
    publishable: false,
    refusal: 'Tabmori has no public release yet. There is nothing to mirror.',
  },
};

function fail(message) {
  console.error(`publish: ${message}`);
  process.exit(1);
}

function usage() {
  console.error('usage: node scripts/publish.mjs <desktop|chrome|app|tabmori> <version> [--dry-run] [--notes <file>] [--changelog <file>]');
}

function step(number, title) {
  console.log(`\n=== [${number}/12] ${title} ===`);
}

function gh(args, { capture = false } = {}) {
  const result = spawnSync('gh', args, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) fail(`could not run gh: ${result.error.message}`);
  return result;
}

function ghOrFail(args, reason, { capture = true } = {}) {
  const result = gh(args, { capture });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim().split('\n')[0] || `exit ${result.status}`;
    fail(`${reason}: ${detail}`);
  }
  return (result.stdout ?? '').trim();
}

function fillTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`unknown template placeholder {${key}}`);
    return values[key];
  });
}

function sha256OfFile(file) {
  const hash = createHash('sha256');
  const fd = fs.openSync(file, 'r');
  try {
    const buffer = Buffer.alloc(1024 * 1024);
    for (;;) {
      const read = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (read === 0) break;
      hash.update(buffer.subarray(0, read));
    }
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest('hex');
}

function parseChecksums(text) {
  const map = new Map();
  for (const raw of text.split('\n')) {
    const match = /^([0-9a-fA-F]{64})\s+\*?(.+)$/.exec(raw.trim());
    if (!match) continue;
    map.set(path.basename(match[2].trim()), match[1].toLowerCase());
  }
  return map;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function headingOf(line) {
  const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
  if (!match) return null;
  const text = match[2].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();
  return { level: match[1].length, text };
}

/**
 * Pull "<displayName>" / "<version>" out of the changelog.
 * Accepted shapes:
 *   ## Cordy Desktop        +  ### 0.5.4 — 2026-09-18
 *   ## Cordy Desktop 0.5.4
 * Returns { body } or { error }.
 */
function extractChangelogSection(changelogPath, displayName, version) {
  if (!fs.existsSync(changelogPath)) return { error: `${changelogPath} does not exist` };
  const lines = fs.readFileSync(changelogPath, 'utf8').split('\n');
  const headings = lines.map((line, index) => {
    const heading = headingOf(line);
    return heading ? { ...heading, index } : null;
  }).filter(Boolean);

  const name = displayName.toLowerCase();
  const versionRe = new RegExp(`(^|[^0-9.])${version.replace(/\./g, '\\.')}([^0-9.]|$)`);
  const collect = (heading) => {
    const next = headings.find((h) => h.index > heading.index && h.level <= heading.level);
    const body = lines.slice(heading.index + 1, next ? next.index : lines.length).join('\n').trim();
    return body;
  };

  const combined = headings.find((h) => h.text.toLowerCase().includes(name) && versionRe.test(h.text));
  if (combined) {
    const body = collect(combined);
    return body ? { body } : { error: `changelog section "${combined.text}" is empty` };
  }

  const product = headings.find((h) => h.text.toLowerCase().includes(name));
  if (!product) return { error: `no changelog heading mentions "${displayName}"` };
  const sectionEnd = headings.find((h) => h.index > product.index && h.level <= product.level);
  const versionHeading = headings.find((h) => h.index > product.index
    && h.level > product.level
    && (!sectionEnd || h.index < sectionEnd.index)
    && versionRe.test(h.text));
  if (!versionHeading) return { error: `no ${displayName} changelog heading mentions version ${version}` };
  const body = collect(versionHeading);
  return body ? { body } : { error: `changelog section "${versionHeading.text}" is empty` };
}

function parseArgs(argv) {
  const positional = [];
  const options = { dryRun: false, notes: null, changelog: path.join(REPO_ROOT, 'CHANGELOG.md') };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--notes' || arg === '--changelog') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        usage();
        fail(`${arg} needs a file path`);
      }
      if (arg === '--notes') options.notes = path.resolve(value);
      else options.changelog = path.resolve(value);
      i += 1;
    } else if (arg.startsWith('--')) {
      usage();
      fail(`unknown option ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length !== 2) {
    usage();
    fail('expected exactly two positional arguments: <product> <version>');
  }
  return { product: positional[0], version: positional[1], options };
}

async function main() {
  const { product, version, options } = parseArgs(process.argv.slice(2));

  // ---- 1. Resolve configuration -------------------------------------------
  step(1, 'Resolve product configuration');
  const config = EXPECTED_ASSETS[product];
  if (!config) {
    usage();
    fail(`unknown product "${product}"`);
  }
  if (!config.publishable) fail(config.refusal);
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    fail(`version "${version}" is not a plain semantic version (e.g. 0.5.4)`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const manifestEntry = manifest.products.find((p) => p.id === config.manifestId);
  if (!manifestEntry) fail(`manifest.json has no product with id "${config.manifestId}"`);

  const privateRepo = config.privateRepo;
  const privateTag = fillTemplate(config.privateTagTemplate, { version });
  const publicTag = `${config.publicTagPrefix}-v${version}`;
  const title = `${config.displayName} ${version}`;
  const expected = config.assetPattern(version);

  console.log(`product        : ${product} (${config.displayName})`);
  console.log(`version        : ${version}`);
  console.log(`source release : ${privateRepo} @ ${privateTag}`);
  console.log(`public release : ${PUBLIC_REPO} @ ${publicTag}`);
  console.log(`latest flag    : ${config.latest ? '--latest' : '--latest=false'}`);
  console.log(`expected assets: ${expected.length}`);
  for (const file of expected) console.log(`  - ${file}`);
  if (options.dryRun) console.log('mode           : --dry-run (nothing will be created)');

  // ---- 2. Download the private release assets ------------------------------
  step(2, 'Download assets from the source release');
  const stagingDir = path.join(STAGING_ROOT, publicTag);
  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });
  console.log(`staging dir    : ${stagingDir}`);
  const download = gh(['release', 'download', privateTag, '-R', privateRepo, '-D', stagingDir]);
  if (download.status !== 0) {
    fail(`gh release download failed for ${privateRepo} @ ${privateTag} (exit ${download.status})`);
  }

  // ---- 3. Allowlist check --------------------------------------------------
  step(3, 'Allowlist check');
  const present = fs.readdirSync(stagingDir)
    .filter((entry) => fs.statSync(path.join(stagingDir, entry)).isFile())
    .sort();
  const ignored = new Set(config.ignorePattern ? config.ignorePattern(version) : []);
  const missing = expected.filter((file) => !present.includes(file));
  const unexpected = present.filter((file) => (
    !expected.includes(file) && !ignored.has(file) && !isChecksumFile(file)
  ));
  console.log(`downloaded     : ${present.length} file(s)`);
  for (const file of present) {
    const role = expected.includes(file) ? 'publish'
      : isChecksumFile(file) ? 'cross-check only'
        : ignored.has(file) ? 'not republished' : 'UNEXPECTED';
    console.log(`  - ${file}  [${role}]`);
  }
  if (missing.length > 0) {
    fail(`source release is missing expected asset(s): ${missing.join(', ')}`);
  }
  if (unexpected.length > 0) {
    fail(`source release carries unexpected asset(s): ${unexpected.join(', ')} — refusing to publish an unreviewed file`);
  }
  console.log('allowlist      : OK (exact match)');

  // ---- 4. Checksums --------------------------------------------------------
  step(4, 'Compute SHA-256 and write SHASUMS256.txt');
  const sourceChecksumFile = present.find((name) => isChecksumFile(name));
  const sourceChecksums = sourceChecksumFile
    ? parseChecksums(fs.readFileSync(path.join(stagingDir, sourceChecksumFile), 'utf8'))
    : null;

  const assets = expected.map((file) => {
    const full = path.join(stagingDir, file);
    const sha256 = sha256OfFile(full);
    const size = fs.statSync(full).size;
    console.log(`  ${sha256}  ${file}  (${formatSize(size)})`);
    return { file, size, sha256, path: full, ...config.describeAsset(file) };
  });

  if (sourceChecksums) {
    let crossChecked = 0;
    for (const asset of assets) {
      const claimed = sourceChecksums.get(asset.file);
      if (!claimed) continue;
      if (claimed !== asset.sha256) {
        fail(`checksum mismatch for ${asset.file}: source ${sourceChecksumFile} says ${claimed}, downloaded bytes hash to ${asset.sha256}`);
      }
      crossChecked += 1;
    }
    console.log(`cross-check    : ${crossChecked}/${assets.length} asset(s) verified against source ${sourceChecksumFile}`);
  } else {
    console.log('cross-check    : source release carried no checksum file');
  }

  const checksumsPath = path.join(stagingDir, CHECKSUMS_FILE);
  fs.writeFileSync(checksumsPath, `${assets.map((a) => `${a.sha256}  ${a.file}`).join('\n')}\n`);
  console.log(`wrote          : ${checksumsPath}`);

  // ---- 5. Leak scan of the release notes ------------------------------------
  step(5, 'Leak-scan the release notes');
  let body;
  if (options.notes) {
    if (!fs.existsSync(options.notes)) fail(`notes file does not exist: ${options.notes}`);
    body = fs.readFileSync(options.notes, 'utf8').trim();
    console.log(`notes source   : ${options.notes}`);
  } else {
    const section = extractChangelogSection(options.changelog, config.displayName, version);
    if (section.error) {
      fail(`${section.error} — pass --notes <file> with the release-notes body`);
    }
    body = section.body;
    console.log(`notes source   : ${options.changelog} (${config.displayName} ${version})`);
  }
  if (!body) fail('the release-notes body is empty');

  const findings = scanText(body, 'release notes');
  if (findings.length > 0) {
    console.error(`\n${formatFindings(findings)}`);
    fail(`release notes contain ${findings.length} forbidden string(s); nothing was created`);
  }
  console.log(`leak scan      : clean (${body.split('\n').length} line(s))`);

  const notesPath = path.join(STAGING_ROOT, `${publicTag}-notes.md`);

  if (!options.dryRun) {
    // ---- 6. Create the draft release ---------------------------------------
    step(6, 'Create the draft release');
    fs.writeFileSync(notesPath, `${body}\n`);
    ghOrFail([
      'release', 'create', publicTag,
      '-R', PUBLIC_REPO,
      '--draft',
      '--title', title,
      '--notes-file', notesPath,
      config.latest ? '--latest' : '--latest=false',
    ], `could not create draft release ${publicTag} (delete any leftover draft first)`);
    console.log(`draft created  : ${publicTag}`);

    // ---- 7. Upload the assets ----------------------------------------------
    step(7, 'Upload assets to the draft');
    ghOrFail([
      'release', 'upload', publicTag,
      '-R', PUBLIC_REPO,
      ...assets.map((a) => a.path),
      checksumsPath,
      '--clobber',
    ], `could not upload assets to ${publicTag}`, { capture: false });
    console.log(`uploaded       : ${assets.length + 1} file(s)`);
  }

  // ---- 8. Plan summary -----------------------------------------------------
  step(8, 'Plan summary');
  console.log(`tag            : ${publicTag}`);
  console.log(`title          : ${title}`);
  console.log(`repository     : ${PUBLIC_REPO}`);
  console.log(`latest flag    : ${config.latest ? '--latest' : '--latest=false'}`);
  console.log(`notes          : ${body.split('\n').length} line(s), leak scan clean`);
  console.log('assets:');
  for (const asset of assets) {
    console.log(`  ${asset.file}`);
    console.log(`    ${asset.os} ${asset.arch} · ${formatSize(asset.size)} (${asset.size} bytes)`);
    console.log(`    sha256 ${asset.sha256}`);
  }
  console.log(`  ${CHECKSUMS_FILE}`);
  console.log(`    ${assets.length} entry/entries · ${formatSize(fs.statSync(checksumsPath).size)}`);
  console.log('');
  console.log('Immutable Releases is enabled on this repository: once the draft is promoted the');
  console.log('tag and every asset are FROZEN. A mistake cannot be edited away — it can only be');
  console.log('superseded by a new version.');

  if (options.dryRun) {
    console.log(`\n--dry-run: nothing was created. Staged files remain in ${stagingDir}`);
    return;
  }

  // ---- 9. Confirmation -----------------------------------------------------
  step(9, 'Confirm');
  if (!process.stdin.isTTY) {
    fail(`stdin is not a terminal, so the tag confirmation cannot be given; draft ${publicTag} left in place`);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let answer;
  try {
    answer = (await rl.question(`Type the exact tag "${publicTag}" to publish (anything else aborts): `)).trim();
  } finally {
    rl.close();
  }
  if (answer !== publicTag) {
    fail(`confirmation did not match "${publicTag}"; draft left in place, nothing was published`);
  }

  // ---- 10. Promote the draft ----------------------------------------------
  step(10, 'Promote the draft');
  ghOrFail(['release', 'edit', publicTag, '-R', PUBLIC_REPO, '--draft=false'], `could not promote draft ${publicTag}`);
  const releaseUrl = `https://github.com/${PUBLIC_REPO}/releases/tag/${publicTag}`;
  console.log(`published      : ${releaseUrl}`);

  // ---- 11. Update manifest.json and both READMEs ---------------------------
  step(11, 'Update manifest.json and re-render the READMEs');
  manifestEntry.status = 'released';
  manifestEntry.version = version;
  manifestEntry.tag = publicTag;
  manifestEntry.releasedAt = new Date().toISOString();
  manifestEntry.assets = assets
    .filter((asset) => !MANIFEST_EXCLUDED_SUFFIXES.some((suffix) => asset.file.endsWith(suffix)))
    .map((asset) => ({ file: asset.file, os: asset.os, arch: asset.arch, size: asset.size, sha256: asset.sha256 }));
  manifest.generated = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`manifest       : ${MANIFEST_PATH}`);
  const rendered = renderReadmes({ check: false });
  console.log(`readmes        : ${rendered.changed.length > 0 ? rendered.changed.join(', ') : 'already up to date'}`);
  console.log('Review the diff and commit manifest.json + the READMEs yourself.');

  // ---- 12. Back-link from the source release -------------------------------
  step(12, 'Back-link the source release');
  const backlink = `Publicly mirrored: ${releaseUrl}`;
  const view = gh(['release', 'view', privateTag, '-R', privateRepo, '--json', 'body', '--jq', '.body'], { capture: true });
  if (view.status !== 0) {
    console.warn(`WARNING: could not read the source release body (${(view.stderr || '').trim().split('\n')[0]}).`);
    console.warn(`WARNING: add this line to ${privateRepo} @ ${privateTag} manually: ${backlink}`);
  } else if ((view.stdout ?? '').includes(backlink)) {
    console.log('back-link      : already present');
  } else {
    const backlinkPath = path.join(STAGING_ROOT, `${publicTag}-source-body.md`);
    fs.writeFileSync(backlinkPath, `${(view.stdout ?? '').trimEnd()}\n\n${backlink}\n`);
    const edit = gh(['release', 'edit', privateTag, '-R', privateRepo, '--notes-file', backlinkPath], { capture: true });
    if (edit.status !== 0) {
      console.warn(`WARNING: could not append the back-link to ${privateRepo} @ ${privateTag} (${(edit.stderr || '').trim().split('\n')[0]}).`);
      console.warn(`WARNING: the public release is already live at ${releaseUrl}; add this line manually: ${backlink}`);
    } else {
      console.log('back-link      : appended to the source release notes');
    }
  }

  console.log(`\nDone. ${title} is public: ${releaseUrl}`);
}

main().catch((error) => {
  fail(error && error.message ? error.message : String(error));
});
