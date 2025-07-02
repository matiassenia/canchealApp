import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwtDecode from 'jwt-decode';

export default function OwnerDashboard() {
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchClubs = async (ownerId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs?ownerId=${ownerId}`);
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      console.error('Error al obtener clubes:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const decoded = jwtDecode(token);
    fetchClubs(decoded.id);
  }, []);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Panel del Dueño</h1>

      <form onSubmit={handleCreateClub} className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Agregar nuevo club</h2>

        <input
          type="text"
          placeholder="Nombre del club"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full p-3 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mb-3 w-full p-3 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Zona"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="mb-3 w-full p-3 border rounded"
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3 w-full p-3 border rounded"
        ></textarea>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear club
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white p-5 rounded shadow border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800">{club.name}</h3>
            <p className="text-sm text-gray-600">{club.address}</p>
            <p className="text-sm text-gray-500 italic">{club.zone}</p>
            <button
              className="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
              onClick={() => router.push(`/owner/fields?clubId=${club.id}`)}
            >
              Administrar canchas
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
