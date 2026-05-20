import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import withAuth from '../../components/withAuth';
import { apiFetch } from '../../lib/api';

const AMENITIES_PLACEHOLDER = [
  'Iluminacion nocturna',
  'Vestuarios',
  'Estacionamiento',
  'Buffet'
];

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
        const res = await apiFetch('/clubs');
        const data = await res.json();
        const clubs = Array.isArray(data) ? data : [];
        const found = clubs.find((item) => item.id === clubId);

        if (!found) {
          setError('Club no encontrado.');
          setClub(null);
          return;
        }

        setClub(found);
      } catch (err) {
        setError('No se pudo cargar el club.');
        setClub(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id, clubId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-slate-600">Cargando perfil del club...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="mb-4 text-red-600">{error || 'Club no encontrado.'}</p>
          <Link href="/clubs" className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">
            Volver a clubes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Link href="/clubs" className="mb-4 inline-block text-sm font-medium text-blue-700 hover:underline">
          {'<- Volver a clubes'}
        </Link>

        <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="h-44 w-full bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 sm:h-56" />
          <div className="p-5 sm:p-6">
            <p className="mb-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Zona {club.zone || 'Sin zona'}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{club.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{club.address || 'Direccion no informada'}</p>
            <p className="mt-3 text-slate-700">{club.description || 'Sin descripcion disponible.'}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Servicios</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {AMENITIES_PLACEHOLDER.map((amenity) => (
              <span key={amenity} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {amenity}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Canchas</h2>
            <span className="text-sm text-slate-500">{club.fields?.length || 0} disponibles</span>
          </div>

          {!club.fields || club.fields.length === 0 ? (
            <p className="text-slate-600">Este club aun no publico canchas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {club.fields.map((field) => (
                <article key={field.id} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-base font-bold text-slate-900">{field.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Tipo: Futbol {field.type}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">Desde $12.000 / hora</p>

                  <button
                    onClick={() => router.push(`/availability?fieldId=${field.id}&clubId=${club.id}`)}
                    className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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
