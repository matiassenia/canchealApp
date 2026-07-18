import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { apiFetch } from '../../lib/api';
import ui from '../../lib/ui';
import { KpiCard, PremiumSurface, PageHeader, StateBlock } from '../../components/ui-kit';

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

  const fetchClubs = async () => {
    try {
      const res = await apiFetch('/clubs/mine');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los clubes.');
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
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
    fetchClubs().finally(() => setLoading(false));
  }, [router]);

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
      fetchClubs();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingClub(false);
    }
  };

  const activeFields = clubs.reduce((acc, club) => acc + (club.fields?.length || 0), 0);

  const statCards = [
    { label: 'Clubes publicados', value: clubs.length, hint: 'Datos reales de tus clubes' },
    { label: 'Canchas activas', value: activeFields, hint: 'Total configurado' }
  ];

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <PageHeader eyebrow="Panel operativo" title="Panel del club" description={`${owner?.role === 'OWNER' ? 'Vista para propietarios' : 'Vista operativa'} para crear clubes, cargar canchas y gestionar disponibilidad.`} />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {statCards.map((stat, index) => (
            <KpiCard key={stat.label} {...stat} accent={index % 2 ? 'emerald' : 'lime'} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleCreateClub} className={`${ui.card} p-6 lg:col-span-1`}>
            <h2 className="text-lg font-bold text-slate-900">Agregar nuevo club</h2>
            <p className="mb-4 mt-1 text-sm text-slate-600">Publica un nuevo club y comienza a recibir reservas.</p>

            <label htmlFor="club-name" className={ui.label}>Nombre del club</label>
            <input
              id="club-name"
              type="text"
              placeholder="Nombre del club"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${ui.input} mb-3`}
              required
            />
            <label htmlFor="club-address" className={ui.label}>Direccion</label>
            <input
              id="club-address"
              type="text"
              placeholder="Direccion"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${ui.input} mb-3`}
              required
            />
            <label htmlFor="club-zone" className={ui.label}>Zona</label>
            <input
              id="club-zone"
              type="text"
              placeholder="Zona"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className={`${ui.input} mb-3`}
            />
            <label htmlFor="club-description" className={ui.label}>Descripcion</label>
            <textarea
              id="club-description"
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

          <PremiumSurface className="p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Mis clubes</h2>
              <span className="text-sm text-slate-500">{clubs.length} registrados</span>
            </div>

            {loading ? (
              <p className="text-sm font-semibold text-slate-600">Cargando clubes...</p>
            ) : clubs.length === 0 ? (
              <StateBlock title="Aun no tenes clubes creados" description="Crea tu primer club para empezar a gestionar disponibilidad y reservas." />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {clubs.map((club) => (
                  <article key={club.id} className="group rounded-2xl border border-white/55 bg-white/65 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl">
                    <div className="mb-3 h-24 rounded-2xl bg-[url('/images/football-field.svg')] bg-cover bg-center" />
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{club.name}</h3>
                      <span className={ui.badgeSuccess}>Activo</span>
                    </div>
                    <p className="text-sm text-slate-600">{club.address}</p>
                    <p className="mt-1 text-xs text-slate-500">Zona {club.zone || 'Sin zona'}</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className={`w-full ${ui.buttonPrimary}`}
                        onClick={() => router.push(`/owner/club/${club.id}`)}
                      >
                        Gestionar club
                      </button>
                      <button
                        type="button"
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
          </PremiumSurface>
        </div>

        <PremiumSurface className="mt-6 p-6">
          <h2 className="text-lg font-bold text-slate-900">Reservas operativas</h2>
          <p className="mt-1 text-sm text-slate-600">Los endpoints actuales no exponen reservas por owner. Se mantiene este espacio listo para conectar datos reales en una fase posterior.</p>
        </PremiumSurface>
      </div>
    </div>
  );
}
