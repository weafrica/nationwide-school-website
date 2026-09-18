const values = [
  { title: 'Consistency', desc: 'The same standard of homework, discipline and feedback from Grade 0 through Grade 12.' },
  { title: 'Accountability', desc: 'Every teacher, every learner and every parent can see where a term is going, not just where it ended.' },
  { title: 'Access', desc: 'Grade 0–12 under one roof, so a family enrols once and is carried the whole way to matric.' },
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

      <section className="bg-lavender-50 py-16 lg:py-24">
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

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
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
      </section>
    </>
  );
}
