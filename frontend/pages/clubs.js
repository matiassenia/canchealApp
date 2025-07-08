
//### 📄 `pages/clubs.js`
//jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import withAuth from '../components/withAuth';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs`, {
          headers: {
            authorization:  `Bearer ${localStorage.getItem('token')}`,
          }
        });

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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Clubes disponibles</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white shadow-md rounded-lg p-5 border-l-4 border-blue-500">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{club.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{club.address}</p>
              <button
                onClick={() => router.push(`/availability?clubId=${club.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full"
              >
                Ver canchas
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Clubs);