import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentPrivacyProblems, assetPrivacyProblems, emailPrivacyProblems } from '../../src/lib/privacy.mjs';
import { checkDist } from '../check-dist.mjs';
const draft = { settings: { noindex: true, siteUrl: 'https://<username>.github.io' }, profile: { headshot: '/img/headshot-placeholder.webp', cvUrl: '' }, contact: { emailConfirmed: false, emailUser: 'placeholder', emailDomain: 'invalid.invalid' } };
assert.deepEqual(contentPrivacyProblems(draft), []);
assert.ok(contentPrivacyProblems({ ...draft, contact: { ...draft.contact, emailConfirmed: true } }).length);
assert.ok(contentPrivacyProblems({ ...draft, settings: { ...draft.settings, noindex: false } }).length);
const confirmed = { ...draft, settings: { noindex: false, siteUrl: 'https://portfolio.example-owner.dev' }, profile: { headshot: '', cvUrl: '' }, contact: { emailConfirmed: true, emailUser: 'owner', emailDomain: 'example-owner.dev' } };
assert.deepEqual(contentPrivacyProblems(confirmed), []);
assert.ok(emailPrivacyProblems('<span data-u="placeholder" data-d="invalid.invalid"></span>', draft.contact).length);
assert.ok(emailPrivacyProblems('<a href="mailto:placeholder&#64;invalid.invalid">Email</a>', draft.contact).length);
assert.deepEqual(emailPrivacyProblems('const href = "mailto:"; document.querySelector(".js-mail");', draft.contact), []);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-privacy-'));
try {
  fs.writeFileSync(path.join(root, 'index.html'), '<meta name="robots" content="noindex, nofollow"><p>Contact details pending confirmation.</p>');
  fs.writeFileSync(path.join(root, '404.html'), '<meta name="robots" content="noindex, nofollow">');
  fs.writeFileSync(path.join(root, '.nojekyll'), '');
  fs.writeFileSync(path.join(root, 'font.woff2'), 'fixture');
  assert.deepEqual(checkDist(draft, root), []);
  const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));
  const archiveDir = fileURLToPath(new URL('../../docs/assets/historical/', import.meta.url));
  for (const [file, label] of [['og-image-persona.png', 'historical OG'], ['cv-persona-draft.pdf', 'historical draft CV']]) {
    const source = path.join(archiveDir, file);
    assert.ok(fs.existsSync(source), `Required historical fixture missing: ${file}`);
    fs.copyFileSync(source, path.join(root, 'renamed.bin'));
    assert.ok(assetPrivacyProblems(root).some((p) => p.includes(label)));
    assert.ok(checkDist(draft, root).some((p) => p.includes(label)));
    fs.unlinkSync(path.join(root, 'renamed.bin'));
  }
  fs.copyFileSync(path.join(publicDir, 'og-image.png'), path.join(root, 'renamed-preview.bin'));
  assert.deepEqual(assetPrivacyProblems(root), []);
  assert.ok(assetPrivacyProblems(root, { publicMode: true }).some((p) => p.includes('renamed-preview.bin')));
  fs.unlinkSync(path.join(root, 'renamed-preview.bin'));
  assert.deepEqual(assetPrivacyProblems(publicDir), []);
  const headshot = path.join(archiveDir, 'headshot-generated-placeholder.webp');
  assert.ok(fs.existsSync(headshot), 'Required archived generated headshot fixture missing');
  if (fs.existsSync(headshot)) {
    fs.copyFileSync(headshot, path.join(root, 'portrait.webp'));
    assert.deepEqual(assetPrivacyProblems(root), []);
    assert.ok(assetPrivacyProblems(root, { publicMode: true }).some((p) => p.includes('portrait.webp')));
    fs.unlinkSync(path.join(root, 'portrait.webp'));
  }
  fs.writeFileSync(path.join(root, 'index.html'), '<output data-u="owner" data-d="example-owner.dev"><noscript>owner [at] example-owner [dot] dev</noscript></output>');
  assert.deepEqual(checkDist(confirmed, root), []);
  assert.ok(checkDist(draft, root).some((p) => p.includes('unconfirmed email')));
  fs.writeFileSync(path.join(root, 'index.html'), '<output data-u="wrong" data-d="example-owner.dev"><noscript>wrong [at] example-owner [dot] dev</noscript></output>');
  assert.ok(checkDist(confirmed, root).some((p) => p.includes('inconsistent')));
  fs.writeFileSync(path.join(root, 'index.html'), '<meta name="robots" content="noindex"><meta property="og:image" content="https://host.dev/og-image.png">');
  assert.ok(checkDist(draft, root).some((p) => p.includes('placeholder siteUrl')));
} finally { fs.rmSync(root, { recursive: true, force: true }); }
console.log('✓ privacy guard regressions passed');
