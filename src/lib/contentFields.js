// Every editable piece of site content, described once. Each entry is
// what the admin content editor shows; "default" is the original
// hand-written copy, used on the live site until someone changes it.
export const contentFields = [
  { key: 'site.logo', type: 'image', page: 'Site-wide', section: 'Branding', label: 'School crest / logo', default: '/logo.png' },

  { key: 'home.hero.eyebrow', type: 'text', page: 'Home', section: 'Hero banner', label: 'Small label above the headline', default: '2026 admission is open' },
  { key: 'home.hero.title', type: 'text', page: 'Home', section: 'Hero banner', label: 'Main headline', default: 'Every learner arrives a seed. We take excellence seriously enough to prove it.' },
  { key: 'home.hero.body', type: 'text', page: 'Home', section: 'Hero banner', label: 'Headline paragraph', default: 'Nationwide School for Academic Excellence is a Grade 0\u201312 school in Jeppestown with five consecutive years of a 100% matric pass rate \u2014 and registration for 2026 is open now.' },
  { key: 'home.hero.badge', type: 'text', page: 'Home', section: 'Hero banner', label: 'Badge text on the hero graphic', default: 'Seed of Excellence' },

  { key: 'home.stats.1.value', type: 'text', page: 'Home', section: 'Stats row', label: 'Stat 1 \u2014 number', default: '100%' },
  { key: 'home.stats.1.label', type: 'text', page: 'Home', section: 'Stats row', label: 'Stat 1 \u2014 description', default: 'Matric pass rate, five years running' },
  { key: 'home.stats.2.value', type: 'text', page: 'Home', section: 'Stats row', label: 'Stat 2 \u2014 number', default: 'Grade 0\u201312' },
  { key: 'home.stats.2.label', type: 'text', page: 'Home', section: 'Stats row', label: 'Stat 2 \u2014 description', default: 'Primary and High School under one roof' },
  { key: 'home.stats.3.value', type: 'text', page: 'Home', section: 'Stats row', label: 'Stat 3 \u2014 number', default: '#18' },
  { key: 'home.stats.3.label', type: 'text', page: 'Home', section: 'Stats row', label: 'Stat 3 \u2014 description', default: 'Umalusi accreditation SCH0100567PA' },

  { key: 'home.about.heading', type: 'text', page: 'Home', section: 'About teaser', label: 'Heading', default: 'A school built to be finished, not just attended' },
  { key: 'home.about.body1', type: 'text', page: 'Home', section: 'About teaser', label: 'First paragraph', default: "We take one intake through thirteen years \u2014 Grade 0 to Grade 12 \u2014 so a child's record, relationships and routines never have to restart at a new gate. Class teachers know what a learner struggled with in Grade 3 by the time that learner sits their first matric paper." },
  { key: 'home.about.body2', type: 'text', page: 'Home', section: 'About teaser', label: 'Second paragraph', default: 'That continuity is where the pass rate comes from: not a single strong matric class, but thirteen years of the same standard applied consistently.' },

  { key: 'home.principal.eyebrow', type: 'text', page: 'Home', section: "Principal's note", label: 'Small label', default: 'A note from the Principal' },
  { key: 'home.principal.quote', type: 'text', page: 'Home', section: "Principal's note", label: 'Quote', default: "We don't ask what a child arrives knowing. We ask what they'll leave knowing how to do \u2014 and we hold that standard from Grade 0 all the way to their last matric exam." },

  { key: 'home.phases.heading', type: 'text', page: 'Home', section: 'Academic phases', label: 'Section heading', default: 'Four phases, one standard' },
  { key: 'home.phases.1.title', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 1 \u2014 title', default: 'Foundation' },
  { key: 'home.phases.1.desc', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 1 \u2014 description', default: 'Literacy, numeracy and the routines that make school feel safe.' },
  { key: 'home.phases.2.title', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 2 \u2014 title', default: 'Intermediate' },
  { key: 'home.phases.2.desc', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 2 \u2014 description', default: 'Broader subjects, first real projects, first real responsibility.' },
  { key: 'home.phases.3.title', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 3 \u2014 title', default: 'Senior' },
  { key: 'home.phases.3.desc', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 3 \u2014 description', default: 'Subject choices sharpen and the matric runway begins.' },
  { key: 'home.phases.4.title', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 4 \u2014 title', default: 'FET' },
  { key: 'home.phases.4.desc', type: 'text', page: 'Home', section: 'Academic phases', label: 'Phase 4 \u2014 description', default: 'Matric preparation built around five straight years of 100% passes.' },

  { key: 'home.life.heading', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Section heading', default: 'Life at Nationwide' },
  { key: 'home.life.subtext', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Section subtext', default: 'Matric results are the headline. This is what fills the years that lead up to it.' },
  { key: 'home.life.1.title', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 1 \u2014 title', default: 'Sport' },
  { key: 'home.life.1.desc', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 1 \u2014 description', default: 'Soccer, netball, athletics and inter-house days.' },
  { key: 'home.life.2.title', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 2 \u2014 title', default: 'Clubs' },
  { key: 'home.life.2.desc', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 2 \u2014 description', default: 'Debate, chess, coding and student council.' },
  { key: 'home.life.3.title', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 3 \u2014 title', default: 'Arts' },
  { key: 'home.life.3.desc', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 3 \u2014 description', default: 'Choir, drama and an annual showcase.' },
  { key: 'home.life.4.title', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 4 \u2014 title', default: 'Support' },
  { key: 'home.life.4.desc', type: 'text', page: 'Home', section: 'Life at Nationwide', label: 'Item 4 \u2014 description', default: 'Free extra lessons and extension work, after school.' },

  { key: 'home.cta.heading', type: 'text', page: 'Home', section: 'Admissions banner', label: 'Heading', default: 'Registration for 2026 is in progress.' },
  { key: 'home.cta.body', type: 'text', page: 'Home', section: 'Admissions banner', label: 'Body text', default: 'Reception is open 7am\u20133pm, Monday to Friday, at 322 Main Street, Jeppestown.' },
];
