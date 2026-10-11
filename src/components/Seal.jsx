import { useContent } from '../lib/ContentContext';

// The school crest. The picture comes from the editable "School crest / logo"
// setting, and falls back to /logo.png until someone changes it.
export default function Seal({ className = 'h-10 w-10' }) {
  const { get } = useContent();
  return (
    <img
      src={get('site.logo') || '/logo.png'}
      alt="Nationwide School for Academic Excellence crest"
      className={`${className} object-contain`}
    />
  );
}
