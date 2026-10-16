import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import PortalLayout from './PortalLayout';

// What a parent or guardian sees: each of their linked children, that
// child's marks, and announcements meant for parents. Which children appear
// is decided by the admin (Admin → Teachers & parents), and the database
// itself only ever returns that parent's own children.
export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState(null); // null = still loading
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState('');
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const { data: links, error: linkError } = await supabase
      .from('parent_links')
      .select('student_id')
      .eq('parent_id', user.id);
    if (linkError) { setFailed(true); return; }

    const ids = (links || []).map((l) => l.student_id);
    let kids = [];
    let markRows = [];
    if (ids.length > 0) {
      const [students, profiles, marksResult] = await Promise.all([
        supabase.from('students').select('user_id, student_number, grade').in('user_id', ids),
        supabase.from('profiles').select('id, full_name').in('id', ids),
        supabase
          .from('marks')
          .select('student_id, score, term, year, comment, subjects(name)')
          .in('student_id', ids)
          .order('year', { ascending: false })
          .order('term', { ascending: false }),
      ]);
      const names = Object.fromEntries((profiles.data || []).map((p) => [p.id, p.full_name]));
      kids = (students.data || []).map((s) => ({
        id: s.user_id,
        name: names[s.user_id] || 'Learner',
        grade: s.grade,
        number: s.student_number,
      }));
      markRows = marksResult.data || [];
    }

    const { data: ann } = await supabase
      .from('announcements')
      .select('*')
      .in('audience', ['all', 'parents'])
      .order('created_at', { ascending: false })
      .limit(10);

    setFailed(false);
    setChildren(kids);
    setMarks(markRows);
    setAnnouncements(ann || []);
    setSelected((current) => (kids.some((k) => k.id === current) ? current : kids[0]?.id || ''));
  }, [user.id]);

  useEffect(() => {
    load();
    // Refresh every 30 seconds so new marks and announcements show up by themselves.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (failed) {
    return (
      <PortalLayout eyebrow="Parent portal" title="Your family">
        <p className="text-sm text-red-700">We couldn&rsquo;t load your information. Please refresh the page.</p>
      </PortalLayout>
    );
  }

  if (children === null) {
    return <PortalLayout eyebrow="Parent portal" title="Your family"><p className="text-ink/50">Loading…</p></PortalLayout>;
  }

  const child = children.find((k) => k.id === selected);
  const childMarks = marks.filter((m) => m.student_id === selected);

  return (
    <PortalLayout eyebrow="Parent portal" title="Your family">
      {children.length === 0 ? (
        <div className="max-w-xl rounded-sm border border-purple-100 p-6">
          <p className="font-serif text-lg text-purple-900">No learners linked to your account yet</p>
          <p className="mt-2 text-sm text-ink/70">
            The school office links each parent or guardian to their child. If you have just been
            approved, please ask reception to link your account.
          </p>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            {children.length > 1 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {children.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setSelected(k.id)}
                    className={`rounded-sm px-4 py-2 text-sm font-semibold ${selected === k.id ? 'bg-purple-900 text-white' : 'border border-purple-100 text-ink/70 hover:bg-lavender-50'}`}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            )}

            <h2 className="font-serif text-xl text-purple-900">{child?.name}</h2>
            <p className="text-sm text-ink/60">{child?.grade} · Student number {child?.number}</p>

            {childMarks.length === 0 ? (
              <p className="mt-4 text-sm text-ink/60">No marks recorded yet.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-sm border border-purple-100">
                <table className="w-full text-sm">
                  <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Term</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {childMarks.map((m, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-purple-900">{m.subjects?.name}</td>
                        <td className="px-4 py-3 text-ink/70">Term {m.term}, {m.year}</td>
                        <td className="px-4 py-3 text-ink/70">{m.score != null ? `${m.score}%` : '—'}</td>
                        <td className="px-4 py-3 text-ink/60">{m.comment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-serif text-xl text-purple-900">Announcements</h2>
            <div className="mt-4 space-y-4">
              {announcements.length === 0 && <p className="text-sm text-ink/60">Nothing posted yet.</p>}
              {announcements.map((a) => (
                <div key={a.id} className="rounded-sm border border-purple-100 p-4">
                  <p className="font-semibold text-purple-900">{a.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
