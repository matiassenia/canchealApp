
// `pages/availability.js`
//
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 24;

const buildTimeSlots = () => {
  const times = [];
  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    times.push(`${String(hour).padStart(2, '0')}:00`);
    times.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return times;
};

const TIME_SLOTS = buildTimeSlots();

const parseTimeToMinutes = (time) => {
  const [h, m] = String(time).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const isWithinRange = (time, start, end) => {
  const t = parseTimeToMinutes(time);
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  if (t === null || s === null || e === null) return false;
  return t >= s && t < e;
};

const getLocalDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getEndTime = (startTime) => {
  const startMinutes = parseTimeToMinutes(startTime);
  if (startMinutes === null) return startTime;
  const endMinutes = startMinutes + 60;
  const hours = Math.floor(endMinutes / 60);
  const minutes = endMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export default function Availability() {
  const router = useRouter();
  const { clubId: clubIdQuery, fieldId: fieldIdQuery } = router.query;

  const [fields, setFields] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [availability, setAvailability] = useState([]);
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
        const [fieldsRes, clubsRes] = await Promise.all([
          apiFetch('/fields'),
          apiFetch('/clubs')
        ]);

        if (!fieldsRes.ok || !clubsRes.ok) {
          throw new Error('No se pudieron cargar clubes o canchas.');
        }

        const fieldsData = await fieldsRes.json();
        const clubsData = await clubsRes.json();

        const allFields = Array.isArray(fieldsData) ? fieldsData : [];
        const allClubs = Array.isArray(clubsData) ? clubsData : [];

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
      setAvailability([]);
      setSelectedSlot(null);
    }
  }, [selectedFieldId, filteredFields]);

  const handleCheckAvailability = async () => {
    if (!selectedFieldId) return;
    setSelectedSlot(null);
    setMessage('');
    setIsLoadingAvailability(true);
    try {
      const res = await apiFetch(`/availability/${selectedFieldId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar la disponibilidad.');
      setAvailability(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) {
        setMessage('No hay horarios configurados para esta cancha.');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setMessage('❌ No se pudo cargar la disponibilidad.');
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || selectedSlot.status !== 'available') return;

    try {
      setIsSubmitting(true);
      const localDate = getLocalDateString();
      const startAt = new Date(`${localDate}T${selectedSlot.startTime}:00`).toISOString();
      const endAt = new Date(`${localDate}T${selectedSlot.endTime}:00`).toISOString();

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
      setMessage(`✅ Reserva confirmada para ${selectedField ? selectedField.name : 'la cancha seleccionada'} (${selectedSlot.startTime}-${selectedSlot.endTime}).`);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Error booking:', err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const now = new Date();
  const currentWeekday = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slotMatrix = Array.from({ length: 7 }, (_, i) => {
    const weekday = i;
    const rules = availability.filter((item) => Number(item.weekday) === weekday);

    const slots = TIME_SLOTS.map((time) => {
      const endTime = getEndTime(time);
      const availableByRule = rules.some((rule) => {
        if (!isWithinRange(time, rule.startTime, rule.endTime)) return false;
        const slotEndMinutes = parseTimeToMinutes(endTime);
        const ruleEndMinutes = parseTimeToMinutes(rule.endTime);
        if (slotEndMinutes === null || ruleEndMinutes === null) return false;
        return slotEndMinutes <= ruleEndMinutes;
      });

      let status = 'unavailable';
      if (availableByRule) {
        const slotStartMinutes = parseTimeToMinutes(time);
        const isPastToday = weekday === currentWeekday && slotStartMinutes !== null && slotStartMinutes <= currentMinutes;
        status = isPastToday ? 'past' : 'available';
      }

      return {
        weekday,
        startTime: time,
        endTime,
        status
      };
    });

    return { weekday, label: WEEKDAY_LABELS[weekday], slots };
  });

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

        <span className={ui.badgeSuccess}>Paso final de reserva</span>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Disponibilidad de Canchas</h1>
        <p className="mb-5 text-sm text-slate-600">Selecciona una cancha, elegi un horario y confirma tu reserva.</p>

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

        <select
          value={selectedFieldId}
          onChange={(e) => setSelectedFieldId(e.target.value)}
          className={`${ui.input} mb-4 max-w-md`}
          disabled={isLoadingFields || filteredFields.length === 0}
        >
          <option value="">Seleccionar cancha</option>
          {filteredFields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name} - {field.type}
            </option>
          ))}
        </select>

        <button
          onClick={handleCheckAvailability}
          disabled={!selectedFieldId || isLoadingFields || filteredFields.length === 0}
          className={`mb-6 ${ui.buttonPrimary}`}
        >
          {isLoadingAvailability ? 'Cargando horarios...' : 'Ver disponibilidad'}
        </button>

        {message && (
          <div className={`${ui.panelInfo} mb-4 p-3 text-sm font-semibold text-slate-700`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className={`lg:col-span-2 ${ui.card} p-4 sm:p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Horarios por dia</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Disponible</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />No disponible / ocupado</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />Pasado</span>
              </div>
            </div>

            {isLoadingAvailability && (
              <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Cargando disponibilidad de la cancha seleccionada...
              </div>
            )}

            <div className="space-y-4">
              {slotMatrix.map((day) => (
                <div key={day.weekday}>
                  <h3 className="mb-2 text-sm font-bold text-slate-700">{day.label}</h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {day.slots.map((slot) => {
                      const isSelected =
                        selectedSlot &&
                        selectedSlot.weekday === slot.weekday &&
                        selectedSlot.startTime === slot.startTime;

                      const isClickable = slot.status === 'available';

                      let className = 'rounded-lg border px-2 py-2 text-xs font-semibold transition';
                      if (slot.status === 'available') {
                        className += ' border-emerald-300 bg-emerald-50 text-emerald-700';
                      } else if (slot.status === 'past') {
                        className += ' cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500';
                      } else {
                        className += ' cursor-not-allowed border-rose-200 bg-rose-50 text-rose-600';
                      }

                      if (isSelected) {
                        className += ' ring-2 ring-slate-900';
                      }

                      return (
                        <button
                          key={`${slot.weekday}-${slot.startTime}`}
                          type="button"
                          disabled={!isClickable}
                          onClick={() => setSelectedSlot(slot)}
                          className={className}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className={`${ui.card} p-4 sm:p-5`}>
            <h2 className="text-lg font-bold text-slate-900">Resumen de reserva</h2>
            {!selectedSlot ? (
              <p className="mt-3 text-sm text-slate-600">Selecciona un horario disponible para continuar.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">Cancha:</span> {selectedField ? selectedField.name : `#${selectedFieldId}`}</p>
                <p><span className="font-semibold">Club:</span> {selectedClub ? selectedClub.name : 'Sin club seleccionado'}</p>
                <p><span className="font-semibold">Dia:</span> {WEEKDAY_LABELS[selectedSlot.weekday]}</p>
                <p><span className="font-semibold">Inicio:</span> {selectedSlot.startTime}</p>
                <p><span className="font-semibold">Fin:</span> {selectedSlot.endTime}</p>
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
