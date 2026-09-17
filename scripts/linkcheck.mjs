#!/usr/bin/env node
/**
 * linkcheck.mjs — prove every download link on this page actually resolves.
 *
 * manifest.json can describe a release that no longer exists. That is not
 * hypothetical: a published release was deleted here, the manifest kept saying
 * "released", and the README went on advertising seven downloads behind a tag
 * that GitHub had already burned. Rendering was self-consistent the whole time,
 * so only a real request catches it.
 *
 * Usage:
 *   node scripts/linkcheck.mjs            check every link derived from manifest.json
 *   node scripts/linkcheck.mjs --readme   also check the links written in the READMEs
 *
 * Exits 1 when any link does not resolve. Network access required, so this is a
 * scheduled/manual check rather than part of the offline guard.
 *
 * Node standard library only. No dependencies, ever.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'manifest.json');
const TIMEOUT_MS = 30_000;

function releaseBase(repo, tag) {
  return `https://github.com/${repo}/releases/download/${tag}`;
}

/** Every URL the published surface promises, derived from the manifest. */
function manifestLinks(manifest) {
  const out = [];
  for (const product of manifest.products) {
    if (product.channel?.url) {
      out.push({ url: product.channel.url, why: `${product.name} channel` });
    }
    if (product.status !== 'released') continue;
    if (!product.tag) {
      out.push({ url: null, why: `${product.name} is marked released but has no tag`, broken: true });
      continue;
    }
    out.push({
      url: `https://github.com/${manifest.repo}/releases/tag/${product.tag}`,
      why: `${product.name} release page`,
    });
    for (const asset of product.assets ?? []) {
      out.push({
        url: `${releaseBase(manifest.repo, product.tag)}/${asset.file}`,
        why: `${product.name} · ${asset.file}`,
        expectSize: asset.size,
      });
    }
    out.push({
      url: `${releaseBase(manifest.repo, product.tag)}/SHASUMS256.txt`,
      why: `${product.name} · SHASUMS256.txt`,
    });
  }
  return out;
}

function readmeLinks() {
  const out = [];
  for (const file of ['README.md', 'README.zh-CN.md']) {
    const full = path.join(REPO_ROOT, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, 'utf8');
    for (const m of text.matchAll(/https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/releases\/[^\s)]+/g)) {
      out.push({ url: m[0], why: file });
    }
  }
  return out;
}

async function check(entry) {
  if (entry.broken) return { ...entry, ok: false, detail: 'no tag in manifest' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(entry.url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    const size = Number(res.headers.get('content-length'));
    if (!res.ok) return { ...entry, ok: false, detail: `HTTP ${res.status}` };
    if (entry.expectSize && size && size !== entry.expectSize) {
      return { ...entry, ok: false, detail: `size ${size} != manifest ${entry.expectSize}` };
    }
    return { ...entry, ok: true, detail: `HTTP ${res.status}${size ? `, ${size} bytes` : ''}` };
  } catch (err) {
    return { ...entry, ok: false, detail: err.name === 'AbortError' ? 'timed out' : String(err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function main(argv) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const entries = [...manifestLinks(manifest)];
  if (argv.includes('--readme')) {
    const seen = new Set(entries.map((e) => e.url));
    for (const e of readmeLinks()) if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); }
  }

  if (entries.length === 0) {
    console.log('linkcheck: nothing published yet, no links to check.');
    return 0;
  }

  const results = [];
  for (const entry of entries) results.push(await check(entry));

  for (const r of results) {
    console.log(`  ${r.ok ? 'OK  ' : 'FAIL'}  ${r.why}\n        ${r.url ?? '(no url)'}  — ${r.detail}`);
  }
  const bad = results.filter((r) => !r.ok);
  if (bad.length > 0) {
    console.error(`\nlinkcheck FAILED: ${bad.length} of ${results.length} link(s) did not resolve.`);
    return 1;
  }
  console.log(`\nlinkcheck OK — ${results.length} link(s) resolve.`);
  return 0;
}

process.exitCode = await main(process.argv.slice(2));
