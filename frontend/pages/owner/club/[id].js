// 📄 pages/owner/club/[id].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FieldAvailabilitySelector from '../../../components/FieldAvailabilitySelector';

export default function ClubDashboard() {
  const router = useRouter();
  const { id: clubId } = router.query;

  const [fields, setFields] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [image, setImage] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchFields = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fields/${clubId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    setFields(data);
  };

  useEffect(() => {
    if (!clubId) return;

    const fetchFieldsAndAvailability = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fields/${clubId}`);
      const data = await res.json();
      setFields(data);

      // Precarga la disponibilidad del primer campo
      if (data[0]) {
        const availRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/${data[0].id}`);
        const avail = await availRes.json();
        setAvailability(avail);
      }
    };

    fetchFieldsAndAvailability();
  }, [clubId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('clubId', clubId);
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cancha');

      // Enviar disponibilidad
      await Promise.all(
        availability.map((slot) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...slot, fieldId: data.id })
          })
        )
      );

      setSuccess('Cancha creada correctamente');
      setName('');
      setType('');
      setImage(null);
      setAvailability([]);
      fetchFields();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-center">Panel de Club</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Crear nueva cancha</h2>

        <input
          type="text"
          placeholder="Nombre de la cancha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="">Seleccionar tipo de cancha</option>
          <option value="5">Fútbol 5</option>
          <option value="7">Fútbol 7</option>
          <option value="8">Fútbol 8</option>
          <option value="11">Fútbol 11</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full mb-4"
        />

        {/* Calendario de disponibilidad */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Seleccionar disponibilidad:</label>
          <FieldAvailabilitySelector onChange={setAvailability} />
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear cancha
        </button>
      </form>

      <div className="mt-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Canchas creadas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">{field.name}</h3>
              <p className="text-gray-600">Tipo: {field.type}</p>
              {field.imageUrl && (
                <img src={field.imageUrl} alt={field.name} className="w-full h-40 object-cover mt-2 rounded" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
