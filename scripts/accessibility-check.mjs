import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const files = [
  "index.html",
  "accessibility.html",
  "case-study-cic-enterprise-systems.html",
  "case-study-surface-repairability.html",
  "resume.html",
  "404.html",
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

  if (!/<meta[^>]+http-equiv="Content-Security-Policy"/.test(html)) {
    fail(`${file}: missing Content Security Policy metadata`);
  }

  if (/Content-Security-Policy[^>]+unsafe-inline/.test(html)) {
    fail(`${file}: Content Security Policy should not allow unsafe inline code`);
  }

  if (!/<meta[^>]+name="referrer"[^>]+content="strict-origin-when-cross-origin"/.test(html)) {
    fail(`${file}: missing referrer policy metadata`);
  }

  if (!/<script[^>]+src="\/?site\.js"/.test(html)) {
    fail(`${file}: missing shared site script`);
  }

  if (/fonts\.(?:googleapis|gstatic)\.com|static\.cloudflareinsights\.com/.test(html)) {
    fail(`${file}: third-party font or analytics runtime remains`);
  }

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
    if (!Object.hasOwn(linkAttrs, "download")) {
      fail(`${file}: promised PDF download missing download attribute`);
    }
  }

  for (const match of html.matchAll(/<a\s+([^>]*href="[^"]+\.vcf"[^>]*)>/g)) {
    const linkAttrs = attrs(match[1]);
    if (!Object.hasOwn(linkAttrs, "download")) {
      fail(`${file}: contact-card download missing download attribute`);
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

for (const font of [
  "assets/fonts/ibm-plex-sans-latin.woff2",
  "assets/fonts/ibm-plex-sans-italic-latin.woff2",
  "assets/fonts/LICENSE.txt",
]) {
  if (!existsSync(font)) {
    fail(`${font}: self-hosted font asset is missing`);
  }
}

if (!/@font-face[\s\S]+assets\/fonts\/ibm-plex-sans-latin\.woff2/.test(css)) {
  fail("styles.css: self-hosted IBM Plex Sans is not configured");
}

if (/article:hover|\.profile-card:hover|\.contact-panel:hover/.test(css)) {
  fail("styles.css: noninteractive cards should not use hover lift");
}

if (!/@media print[\s\S]+main\s*\{[^}]*margin:\s*0;[^}]*width:\s*100%/m.test(css)) {
  fail("styles.css: print layout must reset the desktop main offset");
}

const home = readFileSync("index.html", "utf8");
const snapshotPosition = home.indexOf('id="snapshot"');
const proofPosition = home.indexOf('id="proof"');
const capabilitiesPosition = home.indexOf('id="capabilities"');

if (!(snapshotPosition < proofPosition && proofPosition < capabilitiesPosition)) {
  fail("index.html: measured proof must follow the snapshot before capabilities");
}

if (/impact-title|featured-title/.test(home)) {
  fail("index.html: redundant impact or highlights section remains");
}

const structuredData = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if (!structuredData) {
  fail("index.html: structured data is missing");
} else {
  const structuredDataHash = `sha256-${createHash("sha256").update(structuredData[1]).digest("base64")}`;
  if (!home.includes(`'${structuredDataHash}'`)) {
    fail("index.html: CSP does not authorize the current structured-data hash");
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Accessibility checks passed.");
