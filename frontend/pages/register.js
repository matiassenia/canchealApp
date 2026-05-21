//### 📄 `pages/register.js`

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registro fallido');

      alert('¡Registro exitoso! Ahora podés iniciar sesión.');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient} flex items-center justify-center px-4 py-10`}>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">CanchealApp</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Creá tu cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">Sumate a la plataforma para descubrir clubes, reservar y gestionar partidos.</p>
        </div>

        <form onSubmit={handleRegister} className={`${ui.card} p-6 sm:p-8`}>
          <h2 className="mb-5 text-xl font-bold text-slate-900">Registro</h2>

          <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre completo</label>
          <input
            type="text"
            placeholder="Juan Perez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${ui.input} mb-4`}
          />

          <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${ui.input} mb-4`}
          />

          <label className="mb-1 block text-sm font-semibold text-slate-700">Contraseña</label>
          <input
            type="password"
            placeholder="Elegí una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${ui.input} mb-4`}
          />

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button type="submit" className={`w-full ${ui.buttonPrimary}`}>
            Crear cuenta
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
