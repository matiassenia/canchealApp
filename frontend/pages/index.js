import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';
import { ClubCard, SkeletonCard, StateBlock } from '../components/ui-kit';

export default function Home() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeaturedClubs = async () => {
      try {
        const res = await apiFetch('/clubs?page=1&limit=3');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudieron cargar clubes.');
        setClubs(Array.isArray(data) ? data.slice(0, 3) : (data.data || []).slice(0, 3));
      } catch {
        setError('No pudimos cargar clubes destacados en este momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedClubs();
  }, []);

  return (
    <div className={ui.page}>
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-emerald-950 text-white">
          <div
            role="img"
            aria-label="Cancha de futbol iluminada con cesped verde"
            className="absolute inset-0 bg-cover bg-center opacity-95"
            style={{ backgroundImage: 'url(/images/football-field.svg)' }}
          />
          <div className={ui.heroOverlay} />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-lime-200 backdrop-blur">Marketplace deportivo</span>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Encontra tu cancha. Arma el partido.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/90">
                Reserva canchas de futbol de forma rapida, simple y segura. Clubes, horarios y reservas en una experiencia pensada para jugadores.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/clubs" className="rounded-2xl bg-lime-300 px-6 py-4 text-center text-sm font-black text-emerald-950 shadow-lg shadow-lime-950/20 transition hover:bg-lime-200">
                  Buscar canchas
                </Link>
                <Link href="/owner/dashboard" className="rounded-2xl border border-white/25 bg-white/10 px-6 py-4 text-center text-sm font-black text-white backdrop-blur transition hover:bg-white/20">
                  Publicar mi club
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              <div className="rounded-[1.5rem] bg-white p-5 text-slate-950 shadow-xl">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">Reserva rapida</p>
                <div className="mt-4 grid gap-3">
                  {['Busca un club cercano', 'Elegi cancha y horario', 'Confirma tu reserva'].map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-emerald-950/10 bg-emerald-50 p-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-800 text-sm font-black text-white">{index + 1}</span>
                      <span className="font-bold text-slate-800">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Disponibilidad clara', 'Consulta horarios publicados por cada club antes de reservar.'],
              ['Experiencia mobile', 'Busca, selecciona y confirma desde cualquier dispositivo.'],
              ['Gestion para owners', 'Los propietarios pueden administrar clubes, canchas y disponibilidad.']
            ].map(([title, text]) => (
              <article key={title} className={`${ui.card} p-6`}>
                <h2 className="text-lg font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className={ui.badgeSuccess}>Clubes disponibles</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Empeza por un club</h2>
              <p className="mt-2 text-sm text-slate-600">Datos reales obtenidos desde la API de CanchealApp.</p>
            </div>
            <Link href="/clubs" className={ui.buttonSecondary}>Ver todos</Link>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
          ) : error ? (
            <StateBlock title="No pudimos cargar clubes" description={error} tone="error" />
          ) : clubs.length === 0 ? (
            <StateBlock title="Todavia no hay clubes disponibles" description="Cuando se publiquen clubes reales, apareceran aca." action={<Link href="/owner/dashboard" className={ui.buttonPrimary}>Publicar mi club</Link>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">{clubs.map((club) => <ClubCard key={club.id} club={club} />)}</div>
          )}
        </section>
      </main>
    </div>
  );
}
