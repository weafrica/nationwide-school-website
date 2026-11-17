import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { downloadCsv, sheetDate, toCsv } from '../lib/csv';

const APPLICATION_COLUMNS = [
  { label: 'Received', value: (r) => sheetDate(r.created_at) },
  { label: 'Learner name', value: (r) => r.learner_name },
  { label: 'Date of birth', value: (r) => r.learner_dob },
  { label: 'Grade applying for', value: (r) => r.grade_applying },
  { label: 'Parent / guardian', value: (r) => r.parent_name },
  { label: 'Phone', value: (r) => r.parent_phone },
  { label: 'Email', value: (r) => r.parent_email },
  { label: 'Previous school', value: (r) => r.previous_school },
  { label: 'Their note', value: (r) => r.notes },
  { label: 'Status', value: (r) => r.status },
  { label: 'Office notes', value: (r) => r.admin_notes },
  { label: 'Last handled', value: (r) => sheetDate(r.handled_at) },
];

const MESSAGE_COLUMNS = [
  { label: 'Received', value: (r) => sheetDate(r.created_at) },
  { label: 'Name', value: (r) => r.name },
  { label: 'Phone or email', value: (r) => r.contact },
  { label: 'Message', value: (r) => r.message },
  { label: 'Status', value: (r) => r.status },
  { label: 'Last handled', value: (r) => sheetDate(r.handled_at) },
];

const today = () => sheetDate(new Date().toISOString()).slice(0, 10);

// Two buttons that download everything in the inbox as a spreadsheet, for the
// admissions office to sort, print or share.
export default function InboxExport() {
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function download(table, columns, filename, noun) {
    setState({ status: 'working', message: '' });
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) {
      setState({ status: 'error', message: `The ${noun} could not be downloaded. Please try again.` });
      return;
    }
    if (data.length === 0) {
      setState({ status: 'error', message: `There are no ${noun} to download yet.` });
      return;
    }
    downloadCsv(`${filename}-${today()}.csv`, toCsv(columns, data));
    setState({ status: 'done', message: `Downloaded ${data.length} ${data.length === 1 ? noun.replace(/s$/, '') : noun}.` });
  }

  const button = 'rounded-sm border border-purple-100 px-4 py-2 text-sm font-semibold text-purple-900 hover:bg-lavender-50 disabled:opacity-50';

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-sm border border-purple-100 bg-surface p-4">
      <p className="mr-2 text-sm font-semibold text-ink">Download as a spreadsheet</p>
      <button
        type="button"
        className={button}
        disabled={state.status === 'working'}
        onClick={() => download('admission_applications', APPLICATION_COLUMNS, 'applications', 'applications')}
      >
        All applications
      </button>
      <button
        type="button"
        className={button}
        disabled={state.status === 'working'}
        onClick={() => download('contact_messages', MESSAGE_COLUMNS, 'messages', 'messages')}
      >
        All messages
      </button>
      <span aria-live="polite" className="text-sm">
        {state.status === 'working' && <span className="text-ink/60">Preparing…</span>}
        {state.status === 'done' && <span className="text-green-600">✓ {state.message}</span>}
        {state.status === 'error' && <span className="text-red-600">{state.message}</span>}
      </span>
    </div>
  );
}
