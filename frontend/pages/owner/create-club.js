import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateClub() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, address, zone, description })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el club');

      router.push('/owner/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Club</h1>

        <input
          type="text"
          placeholder="Nombre del Club"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full p-3 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mb-4 w-full p-3 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Zona (Ej: San Miguel, Devoto)"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="mb-4 w-full p-3 border rounded-lg"
          required
        />
        <textarea
          placeholder="Descripción del club"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full p-3 border rounded-lg"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 text-white w-full py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Creando...' : 'Crear Club'}
        </button>
      </form>
    </div>
  );
}
