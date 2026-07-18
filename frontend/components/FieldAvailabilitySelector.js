// 📄 frontend/components/FieldAvailabilitySelector.js
import { useState, useEffect } from 'react';

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const hours = Array.from({ length: 24 }, (_, i) => i);
const intervals = [];

hours.forEach(h => {
  intervals.push(`${String(h).padStart(2, '0')}:00`);
  intervals.push(`${String(h).padStart(2, '0')}:30`);
});

export default function FieldAvailabilitySelector({ onChange, initialAvailability = []  }) {
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    const normalize = (arr) => [...arr].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));
    setSelectedSlots(normalize(initialAvailability));
  }, [initialAvailability]);

  const toggleSlot = (weekday, time) => {
    const startTime = time;
    const [h, m] = time.split(':');
    const endTime = m === '00'
      ? `${String(h).padStart(2, '0')}:30`
      : `${String(parseInt(h) + 1).padStart(2, '0')}:00`;

    const slot = { weekday, startTime, endTime };

    const exists = selectedSlots.some(
      (s) =>
        s.weekday === weekday &&
        s.startTime === slot.startTime &&
        s.endTime === slot.endTime
    );

    let updated;
    if (exists) {
      updated = selectedSlots.filter(
        (s) =>
          !(
            s.weekday === weekday &&
            s.startTime === slot.startTime &&
            s.endTime === slot.endTime
          )
      );
    } else {
      updated = [...selectedSlots, slot];
    }

    setSelectedSlots(updated);
    onChange?.(updated); 
  };

  const isSelected = (weekday, time) => {
    const [h, m] = time.split(':');
    const endTime = m === '00'
    ? `${String(h).padStart(2, '0')}:30`
    : `${String(parseInt(h) + 1).padStart(2, '0')}:00`;

    return selectedSlots.some(
      (s) =>
        s.weekday === weekday &&
        s.startTime === time &&
        s.endTime === endTime
    );
  };

  return (
    <div className="max-h-[80vh] overflow-auto rounded-2xl border border-emerald-950/10 bg-white">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-20 border border-emerald-950/10 bg-emerald-50 p-2 text-xs font-black text-emerald-950">Hora</th>
            {weekdays.map((day) => (
              <th key={day} className="border border-emerald-950/10 bg-emerald-50 p-2 text-center text-xs font-black text-emerald-950">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intervals.map((time, idx) => (
            <tr key={idx}>
              <td className="border border-emerald-950/10 px-2 text-xs font-semibold text-slate-600">{time}</td>
              {weekdays.map((_, dayIdx) => (
                <td
                  key={dayIdx}
                  className={`border border-emerald-950/10 text-center text-xs ${
                    isSelected(dayIdx + 1, time)
                      ? 'bg-emerald-700 text-white'
                      : 'hover:bg-lime-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSlot(dayIdx + 1, time)}
                    className="h-9 w-full font-black"
                    aria-label={`Alternar ${weekdays[dayIdx]} ${time}`}
                  >
                    {isSelected(dayIdx + 1, time) ? '✓' : ''}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
