import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-950/10 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 text-sm text-slate-600 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-black text-emerald-950">CanchealApp</p>
          <p className="mt-1 max-w-xl">Marketplace deportivo para descubrir clubes, elegir cancha y reservar turnos de futbol.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-bold">
          <Link href="/clubs" className="hover:text-emerald-800">Clubes</Link>
          <Link href="/explore" className="hover:text-emerald-800">Explorar</Link>
          <Link href="/login" className="hover:text-emerald-800">Ingresar</Link>
        </div>
        <p className="text-xs text-slate-500 md:col-span-2">© {year} CanchealApp. Producto demo para reservas deportivas.</p>
      </div>
    </footer>
  );
}
