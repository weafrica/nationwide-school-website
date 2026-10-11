import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { useContent } from '../lib/ContentContext';

export default function Home() {
  const { get } = useContent();

  const stats = [1, 2, 3].map((n) => ({
    value: get(`home.stats.${n}.value`),
    label: get(`home.stats.${n}.label`),
  }));

  const phases = [1, 2, 3, 4].map((n) => ({
    title: get(`home.phases.${n}.title`),
    grades: get(`home.phases.${n}.grades`),
    desc: get(`home.phases.${n}.desc`),
  }));

  const lifeItems = [1, 2, 3, 4].map((n) => ({
    title: get(`home.life.${n}.title`),
    desc: get(`home.life.${n}.desc`),
  }));

  const heroImage = get('home.hero.image');

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden bg-purple-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="font-serif text-sm text-gold-500">{get('home.hero.eyebrow')}</p>
            <h1 className="mt-3 max-w-xl font-serif text-4xl leading-[1.1] sm:text-5xl">
              {get('home.hero.title')}
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/75">
              {get('home.hero.body')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to="/admissions">Apply for 2026</Button>
              <Button to="/contact" variant="outline">Book a tour</Button>
            </div>
          </div>

          <div className="relative h-64 lg:h-80">
            {heroImage ? (
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full rounded-sm object-cover" />
            ) : (
              <div className="absolute inset-0 flex gap-2" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${i % 2 === 0 ? 'bg-white/10' : 'bg-gold-500/90'}`} />
                ))}
              </div>
            )}
            {get('home.hero.badge') && (
              <div className="absolute inset-0 flex items-end p-6">
                <p className="inline-block bg-gold-500 px-3 py-1 font-serif text-lg text-purple-900">
                  {get('home.hero.badge')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s, i) => (
              <div key={i} className="px-6 py-6 text-center sm:text-left">
                <p className="font-serif text-3xl text-gold-500">{s.value}</p>
                <p className="mt-1 text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="font-serif text-3xl text-purple-900">{get('home.about.heading')}</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-relaxed text-ink/80">
            <p>{get('home.about.body1')}</p>
            <p>{get('home.about.body2')}</p>
            <Link to="/about" className="inline-block font-semibold text-purple-600 hover:text-purple-900">
              More about our school &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Leadership message */}
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-serif text-sm text-gold-500">{get('home.principal.eyebrow')}</p>
          <p className="mt-4 font-serif text-2xl leading-relaxed sm:text-3xl">
            &ldquo;{get('home.principal.quote')}&rdquo;
          </p>
        </div>
      </section>

      {/* Academic phases */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">{get('home.phases.heading')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((p, i) => (
              <div key={i} className="rounded-sm border border-purple-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{p.grades}</p>
                <h3 className="mt-2 font-serif text-xl text-purple-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/academics" className="mt-8 inline-block font-semibold text-purple-600 hover:text-purple-900">
            See the full academic programme &rarr;
          </Link>
        </div>
      </section>

      {/* Life at Nationwide */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <h2 className="font-serif text-3xl text-purple-900">{get('home.life.heading')}</h2>
        <p className="mt-2 max-w-2xl text-[15px] text-ink/70">{get('home.life.subtext')}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {lifeItems.map((item, i) => (
            <div key={i} className="rounded-sm bg-lavender-50 p-6">
              <h3 className="font-serif text-lg text-purple-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.desc}</p>
            </div>
          ))}
        </div>
        <Link to="/academics" className="mt-8 inline-block font-semibold text-purple-600 hover:text-purple-900">
          More about student life &rarr;
        </Link>
      </section>

      {/* Admissions CTA band */}
      <section className="bg-purple-900 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl">{get('home.cta.heading')}</h2>
            <p className="mt-1 text-white/70">{get('home.cta.body')}</p>
          </div>
          <Button to="/admissions" variant="primary" className="shrink-0">
            Start an application
          </Button>
        </div>
      </section>
    </>
  );
}
