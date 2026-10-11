import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useContent } from '../lib/ContentContext';

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
  const { get } = useContent();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const steps = [1, 2, 3].map((n) => ({
    title: get(`admissions.steps.${n}.title`),
    desc: get(`admissions.steps.${n}.desc`),
  }));
  const bring = [1, 2, 3, 4, 5, 6].map((n) => get(`admissions.bring.${n}`)).filter(Boolean);
  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: get(`admissions.faq.${n}.q`),
    a: get(`admissions.faq.${n}.a`),
  }));

  // Saves the application so the admissions office can see it in the
  // portal (Admin → Applications & messages).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    const { error: insertError } = await supabase.from('admission_applications').insert({
      learner_name: form.learnerName.trim(),
      learner_dob: form.learnerDob,
      grade_applying: form.gradeApplying,
      parent_name: form.parentName.trim(),
      parent_phone: form.parentPhone.trim(),
      parent_email: form.parentEmail.trim() || null,
      previous_school: form.previousSchool.trim() || null,
      notes: form.notes.trim() || null,
    });
    setSending(false);
    if (insertError) {
      setError(
        `We couldn't send your application just now. Please try again, or call reception on ${get('site.phone1')}.`,
      );
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">{get('admissions.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            {get('admissions.hero.title')}
          </h1>
          <p className="mt-4 max-w-lg text-white/75">{get('admissions.hero.body')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <h2 className="font-serif text-3xl text-purple-900">{get('admissions.steps.heading')}</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i}>
              <p className="font-serif text-2xl text-gold-600">{i + 1}</p>
              <h3 className="mt-2 font-semibold text-purple-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24">
        <div className="rounded-sm border border-gold-500/40 bg-lavender-50 p-8">
          <h2 className="font-serif text-xl text-purple-900">{get('admissions.bring.heading')}</h2>
          <ul className="mt-4 grid gap-3 text-[15px] text-ink/75 sm:grid-cols-2">
            {bring.map((item, i) => (
              <li key={i} className="flex gap-2"><span className="text-gold-600">&#10003;</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-lavender-50 py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-6">
          {submitted ? (
            <div className="rounded-sm border border-purple-100 bg-white p-8 text-center">
              <p className="font-serif text-2xl text-purple-900">{get('admissions.form.successTitle')}</p>
              <p className="mt-3 text-ink/70">
                Thank you, {form.learnerName || 'and welcome'}. The admissions office will call{' '}
                {form.parentPhone || 'you'} within 5 working days to confirm space in{' '}
                {form.gradeApplying || 'the grade you applied for'}.
              </p>
              <p className="mt-4 text-sm text-ink/50">
                Questions in the meantime? Call {get('site.phone1')} or email {get('site.email')}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-sm border border-purple-100 bg-white p-8">
              <h2 className="font-serif text-2xl text-purple-900">{get('admissions.form.title')}</h2>

              <div className="mt-6 grid gap-5">
                <Field label="Learner's full name" required>
                  <input
                    type="text" required minLength={2} maxLength={120}
                    value={form.learnerName} onChange={update('learnerName')} className="input"
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
                    type="text" required minLength={2} maxLength={120}
                    value={form.parentName} onChange={update('parentName')} className="input"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Parent / guardian phone" required>
                    <input
                      type="tel" required minLength={7} maxLength={30}
                      value={form.parentPhone} onChange={update('parentPhone')} className="input"
                    />
                  </Field>
                  <Field label="Parent / guardian email">
                    <input
                      type="email" maxLength={200} value={form.parentEmail} onChange={update('parentEmail')}
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Current or previous school (if any)">
                  <input
                    type="text" maxLength={200} value={form.previousSchool} onChange={update('previousSchool')}
                    className="input"
                  />
                </Field>

                <Field label="Anything else we should know">
                  <textarea
                    rows={3} maxLength={2000} value={form.notes} onChange={update('notes')}
                    className="input resize-none"
                  />
                </Field>
              </div>

              {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="mt-7 w-full rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Submit application'}
              </button>
              <p className="mt-3 text-center text-xs text-ink/50">{get('admissions.form.privacy')}</p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <h2 className="font-serif text-3xl text-purple-900">{get('admissions.faq.heading')}</h2>
        <div className="mt-8 divide-y divide-purple-100">
          {faqs.map((f, i) => (
            <FaqItem key={i} question={f.q} answer={f.a} />
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
