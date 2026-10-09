#!/usr/bin/env node
// Honesty and safety checks on the built site in dist/ (LLD section 8). Fails with a list of problems.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { contentPrivacyProblems, assetPrivacyProblems, emailPrivacyProblems } from '../src/lib/privacy.mjs';
const isPlaceholderSiteUrl = (url) => /<username>/i.test(url);

export function checkDist(site, dist = path.resolve('dist')) {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    if (e.isSymbolicLink()) return; // asset scan reports this without following it
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p) : files.push(p);
  });
  if (!fs.existsSync(dist)) return ['dist/ not found. Run npm run build first.'];
  walk(dist);

  const problems = [...contentPrivacyProblems(site), ...assetPrivacyProblems(dist, { publicMode: !site.settings.noindex })];
  const text = files.filter((f) => /\.(html|css|js|xml|txt|json|svg)$/.test(f));
  for (const f of text) {
    const s = fs.readFileSync(f, 'utf8');
    const rel = path.relative(dist, f);
    for (const problem of emailPrivacyProblems(s, site.contact)) problems.push(`${rel}: ${problem}`);
    if (/Ajo\s+Wijaja|Cheaty\s+Frever/i.test(s)) problems.push(`${rel}: contains historical identity`);
    if (/Instagram/i.test(s)) problems.push(`${rel}: mentions Instagram`);
    if (/Junior Manager/i.test(s)) problems.push(`${rel}: contains the HR grade`);
    if (/href=["']#?["']/.test(s)) problems.push(`${rel}: has an empty or "#" link`);
    if (/(fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com|cdnjs|use\.typekit)/i.test(s)) problems.push(`${rel}: requests a font or script CDN`);
    if (/<script[^>]+src=["']https?:/i.test(s)) problems.push(`${rel}: loads an external script`);
    if (/<a [^>]*target=["']_blank["']/.test(s)) {
      for (const m of s.matchAll(/<a [^>]*target=["']_blank["'][^>]*>/g)) {
        if (!/rel=["'][^"']*noopener[^"']*noreferrer|rel=["'][^"']*noreferrer[^"']*noopener/.test(m[0])) problems.push(`${rel}: external link without rel="noopener noreferrer"`);
      }
    }
  }
  const index = path.join(dist, 'index.html');
  const nf = path.join(dist, '404.html');
  if (!fs.existsSync(index)) problems.push('index.html is missing');
  if (!fs.existsSync(nf)) problems.push('404.html is missing');
  if (!fs.existsSync(path.join(dist, '.nojekyll'))) problems.push('.nojekyll is missing');
  if (fs.existsSync(index)) {
    const h = fs.readFileSync(index, 'utf8');
    const og = h.match(/property="og:image" content="([^"]+)"/)?.[1] ?? '';
    if (og && !/^https:\/\//.test(og)) problems.push('index.html: og:image is not absolute');
    if (/^https:\/\//.test(og)) {
      const asset = new URL(og).pathname;
      if (!fs.existsSync(path.join(dist, asset))) problems.push('index.html: og:image asset is missing');
    }
    if (isPlaceholderSiteUrl(site.settings.siteUrl) && /property=["']og:(image|url)["']|rel=["']canonical["']/.test(h)) problems.push('index.html: placeholder siteUrl must not produce canonical/OG URLs');
    if (!site.settings.ogImageConfirmed && /property=["']og:image["']/.test(h)) problems.push('index.html: unreviewed OG bitmap must not produce an image URL');
    const noindex = /name=["']robots["'] content=["'][^"']*noindex/.test(h);
    if (noindex !== site.settings.noindex) problems.push('index.html: robots state does not match draft/public mode');
    if (/<username>|&lt;username&gt;/.test(h)) problems.push('index.html: siteUrl placeholder <username> is in the output');
    if (/class="diagram/.test(h) && !/Illustrative workflow, not actual production architecture\./.test(h)) problems.push('index.html: diagram shown without its illustrative workflow caption');
    if (site.contact.emailConfirmed) {
      const expected = `${site.contact.emailUser} [at] ${site.contact.emailDomain.replace(/\./g, ' [dot] ')}`;
      if (!h.includes(`<noscript>${expected}</noscript>`)) problems.push('index.html: confirmed email fallback missing or inconsistent with content');
      if (!h.includes(`data-u="${site.contact.emailUser}"`) || !h.includes(`data-d="${site.contact.emailDomain}"`)) problems.push('index.html: confirmed email parts missing or inconsistent with content');
    }
  }
  if (fs.existsSync(nf) && !/name="robots" content="noindex/.test(fs.readFileSync(nf, 'utf8'))) problems.push('404.html: must always be noindex');
  if (!files.some((f) => f.endsWith('.woff2'))) problems.push('no self-hosted .woff2 font files in dist/');

  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { loadSite } = await import('../src/lib/load.mjs');
    const problems = checkDist(loadSite());
    if (problems.length) throw new Error(`check:dist found ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
    console.log('✓ check:dist passed');
  } catch (error) {
    console.error(`\n✗ ${error.message}\n`);
    process.exitCode = 1;
  }
}
