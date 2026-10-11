import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

const APPLICATION_STATUSES = ['new', 'contacted', 'accepted', 'waitlisted', 'declined', 'enrolled'];
const MESSAGE_STATUSES = ['new', 'read', 'replied'];

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const when = (iso) => new Date(iso).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
const telLink = (n) => `tel:${n.replace(/[^\d+]/g, '').replace(/^0/, '+27')}`;

// Lists everything people have sent through the Admissions and Contact
// forms on the public site, newest first.
export default function AdminInbox() {
  const [kind, setKind] = useState('applications');
  const [onlyNew, setOnlyNew] = useState(false);
  const [applications, setApplications] = useState(null);
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [apps, msgs] = await Promise.all([
      supabase.from('admission_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    if (apps.error || msgs.error) { setError('The inbox could not be loaded. Please refresh the page.'); return; }
    setError('');
    setApplications(apps.data);
    setMessages(msgs.data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const newApplications = (applications || []).filter((a) => a.status === 'new').length;
  const newMessages = (messages || []).filter((m) => m.status === 'new').length;
  const items = (kind === 'applications' ? applications : messages) || [];
  const shown = onlyNew ? items.filter((i) => i.status === 'new') : items;

  const tab = (id, label, count) => (
    <button
      onClick={() => setKind(id)}
      className={`rounded-sm px-4 py-2 text-sm font-semibold ${kind === id ? 'bg-purple-900 text-white' : 'text-ink/70 hover:bg-lavender-50'}`}
    >
      {label}{count > 0 && <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs text-purple-900">{count} new</span>}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {tab('applications', 'Applications', newApplications)}
        {tab('messages', 'Messages', newMessages)}
        <label className="ml-auto flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} />
          Show new only
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!error && applications === null && <p className="mt-6 text-sm text-ink/60">Loading…</p>}
      {!error && applications !== null && shown.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">
          {onlyNew ? 'Nothing new right now.' : `No ${kind} yet. They will appear here when someone uses the form on the website.`}
        </p>
      )}

      <div className="mt-5 space-y-4">
        {kind === 'applications'
          ? shown.map((a) => <ApplicationCard key={a.id} item={a} onChanged={load} />)
          : shown.map((m) => <MessageCard key={m.id} item={m} onChanged={load} />)}
      </div>
    </div>
  );
}

function StatusSelect({ value, options, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input w-auto py-1.5 text-sm">
      {options.map((s) => <option key={s} value={s}>{capitalise(s)}</option>)}
    </select>
  );
}

function ApplicationCard({ item, onChanged }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState(item.admin_notes || '');
  const [status, setStatus] = useState('idle');

  const save = async (changes) => {
    setStatus('saving');
    const { error } = await supabase
      .from('admission_applications')
      .update({ ...changes, handled_by: user.id, handled_at: new Date().toISOString() })
      .eq('id', item.id);
    setStatus(error ? 'error' : 'saved');
    if (!error) await onChanged();
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className={`rounded-sm border p-5 ${item.status === 'new' ? 'border-gold-500' : 'border-purple-100'} bg-surface`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-xl text-purple-900">{item.learner_name}</p>
          <p className="text-sm text-ink/60">
            {item.grade_applying} · born {item.learner_dob} · sent {when(item.created_at)}
          </p>
        </div>
        <StatusSelect value={item.status} options={APPLICATION_STATUSES} onChange={(s) => save({ status: s })} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold text-ink">Parent / guardian</dt><dd className="text-ink/75">{item.parent_name}</dd></div>
        <div>
          <dt className="font-semibold text-ink">Phone</dt>
          <dd><a href={telLink(item.parent_phone)} className="text-purple-600 hover:text-purple-900">{item.parent_phone}</a></dd>
        </div>
        {item.parent_email && (
          <div>
            <dt className="font-semibold text-ink">Email</dt>
            <dd><a href={`mailto:${item.parent_email}`} className="text-purple-600 hover:text-purple-900">{item.parent_email}</a></dd>
          </div>
        )}
        {item.previous_school && (
          <div><dt className="font-semibold text-ink">Previous school</dt><dd className="text-ink/75">{item.previous_school}</dd></div>
        )}
        {item.notes && (
          <div className="sm:col-span-2"><dt className="font-semibold text-ink">Their note</dt><dd className="whitespace-pre-line text-ink/75">{item.notes}</dd></div>
        )}
      </dl>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-ink">Office notes (only staff can see these)</span>
        <textarea className="input mt-1.5 min-h-[70px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => save({ admin_notes: notes.trim() || null })}
          disabled={notes === (item.admin_notes || '') || status === 'saving'}
          className="rounded-sm bg-gold-500 px-4 py-1.5 text-sm font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-50"
        >
          Save notes
        </button>
        {status === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
        {status === 'error' && <span className="text-sm text-red-600">That didn’t save. Please try again.</span>}
      </div>
    </div>
  );
}

function MessageCard({ item, onChanged }) {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle');

  const setMessageStatus = async (next) => {
    setStatus('saving');
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: next, handled_by: user.id, handled_at: new Date().toISOString() })
      .eq('id', item.id);
    setStatus(error ? 'error' : 'idle');
    if (!error) await onChanged();
  };

  return (
    <div className={`rounded-sm border p-5 ${item.status === 'new' ? 'border-gold-500' : 'border-purple-100'} bg-surface`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-xl text-purple-900">{item.name}</p>
          <p className="text-sm text-ink/60">{item.contact} · sent {when(item.created_at)}</p>
        </div>
        <StatusSelect value={item.status} options={MESSAGE_STATUSES} onChange={setMessageStatus} />
      </div>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{item.message}</p>
      {status === 'error' && <p className="mt-2 text-sm text-red-600">That didn’t save. Please try again.</p>}
    </div>
  );
}
