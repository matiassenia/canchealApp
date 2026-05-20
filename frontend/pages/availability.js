
// `pages/availability.js`
//
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export default function Availability() {
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [availability, setAvailability] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await apiFetch('/fields');
        const data = await res.json();
        setFields(data);
      } catch (err) {
        console.error('Error fetching fields:', err);
      }
    };

    fetchFields();
  }, []);

  const handleCheckAvailability = async () => {
    if (!selectedFieldId) return;
    try {
      const res = await apiFetch(`/availability/${selectedFieldId}`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  const handleBooking = async (slot) => {
    try {
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const startAt = new Date(`${localDate}T${slot.startTime}:00`).toISOString();
      const endAt = new Date(`${localDate}T${slot.endTime}:00`).toISOString();

      const res = await apiFetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fieldId: selectedFieldId,
          startAt,
          endAt
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reservar');
      setMessage('✅ Reserva confirmada.');
    } catch (err) {
      console.error('Error booking:', err);
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Disponibilidad de Canchas</h1>

        <select
          value={selectedFieldId}
          onChange={(e) => setSelectedFieldId(e.target.value)}
          className="mb-4 p-2 border rounded w-full max-w-md"
        >
          <option value="">Seleccionar cancha</option>
          {fields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name} - {field.type}
            </option>
          ))}
        </select>

        <button
          onClick={handleCheckAvailability}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
        >
          Ver disponibilidad
        </button>

        {message && <p className="mb-4 text-sm font-semibold text-center">{message}</p>}

        <ul className="space-y-2">
          {availability.map((slot, index) => (
            <li key={index} className="bg-white p-4 shadow rounded flex justify-between items-center">
              <div>
                <strong>{WEEKDAY_LABELS[slot.weekday] || `Dia ${slot.weekday}`}</strong> - {slot.startTime} a {slot.endTime}
              </div>
              <button
                onClick={() => handleBooking(slot)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Reservar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
