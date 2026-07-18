import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { apiFetch } from '../../lib/api';
import ui from '../../lib/ui';
import { PremiumSurface } from '../../components/ui-kit';

export default function CreateClub() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado');
      setIsLoading(false);
      router.push('/login');
      return;
    }

    try {
      const res = await apiFetch('/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, address, zone, description })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el club');

      router.push('/owner/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl justify-center px-4 py-10 sm:px-6">
        <PremiumSurface className="w-full p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <span className={ui.badgeSuccess}>Owner setup</span>
            <h1 className="mb-2 mt-3 text-3xl font-black tracking-tight text-slate-950">Crear nuevo club</h1>
            <p className="mb-6 text-sm leading-6 text-slate-600">Carga la informacion principal para publicar tu club y empezar a gestionar canchas.</p>

            <label htmlFor="name" className={ui.label}>Nombre del club</label>
            <input
              id="name"
              type="text"
              placeholder="Nombre del Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${ui.input} mb-4`}
              required
            />
            <label htmlFor="address" className={ui.label}>Direccion</label>
            <input
              id="address"
              type="text"
              placeholder="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${ui.input} mb-4`}
              required
            />
            <label htmlFor="zone" className={ui.label}>Zona</label>
            <input
              id="zone"
              type="text"
              placeholder="Zona (Ej: San Miguel, Devoto)"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className={`${ui.input} mb-4`}
              required
            />
            <label htmlFor="description" className={ui.label}>Descripcion</label>
            <textarea
              id="description"
              placeholder="Descripción del club"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${ui.input} mb-4`}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${ui.buttonPrimary}`}
            >
              {isLoading ? 'Creando...' : 'Crear Club'}
            </button>
          </form>
        </PremiumSurface>
      </main>
    </div>
  );
}
