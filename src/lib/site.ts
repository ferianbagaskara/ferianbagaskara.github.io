// Loads, validates and exports the typed content object used by every component.
import type { z } from 'zod';
import { siteSchema } from './schema.mjs';
import { loadSite } from './load.mjs';

export type Site = z.infer<typeof siteSchema>;
export type Cert = Site['certifications'][number];
export type Project = Site['projects'][number];

// astro dev is never gated (Keola, decision 3); build and preview are.
const isDev = import.meta.env.DEV;
export const site: Site = loadSite({ gate: !isDev });
