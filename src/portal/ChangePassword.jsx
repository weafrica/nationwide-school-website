import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function ChangePassword() {
  const { refreshProfile, user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Use at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setBusy(true);
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) { setBusy(false); setError(pwError.message); return; }

    await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
    await refreshProfile();
    setBusy(false);
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-lavender-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-sm border border-purple-100 bg-white p-8">
        <h1 className="font-serif text-2xl text-purple-900">Choose a new password</h1>
        <p className="mt-1 text-sm text-ink/60">
          You're using a temporary password from the school office. Set your own before continuing.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink/80">New password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Confirm new password</span>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input mt-1.5" />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit" disabled={busy}
            className="w-full rounded-sm bg-purple-900 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {busy ? 'Saving\u2026' : 'Set password and continue'}
          </button>
        </form>
      </div>
    </section>
  );
}
