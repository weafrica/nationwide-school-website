const posts = [
  {
    date: '2026 admissions',
    tag: 'Admissions',
    title: '2026 registration is officially open',
    body: 'Reception is taking applications for every grade, 0 through 12. Bring the learner\u2019s ID or birth certificate, a recent report card and proof of address to register in person, or apply online.',
  },
  {
    date: 'Matric results',
    tag: 'Academics',
    title: 'Five years, five 100% matric pass rates',
    body: 'Our Grade 12 class has now delivered a 100% pass rate for five consecutive years — a record built on thirteen years of consistent teaching, not a single strong cohort.',
  },
  {
    date: 'Accreditation',
    tag: 'School news',
    title: 'Umalusi accreditation renewed',
    body: 'Nationwide School for Academic Excellence holds Umalusi Accreditation No. 18 SCH0100567PA and GDE EMIS No. 700400454, confirming our full Grade 0\u201312 curriculum meets national standards.',
  },
  {
    date: 'Sport',
    tag: 'Student life',
    title: 'Inter-house athletics day set for this term',
    body: 'Every learner from Grade 0 to Grade 12 competes for their house on the day — parents are welcome to come and support from the sidelines.',
  },
  {
    date: 'Open day',
    tag: 'Admissions',
    title: 'Book a school tour before you register',
    body: 'Prefer to see the classrooms first? Reception can arrange a short walk-through during school hours, 7am\u20133pm, Monday to Friday \u2014 no appointment necessary.',
  },
  {
    date: 'Arts',
    tag: 'Student life',
    title: 'Choir and drama auditions open to Grade 4 and up',
    body: 'No experience necessary \u2014 rehearsals run after school once a week, building toward the end-of-year showcase parents are invited to attend.',
  },
];

export default function News() {
  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">News</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            What's happening at Nationwide.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="space-y-10">
          {posts.map((p) => (
            <article key={p.title} className="border-t border-purple-100 pt-8">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                <span className="text-gold-600">{p.date}</span>
                <span className="rounded-full bg-lavender-50 px-2.5 py-1 text-purple-900">{p.tag}</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl text-purple-900">{p.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{p.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
