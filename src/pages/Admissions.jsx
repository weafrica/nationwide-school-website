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

const faqs = [
  { q: 'Is there space in every grade for 2026?', a: 'Most grades have space, but some fill up before others. Apply as early as possible — the admissions office will confirm availability for your specific grade when they call you back.' },
  { q: 'What are the school fees?', a: 'Fee amounts depend on the grade and are confirmed by the admissions office when you register — call 011 618 9822 or visit reception for the current fee schedule.' },
  { q: 'Do you offer aftercare?', a: 'Yes, supervised aftercare is available after the school day ends, for an additional fee. Ask reception for details when you register.' },
  { q: 'Can my child join partway through the year?', a: 'Yes — we accept learners at any point in the year, subject to space in that grade. Bring their most recent report card so we can place them correctly.' },
  { q: 'What if my child has never been to school before (Grade 0)?', a: 'That\u2019s the normal starting point for Grade 0. Bring their birth certificate and immunisation record, and our Foundation Phase team will take it from there.' },
  { q: 'Do you assist with matric subject choices?', a: 'Yes — the Senior Phase team meets with every Grade 9 learner and their parents before subject choices are finalised for Grade 10.' },
];

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

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24">
        <div className="rounded-sm border border-gold-500/40 bg-lavender-50 p-8">
          <h2 className="font-serif text-xl text-purple-900">What to bring to register in person</h2>
          <ul className="mt-4 grid gap-3 text-[15px] text-ink/75 sm:grid-cols-2">
            <li className="flex gap-2"><span className="text-gold-600">&#10003;</span> Learner's ID or birth certificate</li>
            <li className="flex gap-2"><span className="text-gold-600">&#10003;</span> Most recent report card (if changing schools)</li>
            <li className="flex gap-2"><span className="text-gold-600">&#10003;</span> Proof of address (utility bill or lease)</li>
            <li className="flex gap-2"><span className="text-gold-600">&#10003;</span> Parent/guardian ID</li>
            <li className="flex gap-2"><span className="text-gold-600">&#10003;</span> Immunisation record (Grade 0 only)</li>
            <li className="flex gap-2"><span className="text-gold-600">&#10003;</span> Proof of guardianship, if applicable</li>
          </ul>
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

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <h2 className="font-serif text-3xl text-purple-900">Questions parents ask</h2>
        <div className="mt-8 divide-y divide-purple-100">
          {faqs.map((f) => (
            <FaqItem key={f.q} question={f.q} answer={f.a} />
          ))}
        </div>
      </section>
    </>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-purple-900">{question}</span>
        <span className="shrink-0 text-xl text-gold-600">{open ? '\u2212' : '+'}</span>
      </button>
      {open && <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{answer}</p>}
    </div>
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
