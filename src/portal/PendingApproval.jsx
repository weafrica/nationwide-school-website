import Seal from '../components/Seal';
import { useContent } from '../lib/ContentContext';

export default function PendingApproval({ onSignOut }) {
  const { get } = useContent();

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-lavender-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-sm border border-purple-100 bg-white p-8 text-center">
        <Seal className="mx-auto h-12 w-auto" />
        <h1 className="mt-4 font-serif text-xl text-purple-900">{get('portal.pending.title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          {get('portal.pending.text')} Contact reception on {get('site.phone1')} if it has been longer.
        </p>
        <button
          onClick={onSignOut}
          className="mt-6 rounded-sm border border-purple-100 px-5 py-2.5 text-sm font-semibold text-purple-900 hover:bg-lavender-50"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
