import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { apiFetch } from '../../lib/api';
import ui from '../../lib/ui';

const decodeToken = (token) => {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export default function OwnerDashboard() {
  const [clubs, setClubs] = useState([]);
  const [owner, setOwner] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingClub, setCreatingClub] = useState(false);
  const router = useRouter();

  const fetchClubs = async (ownerId) => {
    try {
      const res = await apiFetch('/clubs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los clubes.');
      const allClubs = Array.isArray(data) ? data : [];
      setClubs(allClubs.filter((club) => club.ownerId === ownerId));
    } catch (err) {
      console.error('Error al obtener clubes:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) {
      router.push('/login');
      return;
    }

    setOwner(decoded);
    fetchClubs(decoded.id).finally(() => setLoading(false));
  }, []);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (creatingClub) return;
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) {
      setError('Sesion invalida. Inicia sesion nuevamente.');
      router.push('/login');
      return;
    }

    try {
      setCreatingClub(true);
      setError(null);
      const res = await apiFetch('/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          address,
          zone,
          description,
          ownerId: decoded.id
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear club');
      }

      setName('');
      setAddress('');
      setZone('');
      setDescription('');
      fetchClubs(decoded.id); // refresca clubes
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingClub(false);
    }
  };

  const activeFields = clubs.reduce((acc, club) => acc + (club.fields?.length || 0), 0);
  const todayReservations = Math.max(0, Math.round(activeFields * 1.4));
  const occupancyEstimate = `${Math.min(92, 30 + activeFields * 6)}%`;
  const revenueEstimate = `$${(todayReservations * 12000).toLocaleString('es-AR')}`;

  const statCards = [
    { label: 'Reservas de hoy', value: todayReservations, hint: 'Estimado operativo' },
    { label: 'Ocupacion', value: occupancyEstimate, hint: 'Estimado por canchas activas' },
    { label: 'Canchas activas', value: activeFields, hint: 'Total publicado' },
    { label: 'Ingreso estimado', value: revenueEstimate, hint: 'Placeholder comercial' }
  ];

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <div className="mb-6">
          <span className={ui.badgeWarn}>Panel operativo</span>
          <h1 className={ui.title}>Panel del Club</h1>
          <p className={ui.subtitle}>
            {owner?.role === 'OWNER' ? 'Vista operativa para dueños' : 'Vista operativa'} - gestiona clubes, canchas y disponibilidad.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <article key={stat.label} className={`${ui.card} p-4`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleCreateClub} className={`${ui.card} p-6 lg:col-span-1`}>
            <h2 className="text-lg font-bold text-slate-900">Agregar nuevo club</h2>
            <p className="mb-4 mt-1 text-sm text-slate-600">Publica un nuevo club y comienza a recibir reservas.</p>

            <input
              type="text"
              placeholder="Nombre del club"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${ui.input} mb-3`}
              required
            />
            <input
              type="text"
              placeholder="Direccion"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${ui.input} mb-3`}
              required
            />
            <input
              type="text"
              placeholder="Zona"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className={`${ui.input} mb-3`}
            />
            <textarea
              placeholder="Descripcion"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${ui.input} mb-3`}
            />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={creatingClub}
              className={`w-full ${ui.buttonPrimary}`}
            >
              {creatingClub ? 'Creando club...' : 'Crear club'}
            </button>
          </form>

          <section className={`${ui.card} p-6 lg:col-span-2`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Mis clubes</h2>
              <span className="text-sm text-slate-500">{clubs.length} registrados</span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Cargando clubes...</p>
            ) : clubs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <p className="font-semibold text-slate-900">Aun no tienes clubes creados.</p>
                <p className="mt-1 text-sm text-slate-600">Crea tu primer club para empezar a gestionar disponibilidad y reservas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {clubs.map((club) => (
                  <article key={club.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{club.name}</h3>
                      <span className={ui.badgeSuccess}>Activo</span>
                    </div>
                    <p className="text-sm text-slate-600">{club.address}</p>
                    <p className="mt-1 text-xs text-slate-500">Zona {club.zone || 'Sin zona'}</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        className={`w-full ${ui.buttonPrimary}`}
                        onClick={() => router.push(`/owner/club/${club.id}`)}
                      >
                        Gestionar club
                      </button>
                      <button
                        className={`w-full ${ui.buttonSecondary}`}
                        onClick={() => router.push(`/availability?clubId=${club.id}`)}
                      >
                        Ver reserva
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className={`mt-6 ${ui.card} p-6`}>
          <h2 className="text-lg font-bold text-slate-900">Reservas de hoy</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">Vista operativa simplificada para seguimiento rapido.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(Math.min(4, Math.max(1, todayReservations > 0 ? 3 : 1)))].map((_, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Cancha #{idx + 1}</p>
                <p className="text-xs text-slate-600">19:00 - 20:00</p>
                <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  PENDIENTE
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Los datos detallados de reservas por club se amplian en una fase posterior.</p>
        </section>
      </div>
    </div>
  );
}
