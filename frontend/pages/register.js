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
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setSuccess(null);
    try {
      setIsSubmitting(true);
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear la cuenta.');

      setSuccess('Cuenta creada correctamente. Te llevamos al inicio de sesion.');
      setTimeout(() => router.push('/login'), 900);
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient} grid min-h-screen place-items-center px-4 py-10`}>
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">CanchealApp</Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Crea tu cuenta</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sumate para descubrir clubes, reservar turnos y gestionar tus partidos.</p>
        </div>

        <form onSubmit={handleRegister} className={`${ui.card} p-6 sm:p-8`}>
          <label htmlFor="name" className={ui.label}>Nombre completo</label>
          <input
            id="name"
            type="text"
            placeholder="Juan Perez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${ui.input} mb-4`}
            autoComplete="name"
            required
          />

          <label htmlFor="register-email" className={ui.label}>Email</label>
          <input
            id="register-email"
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${ui.input} mb-4`}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password" className={ui.label}>Contraseña</label>
          <div className="mb-4 flex rounded-xl border border-emerald-950/15 bg-white focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-200/70">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Elegi una contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3.5 py-3 text-sm outline-none"
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-xs font-bold text-emerald-800">
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              {success}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={`w-full ${ui.buttonPrimary}`}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
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
