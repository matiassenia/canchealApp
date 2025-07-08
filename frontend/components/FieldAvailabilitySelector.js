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
  const stringify = (arr) => JSON.stringify(arr.sort((a, b) => a.weekday - b.weekday));
  if (stringify(selectedSlots) !== stringify(initialAvailability)) {
    setSelectedSlots(initialAvailability);
  }
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
    <div className="overflow-auto border rounded-lg max-h-[80vh]">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="border p-2 w-20 bg-gray-100">Hora</th>
            {weekdays.map((day, i) => (
              <th key={i} className="border p-2 text-sm bg-gray-100 text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intervals.map((time, idx) => (
            <tr key={idx}>
              <td className="border px-2 text-xs text-gray-600">{time}</td>
              {weekdays.map((_, dayIdx) => (
                <td
                  key={dayIdx}
                  className={`border cursor-pointer text-center text-xs ${
                    isSelected(dayIdx + 1, time)
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  onClick={() => toggleSlot(dayIdx + 1, time)}
                >
                  {isSelected(dayIdx + 1, time) ? '✓' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
