// Adds the "Learners" tab to the admin dashboard.
//
//   node scripts/apply-learners-tab.mjs
//
// Makes three small edits to src/portal/AdminDashboard.jsx. Safe to run more
// than once. If the file is not what it expects, it is left completely
// untouched and the script says so.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relativePath = 'src/portal/AdminDashboard.jsx';
const file = path.join(root, relativePath);

if (!existsSync(file)) {
  console.log(`PROBLEM  ${relativePath} - file not found (run this from the project folder)`);
  process.exit(1);
}

let text = readFileSync(file, 'utf8');
const nl = text.includes('\r\n') ? '\r\n' : '\n';
const applied = [];
const failed = [];

// 1 - the import, placed with the other imports
if (!text.includes('AdminLearners')) {
  const imports = [...text.matchAll(/^import .*\r?\n/gm)];
  if (imports.length === 0) {
    failed.push('add the import');
  } else {
    const last = imports[imports.length - 1];
    const end = last.index + last[0].length;
    text = `${text.slice(0, end)}import AdminLearners from './AdminLearners';${nl}${text.slice(end)}`;
    applied.push('imported the Learners screen');
  }
}

// 2 - the tab itself, right after "Create student login"
if (!/^\s*'Learners',/m.test(text)) {
  const tab = /^([ \t]*)'Create student login',\r?\n/m;
  if (tab.test(text)) {
    text = text.replace(tab, (m, indent) => `${m}${indent}'Learners',${nl}`);
    applied.push('added the tab');
  } else {
    failed.push('add the tab (could not find the list of tabs)');
  }
}

// 3 - what the tab shows
if (!text.includes('<AdminLearners />')) {
  const show = /^([ \t]*)\{tab === 'Create student login' && <CreateStudentPanel \/>\}\r?\n/m;
  if (show.test(text)) {
    text = text.replace(show, (m, indent) => `${m}${indent}{tab === 'Learners' && <AdminLearners />}${nl}`);
    applied.push('connected the tab to the screen');
  } else {
    failed.push('connect the tab to the screen (could not find where the tabs are shown)');
  }
}

if (failed.length > 0) {
  console.log(`PROBLEM  ${relativePath} - left unchanged. Could not: ${failed.join('; ')}`);
  process.exit(1);
}
if (applied.length > 0) {
  writeFileSync(file, text, 'utf8');
  console.log(`UPDATED  ${relativePath} - ${applied.join('; ')}`);
} else {
  console.log(`ok       ${relativePath} - the Learners tab is already there`);
}
console.log('\nAll done.');
