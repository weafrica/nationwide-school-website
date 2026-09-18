import Button from '../components/Button';
import { Link } from 'react-router-dom';

const stats = [
  { value: '100%', label: 'Matric pass rate, five years running' },
  { value: 'Grade 0–12', label: 'Primary and High School under one roof' },
  { value: '#18', label: 'Umalusi accreditation SCH0100567PA' },
];

const phases = [
  { phase: 'Foundation', grades: 'Grade 0 – 3', desc: 'Literacy, numeracy and the routines that make school feel safe.' },
  { phase: 'Intermediate', grades: 'Grade 4 – 6', desc: 'Broader subjects, first real projects, first real responsibility.' },
  { phase: 'Senior', grades: 'Grade 7 – 9', desc: 'Subject choices sharpen and the matric runway begins.' },
  { phase: 'FET', grades: 'Grade 10 – 12', desc: 'Matric preparation built around five straight years of 100% passes.' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden bg-purple-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="font-serif text-sm text-gold-500">2026 admission is open</p>
            <h1 className="mt-3 max-w-xl font-serif text-4xl leading-[1.1] sm:text-5xl">
              Every learner arrives a seed. We take excellence seriously enough to prove it.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/75">
              Nationwide School for Academic Excellence is a Grade 0–12 school in Jeppestown
              with five consecutive years of a 100% matric pass rate — and registration for
              2026 is open now.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to="/admissions">Apply for 2026</Button>
              <Button to="/contact" variant="outline">Book a tour</Button>
            </div>
          </div>

          <div className="relative h-64 lg:h-80" aria-hidden="true">
            <div className="absolute inset-0 flex gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`flex-1 rounded-sm ${i % 2 === 0 ? 'bg-white/10' : 'bg-gold-500/90'}`} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-end p-6">
              <p className="font-serif text-lg text-purple-900 bg-gold-500 inline-block px-3 py-1">
                Seed of Excellence
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s) => (
              <div key={s.label} className="px-6 py-6 text-center sm:text-left">
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
            <h2 className="font-serif text-3xl text-purple-900">A school built to be finished, not just attended</h2>
          </div>
          <div className="space-y-4 text-[17px] leading-relaxed text-ink/80">
            <p>
              We take one intake through thirteen years — Grade 0 to Grade 12 — so a child's
              record, relationships and routines never have to restart at a new gate. Class
              teachers know what a learner struggled with in Grade 3 by the time that learner
              sits their first matric paper.
            </p>
            <p>
              That continuity is where the pass rate comes from: not a single strong matric
              class, but thirteen years of the same standard applied consistently.
            </p>
            <Link to="/about" className="inline-block font-semibold text-purple-600 hover:text-purple-900">
              More about our school &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Academic phases */}
      <section className="bg-lavender-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-purple-900">Four phases, one standard</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((p) => (
              <div key={p.phase} className="rounded-sm border border-purple-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{p.grades}</p>
                <h3 className="mt-2 font-serif text-xl text-purple-900">{p.phase}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/academics" className="mt-8 inline-block font-semibold text-purple-600 hover:text-purple-900">
            See the full academic programme &rarr;
          </Link>
        </div>
      </section>

      {/* Admissions CTA band */}
      <section className="bg-purple-900 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl">Registration for 2026 is in progress.</h2>
            <p className="mt-1 text-white/70">Reception is open 7am–3pm, Monday to Friday, at 322 Main Street, Jeppestown.</p>
          </div>
          <Button to="/admissions" variant="primary" className="shrink-0">
            Start an application
          </Button>
        </div>
      </section>
    </>
  );
}
