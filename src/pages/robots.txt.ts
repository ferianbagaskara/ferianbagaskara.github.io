// robots.txt generated from settings.noindex (Keola). While the site is private, block /cv/:
// the noindex meta tag cannot cover a PDF, and GitHub Pages cannot send X-Robots-Tag.
import type { APIRoute } from 'astro';
import { site } from '../lib/site';

export const GET: APIRoute = () => {
  const lines = ['User-agent: *', site.settings.noindex ? 'Disallow: /cv/' : 'Disallow:'];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
