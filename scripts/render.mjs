#!/usr/bin/env node
/**
 * render.mjs — regenerate the download tables in README.md / README.zh-CN.md
 * from manifest.json.
 *
 * manifest.json is the single source of truth for what is published: versions,
 * tags, asset names, sizes and SHA-256 sums. This script rewrites only the text
 * between the `<!-- BEGIN:DOWNLOADS -->` and `<!-- END:DOWNLOADS -->` markers in
 * each README, so the surrounding prose stays hand-written.
 *
 *   node scripts/render.mjs            rewrite both READMEs
 *   node scripts/render.mjs --check    verify only; exits 1 with a diff when the
 *                                      committed READMEs are stale (this is what
 *                                      CI runs)
 *
 * Node standard library only. No dependencies, ever.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'manifest.json');
const BEGIN_MARKER = '<!-- BEGIN:DOWNLOADS -->';
const END_MARKER = '<!-- END:DOWNLOADS -->';

export const TARGETS = [
  { file: 'README.md', lang: 'en' },
  { file: 'README.zh-CN.md', lang: 'zh' },
];

const STRINGS = {
  en: {
    columns: ['Platform', 'Architecture', 'File', 'Size', 'SHA-256'],
    unreleased: '_No public build yet._',
    released: (date) => `Released ${date}`,
    releaseNotes: 'Release notes',
    verificationIntro: 'The files below are verification artifacts for the published package:',
  },
  zh: {
    columns: ['平台', '架构', '文件', '大小', 'SHA-256'],
    unreleased: '_暂无公开构建。_',
    released: (date) => `发布于 ${date}`,
    releaseNotes: '发布说明',
    verificationIntro: '以下文件是已发布包的校验产物：',
  },
};

/** Call to action for each distribution channel a product can point at. */
const CHANNEL_CTA = {
  'chrome-web-store': {
    en: 'Install from the Chrome Web Store',
    zh: '从 Chrome 应用商店安装',
  },
};

/** Pick a localized field, falling back to the English field. */
function pick(obj, key, lang) {
  if (lang === 'zh') {
    const zhKey = `${key}Zh`;
    if (obj[zhKey] !== undefined && obj[zhKey] !== null && obj[zhKey] !== '') return obj[zhKey];
  }
  return obj[key];
}

export function formatSize(bytes) {
  if (!Number.isInteger(bytes) || bytes < 0) {
    throw new Error(`manifest: asset size must be a non-negative integer (got ${JSON.stringify(bytes)})`);
  }
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function assetUrl(manifest, tag, file) {
  return `https://github.com/${manifest.repo}/releases/download/${tag}/${encodeURIComponent(file)}`;
}

function releaseUrl(manifest, tag) {
  return `https://github.com/${manifest.repo}/releases/tag/${tag}`;
}

function releaseDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) throw new Error(`manifest: releasedAt is not a valid date: ${JSON.stringify(iso)}`);
  return date.toISOString().slice(0, 10);
}

function channelCallToAction(kind, lang) {
  const cta = CHANNEL_CTA[kind];
  if (!cta) throw new Error(`manifest: unknown channel kind "${kind}" — add it to CHANNEL_CTA in scripts/render.mjs`);
  return cta[lang] ?? cta.en;
}

function assetTable(manifest, product, lang) {
  const t = STRINGS[lang];
  const rows = [`| ${t.columns.join(' | ')} |`, `| ${t.columns.map(() => '---').join(' | ')} |`];
  for (const asset of product.assets) {
    if (typeof asset.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(asset.sha256)) {
      throw new Error(`manifest: ${product.id} asset ${asset.file} has no valid sha256`);
    }
    rows.push(
      `| ${asset.os} | ${asset.arch} | [${asset.file}](${assetUrl(manifest, product.tag, asset.file)}) `
      + `| ${formatSize(asset.size)} | \`${asset.sha256.slice(0, 12)}\` |`,
    );
  }
  return rows.join('\n');
}

function productBlock(manifest, product, lang) {
  const t = STRINGS[lang];
  const name = pick(product, 'name', lang);
  const released = product.status === 'released';
  const parts = [];

  parts.push(released ? `### ${name} ${product.version}` : `### ${name}`);

  if (product.channel) {
    const cta = channelCallToAction(product.channel.kind, lang);
    if (product.channel.url) {
      parts.push(`**[${cta}](${product.channel.url})**`);
    }
    const note = pick(product.channel, 'note', lang);
    if (note) parts.push(note);
  }

  if (released) {
    parts.push(`${t.released(releaseDate(product.releasedAt))} · [${t.releaseNotes}](${releaseUrl(manifest, product.tag)})`);
    if (product.assets.length === 0) {
      throw new Error(`manifest: ${product.id} is released but carries no assets`);
    }
    if (product.channel) parts.push(t.verificationIntro);
    parts.push(assetTable(manifest, product, lang));
  } else {
    parts.push(t.unreleased);
  }

  const notes = pick(product, 'notes', lang);
  if (notes) parts.push(`> ${String(notes).split('\n').join('\n> ')}`);

  return parts.join('\n\n');
}

function assertManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new Error('manifest: root must be an object');
  if (typeof manifest.repo !== 'string' || !manifest.repo.includes('/')) {
    throw new Error('manifest: "repo" must be an owner/name string');
  }
  if (!Array.isArray(manifest.products) || manifest.products.length === 0) {
    throw new Error('manifest: "products" must be a non-empty array');
  }
  for (const product of manifest.products) {
    if (typeof product.id !== 'string' || !product.id) throw new Error('manifest: every product needs an "id"');
    if (typeof product.name !== 'string' || !product.name) throw new Error(`manifest: ${product.id} needs a "name"`);
    if (product.status !== 'released' && product.status !== 'unreleased') {
      throw new Error(`manifest: ${product.id} status must be "released" or "unreleased"`);
    }
    if (!Array.isArray(product.assets)) throw new Error(`manifest: ${product.id} needs an "assets" array`);
    if (product.status === 'released') {
      if (typeof product.version !== 'string' || !product.version) throw new Error(`manifest: ${product.id} needs a "version"`);
      if (typeof product.tag !== 'string' || !product.tag) throw new Error(`manifest: ${product.id} needs a "tag"`);
      if (typeof product.releasedAt !== 'string') throw new Error(`manifest: ${product.id} needs a "releasedAt"`);
      for (const asset of product.assets) {
        for (const field of ['file', 'os', 'arch']) {
          if (typeof asset[field] !== 'string' || !asset[field]) {
            throw new Error(`manifest: ${product.id} asset is missing "${field}"`);
          }
        }
      }
    }
  }
  return manifest;
}

export function readManifest(manifestPath = MANIFEST_PATH) {
  return assertManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

/** Build the generated block (without the markers) for one language. */
export function renderBlock(manifest, lang) {
  if (!STRINGS[lang]) throw new Error(`render: unknown language "${lang}"`);
  return manifest.products.map((product) => productBlock(manifest, product, lang)).join('\n\n');
}

function spliceBlock(content, block, label) {
  const begin = content.indexOf(BEGIN_MARKER);
  const end = content.indexOf(END_MARKER);
  if (begin === -1 || end === -1) {
    throw new Error(`${label}: missing ${BEGIN_MARKER} / ${END_MARKER} markers`);
  }
  if (end < begin) throw new Error(`${label}: ${END_MARKER} appears before ${BEGIN_MARKER}`);
  if (content.indexOf(BEGIN_MARKER, begin + 1) !== -1 || content.indexOf(END_MARKER, end + 1) !== -1) {
    throw new Error(`${label}: markers appear more than once`);
  }
  return `${content.slice(0, begin + BEGIN_MARKER.length)}\n\n${block.trim()}\n\n${content.slice(end)}`;
}

/** The current text between the markers, for the --check diff. */
function extractBlock(content) {
  const begin = content.indexOf(BEGIN_MARKER);
  const end = content.indexOf(END_MARKER);
  if (begin === -1 || end === -1 || end < begin) return '';
  return content.slice(begin + BEGIN_MARKER.length, end).trim();
}

function firstDifferences(committed, rendered, limit = 12) {
  const a = committed.split('\n');
  const b = rendered.split('\n');
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length) && out.length < limit; i += 1) {
    if (a[i] === b[i]) continue;
    if (a[i] !== undefined) out.push(`- ${i + 1}: ${a[i]}`);
    if (b[i] !== undefined) out.push(`+ ${i + 1}: ${b[i]}`);
  }
  return out;
}

/**
 * Render both READMEs.
 *
 * @param {{check?: boolean, manifestPath?: string}} options
 * @returns {{changed: string[], results: Array<{file: string, stale: boolean, diff: string[]}>}}
 */
export function renderReadmes({ check = false, manifestPath = MANIFEST_PATH } = {}) {
  const manifest = readManifest(manifestPath);
  const changed = [];
  const results = [];

  for (const target of TARGETS) {
    const file = path.join(REPO_ROOT, target.file);
    // Normalise to LF before comparing. The block we splice in is always LF,
    // so against a CRLF working copy (git autocrlf, or a Windows editor) a raw
    // comparison reports every single line as changed — a --check failure whose
    // diff shows two identical-looking lines. .gitattributes pins eol=lf; this
    // keeps the check honest even if a file arrives with CRLF anyway.
    const committed = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const block = renderBlock(manifest, target.lang);
    const rendered = spliceBlock(committed, block, target.file);
    const stale = rendered !== committed;
    if (stale && !check) {
      fs.writeFileSync(file, rendered);
      changed.push(target.file);
    }
    results.push({
      file: target.file,
      stale,
      // Line numbers are relative to the generated block, not the whole file.
      diff: stale ? firstDifferences(extractBlock(committed), block.trim()) : [],
    });
  }

  return { changed, results };
}

function main(argv) {
  const check = argv.includes('--check');
  const unknown = argv.filter((a) => a !== '--check');
  if (unknown.length > 0) {
    console.error(`render: unknown argument(s): ${unknown.join(' ')}\nusage: node scripts/render.mjs [--check]`);
    process.exit(1);
  }

  let result;
  try {
    result = renderReadmes({ check });
  } catch (error) {
    console.error(`render: ${error.message}`);
    process.exit(1);
  }

  if (check) {
    const stale = result.results.filter((r) => r.stale);
    if (stale.length > 0) {
      console.error('render --check FAILED: the committed download tables do not match manifest.json.\n');
      for (const entry of stale) {
        console.error(`${entry.file}  DOWNLOADS block, line numbers relative to the block`);
        console.error('  ("-" committed, "+" rendered from manifest.json)');
        for (const line of entry.diff) console.error(`  ${line}`);
        console.error('');
      }
      console.error('Run: node scripts/render.mjs');
      process.exit(1);
    }
    console.log(`render --check OK — ${result.results.length} file(s) match manifest.json.`);
    return;
  }

  if (result.changed.length === 0) {
    console.log('render: already up to date.');
    return;
  }
  console.log(`render: updated ${result.changed.join(', ')}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
