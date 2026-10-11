import { useContent } from '../lib/ContentContext';

export default function About() {
  const { get } = useContent();

  const values = [1, 2, 3].map((n) => ({
    title: get(`about.values.${n}.title`),
    desc: get(`about.values.${n}.desc`),
  }));

  const leadership = [1, 2, 3, 4].map((n) => ({
    role: get(`about.leadership.${n}.role`),
    focus: get(`about.leadership.${n}.focus`),
  }));

  const milestones = [1, 2, 3, 4].map((n) => ({
    year: get(`about.story.${n}.year`),
    text: get(`about.story.${n}.text`),
  }));

  const photo = get('about.photo');

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">{get('about.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            {get('about.hero.title')}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 leading-relaxed text-ink/80 lg:py-24">
        <p className="text-[18px]">{get('about.intro.1')}</p>
        <p className="mt-5 text-[18px]">{get('about.intro.2')}</p>
        {photo && (
          <img src={photo} alt="" className="mt-10 max-h-[28rem] w-full rounded-sm object-cover" />
        )}
      </section>

      {/* Mission & Vision */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-purple-900">{get('about.mission.title')}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{get('about.mission.body')}</p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-purple-900">{get('about.vision.title')}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{get('about.vision.body')}</p>
          </div>
        </div>
      </section>

      {/* What the school runs on */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">{get('about.values.heading')}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {values.map((v, i) => (
              <div key={i}>
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
          <h2 className="font-serif text-3xl text-purple-900">{get('about.leadership.heading')}</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-ink/70">{get('about.leadership.subtext')}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((l, i) => (
              <div key={i} className="rounded-sm border border-purple-100 bg-white p-6">
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
          <h2 className="font-serif text-3xl text-purple-900">{get('about.story.heading')}</h2>
          <div className="mt-10 space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="grid gap-2 border-t border-purple-100 pt-6 sm:grid-cols-[160px_1fr] sm:gap-6">
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
          <h2 className="font-serif text-3xl text-purple-900">{get('about.location.heading')}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div className="text-[15px] leading-relaxed text-ink/80">
              <p className="font-semibold text-purple-900">Address</p>
              <p className="mt-1">{get('site.address')}</p>
              <p className="mt-4 font-semibold text-purple-900">Reception hours</p>
              <p className="mt-1">{get('site.hours')}</p>
            </div>
            <div className="text-[15px] leading-relaxed text-ink/80">
              <p className="font-semibold text-purple-900">Phone</p>
              <p className="mt-1">{get('site.phone1')} &middot; {get('site.phone2')}</p>
              <p className="mt-4 font-semibold text-purple-900">Email</p>
              <p className="mt-1">{get('site.email')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
