import Seal from '../components/Seal';

export default function PendingApproval({ onSignOut }) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-lavender-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-sm border border-purple-100 bg-white p-8 text-center">
        <Seal className="mx-auto h-12 w-auto" />
        <h1 className="mt-4 font-serif text-xl text-purple-900">Waiting for approval</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Your account is signed in, but the school office hasn't assigned you a role yet
          (student, teacher, or parent). This usually happens within a school day — contact
          reception at 011 618 9822 if it's been longer.
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
