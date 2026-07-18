import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import withAuth from '../../components/withAuth';
import { apiFetch } from '../../lib/api';
import { getClubExperienceMeta } from '../../lib/club-experience';
import ui from '../../lib/ui';
import { FeatureBadges, PremiumSurface, RatingSummary, StateBlock } from '../../components/ui-kit';

function ClubProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clubId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    if (!id) return;

    const fetchClub = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/clubs/${clubId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Club no encontrado.');

        setClub(data);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el club.');
        setClub(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id, clubId]);

  if (loading) {
    return (
      <div className={ui.page}>
        <Navbar />
        <div className={`${ui.container} !py-8`}>
          <StateBlock title="Cargando perfil del club" description="Estamos preparando la informacion del club." />
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className={ui.page}>
        <Navbar />
        <div className={`${ui.container} !py-8`}>
          <StateBlock title={error || 'Club no encontrado'} tone="error" action={<Link href="/clubs" className={`inline-block ${ui.buttonPrimary}`}>Volver a clubes</Link>} />
        </div>
      </div>
    );
  }

  const meta = getClubExperienceMeta(club);

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/clubs" className="mb-4 inline-block text-sm font-bold text-emerald-800 hover:underline">Volver a clubes</Link>

        <section className={`overflow-hidden ${ui.card}`}>
          <div className="relative h-64 w-full bg-[linear-gradient(135deg,#064e3b,#16a34a_55%,#84cc16)] sm:h-80">
            <div className="absolute inset-0 bg-[url('/images/football-field.svg')] bg-cover bg-center opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-white/5" />
            <div className="absolute left-5 top-5 rounded-full bg-emerald-950/90 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-lime-200 shadow-lg shadow-emerald-950/20">{meta.rankingLabel}</div>
            <div className="absolute bottom-5 left-5"><RatingSummary rating={meta.ratingAverage} reviewsCount={meta.reviewsCount} /></div>
          </div>
          <div className="p-5 sm:p-6">
            <p className={ui.badge}>
              Zona {club.zone || 'Sin zona'}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{club.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{club.address || 'Direccion no informada'}</p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PremiumSurface className="p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-black text-slate-950">Descripcion</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{club.description || 'Sin descripcion disponible.'}</p>
            <div className="mt-5">
              <h2 className="mb-3 text-lg font-black text-slate-950">Amenities</h2>
              <FeatureBadges features={meta.features} />
            </div>
          </PremiumSurface>

          <PremiumSurface className="p-5 sm:p-6">
            <h2 className="text-lg font-black text-slate-950">Comentario destacado</h2>
            <span className="mt-3 inline-flex rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-900">Opinion destacada</span>
            <blockquote className="mt-3 text-sm font-semibold italic leading-6 text-emerald-950/75">“{meta.reviewPreview}”</blockquote>
          </PremiumSurface>
        </div>

        <PremiumSurface className="mt-6 p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Canchas disponibles</h2>
              <p className="text-sm text-slate-600">Elegi una cancha para consultar horarios disponibles.</p>
            </div>
            <span className="text-sm font-bold text-slate-500">{club.fields?.length || 0} disponibles</span>
          </div>

          {!club.fields || club.fields.length === 0 ? (
            <p className="text-slate-600">Este club aun no publico canchas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {club.fields.map((field) => (
                <article key={field.id} className="rounded-2xl border border-white/55 bg-white/70 p-4 shadow-sm backdrop-blur">
                  <div className="mb-3 h-28 rounded-2xl bg-[url('/images/football-field.svg')] bg-cover bg-center" />
                  <h3 className="text-base font-bold text-slate-900">{field.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Tipo: Futbol {field.type}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">Precio a consultar</p>

                  <button
                    type="button"
                    onClick={() => router.push(`/availability?fieldId=${field.id}&clubId=${club.id}`)}
                    className={`mt-3 w-full ${ui.buttonPrimary}`}
                  >
                    Reservar cancha
                  </button>
                </article>
              ))}
            </div>
          )}
        </PremiumSurface>

        <PremiumSurface className="mt-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white/45 p-4">
              <p className="text-sm font-black text-slate-950">Galeria proximamente</p>
              <p className="mt-1 text-xs text-slate-600">Espacio preparado para imagenes reales del club.</p>
            </div>
            <div className="rounded-2xl border border-dashed border-emerald-900/20 bg-white/45 p-4">
              <p className="text-sm font-black text-slate-950">Mapa proximamente</p>
              <p className="mt-1 text-xs text-slate-600">Listo para ubicacion cuando el backend exponga coordenadas.</p>
            </div>
          </div>
        </PremiumSurface>
      </div>
    </div>
  );
}

export default withAuth(ClubProfilePage);
