
//### 📄 `pages/clubs.js`
//jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import withAuth from '../components/withAuth';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await apiFetch('/clubs');

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const data = await res.json();
        setClubs(Array.isArray(data) ? data : (data.clubs || []));

      } catch (err) {
        console.error('Error al obtener clubes:', err);
      }
    };

    fetchClubs();
  }, [router]);

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <div className="mb-8 text-center">
          <span className={ui.badgeSuccess}>Descubrimiento local</span>
          <h1 className={ui.title}>Clubes disponibles</h1>
          <p className={ui.subtitle}>Encontra tu cancha ideal y reserva en minutos.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => (
            <article key={club.id} className={`overflow-hidden ${ui.card} ${ui.cardHover}`}>
              <div className="h-28 bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600" />
              <div className="p-5">
                <p className={ui.badge}>
                  Zona {club.zone || 'Sin zona'}
                </p>
                <h2 className="text-xl font-bold text-slate-900">{club.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{club.address}</p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/clubs/${club.id}`}
                    className={`inline-block w-full text-center ${ui.buttonPrimary}`}
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={() => router.push(`/availability?clubId=${club.id}`)}
                    className={`inline-block w-full ${ui.buttonSecondary}`}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Clubs);
