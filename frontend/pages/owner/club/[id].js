// 📄 pages/owner/club/[id].js
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../components/Navbar';
import FieldAvailabilitySelector from '../../../components/FieldAvailabilitySelector';
import { apiFetch } from '../../../lib/api';
import ui from '../../../lib/ui';
import { StateBlock } from '../../../components/ui-kit';

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

  const fetchFields = useCallback(async () => {
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
  }, [clubId, selectedFieldId]);

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
  }, [clubId, fetchFields]);

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

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <span className={ui.badgeSuccess}>Administracion de club</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Gestion operativa del club</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Configura canchas, imagenes y disponibilidad semanal desde un panel unico.</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className={`${ui.card} p-4`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Canchas activas</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{fields.length}</p>
            <p className="mt-1 text-xs text-slate-500">Dato real cargado desde canchas del club.</p>
          </article>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className={`${ui.card} p-6 lg:col-span-1`}>
            <h2 className="text-lg font-bold text-slate-900">Crear nueva cancha</h2>
            <p className="mb-4 mt-1 text-sm text-slate-600">Publica una cancha para habilitar reservas.</p>

        <label htmlFor="field-name" className={ui.label}>Nombre de la cancha</label>
        <input
          id="field-name"
          type="text"
          placeholder="Nombre de la cancha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`${ui.input} mb-3`}
        />

        <label htmlFor="field-type" className={ui.label}>Tipo de cancha</label>
        <select
          id="field-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className={`${ui.input} mb-3`}
        >
          <option value="">Seleccionar tipo de cancha</option>
          <option value="5">Fútbol 5</option>
          <option value="7">Fútbol 7</option>
          <option value="8">Fútbol 8</option>
          <option value="11">Fútbol 11</option>
        </select>

        <label htmlFor="field-image" className={ui.label}>URL de imagen opcional</label>
        <input
          id="field-image"
          type="text"
          placeholder="URL de imagen (opcional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={`${ui.input} mb-4`}
        />

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-2 text-sm text-emerald-700">{success}</p>}

        <button
          type="submit"
          disabled={creatingField}
          className={`w-full ${ui.buttonPrimary}`}
        >
          {creatingField ? 'Creando cancha...' : 'Crear cancha'}
        </button>
      </form>

          <section className={`${ui.card} p-6 lg:col-span-2`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">Disponibilidad y operacion</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Gestion manual</span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-600">Cargando canchas...</p>
            ) : fields.length === 0 ? (
              <StateBlock title="Aun no hay canchas para gestionar" description="Crea una cancha para configurar su disponibilidad." />
            ) : (
              <>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Seleccionar cancha</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className={`${ui.input} mb-4`}
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
                  className={ui.buttonPrimary}
                >
                  {savingAvailability ? 'Guardando...' : 'Guardar disponibilidad'}
                </button>
              </>
            )}
          </section>
        </div>

        <section className={`${ui.card} mt-6 p-6`}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Listado de canchas</h2>
          {fields.length === 0 ? (
            <StateBlock title="Aun no hay canchas creadas" description="Cuando crees una cancha aparecera en este listado." />
          ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <article key={field.id} className="rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{field.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Activa</span>
                </div>
                <p className="text-sm text-slate-600">Tipo: Futbol {field.type}</p>
                {field.imageUrl && (
                  <div
                    role="img"
                    aria-label={field.name}
                    className="mt-3 h-32 w-full rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${field.imageUrl})` }}
                  />
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
