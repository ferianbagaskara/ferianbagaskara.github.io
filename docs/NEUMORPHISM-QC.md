# Neumorphism QC — 8 October 2026

Snapshot: base commit `a91cc70` plus the local neumorphism stylesheet changes. Publication remains pending.

## Final adjustments

- Kept the hero surface transparent inside the raised Overview panel, avoiding a white rectangle that interrupted the relief.
- Added consistent padding and rounded corners to the Contact card and depth to its Email button.
- Prevented the mobile Sections label and icon from shrinking/wrapping mid-word.
- Preserved confirmed content, links, dates, active-section navigation, and draft settings.

## Checks completed

- Content validation, Astro production build, dist/privacy checks: passed.
- Astro type check: 32 files, zero errors/warnings/hints.
- Local environment: bundled Node 24.19.0; pnpm temporary install of the pinned direct dependencies. No package manifest or package-lock changes. CI retains npm ci.
- Actual built app previewed with Astro at `http://127.0.0.1:4321/`.
- Layout/overflow checked at 320, 390, 768, 1280, and 1440 CSS pixels, including an expanded project diagram: no horizontal overflow.
- Desktop sections and small-screen Overview inspected visually. Saved screenshots: `assets/neumorphism-desktop.jpg`, `assets/neumorphism-mobile.jpg`.
- Keyboard Enter opens the mobile menu and native project disclosure. Visible focus outline and focus transfer to the selected section confirmed.
- Navigation to Certifications updates the hash and aria-current state; email Copy reports success.
- Rendered visible controls have at least 44px height. Credly links and confirmed profile content remain present.
- Computed foreground/background contrast sampling found no failures, with a minimum text ratio of 4.93:1. This is a focused check, not a full accessibility certification.
- Browser warning/error logs: none during the tested flows.

## Inspection limits

Reduced-motion and forced-colors rules were confirmed in the loaded stylesheet. Native no-JavaScript navigation, disclosure, and email fallback were inspected in source/output. These modes were not separately emulated by the browser tool. Full screen-reader testing and cross-browser QA were not performed.

`neumorphism-preview.html` now shows screenshots of the tested build, replacing the earlier simplified mock. The interactive preview is the source of truth for behavior.
