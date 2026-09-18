import { useState } from 'react';

const steps = [
  { title: 'Submit an application', desc: 'Complete the form below or collect a form in person at reception.' },
  { title: 'We review and contact you', desc: 'The admissions office confirms space in the grade and calls you within 5 working days.' },
  { title: 'Register and pay', desc: 'Bring the learner\u2019s ID/birth certificate, report card and proof of address to finalise a place.' },
];

const grades = [
  'Grade 0 (Grade R)', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

const initialForm = {
  learnerName: '',
  learnerDob: '',
  gradeApplying: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  previousSchool: '',
  notes: '',
};

export default function Admissions() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Front-end only for now — this form isn't wired to a database yet,
    // so nothing is actually sent or stored. Phase 2 connects this to
    // Supabase so applications land in the admissions office's queue.
    setSubmitted(true);
  };

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">Admissions</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            2026 registration is open.
          </h1>
          <p className="mt-4 max-w-lg text-white/75">
            Reception is open 7am–3pm, Monday to Friday, at 322 Main Street, Jeppestown — or
            apply online below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <h2 className="font-serif text-3xl text-purple-900">How it works</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title}>
              <p className="font-serif text-2xl text-gold-600">{i + 1}</p>
              <h3 className="mt-2 font-semibold text-purple-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-lavender-50 py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-6">
          {submitted ? (
            <div className="rounded-sm border border-purple-100 bg-white p-8 text-center">
              <p className="font-serif text-2xl text-purple-900">Application received.</p>
              <p className="mt-3 text-ink/70">
                Thank you, {form.learnerName || 'and welcome'}. The admissions office will call{' '}
                {form.parentPhone || 'you'} within 5 working days to confirm space in{' '}
                {form.gradeApplying || 'the grade you applied for'}.
              </p>
              <p className="mt-4 text-sm text-ink/50">
                Questions in the meantime? Call 011 618 9822 or email nationwideschools@gmail.com.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-sm border border-purple-100 bg-white p-8">
              <h2 className="font-serif text-2xl text-purple-900">Learner application</h2>

              <div className="mt-6 grid gap-5">
                <Field label="Learner's full name" required>
                  <input
                    type="text" required value={form.learnerName} onChange={update('learnerName')}
                    className="input"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Date of birth" required>
                    <input
                      type="date" required value={form.learnerDob} onChange={update('learnerDob')}
                      className="input"
                    />
                  </Field>
                  <Field label="Grade applying for" required>
                    <select required value={form.gradeApplying} onChange={update('gradeApplying')} className="input">
                      <option value="" disabled>Select a grade</option>
                      {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Parent / guardian full name" required>
                  <input
                    type="text" required value={form.parentName} onChange={update('parentName')}
                    className="input"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Parent / guardian phone" required>
                    <input
                      type="tel" required value={form.parentPhone} onChange={update('parentPhone')}
                      className="input"
                    />
                  </Field>
                  <Field label="Parent / guardian email">
                    <input
                      type="email" value={form.parentEmail} onChange={update('parentEmail')}
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Current or previous school (if any)">
                  <input
                    type="text" value={form.previousSchool} onChange={update('previousSchool')}
                    className="input"
                  />
                </Field>

                <Field label="Anything else we should know">
                  <textarea
                    rows={3} value={form.notes} onChange={update('notes')}
                    className="input resize-none"
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="mt-7 w-full rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600"
              >
                Submit application
              </button>
              <p className="mt-3 text-center text-xs text-ink/50">
                We'll never share your details. A member of admissions will call you back.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">
        {label} {required && <span className="text-gold-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
