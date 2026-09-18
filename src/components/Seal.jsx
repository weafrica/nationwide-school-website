// Real school crest (public/logo.png), trimmed to its content with a
// smooth (anti-aliased) transparent background — sits cleanly on both
// light and purple surfaces without a white box or jagged edges.
export default function Seal({ className = 'h-10 w-10' }) {
  return (
    <img
      src="/logo.png"
      alt="Nationwide School for Academic Excellence crest"
      className={`${className} object-contain`}
    />
  );
}
