// One-time helper that makes the small edits the new portal features need in
// files that already exist. Safe to run more than once: anything already done is
// left alone, and if a file is not what it expects it is NOT touched.
//
//   node scripts/apply-polish-patches.mjs
//
//   Student dashboard  - fixes the "Loading\u2026" message that showed as code
//   Teacher dashboard  - fixes the same, and now says so when a mark cannot be
//                        saved (before, a mark over 100 just silently did nothing)
//   Admin dashboard    - uses the new announcements manager and adds the
//                        spreadsheet download buttons to the inbox
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let problems = 0;

const newlineOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
const withNewlines = (text, nl) => text.replace(/\r?\n/g, nl);

// Runs a list of steps on one file. Each step is { name, done(text), apply(text) }:
//   done(text)  -> true when that edit is already in place
//   apply(text) -> the new text, or null when the spot to edit could not be found
function patchFile(relativePath, steps) {
  const file = path.join(root, relativePath);
  if (!existsSync(file)) {
    console.log(`PROBLEM  ${relativePath} - file not found (run this from the project folder)`);
    problems++;
    return;
  }
  let text = readFileSync(file, 'utf8');
  const applied = [];
  const already = [];
  const failed = [];
  for (const step of steps) {
    if (step.done(text)) { already.push(step.name); continue; }
    const next = step.apply(text);
    if (next === null) failed.push(step.name);
    else { text = next; applied.push(step.name); }
  }
  // A file is only written when EVERY edit it needs could be made, so it is never left half-changed.
  if (failed.length > 0) {
    console.log(`PROBLEM  ${relativePath} - left unchanged. Could not find the place to: ${failed.join('; ')}`);
    problems++;
    return;
  }
  if (applied.length > 0) {
    writeFileSync(file, text, 'utf8');
    console.log(`UPDATED  ${relativePath} - ${applied.join('; ')}`);
  } else {
    console.log(`ok       ${relativePath} - already up to date`);
  }
}

// ── the broken "Loading..." text, which Vite shows as the raw characters \u2026 ─────────────
const BROKEN_LOADING = 'Loading\\u2026</p>';
const loadingStep = {
  name: 'fix the "Loading…" message',
  done: (t) => !t.includes(BROKEN_LOADING),
  apply: (t) => t.split(BROKEN_LOADING).join('Loading…</p>'),
};

// ── Student dashboard ──────────────────────────────────────────────────────────────────────
patchFile('src/portal/StudentDashboard.jsx', [
  loadingStep,
  {
    name: 'tidy a stray comment',
    done: (t) => !t.includes('eFootball'),
    apply: (t) => {
      const comment = /^([ \t]*)\/\/ Auto-refresh every 30s, same pattern as the eFootball lobby[\s\S]*?\/\/ page reload\.\r?\n/m;
      if (!comment.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(comment, (_m, indent) =>
        `${indent}// Auto-refresh every 30 seconds so a new mark or announcement shows up${nl}${indent}// without a manual page reload.${nl}`);
    },
  },
]);

// ── Teacher dashboard ──────────────────────────────────────────────────────────────────────
patchFile('src/portal/TeacherDashboard.jsx', [
  loadingStep,
  {
    name: 'add the error message state',
    done: (t) => t.includes('setSaveError'),
    apply: (t) => {
      const anchor = /^([ \t]*)const \[savedFor, setSavedFor\] = useState\(null\);\r?\n/m;
      if (!anchor.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(anchor, (m, indent) => `${m}${indent}const [saveError, setSaveError] = useState('');${nl}`);
    },
  },
  {
    name: 'check a mark before saving it',
    done: (t) => t.includes('A mark must be a number from 0 to 100'),
    apply: (t) => {
      const anchor = /(const saveMark = async \(studentId, term, year, score, comment\) => \{\r?\n)([ \t]*)setSavingFor\(studentId\);/;
      if (!anchor.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(anchor, (_m, head, indent) => {
        const block = withNewlines(
`setSaveError('');
const trimmedScore = String(score).trim();
if (score !== '' && (trimmedScore === '' || Number.isNaN(Number(trimmedScore)) || Number(trimmedScore) < 0 || Number(trimmedScore) > 100)) {
  setSaveError('A mark must be a number from 0 to 100 (or left empty).');
  return;
}
const yearNumber = Number(year);
if (!Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
  setSaveError('Please type the year as four digits, for example 2026.');
  return;
}
if (comment.length > 1000) {
  setSaveError('A comment can be at most 1000 characters.');
  return;
}
setSavingFor(studentId);`, nl).split(nl).map((line) => (line ? indent + line : line)).join(nl);
        return head + block;
      });
    },
  },
  {
    name: 'say so when a mark cannot be saved',
    done: (t) => t.includes('That mark could not be saved'),
    apply: (t) => {
      const anchor = /^([ \t]*)if \(!error\) \{ setSavedFor\(studentId\); setTimeout\(\(\) => setSavedFor\(null\), 2000\); \}/m;
      if (!anchor.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(anchor, (_m, indent) => withNewlines(
`${indent}if (error) {
${indent}  setSaveError('That mark could not be saved. Please check your connection and that this learner is in your class, then try again.');
${indent}} else {
${indent}  setSavedFor(studentId);
${indent}  setTimeout(() => setSavedFor(null), 2000);
${indent}}`, nl));
    },
  },
  {
    name: 'show the error above the table',
    done: (t) => t.includes('{saveError &&'),
    apply: (t) => {
      const anchor = /^([ \t]*)<div className="mt-6 overflow-hidden rounded-sm border border-purple-100">/m;
      if (!anchor.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(anchor, (m, indent) =>
        `${indent}{saveError && <p role="alert" className="mt-6 rounded-sm border border-red-300 px-4 py-3 text-sm text-red-700">{saveError}</p>}${nl}${m}`);
    },
  },
]);

// ── Admin dashboard ────────────────────────────────────────────────────────────────────────
patchFile('src/portal/AdminDashboard.jsx', [
  {
    name: 'import the new announcements manager and spreadsheet buttons',
    done: (t) => t.includes('AdminAnnouncements') && t.includes('InboxExport'),
    apply: (t) => {
      const anchor = /^import AdminLinks from ['"]\.\/AdminLinks['"];?\r?\n/m;
      if (!anchor.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(anchor, (m) => `${m}import AdminAnnouncements from './AdminAnnouncements';${nl}import InboxExport from './InboxExport';${nl}`);
    },
  },
  {
    name: 'use the announcements manager',
    done: (t) => t.includes('<AdminAnnouncements />'),
    apply: (t) => (t.includes("{tab === 'Announcements' && <AnnouncementsPanel />}")
      ? t.replace("{tab === 'Announcements' && <AnnouncementsPanel />}", "{tab === 'Announcements' && <AdminAnnouncements />}")
      : null),
  },
  {
    name: 'add the spreadsheet downloads above the inbox',
    done: (t) => t.includes('<InboxExport />'),
    apply: (t) => {
      const anchor = /^([ \t]*)\{tab === 'Applications & messages' && <AdminInbox \/>\}/m;
      if (!anchor.test(t)) return null;
      const nl = newlineOf(t);
      return t.replace(anchor, (_m, indent) => withNewlines(
`${indent}{tab === 'Applications & messages' && (
${indent}  <>
${indent}    <InboxExport />
${indent}    <AdminInbox />
${indent}  </>
${indent})}`, nl));
    },
  },
]);

console.log(problems ? `\n${problems} file(s) need attention - see PROBLEM above. Nothing was half-changed.` : '\nAll done.');
process.exit(problems ? 1 : 0);
