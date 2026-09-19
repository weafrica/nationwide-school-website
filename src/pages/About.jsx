const values = [
  { title: 'Consistency', desc: 'The same standard of homework, discipline and feedback from Grade 0 through Grade 12.' },
  { title: 'Accountability', desc: 'Every teacher, every learner and every parent can see where a term is going, not just where it ended.' },
  { title: 'Access', desc: 'Grade 0–12 under one roof, so a family enrols once and is carried the whole way to matric.' },
];

const leadership = [
  { role: 'Principal', focus: 'Whole-school strategy, staff appointments and the standard every phase is held to.' },
  { role: 'Deputy Principal — Academics', focus: 'Timetables, curriculum coverage and exam results across all four phases.' },
  { role: 'Head of Foundation & Intermediate Phase', focus: 'Grade 0–6: literacy, numeracy and the transition into subject-based learning.' },
  { role: 'Head of Senior & FET Phase', focus: 'Grade 7–12: subject choices, matric preparation and university/college guidance.' },
];

const milestones = [
  { year: 'Founded', text: 'Nationwide School for Academic Excellence opens its doors at 322 Main Street, Jeppestown, as a full Grade 0–12 school.' },
  { year: 'Accreditation', text: 'Registered with GDE (EMIS No. 700400454) and accredited by Umalusi (No. 18 SCH0100567PA) to offer the full national curriculum.' },
  { year: 'Year 1 of 5', text: 'First 100% matric pass rate — proof the Grade 0–12 model works, not just a strong single cohort.' },
  { year: 'Today', text: 'Five consecutive years of a 100% matric pass rate, and 2026 registration open across every grade.' },
];

export default function About() {
  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">About us</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            A Jeppestown school built for the long run.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 leading-relaxed text-ink/80 lg:py-24">
        <p className="text-[18px]">
          Nationwide School for Academic Excellence opened its doors at 322 Main Street,
          Jeppestown, with a simple premise: a school that keeps the same learners from their
          first day of Grade 0 to their last exam in Grade 12 can hold a higher standard than
          one that only meets a child in high school.
        </p>
        <p className="mt-5 text-[18px]">
          That premise has held for five consecutive years of a 100% matric pass rate — GDE
          EMIS No. 700400454, Umalusi Accreditation No. 18 SCH0100567PA. We are registered as
          a full Primary and High School, Grade 0 through Grade 12.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-purple-900">Our mission</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              To carry every learner who enrols with us from Grade 0 to a matric pass, through
              consistent teaching, honest reporting to parents, and a standard that does not
              change from one phase to the next.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-purple-900">Our vision</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
              To be the school families in Jeppestown trust with all thirteen years of a
              child's education — known as much for discipline and care as for results.
            </p>
          </div>
        </div>
      </section>

      {/* What the school runs on */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">What the school runs on</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title}>
                <h3 className="font-serif text-xl text-purple-900">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">School leadership</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-ink/70">
            The team responsible for what happens in every classroom, every day.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((l) => (
              <div key={l.role} className="rounded-sm border border-purple-100 bg-white p-6">
                <div className="h-12 w-12 rounded-full bg-purple-100" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-lg text-purple-900">{l.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{l.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History / milestones */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">Our story so far</h2>
          <div className="mt-10 space-y-8">
            {milestones.map((m, i) => (
              <div key={m.year} className="grid gap-2 border-t border-purple-100 pt-6 sm:grid-cols-[160px_1fr] sm:gap-6">
                <p className="font-serif text-lg text-gold-600">{m.year}</p>
                <p className="text-[15px] leading-relaxed text-ink/75">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">Where to find us</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div className="text-[15px] leading-relaxed text-ink/80">
              <p className="font-semibold text-purple-900">Address</p>
              <p className="mt-1">322 Main Street, Jeppestown</p>
              <p className="mt-4 font-semibold text-purple-900">Reception hours</p>
              <p className="mt-1">7am – 3pm, Monday to Friday</p>
            </div>
            <div className="text-[15px] leading-relaxed text-ink/80">
              <p className="font-semibold text-purple-900">Phone</p>
              <p className="mt-1">011 618 9822 &middot; 071 283 4310</p>
              <p className="mt-4 font-semibold text-purple-900">Email</p>
              <p className="mt-1">nationwideschools@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
