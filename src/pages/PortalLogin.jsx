import { useState } from 'react';
import Seal from '../components/Seal';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Not wired up yet — the portal's real login runs on Supabase Auth,
    // added once the database/backend phase is built. This screen is the
    // finished UI waiting for that wiring.
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-lavender-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-sm border border-purple-100 bg-white p-8">
        <div className="flex flex-col items-center text-center">
          <Seal className="h-14 w-14" />
          <h1 className="mt-4 font-serif text-2xl text-purple-900">Student &amp; staff portal</h1>
          <p className="mt-1 text-sm text-ink/60">Grades, courses and announcements.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Email or student number</span>
            <input
              type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Password</span>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="input mt-1.5"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-sm bg-purple-900 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 rounded-sm bg-lavender-50 p-3 text-center text-xs text-ink/60">
          Portal accounts aren't issued yet — this screen is ready and waiting for the school's
          database to go live.
        </p>
      </div>
    </section>
  );
}
