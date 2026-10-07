# cheafver.github.io

Portfolio site for Ferian Bagaskara, Cloud Network Engineer | Hybrid & Multi-Cloud Networking.

Portfolio URL: https://ferianbagaskara.github.io

## Updating content

Site text comes from [`src/content/site.yaml`](src/content/site.yaml). It is the source of confirmed profile facts; CV PDFs and the OG image are updated manually from those facts.
See [`docs/EDITING.md`](docs/EDITING.md) for the synchronization steps and asset checklist. Commits to `main` run CI and publish the reviewed draft through GitHub Pages.

## Local development

Requires Node 20.3 or newer (CI uses Node 22).

```bash
npm ci
npm run dev        # local dev server, http://localhost:4321
npm run validate   # check site.yaml only
npm test           # validate + build + type check + output checks
```

Built with Astro 5 (pinned to 5.18.2). `.github/workflows/deploy.yml` validates pull requests and publishes `main` to GitHub Pages.

## Draft and output guardrails

`settings.noindex: true` keeps the hosted draft out of search results; it does not restrict access to hosted files. The historical persona archive under `docs/assets/historical/` is intentionally excluded from this public repository.
A placeholder site URL can be used locally with `ALLOW_PLACEHOLDER_SITEURL=1`, never in CI or public mode.
Public mode requires a confirmed site URL and `contact.emailConfirmed: true` with a real email.
Leave email confirmation false, CV URL empty, and optional links empty until their data is confirmed.

Build validation scans **all** `public/` assets, and the build runs output checks after Astro finishes.
Known historical OG/CV files are rejected by SHA-256 even after renaming, including unlinked files.
Historical OG/CV and the unused generated portrait are backed up in `docs/assets/historical/`, outside `public/` and `dist/`. Do not deploy that directory.
The active OG PNG visibly marks the Ferian draft and is stale after the design C copy reconciliation. `settings.ogImageConfirmed: false` keeps its social image URL omitted even if the site URL is filled; public mode rejects its fingerprint, including renamed copies. CV and portrait URLs remain empty; the site shows “CV pending final details.” without a PDF download. A generated headshot is draft-only, including renamed copies.
Fingerprints identify known bytes; changed/new binaries still need manual content review before release.

Dependency-free guard regressions: `node scripts/tests/privacy.mjs`.
