import withAuth from '../components/withAuth';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  const getStatusStyles = (status) => {
    if (status === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const formatDateTime = (isoValue) => {
    if (!isoValue) return '-';
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/bookings/user');

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar tus reservas.');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setFeedback(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    setFeedback('');
    setCancellingBookingId(bookingId);

    try {
      const res = await apiFetch(`/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar');

      setFeedback('✅ Reserva cancelada correctamente.');

      fetchBookings();
    } catch (err) {
      console.error('Cancelación fallida:', err);
      setFeedback(`❌ ${err.message}`);
    } finally {
      setCancellingBookingId(null);
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <span className={ui.badgeSuccess}>Seguimiento de reservas</span>
        <h1 className={ui.title}>Mis Reservas</h1>
        <p className={`${ui.subtitle} mb-6`}>Consulta estado, horario y cancha de cada reserva.</p>

        {feedback && (
          <div className={`${ui.panelInfo} mb-4 p-3 text-sm font-semibold text-slate-700`}>
            {feedback}
          </div>
        )}

        {loading ? (
          <div className={`${ui.card} p-6 text-sm text-slate-600`}>
            Cargando reservas...
          </div>
        ) : bookings.length === 0 ? (
          <div className={`${ui.card} p-8 text-center`}>
            <p className="font-semibold text-slate-900">Aun no tienes reservas activas.</p>
            <p className="mt-1 text-sm text-slate-600">Explora clubes y reserva tu proximo turno.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => {
              const isCancelled = b.status === 'CANCELLED';
              const isCancelling = cancellingBookingId === b.id;
              return (
              <li
                key={b.id}
                className={`rounded-2xl border p-4 shadow-sm ${isCancelled ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-lg font-bold text-slate-900">{b.field?.name || `Cancha #${b.fieldId}`}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(b.status)}`}>
                        {b.status || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700"><span className="font-semibold">Inicio:</span> {formatDateTime(b.startAt)}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold">Fin:</span> {formatDateTime(b.endAt)}</p>
                    <p className="text-sm text-slate-600">Club: {b.field?.club?.name || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={isCancelled || isCancelling}
                    className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isCancelled ? 'Cancelada' : isCancelling ? 'Cancelando...' : 'Cancelar'}
                  </button>
                </div>
              </li>
            );})}
          </ul>
        )}
      </div>
    </div>
  );
}

export default withAuth(MyBookings);
