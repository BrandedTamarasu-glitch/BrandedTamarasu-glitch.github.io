# Cory Ebert — Portfolio

Static portfolio for [coryebert.com](https://coryebert.com), hosted by GitHub Pages from `BrandedTamarasu-glitch/BrandedTamarasu-glitch.github.io`.

## Preview locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Use an HTTP server so root-relative navigation and the custom 404 page resolve correctly.

## Design and content

The site uses a terracotta and deep teal editorial identity, a light theme with a dark option, original HTML/CSS/SVG project diagrams, and a shared stylesheet and script across all six pages. No build step, third-party runtime requests, or production dependencies are required. IBM Plex Sans is self-hosted.

- `index.html`: introduction, selected work, approach, career progression, and contact.
- `case-study-*.html`: detailed CIC and Microsoft program evidence.
- `resume.html`: current comprehensive resume and print layout; source for the downloadable PDF.
- `styles.css`: theme tokens, shared components, responsive layouts, reduced motion, and print rules.
- `site.js`: optional theme persistence, interactive approach diagram, and active navigation.
- `assets/`: portrait, tagged PDF, contact card, social preview, and licensed fonts.

Director of IT Operations is current from July 2026. CIC's IT Program Manager role runs November 2024–July 2026. The current scope is six employees across SAP, LEIF, Infrastructure, and Security; shared IT budget and strategy with the Director of Application Development; department co-leadership reporting directly to the CEO. These details come from the supplied Profile.pdf and Cory's clarification. The profile's outdated summary was not copied into current-role copy.

## Maintenance checks

```bash
npm run check
```

Requires Node.js plus Poppler's `pdfinfo` and `pdftotext`. Static checks cover local links, fragment targets, basic accessibility and security invariants, current leadership details, and the PDF's tags and extracted text. They do not replace browser and assistive-technology testing.

When editing homepage JSON-LD, update its SHA-256 authorization in the Content Security Policy. Keep PDF generation and the contact card in sync with resume changes. The existing PDF URL remains stable.

Before publishing:

- Review all pages in both themes and narrow/mobile layouts.
- Test keyboard navigation, the skip link, diagram controls, theme persistence, and reduced motion.
- Verify navigation and reading remain usable with JavaScript disabled.
- Generate a tagged PDF from the resume's print layout and run the checks.
- Check desktop/mobile screenshots and downloadable assets.
- After deployment, smoke-test the domain, case studies, accessibility page, and resume download.

Local preview screenshots and browser verification output live in `.preview/` and are excluded from Git.
