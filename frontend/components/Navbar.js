import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const decodeToken = (token) => {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const navLinkClass = (active) =>
  `rounded-full px-3 py-2 text-sm font-bold transition ${
    active
      ? 'bg-lime-300 text-emerald-950'
      : 'text-emerald-50 hover:bg-white/10 hover:text-white'
  }`;

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState({ authenticated: false, role: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;
    setSession({ authenticated: Boolean(token), role: decoded?.role || localStorage.getItem('role') });
  }, []);

  const links = [
    { href: '/', label: 'Inicio', public: true },
    { href: '/explore', label: 'Explorar', auth: true },
    { href: '/clubs', label: 'Clubes', auth: true },
    { href: '/my-bookings', label: 'Mis reservas', auth: true }
  ];

  if (session.role === 'OWNER' || session.role === 'ADMIN') {
    links.push({ href: '/owner/dashboard', label: 'Panel owner', auth: true });
  }

  const visibleLinks = links.filter((link) => link.public || session.authenticated || !link.auth);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-emerald-950/95 text-white shadow-lg shadow-emerald-950/10 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight" aria-label="Ir al inicio de CanchealApp">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-lime-300 text-emerald-950 shadow-sm">CA</span>
          <span>Cancheal<span className="text-lime-300">App</span></span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-xl border border-white/15 px-3 py-2 text-sm font-bold md:hidden"
          aria-expanded={menuOpen}
          aria-label="Abrir menu de navegacion"
        >
          Menu
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(router.pathname === link.href)}>
              {link.label}
            </Link>
          ))}
          {session.authenticated ? (
            <Link href="/logout" className="ml-2 rounded-full bg-white px-3 py-2 text-sm font-black text-emerald-950 hover:bg-lime-100">Salir</Link>
          ) : (
            <>
              <Link href="/login" className="ml-2 rounded-full px-3 py-2 text-sm font-bold text-white hover:bg-white/10">Ingresar</Link>
              <Link href="/register" className="rounded-full bg-lime-300 px-3 py-2 text-sm font-black text-emerald-950 hover:bg-lime-200">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          <div className="grid gap-2 pt-3">
            {visibleLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(router.pathname === link.href)} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {session.authenticated ? (
              <Link href="/logout" className="rounded-full bg-white px-3 py-2 text-center text-sm font-black text-emerald-950">Salir</Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="rounded-full border border-white/20 px-3 py-2 text-center text-sm font-bold text-white">Ingresar</Link>
                <Link href="/register" className="rounded-full bg-lime-300 px-3 py-2 text-center text-sm font-black text-emerald-950">Crear cuenta</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
