import { useContent } from '../lib/ContentContext';

export default function Academics() {
  const { get } = useContent();

  const phases = [1, 2, 3, 4].map((n) => ({
    phase: get(`academics.phases.${n}.phase`),
    grades: get(`academics.phases.${n}.grades`),
    desc: get(`academics.phases.${n}.desc`),
    focus: get(`academics.phases.${n}.focus`),
  }));

  const beyondClass = [1, 2, 3, 4].map((n) => ({
    title: get(`academics.beyond.${n}.title`),
    desc: get(`academics.beyond.${n}.desc`),
  }));

  const schoolDay = [1, 2, 3, 4, 5, 6].map((n) => ({
    time: get(`academics.day.${n}.time`),
    label: get(`academics.day.${n}.label`),
    desc: get(`academics.day.${n}.desc`),
  }));

  const photo = get('academics.photo');

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">{get('academics.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            {get('academics.hero.title')}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {photo && (
          <img src={photo} alt="" className="mb-14 max-h-[26rem] w-full rounded-sm object-cover" />
        )}
        <div className="space-y-10">
          {phases.map((p, i) => (
            <div key={i} className="grid gap-6 border-t border-purple-100 pt-8 lg:grid-cols-[220px_1fr]">
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
          <p className="font-serif text-2xl text-purple-900">{get('academics.band.title')}</p>
          <p className="mt-2 text-ink/70">{get('site.accreditation')}</p>
        </div>
      </section>

      {/* Beyond the classroom */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">{get('academics.beyond.heading')}</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-ink/70">{get('academics.beyond.subtext')}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {beyondClass.map((b, i) => (
              <div key={i} className="rounded-sm border border-purple-100 p-6">
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
          <h2 className="font-serif text-3xl text-purple-900">{get('academics.day.heading')}</h2>
          <div className="mt-10 space-y-5">
            {schoolDay.map((s, i) => (
              <div key={i} className="grid grid-cols-[70px_1fr] gap-4 border-t border-purple-100 pt-5 sm:grid-cols-[90px_180px_1fr]">
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
