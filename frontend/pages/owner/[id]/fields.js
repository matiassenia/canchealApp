import { useRouter } from 'next/router';
import { useState } from 'react';

export default function AddFieldPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);



  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  if (!token) {
    setError('Token no encontrado. Iniciá sesión nuevamente.');
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, type, imageUrl, clubId: parseInt(id) })
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);

      if (!res.ok) {
        console.error('❌ Error desde el backend:', data);
        throw new Error(data.error || 'Error al crear la cancha');
      }

      console.log('✅ Cancha creada correctamente:', data);
      setSuccess('Cancha creada correctamente');
      setName('');
      setType('');
      setImageUrl('');
      setError(null);

    } catch (jsonErr) {
      console.error('❌ La respuesta no es JSON válido:', text);
      setError('Respuesta inesperada del servidor (no es JSON válido)');
    }

  } catch (err) {
    console.error('❌ Error de red o fetch:', err);
    setError('Error de conexión con el servidor');
  }
};



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Agregar Cancha al Club #{id}</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Nombre de la cancha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Tipo (Fútbol 5, Fútbol 11, etc.)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="URL de imagen (opcional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Crear cancha
        </button>
      </form>
    </div>
  );
}
