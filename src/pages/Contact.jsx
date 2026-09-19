import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="bg-purple-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-serif text-sm text-gold-500">Contact</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            Come and see the school for yourself.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-purple-900">Reception</h2>
            <dl className="mt-4 space-y-4 text-[15px] text-ink/80">
              <div>
                <dt className="font-semibold text-purple-900">Address</dt>
                <dd className="mt-0.5">322 Main Street, Jeppestown</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Hours</dt>
                <dd className="mt-0.5">7am – 3pm, Monday to Friday</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Phone</dt>
                <dd className="mt-0.5">011 618 9822 &middot; 071 283 4310</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Email</dt>
                <dd className="mt-0.5">nationwideschools@gmail.com</dd>
              </div>
              <div>
                <dt className="font-semibold text-purple-900">Social</dt>
                <dd className="mt-0.5">@nationwide_schools &middot; @nationwideschool</dd>
              </div>
            </dl>

            <div className="mt-8 h-56 overflow-hidden rounded-sm border border-purple-100">
              <iframe
                title="Map of 322 Main Street, Jeppestown"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=322+Main+Street,+Jeppestown,+Johannesburg&output=embed"
              />
            </div>
          </div>

          <div>
            {sent ? (
              <div className="rounded-sm border border-purple-100 bg-lavender-50 p-8 text-center">
                <p className="font-serif text-xl text-purple-900">Message sent.</p>
                <p className="mt-2 text-ink/70">We'll get back to you within 2 working days.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="rounded-sm border border-purple-100 bg-white p-8"
              >
                <h2 className="font-serif text-2xl text-purple-900">Send a message</h2>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-ink/80">Your name</span>
                    <input type="text" required className="input mt-1.5" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink/80">Phone or email</span>
                    <input type="text" required className="input mt-1.5" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink/80">Message</span>
                    <textarea rows={4} required className="input mt-1.5 resize-none" />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-sm bg-gold-500 px-6 py-3 font-semibold text-purple-900 hover:bg-gold-600"
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="bg-lavender-50 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-2xl text-purple-900">Before you visit</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-purple-900">Walk-ins welcome</p>
              <p className="mt-1 text-sm text-ink/70">No appointment needed for a school tour during reception hours.</p>
            </div>
            <div>
              <p className="font-semibold text-purple-900">Bring registration documents</p>
              <p className="mt-1 text-sm text-ink/70">If you're ready to register the same day, see the document checklist on the Admissions page.</p>
            </div>
            <div>
              <p className="font-semibold text-purple-900">Parking on site</p>
              <p className="mt-1 text-sm text-ink/70">Visitor parking is available at the Main Street entrance.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
