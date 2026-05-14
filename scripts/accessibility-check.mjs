import { readFileSync } from "node:fs";

const files = [
  "index.html",
  "accessibility.html",
  "case-study-cic-enterprise-systems.html",
  "case-study-surface-repairability.html",
  "resume.html",
];
const css = readFileSync("styles.css", "utf8");
const failures = [];

function fail(message) {
  failures.push(message);
}

function attrs(source) {
  const result = {};
  const attrPattern = /([a-zA-Z:-]+)(?:\s*=\s*"([^"]*)")?/g;
  let match;

  while ((match = attrPattern.exec(source))) {
    result[match[1]] = match[2] || "";
  }

  return result;
}

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicateIds.length) {
    fail(`${file}: duplicate ids: ${[...new Set(duplicateIds)].join(", ")}`);
  }

  if (!/<main[^>]+id="top"[^>]+tabindex="-1"/.test(html)) {
    fail(`${file}: main content target must be focusable`);
  }

  if (!/<a[^>]+class="skip-link"[^>]+href="#top"/.test(html)) {
    fail(`${file}: missing skip link to main content`);
  }

  if (!/<button[^>]+class="theme-toggle"[^>]+aria-pressed="false"/.test(html)) {
    fail(`${file}: theme toggle needs aria-pressed`);
  }

  if (!/<h1\b/.test(html)) {
    fail(`${file}: missing h1`);
  }

  for (const match of html.matchAll(/<a\s+([^>]*target="_blank"[^>]*)>/g)) {
    const linkAttrs = attrs(match[1]);
    if (!/new tab/.test(linkAttrs["aria-label"] || "")) {
      fail(`${file}: external link missing new-tab aria label`);
    }
    if (!/(^|\s)noopener(\s|$)/.test(linkAttrs.rel || "")) {
      fail(`${file}: external link missing noopener`);
    }
  }

  for (const match of html.matchAll(/<img\s+([^>]*)>/g)) {
    const imageAttrs = attrs(match[1]);
    if (!imageAttrs.alt) {
      fail(`${file}: image missing alt text`);
    }
    if (!imageAttrs.width || !imageAttrs.height) {
      fail(`${file}: image missing explicit width and height`);
    }
  }

  for (const match of html.matchAll(/<a\s+([^>]*href="[^"]+\.pdf"[^>]*)>/g)) {
    const linkAttrs = attrs(match[1]);
    if (!/PDF/.test(linkAttrs["aria-label"] || match[0])) {
      fail(`${file}: PDF link missing PDF context`);
    }
  }

  for (const match of html.matchAll(/<a\s+([^>]*href="#([^"]+)"[^>]*)>/g)) {
    if (!ids.includes(match[2])) {
      fail(`${file}: fragment link #${match[2]} does not resolve`);
    }
  }
}

if (!/accessibility\.html/.test(readFileSync("index.html", "utf8"))) {
  fail("index.html: accessibility statement is not linked");
}

if (!/:focus-visible/.test(css)) {
  fail("styles.css: missing focus-visible styles");
}

if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) {
  fail("styles.css: missing reduced-motion media query");
}

if (!/@media print/.test(css)) {
  fail("styles.css: missing print stylesheet");
}

if (!/a\[target="_blank"\]::after/.test(css)) {
  fail("styles.css: missing visible external-link affordance");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Accessibility checks passed.");
