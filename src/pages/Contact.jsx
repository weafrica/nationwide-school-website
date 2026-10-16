import { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useContent } from '../lib/ContentContext';

// Hidden field only bots fill in. People never see it.
const trapStyle = { position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' };

export default function Contact() {
  const { get } = useContent();
  const [form, setForm] = useState({ name: '', contact: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [trap, setTrap] = useState('');
  const openedAt = useRef(Date.now());

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const visitTips = [1, 2, 3].map((n) => ({
    title: get(`contact.visit.${n}.title`),
    desc: get(`contact.visit.${n}.desc`),
  }));

  // Saves the message so the office can read it in the portal
  // (Admin → Applications & messages).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (trap) { setSent(true); return; } // a bot: pretend it worked, send nothing
    if (Date.now() - openedAt.current < 1500) {
      setError('Please check your message and press Send once more.');
      return;
    }
    setSending(true);
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      contact: form.contact.trim(),
      message: form.message.trim(),
    });
    setSending(false);
    if (insertError) {
      setError(`We couldn't send your message just now. Please try again, or call reception on ${get('site.phone1')}.`);
      return;
    }
    setSent(true);
  };

  const mapQuery = encodeURIComponent(`${get('site.address')}, Johannesburg`);

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">{get('contact.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            {get('contact.hero.title')}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-purple-900">{get('contact.reception.heading')}</h2>
            <dl className="mt-4 space-y-4 text-[15px] text-ink/80">
              <div>
                <dt className="font-semibold text-purple-900">Address</dt>
                <dd className="mt-0.5">{get('site.address')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Hours</dt>
                <dd className="mt-0.5">{get('site.hours')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Phone</dt>
                <dd className="mt-0.5">{get('site.phone1')} &middot; {get('site.phone2')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Email</dt>
                <dd className="mt-0.5">{get('site.email')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Social</dt>
                <dd className="mt-0.5">{get('site.social')}</dd>
              </div>
            </dl>

            <div className="mt-8 h-56 overflow-hidden rounded-sm border border-purple-100">
              <iframe
                title={`Map of ${get('site.address')}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              />
            </div>
          </div>

          <div>
            {sent ? (
              <div className="rounded-sm border border-purple-100 bg-lavender-50 p-8 text-center">
                <p className="font-serif text-xl text-purple-900">{get('contact.form.successTitle')}</p>
                <p className="mt-2 text-ink/70">{get('contact.form.successText')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-sm border border-purple-100 bg-white p-8">
                <h2 className="font-serif text-2xl text-purple-900">{get('contact.form.title')}</h2>
                <div aria-hidden="true" style={trapStyle}>
                  <label>Leave this empty
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                  </label>
                </div>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-ink/80">Your name</span>
                    <input
                      type="text" required minLength={2} maxLength={120}
                      value={form.name} onChange={update('name')} className="input mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink/80">Phone or email</span>
                    <input
                      type="text" required minLength={3} maxLength={200}
                      value={form.contact} onChange={update('contact')} className="input mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink/80">Message</span>
                    <textarea
                      rows={4} required minLength={5} maxLength={3000}
                      value={form.message} onChange={update('message')} className="input mt-1.5 resize-none"
                    />
                  </label>
                </div>
                {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-6 w-full rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600 disabled:opacity-60"
                >
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="bg-lavender-50 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-2xl text-purple-900">{get('contact.visit.heading')}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {visitTips.map((tip, i) => (
              <div key={i}>
                <p className="font-semibold text-purple-900">{tip.title}</p>
                <p className="mt-1 text-sm text-ink/70">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
