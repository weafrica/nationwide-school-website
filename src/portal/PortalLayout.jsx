import { useAuth } from '../lib/AuthContext';

export default function PortalLayout({ eyebrow, title, children }) {
  const { profile, signOut } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-purple-100 pb-6">
        <div>
          <p className="font-serif text-sm text-gold-600">{eyebrow}</p>
          <h1 className="mt-1 font-serif text-3xl text-purple-900">{title}</h1>
          <p className="mt-1 text-sm text-ink/60">Signed in as {profile?.full_name}</p>
        </div>
        <button
          onClick={signOut}
          className="rounded-sm border border-purple-100 px-4 py-2 text-sm font-semibold text-purple-900 hover:bg-lavender-50"
        >
          Sign out
        </button>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
