import { defineConfig } from 'astro/config';
import { loadSite } from './src/lib/load.mjs';

// siteUrl lives in src/content/site.yaml, so a custom domain later is a one-line change there.
// Validation and the placeholder gate run in scripts/validate-content.mjs and src/lib/site.ts.
let site;
try { site = loadSite({ gate: false }).settings.siteUrl; } catch { site = undefined; }
if (site && /<username>/i.test(site)) site = undefined;

export default defineConfig({ output: 'static', site, build: { inlineStylesheets: 'auto' } });
