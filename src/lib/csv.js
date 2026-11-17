// Turns rows of data into a spreadsheet file (CSV) that opens correctly in Excel
// and Google Sheets, accents and all.

// Anything typed into the public forms ends up in these files. A cell that
// starts with = + - @ (or a tab / carriage return) can be run as a FORMULA when
// the file is opened in Excel, which is a known way to attack whoever opens it.
// Putting an apostrophe in front makes the spreadsheet treat it as plain text.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// columns: [{ label: 'Name', value: (row) => row.name }, ...]
export function toCsv(columns, rows) {
  const header = columns.map((column) => csvCell(column.label)).join(',');
  const lines = rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(','));
  return [header, ...lines].join('\r\n');
}

// "2026-11-14T09:30:00Z" -> "2026-11-14 11:30" (South African time), easy to sort in a spreadsheet.
export function sheetDate(iso) {
  if (!iso) return '';
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
  return parts; // "2026-11-14 11:30"
}

// Starts a download in the browser. The leading BOM is what makes Excel read the
// file as UTF-8 instead of mangling names with accents.
export function downloadCsv(filename, csvText) {
  const blob = new Blob(['\uFEFF', csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
