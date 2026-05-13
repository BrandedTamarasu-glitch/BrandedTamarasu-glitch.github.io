# Cory Ebert Evidence Hub

Static portfolio site for GitHub Pages.

Target repository:

```text
BrandedTamarasu-glitch/BrandedTamarasu-glitch.github.io
```

Published URL:

```text
https://coryebert.com
```

## Maintenance Checks

Run the static accessibility and PDF checks before publishing material changes:

```bash
npm run check
```

Manual review checklist:

- Keyboard tab through the home page and accessibility page.
- Confirm the skip link appears on focus and moves focus to main content.
- Capture desktop and mobile screenshots for layout regressions.
- Open the resume links and confirm the PDFs load.
- Confirm `pdftotext` output remains readable for ATS compatibility after resume updates.
- Smoke test production after GitHub Pages deploys: `https://coryebert.com`, `https://coryebert.com/accessibility.html`, and the resume PDF links.
