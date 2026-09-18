// Placeholder crest, styled to sit comfortably next to the flyer's real
// logo. Swap the <svg> below for an <img src="/logo.svg"> once the actual
// artwork file is supplied — everything that positions/sizes it (the
// `className` prop callers pass in) will keep working unchanged.
export default function Seal({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="var(--color-purple-900)" stroke="var(--color-gold-500)" strokeWidth="2" />
      <path
        d="M32 14c-6 4-10 4-14 3 1 6 4 10 8 12-3 1-5 3-6 6 5 2 9 1 12-2 3 3 7 4 12 2-1-3-3-5-6-6 4-2 7-6 8-12-4 1-8 1-14-3Z"
        fill="var(--color-gold-500)"
      />
      <path
        d="M20 44c4-2 8-3 12-3s8 1 12 3"
        fill="none"
        stroke="var(--color-gold-500)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
