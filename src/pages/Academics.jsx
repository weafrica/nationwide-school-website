const phases = [
  {
    phase: 'Foundation Phase',
    grades: 'Grade 0 – 3',
    focus: 'Home Language, First Additional Language, Mathematics, Life Skills',
    desc: 'The years where reading, counting and following a school routine become automatic — the base every later subject depends on.',
  },
  {
    phase: 'Intermediate Phase',
    grades: 'Grade 4 – 6',
    focus: 'Languages, Mathematics, Natural Sciences & Technology, Social Sciences, Life Skills',
    desc: 'Subjects widen, homework gets heavier, and learners start being marked on how they think, not just what they remember.',
  },
  {
    phase: 'Senior Phase',
    grades: 'Grade 7 – 9',
    focus: 'Languages, Mathematics, Natural Sciences, Social Sciences, Technology, EMS, Life Orientation, Creative Arts',
    desc: 'The last three years before subject choices lock in for matric — where a learner\u2019s FET stream gets decided.',
  },
  {
    phase: 'FET Phase',
    grades: 'Grade 10 – 12',
    focus: 'Languages, Mathematics or Mathematical Literacy, Life Orientation, plus three elective subjects',
    desc: 'Matric preparation, built around the same pass rate we\u2019ve held for five straight years.',
  },
];

export default function Academics() {
  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">Academics</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            Grade 0 to Grade 12, on one campus.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="space-y-10">
          {phases.map((p, i) => (
            <div key={p.phase} className="grid gap-6 border-t border-purple-100 pt-8 lg:grid-cols-[220px_1fr]">
              <div>
                <p className="font-serif text-2xl text-purple-900">{p.phase}</p>
                <p className="mt-1 text-sm font-semibold text-gold-600">{p.grades}</p>
              </div>
              <div>
                <p className="text-[15px] leading-relaxed text-ink/80">{p.desc}</p>
                <p className="mt-3 text-sm text-ink/60">
                  <span className="font-semibold text-purple-900">Subjects: </span>
                  {p.focus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-lavender-50 py-14">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-serif text-2xl text-purple-900">Five consecutive years of a 100% matric pass rate.</p>
          <p className="mt-2 text-ink/70">GDE EMIS No. 700400454 &middot; Umalusi Accreditation No. 18 SCH0100567PA</p>
        </div>
      </section>
    </>
  );
}
