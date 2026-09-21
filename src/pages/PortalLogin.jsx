import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seal from '../components/Seal';
import { useAuth } from '../lib/AuthContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function PortalLogin() {
  const { signInWithGoogle, signInWithPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: signInError } = await signInWithPassword(email, password);
    setBusy(false);
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Incorrect email/username or password.'
        : signInError.message);
      return;
    }
    navigate('/portal/dashboard');
  };

  if (!isSupabaseConfigured) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-lavender-50 px-6 py-16">
        <div className="w-full max-w-sm rounded-sm border border-purple-100 bg-white p-8 text-center">
          <Seal className="mx-auto h-14 w-auto" />
          <h1 className="mt-4 font-serif text-2xl text-purple-900">Portal coming soon</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            The student and staff portal is being set up. Check back soon, or contact the
            school office at 011 618 9822 in the meantime.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-lavender-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-sm border border-purple-100 bg-white p-8">
        <div className="flex flex-col items-center text-center">
          <Seal className="h-14 w-auto" />
          <h1 className="mt-4 font-serif text-2xl text-purple-900">Student &amp; staff portal</h1>
          <p className="mt-1 text-sm text-ink/60">Grades, courses and announcements.</p>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-sm border border-purple-100 bg-white px-6 py-3 font-semibold text-ink/80 hover:bg-lavender-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-3 text-center text-xs text-ink/50">
          New Google sign-ins wait for admin approval before they can see anything.
        </p>

        <div className="my-6 flex items-center gap-3 text-xs text-ink/40">
          <div className="h-px flex-1 bg-purple-100" />
          or
          <div className="h-px flex-1 bg-purple-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Email or student login</span>
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

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit" disabled={busy}
            className="w-full rounded-sm bg-purple-900 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {busy ? 'Signing in\u2026' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/50">
          Students: use the login and password given to you by the school office.
        </p>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
