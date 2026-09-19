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

const schoolDay = [
  { time: '7:00', label: 'Gates open', desc: 'Early drop-off supervision begins.' },
  { time: '7:30', label: 'Classes begin', desc: 'Register, then straight into the first period.' },
  { time: '10:00', label: 'Morning break', desc: '20 minutes — Foundation Phase eats first.' },
  { time: '13:00', label: 'Lunch', desc: 'Grade 0–6 finish their academic day around this time.' },
  { time: '14:30', label: 'Senior classes end', desc: 'Grade 7–12 finish, followed by sport and clubs.' },
  { time: '15:00', label: 'Gates close', desc: 'All learners must be collected or in aftercare by now.' },
];

const beyondClass = [
  { title: 'Sport', desc: 'Soccer, netball and athletics, with inter-house competitions each term and a chance to represent the school at district level.' },
  { title: 'Clubs & societies', desc: 'Debate, chess, coding and a student council — learners choose one to join from Grade 4 upward.' },
  { title: 'Creative arts', desc: 'Choir, drama and visual art, with an end-of-year showcase parents are invited to.' },
  { title: 'Academic support', desc: 'Extra lessons for learners behind in a subject, and extension work for learners ahead of it — both run after school, no extra fee.' },
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
          {phases.map((p) => (
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

      {/* Beyond the classroom */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">Beyond the classroom</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-ink/70">
            A matric certificate is the floor, not the ceiling — every learner is expected to
            take part in at least one activity outside of timetabled lessons.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {beyondClass.map((b) => (
              <div key={b.title} className="rounded-sm border border-purple-100 p-6">
                <h3 className="font-serif text-xl text-purple-900">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The school day */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">A typical school day</h2>
          <div className="mt-10 space-y-5">
            {schoolDay.map((s) => (
              <div key={s.time} className="grid grid-cols-[70px_1fr] gap-4 border-t border-purple-100 pt-5 sm:grid-cols-[90px_180px_1fr]">
                <p className="font-serif text-lg text-gold-600">{s.time}</p>
                <p className="font-semibold text-purple-900">{s.label}</p>
                <p className="text-sm text-ink/65 sm:col-start-3">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
