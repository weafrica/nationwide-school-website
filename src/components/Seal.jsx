// Real school crest (public/logo.png), exactly as supplied — no
// re-editing of the artwork. Its background is white, so on a purple
// surface (header, footer, portal) it sits inside a white disc, the way
// a printed badge or seal normally would, rather than looking like a
// broken cutout.
export default function Seal({ className = 'h-10 w-10', onPurple = false }) {
  const img = <img src="/logo.png" alt="Nationwide School for Academic Excellence crest" className="h-full w-full object-contain" />;

  if (!onPurple) {
    return <span className={`${className} inline-block`}>{img}</span>;
  }

  return (
    <span className={`${className} inline-flex items-center justify-center rounded-full bg-white p-1`}>
      {img}
    </span>
  );
}
