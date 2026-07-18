
// `pages/availability.js`
//
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const getLocalDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatTime = (isoValue) => {
  if (!isoValue) return '-';
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' });
};

export default function Availability() {
  const router = useRouter();
  const { clubId: clubIdQuery, fieldId: fieldIdQuery } = router.query;

  const [fields, setFields] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const selectedClubId = clubIdQuery ? String(clubIdQuery) : '';

  const filteredFields = selectedClubId
    ? fields.filter((field) => String(field.clubId) === selectedClubId)
    : fields;

  const selectedField = fields.find((f) => String(f.id) === String(selectedFieldId));
  const selectedClub = selectedClubId
    ? clubs.find((club) => String(club.id) === selectedClubId)
    : (selectedField ? clubs.find((club) => club.id === selectedField.clubId) : null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingFields(true);
      try {
        const fieldsPath = selectedClubId ? `/fields/club/${selectedClubId}` : '/fields';
        const clubsPath = selectedClubId ? `/clubs/${selectedClubId}` : '/clubs';
        const [fieldsRes, clubsRes] = await Promise.all([apiFetch(fieldsPath), apiFetch(clubsPath)]);

        if (!fieldsRes.ok || !clubsRes.ok) {
          throw new Error('No se pudieron cargar clubes o canchas.');
        }

        const fieldsData = await fieldsRes.json();
        const clubsData = await clubsRes.json();

        const allFields = Array.isArray(fieldsData) ? fieldsData : [];
        const allClubs = Array.isArray(clubsData) ? clubsData : [clubsData];

        setFields(allFields);
        setClubs(allClubs);

        const hasFieldQuery = typeof fieldIdQuery === 'string' && fieldIdQuery.length > 0;
        if (hasFieldQuery) {
          const exists = allFields.some((field) => String(field.id) === String(fieldIdQuery));
          if (exists) {
            setSelectedFieldId(String(fieldIdQuery));
            return;
          }
        }

        if (selectedClubId) {
          const firstField = allFields.find((field) => String(field.clubId) === selectedClubId);
          if (firstField) {
            setSelectedFieldId(String(firstField.id));
          }
        }
      } catch (err) {
        console.error('Error fetching fields:', err);
        setMessage('❌ No se pudieron cargar clubes o canchas.');
      } finally {
        setIsLoadingFields(false);
      }
    };

    if (!router.isReady) return;
    fetchData();
  }, [router.isReady, selectedClubId, fieldIdQuery]);

  useEffect(() => {
    if (!selectedFieldId) return;

    const stillVisible = filteredFields.some((field) => String(field.id) === String(selectedFieldId));
    if (!stillVisible) {
      setSelectedFieldId(filteredFields[0] ? String(filteredFields[0].id) : '');
        setSlots([]);
        setSelectedSlot(null);
    }
  }, [selectedFieldId, filteredFields]);

  const handleCheckAvailability = useCallback(async () => {
    if (!selectedFieldId) return;
    setSelectedSlot(null);
    setMessage('');
    setIsLoadingAvailability(true);
    try {
      const res = await apiFetch(`/availability/${selectedFieldId}/slots?date=${selectedDate}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar la disponibilidad.');
      const parsedSlots = Array.isArray(data.slots) ? data.slots : [];
      setSlots(parsedSlots);
      if (parsedSlots.length === 0) {
        setMessage('No hay horarios disponibles para la fecha seleccionada.');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setMessage('❌ No se pudo cargar la disponibilidad.');
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [selectedFieldId, selectedDate]);

  useEffect(() => {
    if (!selectedFieldId) return;
    handleCheckAvailability();
  }, [selectedFieldId, selectedDate, handleCheckAvailability]);

  const handleBooking = async () => {
    if (!selectedSlot || selectedSlot.status !== 'available') return;

    try {
      setIsSubmitting(true);
      const startAt = selectedSlot.startAt;
      const endAt = selectedSlot.endAt;

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
      setMessage(`Reserva confirmada para ${selectedField ? selectedField.name : 'la cancha seleccionada'} (${formatTime(selectedSlot.startAt)}-${formatTime(selectedSlot.endAt)}).`);
      setSelectedSlot(null);
      handleCheckAvailability();
    } catch (err) {
      console.error('Error booking:', err);
      setMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const selectedWeekday = Number.isNaN(selectedDateObj.getTime()) ? 0 : selectedDateObj.getDay();

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className={ui.container}>
        <div className="mb-3 text-xs font-semibold text-slate-500">
          <Link href="/explore" className="hover:underline">Explorar</Link>
          <span className="mx-1">-&gt;</span>
          {selectedClub ? (
            <Link href={`/clubs/${selectedClub.id}`} className="hover:underline">{selectedClub.name}</Link>
          ) : (
            <span>Club</span>
          )}
          <span className="mx-1">-&gt;</span>
          <span className="text-slate-700">Reserva</span>
        </div>

        <span className={ui.badgeSuccess}>Reserva de cancha</span>
        <h1 className="mb-1 text-3xl font-black tracking-tight text-slate-950">Elegí cancha, fecha y horario</h1>
        <p className="mb-5 text-sm text-slate-600">El backend confirma la disponibilidad final antes de crear la reserva.</p>

        {(selectedClub || selectedField) && (
          <div className={`${ui.card} mb-4 p-4`}>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Club:</span> {selectedClub ? selectedClub.name : 'Sin seleccionar'}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">Cancha:</span> {selectedField ? selectedField.name : 'Sin seleccionar'}
            </p>
          </div>
        )}

        {isLoadingFields ? (
          <div className={`${ui.card} mb-5 p-4`}>
            <p className="text-sm text-slate-600">Cargando canchas...</p>
          </div>
        ) : filteredFields.length === 0 ? (
          <div className={`${ui.card} mb-5 p-4`}>
            <p className="font-semibold text-slate-900">No hay canchas disponibles para este club.</p>
            <p className="mt-1 text-sm text-slate-600">Prueba desde Explorar con otro club.</p>
          </div>
        ) : null}

        <section className={`${ui.card} mb-6 grid gap-4 p-4 md:grid-cols-3`}>
          <div>
            <label htmlFor="field" className={ui.label}>Cancha</label>
            <select
              id="field"
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className={ui.input}
              disabled={isLoadingFields || filteredFields.length === 0}
            >
              <option value="">Seleccionar cancha</option>
              {filteredFields.map((field) => (
                <option key={field.id} value={field.id}>{field.name} - Futbol {field.type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className={ui.label}>Fecha</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              min={getLocalDateString()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={ui.input}
            />
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">Dia seleccionado</p>
            <p className="mt-2 text-lg font-black capitalize text-slate-950">{formatDateLabel(selectedDate)}</p>
          </div>
        </section>

        {message && (
          <div className={`${ui.panelInfo} mb-4 p-3 text-sm font-semibold text-slate-700`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className={`lg:col-span-2 ${ui.card} p-4 sm:p-5`}>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Horarios disponibles</h2>
                <p className="text-sm text-slate-600">{WEEKDAY_LABELS[selectedWeekday]} · {formatDateLabel(selectedDate)}</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Disponible</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />No disponible</span>
              </div>
            </div>

            {isLoadingAvailability && (
              <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Cargando disponibilidad de la cancha seleccionada...
              </div>
            )}

            {slots.length === 0 && !isLoadingAvailability ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">No hay horarios disponibles para esta fecha.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {slots.map((slot) => {
                  const isSelected = selectedSlot && selectedSlot.startAt === slot.startAt;
                  return (
                    <button
                      key={`${slot.startAt}-${slot.endAt}`}
                      type="button"
                      disabled={slot.available === false}
                      onClick={() => setSelectedSlot({ ...slot, status: 'available' })}
                      className={`rounded-xl border px-3 py-3 text-sm font-black transition ${isSelected ? 'border-emerald-900 bg-emerald-900 text-white ring-4 ring-lime-200' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-500'} disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                    >
                      {formatTime(slot.startAt)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={`${ui.card} p-4 sm:p-5`}>
            <h2 className="text-lg font-bold text-slate-900">Resumen de reserva</h2>
            {!selectedSlot ? (
              <p className="mt-3 text-sm text-slate-600">Selecciona un horario disponible para continuar.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">Cancha:</span> {selectedField ? selectedField.name : `#${selectedFieldId}`}</p>
                <p><span className="font-semibold">Club:</span> {selectedClub ? selectedClub.name : 'Sin club seleccionado'}</p>
                <p><span className="font-semibold">Fecha:</span> {formatDateLabel(selectedDate)}</p>
                <p><span className="font-semibold">Inicio:</span> {formatTime(selectedSlot.startAt)}</p>
                <p><span className="font-semibold">Fin:</span> {formatTime(selectedSlot.endAt)}</p>
                <p><span className="font-semibold">Duracion:</span> 60 minutos</p>
                <p><span className="font-semibold">Estado:</span> {selectedSlot.status === 'available' ? 'Disponible' : 'No disponible'}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleBooking}
              disabled={!selectedSlot || selectedSlot.status !== 'available' || isSubmitting}
              className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Reservando...' : 'Confirmar reserva'}
            </button>

            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              disabled={!selectedSlot || isSubmitting}
              className={`mt-2 w-full ${ui.buttonSecondary}`}
            >
              Limpiar seleccion
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
