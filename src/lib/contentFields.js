// Every editable piece of site content, described once.
//
// - "default" is the original wording. The live site shows it until an admin
//   changes it, and the editor's "Restore original" button puts it back.
// - Pages read content with get('some.key') and never repeat the wording, so
//   nothing can drift out of sync or come out blank.
// - To make something new editable: add it here, then use get('its.key').

const text = (key, page, section, label, def) => ({ key, type: 'text', page, section, label, default: def });

const image = (key, page, section, label, extra = {}) => ({
  key, type: 'image', page, section, label, default: '', ...extra,
});

// A numbered group such as "Value 1 — title", "Value 1 — description".
function group(prefix, page, section, noun, rows, parts) {
  return rows.flatMap((row, i) =>
    parts.map(([part, label]) =>
      text(`${prefix}.${i + 1}.${part}`, page, section, `${noun} ${i + 1} — ${label}`, row[part])));
}

// A numbered list of single lines such as "Item 1", "Item 2".
const lines = (prefix, page, section, noun, rows) =>
  rows.map((row, i) => text(`${prefix}.${i + 1}`, page, section, `${noun} ${i + 1}`, row));

export const contentFields = [
  // ───────────────────────── Site-wide ─────────────────────────
  image('site.logo', 'Site-wide', 'Logo', 'School crest / logo (shown in the top bar and footer)', {
    default: '/logo.png', required: true,
  }),
  text('site.name', 'Site-wide', 'School name', 'School name (top line)', 'Nationwide School'),
  text('site.tagline', 'Site-wide', 'School name', 'School name (small line underneath)', 'for Academic Excellence'),
  text('site.accreditation', 'Site-wide', 'School name', 'Registration numbers', 'GDE EMIS No. 700400454 · Umalusi Accreditation No. 18 SCH0100567PA'),
  text('site.address', 'Site-wide', 'Contact details', 'Address (use a comma to start a new line)', '322 Main Street, Jeppestown'),
  text('site.hours', 'Site-wide', 'Contact details', 'Reception hours', '7am – 3pm, Monday to Friday'),
  text('site.phone1', 'Site-wide', 'Contact details', 'Phone number 1', '011 618 9822'),
  text('site.phone2', 'Site-wide', 'Contact details', 'Phone number 2', '071 283 4310'),
  text('site.email', 'Site-wide', 'Contact details', 'Email address', 'nationwideschools@gmail.com'),
  text('site.social', 'Site-wide', 'Contact details', 'Social media names', '@nationwide_schools · @nationwideschool'),
  text('site.facebook', 'Site-wide', 'Footer', 'Facebook page link', 'https://facebook.com'),
  text('site.instagram', 'Site-wide', 'Footer', 'Instagram page link', 'https://instagram.com'),
  text('site.footerNote', 'Site-wide', 'Footer', 'Line at the bottom right of the footer', 'Primary and High School · Grade 0–12'),
  text('footer.visit', 'Site-wide', 'Footer', 'Footer heading — address', 'Visit us'),
  text('footer.touch', 'Site-wide', 'Footer', 'Footer heading — phone and email', 'Get in touch'),
  text('footer.links', 'Site-wide', 'Footer', 'Footer heading — links', 'Quick links'),
  text('footer.link.apply', 'Site-wide', 'Footer', 'Footer link 1', 'Apply for 2026'),
  text('footer.link.academics', 'Site-wide', 'Footer', 'Footer link 2', 'Academic programme'),
  text('footer.link.portal', 'Site-wide', 'Footer', 'Footer link 3', 'Student & staff portal'),

  text('nav.about', 'Site-wide', 'Menu names', 'Menu — About', 'About'),
  text('nav.academics', 'Site-wide', 'Menu names', 'Menu — Academics', 'Academics'),
  text('nav.admissions', 'Site-wide', 'Menu names', 'Menu — Admissions', 'Admissions'),
  text('nav.news', 'Site-wide', 'Menu names', 'Menu — News', 'News'),
  text('nav.contact', 'Site-wide', 'Menu names', 'Menu — Contact', 'Contact'),
  text('nav.portal', 'Site-wide', 'Menu names', 'Menu — portal button', 'Portal login'),

  // ───────────────────────── Home ─────────────────────────
  text('home.hero.eyebrow', 'Home', 'Hero banner', 'Small label above the headline', '2026 admission is open'),
  text('home.hero.title', 'Home', 'Hero banner', 'Main headline', 'Every learner arrives a seed. We take excellence seriously enough to prove it.'),
  text('home.hero.body', 'Home', 'Hero banner', 'Paragraph under the headline', 'Nationwide School for Academic Excellence is a Grade 0–12 school in Jeppestown with five consecutive years of a 100% matric pass rate — and registration for 2026 is open now.'),
  text('home.hero.badge', 'Home', 'Hero banner', 'Badge text on the picture', 'Seed of Excellence'),
  image('home.hero.image', 'Home', 'Hero banner', 'Hero photo (optional — replaces the purple and gold stripes)'),
  text('home.hero.button1', 'Home', 'Hero banner', 'First button', 'Apply for 2026'),
  text('home.hero.button2', 'Home', 'Hero banner', 'Second button', 'Book a tour'),

  ...group('home.stats', 'Home', 'Stats row', 'Stat', [
    { value: '100%', label: 'Matric pass rate, five years running' },
    { value: 'Grade 0–12', label: 'Primary and High School under one roof' },
    { value: '#18', label: 'Umalusi accreditation SCH0100567PA' },
  ], [['value', 'big number'], ['label', 'description']]),

  text('home.about.heading', 'Home', 'About teaser', 'Heading', 'A school built to be finished, not just attended'),
  text('home.about.body1', 'Home', 'About teaser', 'First paragraph', 'We take one intake through thirteen years — Grade 0 to Grade 12 — so a child’s record, relationships and routines never have to restart at a new gate. Class teachers know what a learner struggled with in Grade 3 by the time that learner sits their first matric paper.'),
  text('home.about.body2', 'Home', 'About teaser', 'Second paragraph', 'That continuity is where the pass rate comes from: not a single strong matric class, but thirteen years of the same standard applied consistently.'),
  text('home.about.link', 'Home', 'About teaser', 'Link text (an arrow is added automatically)', 'More about our school'),

  text('home.principal.eyebrow', 'Home', 'Principal’s note', 'Small label', 'A note from the Principal'),
  text('home.principal.quote', 'Home', 'Principal’s note', 'Quote', 'We don’t ask what a child arrives knowing. We ask what they’ll leave knowing how to do — and we hold that standard from Grade 0 all the way to their last matric exam.'),

  text('home.phases.heading', 'Home', 'Academic phases', 'Section heading', 'Four phases, one standard'),
  text('home.phases.link', 'Home', 'Academic phases', 'Link text under the cards (an arrow is added automatically)', 'See the full academic programme'),
  ...group('home.phases', 'Home', 'Academic phases', 'Phase', [
    { title: 'Foundation', grades: 'Grade 0 – 3', desc: 'Literacy, numeracy and the routines that make school feel safe.' },
    { title: 'Intermediate', grades: 'Grade 4 – 6', desc: 'Broader subjects, first real projects, first real responsibility.' },
    { title: 'Senior', grades: 'Grade 7 – 9', desc: 'Subject choices sharpen and the matric runway begins.' },
    { title: 'FET', grades: 'Grade 10 – 12', desc: 'Matric preparation built around five straight years of 100% passes.' },
  ], [['title', 'name'], ['grades', 'grades'], ['desc', 'description']]),

  text('home.life.heading', 'Home', 'Life at Nationwide', 'Section heading', 'Life at Nationwide'),
  text('home.life.subtext', 'Home', 'Life at Nationwide', 'Text under the heading', 'Matric results are the headline. This is what fills the years that lead up to it.'),
  text('home.life.link', 'Home', 'Life at Nationwide', 'Link text under the cards (an arrow is added automatically)', 'More about student life'),
  ...group('home.life', 'Home', 'Life at Nationwide', 'Card', [
    { title: 'Sport', desc: 'Soccer, netball, athletics and inter-house days.' },
    { title: 'Clubs', desc: 'Debate, chess, coding and student council.' },
    { title: 'Arts', desc: 'Choir, drama and an annual showcase.' },
    { title: 'Support', desc: 'Free extra lessons and extension work, after school.' },
  ], [['title', 'title'], ['desc', 'description']]),

  text('home.cta.heading', 'Home', 'Admissions banner', 'Heading', 'Registration for 2026 is in progress.'),
  text('home.cta.body', 'Home', 'Admissions banner', 'Text under the heading', 'Reception is open 7am–3pm, Monday to Friday, at 322 Main Street, Jeppestown.'),
  text('home.cta.button', 'Home', 'Admissions banner', 'Button text', 'Start an application'),

  // ───────────────────────── About ─────────────────────────
  text('about.hero.eyebrow', 'About', 'Page banner', 'Small label', 'About us'),
  text('about.hero.title', 'About', 'Page banner', 'Main headline', 'A Jeppestown school built for the long run.'),

  text('about.intro.1', 'About', 'Introduction', 'First paragraph', 'Nationwide School for Academic Excellence opened its doors at 322 Main Street, Jeppestown, with a simple premise: a school that keeps the same learners from their first day of Grade 0 to their last exam in Grade 12 can hold a higher standard than one that only meets a child in high school.'),
  text('about.intro.2', 'About', 'Introduction', 'Second paragraph', 'That premise has held for five consecutive years of a 100% matric pass rate — GDE EMIS No. 700400454, Umalusi Accreditation No. 18 SCH0100567PA. We are registered as a full Primary and High School, Grade 0 through Grade 12.'),
  image('about.photo', 'About', 'Introduction', 'Photo under the introduction (optional)'),

  text('about.mission.title', 'About', 'Mission and vision', 'Mission — heading', 'Our mission'),
  text('about.mission.body', 'About', 'Mission and vision', 'Mission — text', 'To carry every learner who enrols with us from Grade 0 to a matric pass, through consistent teaching, honest reporting to parents, and a standard that does not change from one phase to the next.'),
  text('about.vision.title', 'About', 'Mission and vision', 'Vision — heading', 'Our vision'),
  text('about.vision.body', 'About', 'Mission and vision', 'Vision — text', 'To be the school families in Jeppestown trust with all thirteen years of a child’s education — known as much for discipline and care as for results.'),

  text('about.values.heading', 'About', 'What the school runs on', 'Section heading', 'What the school runs on'),
  ...group('about.values', 'About', 'What the school runs on', 'Value', [
    { title: 'Consistency', desc: 'The same standard of homework, discipline and feedback from Grade 0 through Grade 12.' },
    { title: 'Accountability', desc: 'Every teacher, every learner and every parent can see where a term is going, not just where it ended.' },
    { title: 'Access', desc: 'Grade 0–12 under one roof, so a family enrols once and is carried the whole way to matric.' },
  ], [['title', 'title'], ['desc', 'description']]),

  text('about.leadership.heading', 'About', 'School leadership', 'Section heading', 'School leadership'),
  text('about.leadership.subtext', 'About', 'School leadership', 'Text under the heading', 'The team responsible for what happens in every classroom, every day.'),
  ...group('about.leadership', 'About', 'School leadership', 'Role', [
    { role: 'Principal', focus: 'Whole-school strategy, staff appointments and the standard every phase is held to.' },
    { role: 'Deputy Principal — Academics', focus: 'Timetables, curriculum coverage and exam results across all four phases.' },
    { role: 'Head of Foundation & Intermediate Phase', focus: 'Grade 0–6: literacy, numeracy and the transition into subject-based learning.' },
    { role: 'Head of Senior & FET Phase', focus: 'Grade 7–12: subject choices, matric preparation and university/college guidance.' },
  ], [['role', 'job title'], ['focus', 'what they look after']]),

  text('about.story.heading', 'About', 'Our story', 'Section heading', 'Our story so far'),
  ...group('about.story', 'About', 'Our story', 'Milestone', [
    { year: 'Founded', text: 'Nationwide School for Academic Excellence opens its doors at 322 Main Street, Jeppestown, as a full Grade 0–12 school.' },
    { year: 'Accreditation', text: 'Registered with GDE (EMIS No. 700400454) and accredited by Umalusi (No. 18 SCH0100567PA) to offer the full national curriculum.' },
    { year: 'Year 1 of 5', text: 'First 100% matric pass rate — proof the Grade 0–12 model works, not just a strong single cohort.' },
    { year: 'Today', text: 'Five consecutive years of a 100% matric pass rate, and 2026 registration open across every grade.' },
  ], [['year', 'label'], ['text', 'description']]),

  text('about.location.heading', 'About', 'Where to find us', 'Section heading (address, hours, phone and email come from Site-wide)', 'Where to find us'),

  // ───────────────────────── Academics ─────────────────────────
  text('academics.hero.eyebrow', 'Academics', 'Page banner', 'Small label', 'Academics'),
  text('academics.hero.title', 'Academics', 'Page banner', 'Main headline', 'Grade 0 to Grade 12, on one campus.'),
  image('academics.photo', 'Academics', 'Page banner', 'Photo above the phases (optional)'),

  ...group('academics.phases', 'Academics', 'The four phases', 'Phase', [
    { phase: 'Foundation Phase', grades: 'Grade 0 – 3', desc: 'The years where reading, counting and following a school routine become automatic — the base every later subject depends on.', focus: 'Home Language, First Additional Language, Mathematics, Life Skills' },
    { phase: 'Intermediate Phase', grades: 'Grade 4 – 6', desc: 'Subjects widen, homework gets heavier, and learners start being marked on how they think, not just what they remember.', focus: 'Languages, Mathematics, Natural Sciences & Technology, Social Sciences, Life Skills' },
    { phase: 'Senior Phase', grades: 'Grade 7 – 9', desc: 'The last three years before subject choices lock in for matric — where a learner’s FET stream gets decided.', focus: 'Languages, Mathematics, Natural Sciences, Social Sciences, Technology, EMS, Life Orientation, Creative Arts' },
    { phase: 'FET Phase', grades: 'Grade 10 – 12', desc: 'Matric preparation, built around the same pass rate we’ve held for five straight years.', focus: 'Languages, Mathematics or Mathematical Literacy, Life Orientation, plus three elective subjects' },
  ], [['phase', 'name'], ['grades', 'grades'], ['desc', 'description'], ['focus', 'subjects']]),

  text('academics.band.title', 'Academics', 'Results banner', 'Banner text (registration numbers come from Site-wide)', 'Five consecutive years of a 100% matric pass rate.'),

  text('academics.beyond.heading', 'Academics', 'Beyond the classroom', 'Section heading', 'Beyond the classroom'),
  text('academics.beyond.subtext', 'Academics', 'Beyond the classroom', 'Text under the heading', 'A matric certificate is the floor, not the ceiling — every learner is expected to take part in at least one activity outside of timetabled lessons.'),
  ...group('academics.beyond', 'Academics', 'Beyond the classroom', 'Activity', [
    { title: 'Sport', desc: 'Soccer, netball and athletics, with inter-house competitions each term and a chance to represent the school at district level.' },
    { title: 'Clubs & societies', desc: 'Debate, chess, coding and a student council — learners choose one to join from Grade 4 upward.' },
    { title: 'Creative arts', desc: 'Choir, drama and visual art, with an end-of-year showcase parents are invited to.' },
    { title: 'Academic support', desc: 'Extra lessons for learners behind in a subject, and extension work for learners ahead of it — both run after school, no extra fee.' },
  ], [['title', 'title'], ['desc', 'description']]),

  text('academics.day.heading', 'Academics', 'A typical school day', 'Section heading', 'A typical school day'),
  ...group('academics.day', 'Academics', 'A typical school day', 'Time slot', [
    { time: '7:00', label: 'Gates open', desc: 'Early drop-off supervision begins.' },
    { time: '7:30', label: 'Classes begin', desc: 'Register, then straight into the first period.' },
    { time: '10:00', label: 'Morning break', desc: '20 minutes — Foundation Phase eats first.' },
    { time: '13:00', label: 'Lunch', desc: 'Grade 0–6 finish their academic day around this time.' },
    { time: '14:30', label: 'Senior classes end', desc: 'Grade 7–12 finish, followed by sport and clubs.' },
    { time: '15:00', label: 'Gates close', desc: 'All learners must be collected or in aftercare by now.' },
  ], [['time', 'time'], ['label', 'title'], ['desc', 'description']]),

  // ───────────────────────── Admissions ─────────────────────────
  text('admissions.hero.eyebrow', 'Admissions', 'Page banner', 'Small label', 'Admissions'),
  text('admissions.hero.title', 'Admissions', 'Page banner', 'Main headline', '2026 registration is open.'),
  text('admissions.hero.body', 'Admissions', 'Page banner', 'Paragraph under the headline', 'Reception is open 7am–3pm, Monday to Friday, at 322 Main Street, Jeppestown — or apply online below.'),

  text('admissions.steps.heading', 'Admissions', 'How it works', 'Section heading', 'How it works'),
  ...group('admissions.steps', 'Admissions', 'How it works', 'Step', [
    { title: 'Submit an application', desc: 'Complete the form below or collect a form in person at reception.' },
    { title: 'We review and contact you', desc: 'The admissions office confirms space in the grade and calls you within 5 working days.' },
    { title: 'Register and pay', desc: 'Bring the learner’s ID/birth certificate, report card and proof of address to finalise a place.' },
  ], [['title', 'title'], ['desc', 'description']]),

  text('admissions.bring.heading', 'Admissions', 'What to bring', 'Box heading', 'What to bring to register in person'),
  ...lines('admissions.bring', 'Admissions', 'What to bring', 'Checklist item', [
    'Learner\'s ID or birth certificate',
    'Most recent report card (if changing schools)',
    'Proof of address (utility bill or lease)',
    'Parent/guardian ID',
    'Immunisation record (Grade 0 only)',
    'Proof of guardianship, if applicable',
  ]),

  text('admissions.form.title', 'Admissions', 'Application form', 'Form heading', 'Learner application'),
  text('admissions.form.privacy', 'Admissions', 'Application form', 'Small print under the Submit button', 'We\'ll never share your details. A member of admissions will call you back.'),
  text('admissions.form.successTitle', 'Admissions', 'Application form', 'Heading shown after someone applies', 'Application received.'),

  text('admissions.faq.heading', 'Admissions', 'Questions parents ask', 'Section heading', 'Questions parents ask'),
  ...group('admissions.faq', 'Admissions', 'Questions parents ask', 'Question', [
    { q: 'Is there space in every grade for 2026?', a: 'Most grades have space, but some fill up before others. Apply as early as possible — the admissions office will confirm availability for your specific grade when they call you back.' },
    { q: 'What are the school fees?', a: 'Fee amounts depend on the grade and are confirmed by the admissions office when you register — call 011 618 9822 or visit reception for the current fee schedule.' },
    { q: 'Do you offer aftercare?', a: 'Yes, supervised aftercare is available after the school day ends, for an additional fee. Ask reception for details when you register.' },
    { q: 'Can my child join partway through the year?', a: 'Yes — we accept learners at any point in the year, subject to space in that grade. Bring their most recent report card so we can place them correctly.' },
    { q: 'What if my child has never been to school before (Grade 0)?', a: 'That’s the normal starting point for Grade 0. Bring their birth certificate and immunisation record, and our Foundation Phase team will take it from there.' },
    { q: 'Do you assist with matric subject choices?', a: 'Yes — the Senior Phase team meets with every Grade 9 learner and their parents before subject choices are finalised for Grade 10.' },
  ], [['q', 'question'], ['a', 'answer']]),

  // ───────────────────────── Contact ─────────────────────────
  text('contact.hero.eyebrow', 'Contact', 'Page banner', 'Small label', 'Contact'),
  text('contact.hero.title', 'Contact', 'Page banner', 'Main headline', 'Come and see the school for yourself.'),
  text('contact.reception.heading', 'Contact', 'Reception', 'Heading (address, hours, phone and email come from Site-wide)', 'Reception'),
  text('contact.form.title', 'Contact', 'Message form', 'Form heading', 'Send a message'),
  text('contact.form.successTitle', 'Contact', 'Message form', 'Heading shown after a message is sent', 'Message sent.'),
  text('contact.form.successText', 'Contact', 'Message form', 'Text shown after a message is sent', 'We\'ll get back to you within 2 working days.'),
  text('contact.visit.heading', 'Contact', 'Before you visit', 'Section heading', 'Before you visit'),
  ...group('contact.visit', 'Contact', 'Before you visit', 'Tip', [
    { title: 'Walk-ins welcome', desc: 'No appointment needed for a school tour during reception hours.' },
    { title: 'Bring registration documents', desc: 'If you\'re ready to register the same day, see the document checklist on the Admissions page.' },
    { title: 'Parking on site', desc: 'Visitor parking is available at the Main Street entrance.' },
  ], [['title', 'title'], ['desc', 'description']]),

  // ───────────────────────── News ─────────────────────────
  text('news.hero.eyebrow', 'News', 'Page banner', 'Small label', 'News'),
  text('news.hero.title', 'News', 'Page banner', 'Main headline', 'What\'s happening at Nationwide.'),

  // ───────────────────────── Portal login ─────────────────────────
  text('portal.title', 'Portal login', 'Sign-in page', 'Heading', 'Student & staff portal'),
  text('portal.subtitle', 'Portal login', 'Sign-in page', 'Text under the heading', 'Grades, courses and announcements.'),
  text('portal.googleNote', 'Portal login', 'Sign-in page', 'Note under the Google button', 'New Google sign-ins wait for admin approval before they can see anything.'),
  text('portal.studentNote', 'Portal login', 'Sign-in page', 'Note at the bottom', 'Students: use the login and password given to you by the school office.'),
  text('portal.pending.title', 'Portal login', 'Waiting-for-approval screen', 'Heading', 'Waiting for approval'),
  text('portal.pending.text', 'Portal login', 'Waiting-for-approval screen', 'Message (the reception phone number is added automatically)', 'Your account is signed in, but the school office hasn\'t assigned you a role yet (student, teacher, or parent). This usually happens within a school day.'),
];

// key → original wording, used by the site until something is edited.
export const defaults = Object.fromEntries(contentFields.map((f) => [f.key, f.default]));

// Where each editor tab's page lives, for the "View this page" link.
export const pageRoutes = {
  'Site-wide': '/',
  Home: '/',
  About: '/about',
  Academics: '/academics',
  Admissions: '/admissions',
  Contact: '/contact',
  News: '/news',
  'Portal login': '/portal',
};
