import { Link } from 'react-router-dom';
import Seal from './Seal';

export default function Footer() {
  return (
    <footer className="bg-purple-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Seal className="h-14 w-14" onPurple />
              <span className="font-serif text-base leading-tight">
                Nationwide School
                <span className="block text-[11px] font-sans text-gold-500">for Academic Excellence</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-white/60">
              GDE EMIS No. 700400454 &middot; Umalusi Accreditation No. 18 SCH0100567PA
            </p>
          </div>

          <div>
            <h3 className="font-serif text-sm text-gold-500">Visit us</h3>
            <p className="mt-3 text-sm text-white/75">
              322 Main Street<br />
              Jeppestown
            </p>
            <p className="mt-3 text-sm text-white/75">Reception: 7am – 3pm, Mon–Fri</p>
          </div>

          <div>
            <h3 className="font-serif text-sm text-gold-500">Get in touch</h3>
            <p className="mt-3 text-sm text-white/75">
              <a href="tel:+27116189822" className="hover:text-white">011 618 9822</a><br />
              <a href="tel:+27712834310" className="hover:text-white">071 283 4310</a>
            </p>
            <p className="mt-3 text-sm text-white/75">
              <a href="mailto:nationwideschools@gmail.com" className="hover:text-white">
                nationwideschools@gmail.com
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
                <a href="https://facebook.com" className="hover:text-white">Facebook</a>
                {' · '}
                <a href="https://instagram.com" className="hover:text-white">Instagram</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Nationwide School for Academic Excellence. All rights reserved.</p>
          <p>Primary and High School &middot; Grade 0–12</p>
        </div>
      </div>
    </footer>
  );
}
