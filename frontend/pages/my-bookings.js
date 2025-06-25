import withAuth from '../components/withAuth';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Error al cancelar');

      fetchBookings();
    } catch (err) {
      console.error('Cancelación fallida:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Mis Reservas</h1>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600">Aún no tenés reservas.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b, index) => (
              <li key={index} className="bg-white border-l-4 border-blue-500 p-4 shadow rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{b.day || b.date?.split('T')[0]}</p>
                    <p className="text-sm text-gray-600">{b.start_time || b.timeSlot} hs</p>
                    <p className="text-sm text-gray-800">Cancha: {b.field?.name || b.fieldId}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded shadow"
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default withAuth(MyBookings);