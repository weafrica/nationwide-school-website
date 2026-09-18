const posts = [
  {
    date: '2026 admissions',
    title: '2026 registration is officially open',
    body: 'Reception is taking applications for every grade, 0 through 12. Bring the learner\u2019s ID or birth certificate, a recent report card and proof of address to register in person, or apply online.',
  },
  {
    date: 'Matric results',
    title: 'Five years, five 100% matric pass rates',
    body: 'Our Grade 12 class has now delivered a 100% pass rate for five consecutive years — a record built on thirteen years of consistent teaching, not a single strong cohort.',
  },
  {
    date: 'Accreditation',
    title: 'Umalusi accreditation renewed',
    body: 'Nationwide School for Academic Excellence holds Umalusi Accreditation No. 18 SCH0100567PA and GDE EMIS No. 700400454, confirming our full Grade 0\u201312 curriculum meets national standards.',
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{p.date}</p>
              <h2 className="mt-2 font-serif text-2xl text-purple-900">{p.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{p.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
