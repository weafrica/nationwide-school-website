import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// "Grade 10" -> 10, so grades sort 0, 1, 2 ... 10, 11, 12 and not alphabetically.
const gradeNumber = (grade) => Number(String(grade).replace(/\D/g, '')) || 0;
const MAX_ROWS = 100; // keeps the page quick for a big school; searching narrows it down

// Every learner in one place: who they are, their grade and student number, the
// login name they sign in with, whether they have chosen their own password yet,
// and whether a parent or guardian has been linked to them.
export default function AdminLearners() {
  const [learners, setLearners] = useState(null); // null = still loading
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('');

  const load = useCallback(async () => {
    const [students, profiles, links] = await Promise.all([
      supabase.from('students').select('user_id, student_number, grade'),
      supabase.from('profiles').select('id, full_name, email, must_change_password').eq('role', 'student'),
      supabase.from('parent_links').select('student_id'),
    ]);
    if (students.error || profiles.error || links.error) {
      setError('The learners could not be loaded. Please refresh the page.');
      return;
    }
    const profileById = Object.fromEntries((profiles.data || []).map((p) => [p.id, p]));
    const parentsOf = {};
    for (const link of links.data || []) parentsOf[link.student_id] = (parentsOf[link.student_id] || 0) + 1;

    const rows = (students.data || []).map((s) => {
      const profile = profileById[s.user_id];
      return {
        id: s.user_id,
        number: s.student_number,
        grade: s.grade,
        name: profile?.full_name || 'Unnamed learner',
        login: profile?.email || '',
        ownPassword: profile ? profile.must_change_password !== true : false,
        parents: parentsOf[s.user_id] || 0,
      };
    });
    rows.sort((a, b) => gradeNumber(a.grade) - gradeNumber(b.grade) || a.name.localeCompare(b.name));
    setError('');
    setLearners(rows);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grades = useMemo(
    () => [...new Set((learners || []).map((l) => l.grade))].sort((a, b) => gradeNumber(a) - gradeNumber(b)),
    [learners],
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (learners || []).filter((l) => {
      if (grade && l.grade !== grade) return false;
      if (!needle) return true;
      return [l.name, l.number, l.grade, l.login].some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [learners, query, grade]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (learners === null) return <p className="text-sm text-ink/50">Loading…</p>;

  if (learners.length === 0) {
    return (
      <div className="max-w-xl rounded-sm border border-purple-100 p-6">
        <p className="font-serif text-lg text-purple-900">No learners yet</p>
        <p className="mt-2 text-sm text-ink/70">
          Use the <strong>Create student login</strong> tab to add the first learner. They will appear here.
        </p>
      </div>
    );
  }

  const shown = matches.slice(0, MAX_ROWS);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink/80">Search learners</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, student number or login…"
            className="input mt-1.5 w-72 max-w-full"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/80">Grade</span>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input mt-1.5">
            <option value="">All grades</option>
            {grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={load}
          className="rounded-sm border border-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-900 hover:bg-lavender-50"
        >
          Refresh
        </button>
      </div>

      <p className="mt-4 text-sm text-ink/60" aria-live="polite">
        {matches.length === learners.length
          ? `${learners.length} ${learners.length === 1 ? 'learner' : 'learners'}`
          : `${matches.length} of ${learners.length} learners match`}
        {matches.length > MAX_ROWS && ` — showing the first ${MAX_ROWS}. Type a name or pick a grade to narrow it down.`}
      </p>

      {matches.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">No learner matches that search.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-sm border border-purple-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Login name</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {shown.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium text-purple-900">
                    {l.name}
                    <span className="block text-xs font-normal text-ink/50">{l.number}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{l.grade}</td>
                  <td className="break-all px-4 py-3 font-mono text-xs text-ink/70">{l.login || '—'}</td>
                  <td className="px-4 py-3">
                    {l.ownPassword ? (
                      <span className="text-green-600">Chosen by the learner</span>
                    ) : (
                      <span className="text-gold-600">Still the school-issued password</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {l.parents > 0 ? (
                      <span className="text-ink/70">{l.parents === 1 ? '1 parent linked' : `${l.parents} parents linked`}</span>
                    ) : (
                      <span className="text-ink/50">None linked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
