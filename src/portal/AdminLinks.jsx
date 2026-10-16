import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// "Grade 10" -> 10, so grades sort 0, 1, 2 … 10, 11, 12 rather than alphabetically.
const gradeNumber = (grade) => Number(String(grade).replace(/\D/g, '')) || 0;
const byGrade = (a, b) => gradeNumber(a.grade) - gradeNumber(b.grade) || a.name.localeCompare(b.name);

// Two jobs the admin needs to do by hand:
//   1. say which teacher teaches which subject (so they can enter marks)
//   2. say which parent belongs to which learner (so they can see marks)
export default function AdminLinks() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    const results = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').eq('role', 'teacher'),
      supabase.from('profiles').select('id, full_name, email').eq('role', 'parent'),
      supabase.from('profiles').select('id, full_name').eq('role', 'student'),
      supabase.from('students').select('user_id, student_number, grade'),
      supabase.from('subjects').select('id, name, grade'),
      supabase.from('subject_teachers').select('subject_id, teacher_id'),
      supabase.from('parent_links').select('parent_id, student_id'),
    ]);
    if (results.some((r) => r.error)) { setLoadError('This information could not be loaded. Please refresh the page.'); return; }
    const [teachers, parents, learnerNames, students, subjects, assignments, links] = results.map((r) => r.data || []);
    const nameOf = Object.fromEntries(learnerNames.map((p) => [p.id, p.full_name]));
    setLoadError('');
    setData({
      teachers: teachers.sort((a, b) => a.full_name.localeCompare(b.full_name)),
      parents: parents.sort((a, b) => a.full_name.localeCompare(b.full_name)),
      learners: students
        .map((s) => ({ ...s, name: nameOf[s.user_id] || 'Learner' }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      subjects: subjects.sort(byGrade),
      assignments,
      links,
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loadError) return <p className="text-sm text-red-700">{loadError}</p>;
  if (!data) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <AssignTeacher data={data} onChanged={load} />
      <LinkParent data={data} onChanged={load} />
    </div>
  );
}

function useAction() {
  const [state, setState] = useState({ status: 'idle', message: '' });
  const run = async (promise) => {
    setState({ status: 'saving', message: '' });
    const { error } = await promise;
    if (error) { setState({ status: 'error', message: error.message }); return false; }
    setState({ status: 'saved', message: '' });
    setTimeout(() => setState({ status: 'idle', message: '' }), 2500);
    return true;
  };
  return [state, run];
}

function Note({ state }) {
  return (
    <span aria-live="polite" className="text-sm">
      {state.status === 'saving' && <span className="text-ink/60">Saving…</span>}
      {state.status === 'saved' && <span className="text-green-600">✓ Done</span>}
      {state.status === 'error' && <span className="text-red-700">{state.message || 'That did not work. Please try again.'}</span>}
    </span>
  );
}

function AssignTeacher({ data, onChanged }) {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [state, run] = useAction();

  const grades = [...new Set(data.subjects.map((s) => s.grade))].sort((a, b) => gradeNumber(a) - gradeNumber(b));
  const subjectsInGrade = data.subjects.filter((s) => s.grade === grade);
  const teacherById = Object.fromEntries(data.teachers.map((t) => [t.id, t]));
  const subjectById = Object.fromEntries(data.subjects.map((s) => [s.id, s]));
  const rows = data.assignments
    .map((a) => ({ ...a, teacher: teacherById[a.teacher_id], subject: subjectById[a.subject_id] }))
    .filter((r) => r.teacher && r.subject)
    .sort((a, b) => a.teacher.full_name.localeCompare(b.teacher.full_name) || byGrade(a.subject, b.subject));

  const submit = async (e) => {
    e.preventDefault();
    const ok = await run(supabase.rpc('admin_assign_teacher', {
      p_teacher_email: teacherEmail, p_subject_name: subjectName, p_grade: grade,
    }));
    if (ok) { setSubjectName(''); await onChanged(); }
  };

  const remove = async (row) => {
    const ok = await run(
      supabase.from('subject_teachers').delete().eq('subject_id', row.subject_id).eq('teacher_id', row.teacher_id),
    );
    if (ok) await onChanged();
  };

  return (
    <div>
      <h2 className="font-serif text-xl text-purple-900">Teachers and their subjects</h2>
      <p className="mt-1 text-sm text-ink/70">
        A teacher can only enter marks for the subjects you give them here. Approve the teacher&rsquo;s
        account first (Pending approvals tab).
      </p>

      {data.teachers.length === 0 ? (
        <p className="mt-4 rounded-sm border border-purple-100 p-4 text-sm text-ink/70">
          No approved teachers yet.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-sm border border-purple-100 bg-surface p-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Teacher</span>
            <select required value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} className="input mt-1.5">
              <option value="" disabled>Choose a teacher</option>
              {data.teachers.map((t) => <option key={t.id} value={t.email}>{t.full_name} ({t.email})</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink/80">Grade</span>
              <select required value={grade} onChange={(e) => { setGrade(e.target.value); setSubjectName(''); }} className="input mt-1.5">
                <option value="" disabled>Choose a grade</option>
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink/80">Subject</span>
              <select required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} disabled={!grade} className="input mt-1.5">
                <option value="" disabled>{grade ? 'Choose a subject' : 'Choose a grade first'}</option>
                {subjectsInGrade.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={state.status === 'saving'}
              className="rounded-sm bg-gold-500 px-5 py-2 text-sm font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60"
            >
              Assign teacher
            </button>
            <Note state={state} />
          </div>
        </form>
      )}

      <ul className="mt-5 divide-y divide-purple-100 rounded-sm border border-purple-100">
        {rows.length === 0 && <li className="p-4 text-sm text-ink/60">No subjects assigned yet.</li>}
        {rows.map((r) => (
          <li key={`${r.subject_id}-${r.teacher_id}`} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
            <span>
              <span className="font-semibold text-purple-900">{r.teacher.full_name}</span>
              <span className="text-ink/70"> — {r.subject.name}, {r.subject.grade}</span>
            </span>
            <button onClick={() => remove(r)} className="text-sm text-red-700 underline hover:text-red-900">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkParent({ data, onChanged }) {
  const [parentEmail, setParentEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [state, run] = useAction();

  const parentById = Object.fromEntries(data.parents.map((p) => [p.id, p]));
  const learnerById = Object.fromEntries(data.learners.map((l) => [l.user_id, l]));
  const rows = data.links
    .map((l) => ({ ...l, parent: parentById[l.parent_id], learner: learnerById[l.student_id] }))
    .filter((r) => r.parent && r.learner)
    .sort((a, b) => a.parent.full_name.localeCompare(b.parent.full_name) || a.learner.name.localeCompare(b.learner.name));

  const submit = async (e) => {
    e.preventDefault();
    const ok = await run(supabase.rpc('admin_link_parent', {
      p_parent_email: parentEmail, p_student_number: studentNumber,
    }));
    if (ok) { setStudentNumber(''); await onChanged(); }
  };

  const remove = async (row) => {
    const ok = await run(
      supabase.from('parent_links').delete().eq('parent_id', row.parent_id).eq('student_id', row.student_id),
    );
    if (ok) await onChanged();
  };

  return (
    <div>
      <h2 className="font-serif text-xl text-purple-900">Parents and their children</h2>
      <p className="mt-1 text-sm text-ink/70">
        A parent only ever sees the learners you link to them here. Approve the parent&rsquo;s account
        first (Pending approvals tab → Approve as parent).
      </p>

      {data.parents.length === 0 ? (
        <p className="mt-4 rounded-sm border border-purple-100 p-4 text-sm text-ink/70">No approved parents yet.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-sm border border-purple-100 bg-surface p-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Parent</span>
            <select required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="input mt-1.5">
              <option value="" disabled>Choose a parent</option>
              {data.parents.map((p) => <option key={p.id} value={p.email}>{p.full_name} ({p.email})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Learner</span>
            <select required value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="input mt-1.5">
              <option value="" disabled>Choose a learner</option>
              {data.learners.map((l) => (
                <option key={l.user_id} value={l.student_number}>{l.name} — {l.grade} ({l.student_number})</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={state.status === 'saving'}
              className="rounded-sm bg-gold-500 px-5 py-2 text-sm font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60"
            >
              Link parent
            </button>
            <Note state={state} />
          </div>
        </form>
      )}

      <ul className="mt-5 divide-y divide-purple-100 rounded-sm border border-purple-100">
        {rows.length === 0 && <li className="p-4 text-sm text-ink/60">No parents linked yet.</li>}
        {rows.map((r) => (
          <li key={`${r.parent_id}-${r.student_id}`} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
            <span>
              <span className="font-semibold text-purple-900">{r.parent.full_name}</span>
              <span className="text-ink/70"> — {r.learner.name}, {r.learner.grade}</span>
            </span>
            <button onClick={() => remove(r)} className="text-sm text-red-700 underline hover:text-red-900">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
