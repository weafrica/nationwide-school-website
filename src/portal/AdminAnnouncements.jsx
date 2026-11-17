import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'Students only' },
  { value: 'teachers', label: 'Teachers only' },
  { value: 'parents', label: 'Parents only' },
];
const audienceLabel = (value) => AUDIENCES.find((a) => a.value === value)?.label || value;
const when = (iso) => new Date(iso).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });

// Post a notice for students, teachers, parents or everyone, and see, fix or
// remove the ones already posted.
export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [authors, setAuthors] = useState({});
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { setLoadError('The announcements could not be loaded. Please refresh the page.'); return; }
    setLoadError('');
    setItems(data);
    const ids = [...new Set(data.map((a) => a.author_id).filter(Boolean))];
    if (ids.length > 0) {
      const { data: people } = await supabase.from('profiles').select('id, full_name').in('id', ids);
      setAuthors(Object.fromEntries((people || []).map((p) => [p.id, p.full_name])));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <PostForm userId={user.id} onPosted={load} />
      <div>
        <h2 className="font-serif text-xl text-purple-900">Already posted</h2>
        {loadError && <p className="mt-3 text-sm text-red-700">{loadError}</p>}
        {!loadError && items === null && <p className="mt-3 text-sm text-ink/60">Loading…</p>}
        {items && items.length === 0 && <p className="mt-3 text-sm text-ink/60">Nothing has been posted yet.</p>}
        <div className="mt-4 space-y-4">
          {(items || []).map((item) => (
            <AnnouncementCard key={item.id} item={item} author={authors[item.author_id]} onChanged={load} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostForm({ userId, onPosted }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'saving', message: '' });
    const { error } = await supabase
      .from('announcements')
      .insert({ title: title.trim(), body: body.trim(), audience, author_id: userId });
    if (error) {
      setState({ status: 'error', message: 'That could not be posted. Please try again.' });
      return;
    }
    setTitle('');
    setBody('');
    setState({ status: 'saved', message: '' });
    setTimeout(() => setState({ status: 'idle', message: '' }), 2500);
    await onPosted();
  }

  return (
    <form onSubmit={submit} className="space-y-4 self-start rounded-sm border border-purple-100 bg-surface p-6">
      <h2 className="font-serif text-xl text-purple-900">Post an announcement</h2>
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Title</span>
        <input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Message</span>
        <textarea required maxLength={5000} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="input mt-1.5 resize-none" />
      </label>
      <label className="block max-w-xs">
        <span className="text-sm font-medium text-ink/80">Who should see it</span>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="input mt-1.5">
          {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state.status === 'saving'}
          className="rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60"
        >
          {state.status === 'saving' ? 'Posting…' : 'Post announcement'}
        </button>
        <span aria-live="polite" className="text-sm">
          {state.status === 'saved' && <span className="text-green-600">✓ Posted</span>}
          {state.status === 'error' && <span className="text-red-700">{state.message}</span>}
        </span>
      </div>
    </form>
  );
}

function AnnouncementCard({ item, author, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: item.title, body: item.body, audience: item.audience });
  const [state, setState] = useState({ status: 'idle', message: '' });

  const startEditing = () => {
    setDraft({ title: item.title, body: item.body, audience: item.audience });
    setState({ status: 'idle', message: '' });
    setEditing(true);
  };

  async function save() {
    if (!draft.title.trim() || !draft.body.trim()) {
      setState({ status: 'error', message: 'Please keep both a title and a message.' });
      return;
    }
    setState({ status: 'saving', message: '' });
    const { error } = await supabase
      .from('announcements')
      .update({ title: draft.title.trim(), body: draft.body.trim(), audience: draft.audience })
      .eq('id', item.id);
    if (error) {
      setState({ status: 'error', message: 'That did not save. Please try again.' });
      return;
    }
    setEditing(false);
    await onChanged();
  }

  async function remove() {
    if (!window.confirm(`Delete “${item.title}”? People will no longer see it. This cannot be undone.`)) return;
    const { error } = await supabase.from('announcements').delete().eq('id', item.id);
    if (error) {
      setState({ status: 'error', message: 'That could not be deleted. Please try again.' });
      return;
    }
    await onChanged();
  }

  if (editing) {
    return (
      <div className="rounded-sm border border-gold-500 bg-surface p-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Title</span>
          <input maxLength={200} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="input mt-1.5" />
        </label>
        <label className="mt-3 block">
          <span className="text-sm font-semibold text-ink">Message</span>
          <textarea maxLength={5000} rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="input mt-1.5 resize-none" />
        </label>
        <label className="mt-3 block max-w-xs">
          <span className="text-sm font-semibold text-ink">Who should see it</span>
          <select value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} className="input mt-1.5">
            {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={state.status === 'saving'} className="rounded-sm bg-gold-500 px-4 py-1.5 text-sm font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60">
            {state.status === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-sm text-ink/60 underline hover:text-ink">Cancel</button>
          {state.status === 'error' && <span className="text-sm text-red-700">{state.message}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-purple-100 bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold text-purple-900">{item.title}</p>
        <span className="rounded-full bg-lavender-50 px-2.5 py-1 text-xs font-semibold text-purple-900">{audienceLabel(item.audience)}</span>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-ink/75">{item.body}</p>
      <p className="mt-2 text-xs text-ink/50">
        {when(item.created_at)}{author ? ` · posted by ${author}` : ''}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="button" onClick={startEditing} className="text-sm font-semibold text-purple-600 hover:text-purple-900">Edit</button>
        <button type="button" onClick={remove} className="text-sm text-red-700 underline hover:text-red-900">Delete</button>
        {state.status === 'error' && <span className="text-sm text-red-700">{state.message}</span>}
      </div>
    </div>
  );
}
