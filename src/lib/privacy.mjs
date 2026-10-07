// Shared build/output policy. noindex describes draft mode; it is not access control.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Fingerprints keep known unsafe binaries detectable after a rename or copy.
export const RESTRICTED_ASSET_FINGERPRINTS = Object.freeze([
  Object.freeze({ sha256: '5ad0f3d9d2a2363016ae5d27d91b2b5ed0651be5796e535b5984da70b458d1e3', label: 'historical OG image' }),
  Object.freeze({ sha256: '838b2193cb74ded3117077d29c49a5fb964ecc32fdafa2e0de3d125bf40af4a2', label: 'historical draft CV' }),
]);
const restrictedAssets = new Map(RESTRICTED_ASSET_FINGERPRINTS.map(({ sha256, label }) => [sha256, label]));
const draftHeadshot = '502d81587eb7029ff5eb7575f244860adfcc2dc4f0dae28560ff5a49abf61b37';
// Ferian OG preview visibly carries a draft label; a rename cannot make it final.
const draftOg = '3d2d007a8c29339fc433d7aa80c0694615ae597d9253e8c56e12f6192524623e';
export const isPlaceholderEmail = (contact) => /(^|\.)(invalid|example|test|localhost)(\.|$)/i.test(contact.emailDomain) || /^(placeholder|your[-_.]?email|email[-_.]?here)$/i.test(contact.emailUser);
export const emailAddress = (contact) => `${contact.emailUser}@${contact.emailDomain}`;
export function contentPrivacyProblems(site) {
  const problems = [];
  if (site.contact.emailConfirmed && isPlaceholderEmail(site.contact)) problems.push('contact.emailConfirmed requires a real, confirmed email, not a placeholder.');
  if (!site.settings.noindex) {
    if (!site.contact.emailConfirmed || isPlaceholderEmail(site.contact)) problems.push('Public mode requires the owner’s confirmed email.');
    if (/<username>|\.invalid(?:\/|$)|example\.(com|org|net)(?:\/|$)/i.test(site.settings.siteUrl)) problems.push('Public mode requires a confirmed siteUrl; local placeholder bypass is draft-only.');
    if (/placeholder|draft/i.test(site.profile.headshot)) problems.push('Public mode cannot reference a draft headshot.');
  }
  if (/placeholder|draft/i.test(site.profile.cvUrl)) problems.push('Do not link a draft CV; leave cvUrl empty until the final PDF is confirmed.');
  return problems;
}
export function assetPrivacyProblems(root, { publicMode = false, restrictedAssetSet = restrictedAssets, draftHeadshotHash = draftHeadshot, draftOgHash = draftOg } = {}) {
  const problems = [];
  if (!fs.existsSync(root)) return problems;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      const rel = path.relative(root, file);
      if (entry.isSymbolicLink()) { problems.push(`${rel}: symlinks are not allowed in published assets`); continue; }
      if (entry.isDirectory()) { walk(file); continue; }
      const digest = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (restrictedAssetSet.has(digest)) problems.push(`${rel}: contains ${restrictedAssetSet.get(digest)}; keep it outside published directories`);
      if (publicMode && (digest === draftHeadshotHash || digest === draftOgHash || /(?:draft|placeholder)/i.test(rel))) problems.push(`${rel}: draft asset must not be included in public mode`);
    }
  }
  walk(root);
  return problems;
}
// Check rendered HTML as well as scripts/data. Unconfirmed parts must never leak.
export function emailPrivacyProblems(text, contact) {
  const problems = [];
  const decode = (s) => s.replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, dec) => String.fromCodePoint(parseInt(hex || dec, hex ? 16 : 10))).replace(/&commat;/gi, '@').replace(/&period;/gi, '.');
  const decoded = decode(text);
  if (!contact.emailConfirmed) {
    if (decoded.includes(emailAddress(contact)) || decoded.includes(`${contact.emailUser} [at] ${contact.emailDomain.replace(/\./g, ' [dot] ')}`) || /data-(?:u|d)=/i.test(decoded)) problems.push('unconfirmed email data appears in output');
    if (/href=["']mailto:|id=["']copy-btn["']|class=["'][^"']*js-mail/i.test(decoded)) problems.push('email actions appear without a confirmed email');
  } else if (isPlaceholderEmail(contact)) problems.push('placeholder email is enabled');
  return problems;
}
