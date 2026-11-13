// One-time helper that makes the three small edits the app needs in files that
// already exist in the project. Safe to run more than once: anything already
// done is left alone. Run it from the project folder:
//
//   node scripts/apply-pwa-patches.mjs
//
//   1. src/main.jsx            fades the launch splash and registers the
//                              service worker (public/sw.js)
//   2. src/components/Footer.jsx   adds the "Install the app" link
//   3. src/lib/contentFields.js    makes that link's wording editable in the
//                              website's content editor (optional)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let problems = 0;

function edit(relativePath, label, change, { optional = false } = {}) {
  const file = path.join(root, relativePath);
  if (!existsSync(file)) {
    if (optional) {
      console.log(`ok       ${relativePath} - not present, so the link uses its built-in wording`);
    } else {
      console.log(`PROBLEM  ${relativePath} - file not found (run this from the project folder)`);
      problems++;
    }
    return;
  }
  const before = readFileSync(file, 'utf8');
  const result = change(before);
  if (result.status === 'done') {
    writeFileSync(file, result.text, 'utf8');
    console.log(`UPDATED  ${relativePath} - ${label}`);
  } else if (result.status === 'already') {
    console.log(`ok       ${relativePath} - ${label} (already there)`);
  } else {
    console.log(`PROBLEM  ${relativePath} - ${result.message}`);
    problems++;
  }
}

const newlineOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');

// 1 ─ main.jsx ───────────────────────────────────────────────────────────────
const MAIN_BLOCK = `
// Fades out the launch splash (the installed app only - see index.html) once
// the page has really painted, not merely when React.render() returns. A short
// minimum keeps it from flickering on a fast, already-cached launch.
const MIN_SPLASH_MS = 500;
const splashShownAt = performance.now();
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    const wait = Math.max(0, MIN_SPLASH_MS - (performance.now() - splashShownAt));
    setTimeout(() => {
      splash.classList.add('splash-hidden');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      setTimeout(() => splash.remove(), 1000); // in case the transition never reports back
    }, wait);
  });
});

// Registers the service worker (public/sw.js) that makes the site installable.
// Only in the real, built site - not while developing - and only after the page
// has loaded, so it never competes with the page's own first requests.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
`;
edit('src/main.jsx', 'splash fade and service worker', (text) => {
  if (text.includes("register('/sw.js')")) return { status: 'already' };
  const nl = newlineOf(text);
  const block = MAIN_BLOCK.replace(/\n/g, nl);
  return { status: 'done', text: text.replace(/\s*$/, nl) + block };
});

// 2 ─ Footer.jsx ─────────────────────────────────────────────────────────────
edit('src/components/Footer.jsx', 'the "Install the app" link', (text) => {
  if (text.includes('InstallApp')) return { status: 'already' };
  const nl = newlineOf(text);

  // the import goes right after the Seal import (or after the last import)
  const sealImport = /^import Seal from ['"]\.\/Seal['"];?\r?\n/m;
  const imports = [...text.matchAll(/^import .*\r?\n/gm)];
  let withImport;
  if (sealImport.test(text)) {
    withImport = text.replace(sealImport, (m) => `${m}import InstallApp from './InstallApp';${nl}`);
  } else if (imports.length) {
    const last = imports[imports.length - 1];
    const end = last.index + last[0].length;
    withImport = `${text.slice(0, end)}import InstallApp from './InstallApp';${nl}${text.slice(end)}`;
  } else {
    return { status: 'problem', message: 'could not find the import lines at the top of the file' };
  }

  // the link goes straight after the "portal" item in the Quick links list
  const portalItem = /^([ \t]*)<li><Link to="\/portal"[^\r\n]*<\/li>(\r?\n)/m;
  if (!portalItem.test(withImport)) {
    return {
      status: 'problem',
      message: 'could not find the portal link in the footer. Add <li><InstallApp /></li> to the Quick links list by hand, and import InstallApp from "./InstallApp".',
    };
  }
  return { status: 'done', text: withImport.replace(portalItem, (m, indent, eol) => `${m}${indent}<li><InstallApp /></li>${eol}`) };
});

// 3 ─ contentFields.js (optional: only makes the wording editable) ───────────
edit('src/lib/contentFields.js', 'editable wording for the install link', (text) => {
  if (text.includes('footer.link.install')) return { status: 'already' };
  const portalField = /^.*'footer\.link\.portal'.*\r?\n/m;
  if (!portalField.test(text)) {
    console.log('         (this project\'s content list has no footer links yet, so the link simply uses its built-in wording)');
    return { status: 'already' };
  }
  const nl = newlineOf(text);
  const add =
    `  text('footer.link.install', 'Site-wide', 'Footer', 'Footer link 4 — install the app (only shown where installing is possible)', 'Install the app'),${nl}` +
    `  text('footer.install.help', 'Site-wide', 'Footer', 'Install instructions shown to iPhone and iPad visitors', 'To install: tap the Share button, then “Add to Home Screen”.'),${nl}`;
  return { status: 'done', text: text.replace(portalField, (m) => m + add) };
}, { optional: true });

console.log(problems ? `\n${problems} thing(s) need attention - see PROBLEM / SKIPPED above.` : '\nAll done.');
process.exit(problems ? 1 : 0);
