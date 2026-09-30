import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Seal from './Seal';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/about', label: 'About' },
  { to: '/academics', label: 'Academics' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-purple-100 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Seal className="h-12 w-auto shrink-0" />
          <span className="font-serif text-lg leading-tight text-purple-900">
            Nationwide School
            <span className="block text-[11px] font-sans font-medium tracking-wide text-gold-600">
              for Academic Excellence
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[15px] font-medium transition-colors ${
                  isActive ? 'text-purple-900' : 'text-ink/70 hover:text-purple-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <ThemeToggle />
          <Link
            to="/portal"
            className="rounded-sm bg-purple-900 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-purple-700"
          >
            Portal login
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 top-0 h-[2px] w-6 bg-purple-900 transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`}
              />
              <span className={`absolute left-0 top-[7px] h-[2px] w-6 bg-purple-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span
                className={`absolute left-0 top-[14px] h-[2px] w-6 bg-purple-900 transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-purple-100 px-6 py-4 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-sm px-2 py-2.5 text-[15px] font-medium text-ink/80 hover:bg-lavender-50"
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/portal"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-sm bg-purple-900 px-2 py-2.5 text-center text-[15px] font-semibold text-white"
          >
            Portal login
          </Link>
        </nav>
      )}
    </header>
  );
}
