
// `pages/availability.js`
//
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../lib/api';

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
  const [h, m] = startTime.split(':').map(Number);
  if (m === 0) return `${String(h).padStart(2, '0')}:30`;
  return `${String(h + 1).padStart(2, '0')}:00`;
};

export default function Availability() {
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [availability, setAvailability] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setSelectedSlot(null);
    setMessage('');
    try {
      const res = await apiFetch(`/availability/${selectedFieldId}`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
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
      setMessage('✅ Reserva confirmada.');
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
      const availableByRule = rules.some((rule) => isWithinRange(time, rule.startTime, rule.endTime));

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

  const selectedField = fields.find((f) => String(f.id) === String(selectedFieldId));

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold mb-1 text-slate-900">Disponibilidad de Canchas</h1>
        <p className="mb-5 text-sm text-slate-600">Selecciona una cancha, elegi un horario y confirma tu reserva.</p>

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
          className="mb-6 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
        >
          Ver disponibilidad
        </button>

        {message && <p className="mb-4 text-sm font-semibold text-center">{message}</p>}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl bg-white p-4 shadow sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Horarios por dia</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Disponible</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />No disponible</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />Pasado</span>
              </div>
            </div>

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

          <aside className="rounded-2xl bg-white p-4 shadow sm:p-5">
            <h2 className="text-lg font-bold text-slate-900">Resumen de reserva</h2>
            {!selectedSlot ? (
              <p className="mt-3 text-sm text-slate-600">Selecciona un horario disponible para continuar.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">Cancha:</span> {selectedField ? selectedField.name : `#${selectedFieldId}`}</p>
                <p><span className="font-semibold">Dia:</span> {WEEKDAY_LABELS[selectedSlot.weekday]}</p>
                <p><span className="font-semibold">Horario:</span> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
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
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              Limpiar seleccion
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
