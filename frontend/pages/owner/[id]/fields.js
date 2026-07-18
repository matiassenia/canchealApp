import { useRouter } from 'next/router';
import { useState } from 'react';
import Navbar from '../../../components/Navbar';
import { apiFetch } from '../../../lib/api';
import ui from '../../../lib/ui';
import { PremiumSurface } from '../../../components/ui-kit';

export default function AddFieldPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Token no encontrado. Inicia sesion nuevamente.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const res = await apiFetch('/fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, type, imageUrl, clubId: parseInt(id, 10) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la cancha');

      setSuccess('Cancha creada correctamente');
      setName('');
      setType('');
      setImageUrl('');
    } catch (err) {
      setError(err.message || 'Error de conexion con el servidor');
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PremiumSurface className="p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <span className={ui.badgeSuccess}>Canchas</span>
            <h1 className="mb-2 mt-3 text-3xl font-black tracking-tight text-slate-950">Agregar cancha al club #{id}</h1>
            <p className="mb-6 text-sm leading-6 text-slate-600">Publica una cancha con su modalidad para luego configurar disponibilidad.</p>
            <label htmlFor="field-name" className={ui.label}>Nombre de la cancha</label>
            <input
              id="field-name"
              type="text"
              placeholder="Nombre de la cancha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${ui.input} mb-4`}
            />
            <label htmlFor="field-type" className={ui.label}>Tipo</label>
            <input
              id="field-type"
              type="text"
              placeholder="Tipo (Fútbol 5, Fútbol 11, etc.)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`${ui.input} mb-4`}
            />
            <label htmlFor="field-image" className={ui.label}>URL de imagen opcional</label>
            <input
              id="field-image"
              type="text"
              placeholder="URL de imagen (opcional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`${ui.input} mb-4`}
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
            <button
              type="submit"
              className={`w-full ${ui.buttonPrimary}`}
            >
              Crear cancha
            </button>
          </form>
        </PremiumSurface>
      </main>
    </div>
  );
}
