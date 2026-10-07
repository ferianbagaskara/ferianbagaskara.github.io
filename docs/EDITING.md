# Editing Ferian's portfolio

Site text comes from `src/content/site.yaml`. Treat it as the source of confirmed
profile facts for the site, CV, and OG preview. The site and text metadata read it
automatically; PDF and image files do not. There is no CV or OG generator: update
those assets manually using the checklist below.

## Update and synchronize content

1. Confirm the changed facts with Ferian, then edit `src/content/site.yaml` first.
   Keep YAML indentation and use only fields supported by `src/lib/schema.mjs`.
   Hero, project summaries/details, footer, and text metadata read this content;
   do not add title-based component copy overrides.
   Do not turn unknown dates, contacts, links, or CV details into guessed data.
2. Use the asset table to identify every affected file. Compare the CV and OG
   text with the updated YAML: name, role, dates, certifications, and contributions
   must agree wherever they appear. A CV may expand confirmed details but must
   not introduce unsupported claims or disclose NDA/private material.
3. Update each affected asset manually, or record it as pending in
   `portfolio-docs/08-rencana-pengembangan.md` with the affected field/path and
   missing information. Keep `profile.cvUrl: ""` until a final PDF is confirmed.
   If an active CV becomes stale, clear its URL until the replacement is reviewed.
   Clear `settings.ogImageConfirmed` whenever facts shown in the OG change.
   Update and visually review the bitmap before setting it true. Its metadata URL
   requires both this flag and a confirmed `settings.siteUrl`; a URL change alone
   must not enable a stale bitmap. Remove stale public binaries before launch.
4. Review the actual PDF and image, not just their filenames. Check visible text,
   PDF metadata, contact details, and legibility. Store historical or unfinished
   assets outside `public/` and `dist/`; unlinking them does not prevent hosting.
5. Run `npm run validate` for content, then `npm test` for build, output, type,
   and privacy checks when project dependencies are available. The placeholder
   site URL can be bypassed only in local draft checks using
   `ALLOW_PLACEHOLDER_SITEURL=1 npm test`. Other guards still apply; a passing
   check is not approval of CV/OG facts or publication.
6. Commit the YAML, reviewed assets, and changed references together. GitHub
   Actions runs CI on pull requests. A push to `main` runs CI and, if it passes,
   deploys `dist/` to GitHub Pages. Check the workflow result and live page after
   a publication push; a local check does not publish the site.

### Assets and references to review

Paths below are relative to the application directory (`cheafver.github.io-main/`).
Only update items affected by the content change.

| Change | Assets / references | Manual action |
| --- | --- | --- |
| Name, headline, tagline | `public/og-image.png`; final CV under `public/cv/`; identity mentions in `README.md` and `docs/EDITING.md` if present | Recreate the OG bitmap and revise the final CV from confirmed YAML. The site's title, description, OG text, and image alt text already use `profile` in `src/layouts/BaseLayout.astro`. |
| Certification, experience, project, availability, location | Final CV under `public/cv/`; `public/og-image.png` if it includes that text | Update only the details shown in each asset. Preserve separate on-prem/cloud periods and NDA/private-code wording. |
| Confirmed email / LinkedIn / site URL | Final CV; OG if it prints a contact or URL; `contact` / `settings.siteUrl` in YAML | Review every printed address before enabling it. Do not copy historical persona contacts. |
| New final CV | `public/cv/<final-file>.pdf`; `profile.cvUrl` | Open and verify the PDF before setting the URL. Remove superseded public copies. A renamed old draft is not a final CV. |
| OG replacement | `public/og-image.png`; image path and dimensions in `src/layouts/BaseLayout.astro` | Keep the expected 1200×630 PNG/path, or update its metadata references if those change. Do not insert historical bytes under a new name. |
| Confirmed portrait | `public/img/<photo>`; `profile.headshot` | Replace the generated placeholder with a reviewed real photo, then remove unused draft copies before public mode. |

At S3.5, `public/og-image.png` was a 1200×630 Ferian preview marked
“Draft portfolio — contact details and CV pending.” It uses the YAML name,
headline and tagline, with the white, serif and blue design C direction. It is
now stale after S4.4 aligned headline/tagline to design C; `ogImageConfirmed` is
false. It is not a final launch asset: its known bytes are rejected in public mode, including
renamed copies. Update and review it manually when the profile changes, and
replace its draft label only after the missing data and publication are approved.
The OG URL remains omitted until the bitmap is reviewed and the site URL confirmed.

Historical OG/CV and the unused generated portrait are preserved unchanged in
`docs/assets/historical/`, outside the active public output. Their README records
fixture usage; do not deploy that directory. `profile.headshot` and `profile.cvUrl`
are empty. Design C needs no portrait. The site displays “CV pending final
details.”; no placeholder PDF or download is supplied.

## Edit on GitHub

Open `src/content/site.yaml` in the repository, click the pencil icon, make the
confirmed edits, and review the diff before committing. Use the **Actions** tab
to inspect CI results. A green check means checks passed, not that the site was
published. For PDF/image changes, include the reviewed replacement and remove
superseded public files in the same change.

## Filling in placeholders

Empty optional links show a placeholder or are hidden by `hidePlaceholders`.
Email actions stay absent until the email is confirmed.

| What | Key in `site.yaml` | What to put |
| --- | --- | --- |
| Email | `contact.emailUser`, `contact.emailDomain`, `contact.emailConfirmed` | Keep confirmation false until Ferian supplies the real address. Set both parts and confirmation together only after review. The schema defaults confirmation to false when omitted. |
| LinkedIn | `contact.linkedinUrl` | Confirmed full LinkedIn profile URL; otherwise `""`. |
| Credly badges | `certifications[].credlyUrl` | Ask Ferian for the direct badge URL for that credential and verify it identifies the matching badge. Until confirmed, keep `""`; do not create a placeholder link. |
| Credential dates | `certifications[].datesConfirmed`, `issued`, `expires` | Confirm Issued and whether an Expires date exists for each credential with Ferian. Keep `datesConfirmed: false` and show pending text while either fact is unknown. Enter confirmed dates as `Mon YYYY`; represent no expiry only after confirmation, without inventing a date or claiming active status. If a confirmed credential has no expiry, update the schema and card display to represent that state explicitly. Overview still uses `featured` / `short` for a brief credential summary; full credential details appear in the cards below. |
| OG metadata | `settings.ogImageConfirmed` | Keep false for stale/draft artwork; set true only after manual review against current YAML. A confirmed site URL is also required. |
| CV (PDF) | `profile.cvUrl` | `""` until the final confirmed PDF is in `public/cv/`, then `/cv/<final-file>.pdf`. |
| Headshot | `profile.headshot` | Keep `""` for design C. If adding a portrait later, use a confirmed real photo in `public/img/`; the generated archive is never a final photo. |

Certification `issued` and `expires` use `Mon YYYY`, for example `Aug 2026`.
Dates display only with `datesConfirmed: true`; never promote provisional source
dates to confirmed values. A nonempty `credlyUrl` is a confirmed badge URL and
enables one ordinary verification link independently of date confirmation. Do
not infer active credential status.

A nonempty final `profile.cvUrl` enables ordinary PDF links in Overview and
Contact, including without JavaScript, and replaces the pending CV text. Draft
status remains while `settings.noindex` is true, even when final data arrives.
Project `detailSummary` / `detailText` hold optional confirmed disclosure copy;
`role`, `problem`, and `outcome` always remain visible.
Experience/track periods are text; keep their confirmed wording. The current cloud track uses `2025-present` and the overall role uses `2022–present`.

## Experience responsibilities

Each item under `experience[].tracks[]` may include a `responsibilities` list.
Leave it absent or set it to `[]` until the personal responsibilities are confirmed;
no bullet list appears when it is empty. Add up to five nonempty items, each no more
than 240 characters. Keep the role and each track's period accurate: the on-prem
track starts in 2022, while the cloud track period is `2025-present`.

This commented example goes below a track's `period`, at the same indentation.
Replace `[responsibility]` with confirmed text before uncommenting:

```yaml
# responsibilities:
#   - "[responsibility]"
```

## Draft settings and checks

- Keep `settings.noindex: true` during draft review. It requests no indexing;
  it does not control access to hosted files. Public mode still needs final data,
  reviewed assets, and a separate publication decision.
- `settings.hidePlaceholders: true` hides empty optional links. It does not confirm
  missing content or make a draft ready for publication.
- Keep `settings.siteUrl` as `https://<username>.github.io` until Ferian confirms it.
  Canonical and social-image URLs stay omitted while it is a placeholder.
- Public mode requires a real confirmed email and site URL. A draft CV cannot be
  linked. Referenced local files must exist, historical CV/OG bytes are rejected
  throughout `public/`, and generated/draft assets are rejected in public mode.
- Confirmed email has a visible no-JavaScript fallback. Splitting its YAML fields
  reduces casual scraping but does not promise secrecy. Review binaries manually:
  fingerprints detect known historical bytes, not every possible stale asset.
