import { useNavigate, useLocation } from 'react-router-dom';

// Mirrors the back affordance on the eFootball app's detail screens: a
// visible, tappable "Back" control rather than relying only on the
// browser's own back button (which isn't always obvious on mobile, and
// does nothing useful if someone arrived via a direct/shared link with
// no history to go back to).
export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  const hasHistory = (window.history.state?.idx ?? 0) > 0;

  return (
    <button
      onClick={() => (hasHistory ? navigate(-1) : navigate('/'))}
      className="group flex items-center gap-1.5 py-3 text-sm font-medium text-ink/60 hover:text-purple-900"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
        <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}
