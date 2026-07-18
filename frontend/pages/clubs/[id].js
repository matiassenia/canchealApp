import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import withAuth from '../../components/withAuth';
import { apiFetch } from '../../lib/api';
import ui from '../../lib/ui';
import { PageHeader, StateBlock } from '../../components/ui-kit';

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

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/clubs" className="mb-4 inline-block text-sm font-bold text-emerald-800 hover:underline">Volver a clubes</Link>

        <section className={`overflow-hidden ${ui.card}`}>
          <div className="relative h-48 w-full bg-[linear-gradient(135deg,#064e3b,#16a34a_55%,#84cc16)] sm:h-64">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:auto,46px_46px]" />
          </div>
          <div className="p-5 sm:p-6">
            <p className={ui.badge}>
              Zona {club.zone || 'Sin zona'}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{club.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{club.address || 'Direccion no informada'}</p>
            <p className="mt-3 text-slate-700">{club.description || 'Sin descripcion disponible.'}</p>
          </div>
        </section>

        <section className={`mt-6 ${ui.card} p-5 sm:p-6`}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader title="Canchas del club" description="Elegí una cancha para consultar horarios disponibles." />
            <span className="text-sm text-slate-500">{club.fields?.length || 0} disponibles</span>
          </div>

          {!club.fields || club.fields.length === 0 ? (
            <p className="text-slate-600">Este club aun no publico canchas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {club.fields.map((field) => (
                <article key={field.id} className="rounded-2xl border border-emerald-950/10 bg-emerald-50/50 p-4 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">{field.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Tipo: Futbol {field.type}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">Precio a consultar</p>

                  <button
                    onClick={() => router.push(`/availability?fieldId=${field.id}&clubId=${club.id}`)}
                    className={`mt-3 w-full ${ui.buttonPrimary}`}
                  >
                    Reservar cancha
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default withAuth(ClubProfilePage);
