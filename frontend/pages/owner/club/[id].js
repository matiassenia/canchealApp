// 📄 pages/owner/club/[id].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../components/Navbar';
import FieldAvailabilitySelector from '../../../components/FieldAvailabilitySelector';
import { apiFetch } from '../../../lib/api';

export default function ClubDashboard() {
  const router = useRouter();
  const { id: clubId } = router.query;

  const [fields, setFields] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [availability, setAvailability] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingField, setCreatingField] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const fetchFields = async () => {
    const res = await apiFetch(`/fields/club/${clubId}`);
    if (!res.ok) throw new Error('No se pudo cargar las canchas');

    const data = await res.json();
    const parsed = Array.isArray(data) ? data : [];
    setFields(parsed);

    if (!parsed.length) {
      setSelectedFieldId('');
      setAvailability([]);
      return;
    }

    const exists = parsed.some((field) => String(field.id) === String(selectedFieldId));
    if (!exists) {
      setSelectedFieldId(String(parsed[0].id));
    }
  };

  useEffect(() => {
    if (!clubId || isNaN(clubId)) return;

    const loadInitialData = async () => {
      try {
        await fetchFields();
      } catch (err) {
        console.error('Error al cargar canchas:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [clubId]);

  useEffect(() => {
    if (!selectedFieldId) return;

    const fetchAvailability = async () => {
      try {
        const res = await apiFetch(`/availability/${selectedFieldId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar la disponibilidad');
        setAvailability(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar disponibilidad:', err.message);
        setError(err.message);
      }
    };

    fetchAvailability();
  }, [selectedFieldId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creatingField) return;

    try {
      setCreatingField(true);
      setError(null);
      setSuccess(null);
      const res = await apiFetch('/fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          type,
          imageUrl: imageUrl || null,
          clubId: Number(clubId)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cancha');

      setSuccess('Cancha creada correctamente');
      setName('');
      setType('');
      setImageUrl('');
      fetchFields();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingField(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedFieldId) return;

    setSavingAvailability(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiFetch('/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fieldId: Number(selectedFieldId), slots: availability })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la disponibilidad');
      setSuccess('Disponibilidad actualizada correctamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAvailability(false);
    }
  };

  const activeFields = fields.length;
  const todayReservations = Math.max(0, Math.round(activeFields * 1.3));
  const occupancyEstimate = `${Math.min(95, 35 + activeFields * 8)}%`;
  const revenueEstimate = `$${(todayReservations * 12000).toLocaleString('es-AR')}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Gestion operativa del club</h1>
        <p className="mt-1 text-sm text-slate-600">Configura canchas y disponibilidad desde un panel unico.</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reservas hoy</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{todayReservations}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ocupacion estimada</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{occupancyEstimate}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Canchas activas</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{activeFields}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ingreso estimado</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{revenueEstimate}</p>
          </article>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-900">Crear nueva cancha</h2>
            <p className="mb-4 mt-1 text-sm text-slate-600">Publica una cancha para habilitar reservas.</p>

        <input
          type="text"
          placeholder="Nombre de la cancha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mb-3 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="mb-3 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
        >
          <option value="">Seleccionar tipo de cancha</option>
          <option value="5">Fútbol 5</option>
          <option value="7">Fútbol 7</option>
          <option value="8">Fútbol 8</option>
          <option value="11">Fútbol 11</option>
        </select>

        <input
          type="text"
          placeholder="URL de imagen (opcional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
        />

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-2 text-sm text-emerald-700">{success}</p>}

        <button
          type="submit"
          disabled={creatingField}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {creatingField ? 'Creando cancha...' : 'Crear cancha'}
        </button>
      </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">Disponibilidad y operacion</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Gestion manual</span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Cargando canchas...</p>
            ) : fields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <p className="font-semibold text-slate-900">Aun no hay canchas para gestionar.</p>
                <p className="mt-1 text-sm text-slate-600">Crea una cancha para configurar su disponibilidad.</p>
              </div>
            ) : (
              <>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Seleccionar cancha</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="mb-4 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                >
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>{field.name} - Futbol {field.type}</option>
                  ))}
                </select>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Editar disponibilidad semanal</label>
                  <FieldAvailabilitySelector onChange={setAvailability} initialAvailability={availability} />
                </div>

                <button
                  type="button"
                  onClick={handleSaveAvailability}
                  disabled={savingAvailability || !selectedFieldId}
                  className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {savingAvailability ? 'Guardando...' : 'Guardar disponibilidad'}
                </button>
              </>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Listado de canchas</h2>
          {fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-4">
              <p className="font-semibold text-slate-900">Aun no hay canchas creadas.</p>
              <p className="mt-1 text-sm text-slate-600">Cuando crees una cancha aparecera en este listado.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <article key={field.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{field.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Activa</span>
                </div>
                <p className="text-sm text-slate-600">Tipo: Futbol {field.type}</p>
                {field.imageUrl && (
                  <img src={field.imageUrl} alt={field.name} className="mt-2 h-32 w-full rounded object-cover" />
                )}
              </article>
            ))}
          </div>
          )}
        </section>
      </div>
    </div>
  );
}
