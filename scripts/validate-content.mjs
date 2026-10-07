#!/usr/bin/env node
// Validates src/content/site.yaml against the schema. Runs before every build (locally and in CI).
import { loadSite } from '../src/lib/load.mjs';
try {
  loadSite();
  console.log('✓ site.yaml is valid');
} catch (e) {
  console.error(`\n✗ ${e.message}\n`);
  if (process.env.GITHUB_ACTIONS) console.log(`::error file=src/content/site.yaml::${e.message.split('\n')[0]}`);
  process.exit(1);
}
