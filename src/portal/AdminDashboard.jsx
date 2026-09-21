import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import PortalLayout from './PortalLayout';

const TABS = ['Create student login', 'Pending approvals', 'Announcements'];

export default function AdminDashboard() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <PortalLayout eyebrow="Admin portal" title="School administration">
      <div className="flex gap-2 border-b border-purple-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold ${tab === t ? 'border-b-2 border-gold-500 text-purple-900' : 'text-ink/50 hover:text-purple-900'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === 'Create student login' && <CreateStudentPanel />}
        {tab === 'Pending approvals' && <PendingApprovalsPanel />}
        {tab === 'Announcements' && <AnnouncementsPanel />}
      </div>
    </PortalLayout>
  );
}

function CreateStudentPanel() {
  const [form, setForm] = useState({ fullName: '', grade: '', dateOfBirth: '', parentName: '', parentPhone: '', parentEmail: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const { data, error: invokeError } = await supabase.functions.invoke('create-student', {
      body: form,
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });
    setBusy(false);
    if (invokeError) { setError(invokeError.message); return; }
    if (data?.error) { setError(data.error); return; }
    setResult(data);
    setForm({ fullName: '', grade: '', dateOfBirth: '', parentName: '', parentPhone: '', parentEmail: '' });
  };

  return (
    <div className="max-w-xl">
      <p className="text-sm text-ink/70">
        Generates a login (not a real email address — just an ID) and a random password for a
        new student. Write both down and hand them to the student or parent; this is the only
        time the password is shown.
      </p>

      {result && (
        <div className="mt-5 rounded-sm border border-gold-500/40 bg-lavender-50 p-5">
          <p className="font-semibold text-purple-900">Login created \u2014 write this down now:</p>
          <p className="mt-2 font-mono text-sm">Username: {result.loginUsername}</p>
          <p className="font-mono text-sm">Password: {result.password}</p>
          <p className="mt-2 text-xs text-ink/60">Student number: {result.studentNumber}. They'll be asked to set their own password on first login.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 rounded-sm border border-purple-100 bg-white p-6">
        <label className="block">
          <span className="text-sm font-medium text-ink/80">Learner's full name *</span>
          <input required value={form.fullName} onChange={update('fullName')} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/80">Grade *</span>
          <input required value={form.grade} onChange={update('grade')} placeholder="e.g. Grade 4" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/80">Date of birth</span>
          <input type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} className="input mt-1.5" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Parent/guardian name</span>
            <input value={form.parentName} onChange={update('parentName')} className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Parent/guardian phone</span>
            <input value={form.parentPhone} onChange={update('parentPhone')} className="input mt-1.5" />
          </label>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60">
          {busy ? 'Creating\u2026' : 'Create login'}
        </button>
      </form>
    </div>
  );
}

function PendingApprovalsPanel() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'pending').order('created_at', { ascending: false });
    setPending(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const approve = async (id, role) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    load();
  };

  if (loading) return <p className="text-sm text-ink/50">Loading\u2026</p>;
  if (pending.length === 0) return <p className="text-sm text-ink/60">No accounts waiting for approval.</p>;

  return (
    <div className="space-y-3">
      {pending.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-purple-100 p-4">
          <div>
            <p className="font-semibold text-purple-900">{p.full_name}</p>
            <p className="text-sm text-ink/60">{p.email}</p>
          </div>
          <div className="flex gap-2">
            {['teacher', 'parent', 'principal', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => approve(p.id, r)}
                className="rounded-sm border border-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-900 hover:bg-lavender-50"
              >
                Approve as {r}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsPanel() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [posted, setPosted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await supabase.from('announcements').insert({ title, body, audience, author_id: user.id });
    setBusy(false);
    setPosted(true);
    setTitle(''); setBody('');
    setTimeout(() => setPosted(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-sm border border-purple-100 bg-white p-6">
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Title</span>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Message</span>
        <textarea required rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="input mt-1.5 resize-none" />
      </label>
      <label className="block max-w-xs">
        <span className="text-sm font-medium text-ink/80">Audience</span>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className="input mt-1.5">
          <option value="all">Everyone</option>
          <option value="students">Students only</option>
          <option value="teachers">Teachers only</option>
          <option value="parents">Parents only</option>
        </select>
      </label>
      <button type="submit" disabled={busy} className="rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60">
        {busy ? 'Posting\u2026' : posted ? 'Posted!' : 'Post announcement'}
      </button>
    </form>
  );
}
