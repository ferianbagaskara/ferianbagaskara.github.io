// Reads, parses and validates site.yaml. Applies the siteUrl placeholder gate (Keola, D2).
import fs from 'node:fs';
import { contentPrivacyProblems, assetPrivacyProblems } from './privacy.mjs';
import path from 'node:path';
import yaml from 'js-yaml';
import { siteSchema, formatIssues, isPlaceholderSiteUrl, PLACEHOLDER_SITEURL_MESSAGE } from './schema.mjs';

export const CONTENT_FILE = path.resolve('src/content/site.yaml');

export function loadSite({ gate = true } = {}) {
  let raw;
  try {
    raw = yaml.load(fs.readFileSync(CONTENT_FILE, 'utf8'));
  } catch (e) {
    throw new Error(`site.yaml could not be read. Check the indentation and quotes near line ${(e.mark?.line ?? 0) + 1}.\n${e.reason ?? e.message}`);
  }
  const res = siteSchema.safeParse(raw);
  if (!res.success) throw new Error(`site.yaml has ${res.error.issues.length} problem(s):\n  - ${formatIssues(res.error).join('\n  - ')}`);
  const site = res.data;
  // Files referenced from site.yaml must exist in public/.
  for (const [key, ref] of [['profile.headshot', site.profile.headshot], ['profile.cvUrl', site.profile.cvUrl]]) {
    if (ref && ref.startsWith('/') && !fs.existsSync(path.resolve('public' + ref))) throw new Error(`site.yaml ${key} points to ${ref}, but public${ref} does not exist. Upload the file or set it back to "".`);
  }
  const privacyProblems = [...contentPrivacyProblems(site), ...assetPrivacyProblems(path.resolve('public'), { publicMode: !site.settings.noindex })];
  if (privacyProblems.length) throw new Error(`Privacy checks failed:\n  - ${privacyProblems.join('\n  - ')}`);
  if (gate && isPlaceholderSiteUrl(site.settings.siteUrl)) {
    const inCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
    if (process.env.ALLOW_PLACEHOLDER_SITEURL === '1' && !inCI && site.settings.noindex) {
      if (!globalThis.__siteUrlWarned) {
        console.warn(`\n⚠  WARNING: siteUrl is still a placeholder (${site.settings.siteUrl}). Continuing because ALLOW_PLACEHOLDER_SITEURL=1 (local only). Canonical and og:image URLs in this build are NOT deployable.\n`);
        globalThis.__siteUrlWarned = true;
      }
    } else {
      throw new Error(PLACEHOLDER_SITEURL_MESSAGE);
    }
  }
  return site;
}
