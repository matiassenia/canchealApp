
//### 📄 `pages/clubs.js`
//jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import withAuth from '../components/withAuth';
import { apiFetch } from '../lib/api';
import { RANKING_POOL } from '../lib/club-experience';
import ui from '../lib/ui';
import { ClubCard, PageHeader, Pagination, SkeletonCard, StateBlock } from '../components/ui-kit';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/clubs?page=${page}&limit=12`);

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const data = await res.json();
        setClubs(Array.isArray(data) ? data : (data.data || data.clubs || []));
        setPagination(data.pagination || null);

      } catch {
        setError('No se pudieron cargar los clubes. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [router, page]);

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <PageHeader
          eyebrow="Descubrimiento local"
          title="Clubes disponibles"
          description="Encontra clubes reales, revisa sus canchas y reserva tu proximo turno."
          actions={<Link href="/explore" className={ui.buttonSecondary}>Explorar con filtros</Link>}
        />

        <section className="mb-6 grid gap-3 sm:grid-cols-4">
          {RANKING_POOL.map((ranking) => (
            <div key={ranking} className="rounded-2xl border border-white/55 bg-white/55 px-4 py-3 text-sm font-black text-emerald-950 shadow-sm backdrop-blur-xl">
              {ranking}
            </div>
          ))}
        </section>

        {pagination && !loading && !error && (
          <p className="mb-4 rounded-full bg-white/55 px-4 py-2 text-center text-sm font-bold text-emerald-950 shadow-sm backdrop-blur">
            Mostrando {clubs.length} de {pagination.total} clubes
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <SkeletonCard key={item} />)}</div>
        ) : error ? (
          <StateBlock title="No se pudieron cargar los clubes" description={error} tone="error" action={<button type="button" onClick={() => setPage(1)} className={ui.buttonSecondary}>Intentar nuevamente</button>} />
        ) : clubs.length === 0 ? (
          <StateBlock title="No hay clubes disponibles por el momento" description="Cuando los propietarios publiquen clubes, apareceran en este listado." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => <ClubCard key={club.id} club={club} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(Clubs);
