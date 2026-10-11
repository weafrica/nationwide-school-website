import { Link } from 'react-router-dom';
import Seal from './Seal';
import { useContent } from '../lib/ContentContext';

// "011 618 9822" -> "tel:+27116189822"
const telLink = (number) => `tel:${number.replace(/\s+/g, '').replace(/^0/, '+27')}`;

export default function Footer() {
  const { get } = useContent();
  const addressLines = get('site.address').split(',').map((line) => line.trim()).filter(Boolean);
  const phones = [get('site.phone1'), get('site.phone2')].filter(Boolean);

  return (
    <footer className="bg-purple-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Seal className="h-14 w-auto" />
              <span className="font-serif text-base leading-tight">
                {get('site.name')}
                <span className="block text-[11px] font-sans text-gold-500">{get('site.tagline')}</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-white/60">{get('site.accreditation')}</p>
          </div>

          <div>
            <h3 className="font-serif text-sm text-gold-500">Visit us</h3>
            <p className="mt-3 text-sm text-white/75">
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < addressLines.length - 1 && <br />}
                </span>
              ))}
            </p>
            <p className="mt-3 text-sm text-white/75">Reception: {get('site.hours')}</p>
          </div>

          <div>
            <h3 className="font-serif text-sm text-gold-500">Get in touch</h3>
            <p className="mt-3 text-sm text-white/75">
              {phones.map((phone, i) => (
                <span key={phone}>
                  <a href={telLink(phone)} className="hover:text-white">{phone}</a>
                  {i < phones.length - 1 && <br />}
                </span>
              ))}
            </p>
            <p className="mt-3 text-sm text-white/75">
              <a href={`mailto:${get('site.email')}`} className="hover:text-white">
                {get('site.email')}
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-serif text-sm text-gold-500">Quick links</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li><Link to="/admissions" className="hover:text-white">Apply for 2026</Link></li>
              <li><Link to="/academics" className="hover:text-white">Academic programme</Link></li>
              <li><Link to="/portal" className="hover:text-white">Student &amp; staff portal</Link></li>
              <li>
                <a href={get('site.facebook')} className="hover:text-white">Facebook</a>
                {' · '}
                <a href={get('site.instagram')} className="hover:text-white">Instagram</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {get('site.name')} {get('site.tagline')}. All rights reserved.</p>
          <p>{get('site.footerNote')}</p>
        </div>
      </div>
    </footer>
  );
}
