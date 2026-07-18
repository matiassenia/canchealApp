import withAuth from '../components/withAuth';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';
import { PageHeader, PremiumSurface, StateBlock, StatusBadge } from '../components/ui-kit';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

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
      setFeedback(err.message);
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

      setFeedback('Reserva cancelada correctamente.');

      fetchBookings();
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setCancellingBookingId(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter((booking) => booking.status !== 'CANCELLED' && new Date(booking.startAt) >= now);
  const past = bookings.filter((booking) => booking.status !== 'CANCELLED' && new Date(booking.startAt) < now);
  const cancelled = bookings.filter((booking) => booking.status === 'CANCELLED');

  const renderBookings = (items) => (
    <ul className="space-y-4">
      {items.map((b) => {
        const isCancelled = b.status === 'CANCELLED';
        const isCancelling = cancellingBookingId === b.id;
        return (
          <li key={b.id} className={`rounded-[1.25rem] border p-4 shadow-sm backdrop-blur ${isCancelled ? 'border-rose-200 bg-rose-50/75' : 'border-white/55 bg-white/70'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-lg font-black text-slate-950">{b.field?.name || `Cancha #${b.fieldId}`}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-slate-700"><span className="font-bold">Club:</span> {b.field?.club?.name || 'No informado'}</p>
                <p className="text-sm text-slate-700"><span className="font-bold">Inicio:</span> {formatDateTime(b.startAt)}</p>
                <p className="text-sm text-slate-700"><span className="font-bold">Fin:</span> {formatDateTime(b.endAt)}</p>
                <p className="mt-1 text-sm font-bold text-emerald-800">Precio a consultar</p>
              </div>
              <button
                onClick={() => handleCancel(b.id)}
                disabled={isCancelled || isCancelling}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isCancelled ? 'Cancelada' : isCancelling ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <PageHeader eyebrow="Seguimiento de reservas" title="Mis reservas" description="Consulta tus proximos turnos, reservas anteriores y cancelaciones." />

        {feedback && (
          <div className={`${ui.panelInfo} mb-4 p-3 text-sm font-semibold text-slate-700`}>
            {feedback}
          </div>
        )}

        {loading ? (
          <div className={`${ui.card} p-6 text-sm font-semibold text-slate-600`}>Cargando reservas...</div>
        ) : bookings.length === 0 ? (
          <StateBlock title="Todavia no tenes reservas" description="Explora clubes y reserva tu proximo turno." />
        ) : (
          <div className="space-y-8">
            <section>
              <PremiumSurface className="p-5">
                <h2 className="mb-3 text-xl font-black text-slate-950">Proximas</h2>
                {upcoming.length ? renderBookings(upcoming) : <StateBlock title="No tenes reservas proximas" description="Cuando reserves un turno futuro aparecera aca." />}
              </PremiumSurface>
            </section>
            <section>
              <PremiumSurface className="p-5">
                <h2 className="mb-3 text-xl font-black text-slate-950">Pasadas</h2>
                {past.length ? renderBookings(past) : <StateBlock title="No hay reservas pasadas" />}
              </PremiumSurface>
            </section>
            <section>
              <PremiumSurface className="p-5">
                <h2 className="mb-3 text-xl font-black text-slate-950">Canceladas</h2>
                {cancelled.length ? renderBookings(cancelled) : <StateBlock title="No hay reservas canceladas" />}
              </PremiumSurface>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(MyBookings);
