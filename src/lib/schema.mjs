// Zod schema for src/content/site.yaml. Shared by the Astro build (src/lib/site.ts)
// and the standalone validator (scripts/validate-content.mjs), so both apply the same rules.
import { z } from 'zod';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monYear = z.string().regex(new RegExp(`^(${MONTHS.join('|')}) \\d{4}$`), 'Use the format "Mon YYYY", for example "Aug 2026"');
const monthIndex = (s) => Number(s.slice(4)) * 12 + MONTHS.indexOf(s.slice(0, 3));
const text = (max) => z.string().trim().min(1, 'Must not be empty').max(max, `Keep this to ${max} characters or fewer`);
const optionalText = (max) => z.string().max(max, `Keep this to ${max} characters or fewer`).default('');
const emptyOr = (re, msg) => z.string().refine((v) => v === '' || re.test(v), msg).default('');

export const PLACEHOLDER_HEADSHOT_MESSAGE = 'Replace the placeholder headshot with your real photo before making the site public.';
export const isPlaceholderHeadshot = (p) => /placeholder/i.test(p || '');
export const PLACEHOLDER_SITEURL_MESSAGE = 'Set siteUrl in site.yaml to your real GitHub Pages address before deploying.';

const cert = z.object({
  name: text(100),
  issuer: text(60),
  issued: monYear,
  expires: monYear,
  datesConfirmed: z.boolean().default(false),
  kind: z.enum(['certification', 'microcredential']),
  featured: z.boolean().optional(),
  short: text(40).optional(),
  credlyUrl: emptyOr(/^https:\/\/www\.credly\.com\/\S+$/, 'Use "" or a link starting with https://www.credly.com/'),
}).strict().refine((c) => monthIndex(c.expires) >= monthIndex(c.issued), { message: 'expires must not be earlier than issued', path: ['expires'] });

const track = z.object({
  title: text(80),
  period: text(40),
  responsibilities: z.array(text(240)).max(5).default([]),
}).strict();

const project = z.object({
  title: text(100),
  nda: z.boolean().default(false),
  privateCode: z.boolean().default(false),
  problem: text(400),
  role: text(400),
  outcome: text(400),
  tags: z.array(text(40)).max(12).default([]),
  diagram: z.boolean().default(false),
  detailSummary: text(100).optional(),
  detailText: text(400).optional(),
}).strict();

export const siteSchema = z.object({
  settings: z.object({
    noindex: z.boolean(),
    siteUrl: z.string()
      .regex(/^https:\/\/\S+[^/]$/, 'siteUrl must start with https:// and have no trailing slash'),
    lang: z.string().regex(/^[a-z]{2}$/, 'Use a two-letter language code, for example "en"').default('en'),
    hidePlaceholders: z.boolean().default(false),
    // Enable only after manually reviewing the bitmap against current YAML.
    ogImageConfirmed: z.boolean().default(false),
  }).strict(),
  profile: z.object({
    name: text(60),
    headline: text(80),
    tagline: text(320),
    availability: text(60),
    location: optionalText(40),
    headshot: emptyOr(/^\/img\/[\w.-]+\.(webp|avif|jpg|png)$/, 'Use "" or a path like /img/headshot.webp (file in public/img/)'),
    cvUrl: emptyOr(/^\/cv\/[\w.-]+\.pdf$/, 'Use "" or a path like /cv/your-cv.pdf (file in public/cv/)'),
  }).strict(),
  contact: z.object({
    // Enable contact actions only after this address is confirmed for the portfolio owner.
    emailConfirmed: z.boolean().default(false),
    emailUser: z.string().regex(/^[A-Za-z0-9._+-]+$/, 'Only letters, digits, . _ + - are allowed before the @'),
    emailDomain: z.string().regex(/^([a-z0-9-]+\.)+[a-z]{2,}$/i, 'Use a domain like gmail.com'),
    linkedinUrl: emptyOr(/^https:\/\/www\.linkedin\.com\/in\/[\w%-]+\/?$/, 'Use "" or a link like https://www.linkedin.com/in/your-name'),
    heading: optionalText(80),
  }).strict(),
  certifications: z.array(cert).min(1).max(12),
  experience: z.array(z.object({
    role: text(80),
    employer: text(80),
    period: text(40),
    tracks: z.array(track).max(4).default([]),
  }).strict()).min(1).max(5),
  projects: z.array(project).min(1).max(6),
  skills: z.array(z.object({ group: text(60), items: z.array(text(60)).min(1).max(20) }).strict()).min(1).max(6),
}).strict();

export const isPlaceholderSiteUrl = (url) => /<username>/i.test(url);

/** Formats zod issues as "path: message" lines, e.g. "certifications[2].issued: Required". */
export function formatIssues(error) {
  return error.issues.map((i) => {
    const p = i.path.reduce((acc, k) => (typeof k === 'number' ? `${acc}[${k}]` : acc ? `${acc}.${k}` : String(k)), '');
    return `${p || '(root)'}: ${i.message}`;
  });
}
