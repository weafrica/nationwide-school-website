import { Link } from 'react-router-dom';

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-[15px] font-semibold transition-colors';

const variants = {
  primary: 'bg-gold-500 text-purple-900 hover:bg-gold-600',
  outline: 'border border-white/40 text-white hover:bg-white/10',
  dark: 'bg-purple-900 text-white hover:bg-purple-700',
  ghost: 'text-purple-900 hover:text-purple-600',
};

export default function Button({ to, href, variant = 'primary', children, className = '', ...rest }) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}
