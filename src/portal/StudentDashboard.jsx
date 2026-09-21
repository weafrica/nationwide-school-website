import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import PortalLayout from './PortalLayout';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: markRows }, { data: ann }] = await Promise.all([
      supabase
        .from('marks')
        .select('score, term, year, comment, subjects(name)')
        .eq('student_id', user.id)
        .order('year', { ascending: false })
        .order('term', { ascending: false }),
      supabase
        .from('announcements')
        .select('*')
        .in('audience', ['all', 'students'])
        .order('created_at', { ascending: false })
        .limit(10),
    ]);
    setMarks(markRows || []);
    setAnnouncements(ann || []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    load();
    // Auto-refresh every 30s, same pattern as the eFootball lobby
    // banners — a new mark or announcement shows up without a manual
    // page reload.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <PortalLayout eyebrow="Portal" title="Your dashboard"><p className="text-ink/50">Loading\u2026</p></PortalLayout>;

  return (
    <PortalLayout eyebrow="Student portal" title="Your dashboard">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-serif text-xl text-purple-900">Your marks</h2>
          {marks.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No marks recorded yet.</p>
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
                  {marks.map((m, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-purple-900">{m.subjects?.name}</td>
                      <td className="px-4 py-3 text-ink/70">Term {m.term}, {m.year}</td>
                      <td className="px-4 py-3 text-ink/70">{m.score != null ? `${m.score}%` : '\u2014'}</td>
                      <td className="px-4 py-3 text-ink/60">{m.comment || '\u2014'}</td>
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
    </PortalLayout>
  );
}
