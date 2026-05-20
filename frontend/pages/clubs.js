
//### 📄 `pages/clubs.js`
//jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import withAuth from '../components/withAuth';
import { apiFetch } from '../lib/api';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await apiFetch('/clubs');

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          router.push('login');
          return;
        }

        const data = await res.json();
        console.log("Respuesta de /clubs:", data);
        setClubs(Array.isArray(data) ? data : (data.clubs || []));

      } catch (err) {
        console.error('Error al obtener clubes:', err);
      }
    };

    fetchClubs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Clubes disponibles</h1>
          <p className="mt-2 text-slate-600">Encontra tu cancha ideal y reserva en minutos.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => (
            <article key={club.id} className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg">
              <div className="h-28 bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600" />
              <div className="p-5">
                <p className="mb-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Zona {club.zone || 'Sin zona'}
                </p>
                <h2 className="text-xl font-bold text-slate-900">{club.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{club.address}</p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="inline-block w-full rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={() => router.push(`/availability?clubId=${club.id}`)}
                    className="inline-block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
