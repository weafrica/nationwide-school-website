import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import PortalLayout from './PortalLayout';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingFor, setSavingFor] = useState(null);
  const [savedFor, setSavedFor] = useState(null);

  const loadSubjects = useCallback(async () => {
    const { data } = await supabase
      .from('subject_teachers')
      .select('subjects(id, name, grade)')
      .eq('teacher_id', user.id);
    const list = (data || []).map((r) => r.subjects).filter(Boolean);
    setSubjects(list);
    if (list.length && !selectedSubject) setSelectedSubject(list[0].id);
    setLoading(false);
  }, [user.id, selectedSubject]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const loadRoster = useCallback(async () => {
    if (!selectedSubject) { setRoster([]); return; }
    const { data } = await supabase
      .from('enrollments')
      .select('students(user_id, student_number, profiles(full_name))')
      .eq('subject_id', selectedSubject);
    setRoster((data || []).map((r) => r.students).filter(Boolean));
  }, [selectedSubject]);

  useEffect(() => {
    loadRoster();
    const interval = setInterval(loadRoster, 30000);
    return () => clearInterval(interval);
  }, [loadRoster]);

  const saveMark = async (studentId, term, year, score, comment) => {
    setSavingFor(studentId);
    const { error } = await supabase.from('marks').upsert(
      { student_id: studentId, subject_id: selectedSubject, term: Number(term), year: Number(year), score: score === '' ? null : Number(score), comment, recorded_by: user.id },
      { onConflict: 'student_id,subject_id,term,year' }
    );
    setSavingFor(null);
    if (!error) { setSavedFor(studentId); setTimeout(() => setSavedFor(null), 2000); }
  };

  if (loading) return <PortalLayout eyebrow="Portal" title="Your classes"><p className="text-ink/50">Loading\u2026</p></PortalLayout>;

  return (
    <PortalLayout eyebrow="Teacher portal" title="Your classes">
      {subjects.length === 0 ? (
        <p className="text-sm text-ink/60">No subjects assigned to you yet — ask admin to add you to a subject.</p>
      ) : (
        <>
          <label className="block max-w-xs">
            <span className="text-sm font-medium text-ink/80">Subject</span>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input mt-1.5">
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
            </select>
          </label>

          <div className="mt-6 overflow-hidden rounded-sm border border-purple-100">
            <table className="w-full text-sm">
              <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {roster.map((s) => (
                  <MarkRow
                    key={s.user_id}
                    student={s}
                    saving={savingFor === s.user_id}
                    saved={savedFor === s.user_id}
                    onSave={saveMark}
                  />
                ))}
                {roster.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-ink/50">No students enrolled in this subject yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PortalLayout>
  );
}

function MarkRow({ student, saving, saved, onSave }) {
  const [term, setTerm] = useState('1');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-purple-900">
        {student.profiles?.full_name}
        <span className="block text-xs text-ink/50">{student.student_number}</span>
      </td>
      <td className="px-2 py-3">
        <select value={term} onChange={(e) => setTerm(e.target.value)} className="input">
          {[1, 2, 3, 4].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="px-2 py-3">
        <input value={year} onChange={(e) => setYear(e.target.value)} className="input w-20" />
      </td>
      <td className="px-2 py-3">
        <input value={score} onChange={(e) => setScore(e.target.value)} placeholder="%" className="input w-20" />
      </td>
      <td className="px-2 py-3">
        <input value={comment} onChange={(e) => setComment(e.target.value)} className="input" />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onSave(student.user_id, term, year, score, comment)}
          disabled={saving}
          className="rounded-sm bg-purple-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {saving ? '\u2026' : saved ? 'Saved' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
