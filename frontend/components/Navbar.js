//### 📄 `components/Navbar.js`
//```jsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/clubs" className="text-lg font-extrabold tracking-tight">
          Cancheal
          <span className="ml-1 text-emerald-400">App</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Link href="/explore" className="rounded-md px-3 py-1.5 text-slate-200 hover:bg-slate-800">Explorar</Link>
          <Link href="/clubs" className="rounded-md px-3 py-1.5 text-slate-200 hover:bg-slate-800">Clubes</Link>
          <Link href="/my-bookings" className="rounded-md px-3 py-1.5 text-slate-200 hover:bg-slate-800">Mis reservas</Link>
          <Link href="/logout" className="rounded-md bg-slate-800 px-3 py-1.5 text-slate-100 hover:bg-slate-700">Salir</Link>
        </div>
      </div>
    </nav>
  );
}
