
//### 📄 `pages/login.js`
//```jsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';
import ui from '../lib/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    try {
      setIsSubmitting(true);
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);

      let role;
      try {
      const [, payload] = data.token.split('.');
      const decoded = JSON.parse(atob(payload));
      role = decoded.role;
      localStorage.setItem('role',role);
      } catch {
        throw new Error ('Token inválido');
      }
      if (role === 'OWNER') {
        router.push('/owner/dashboard');
      } else {
        router.push('/clubs');
      }
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient} flex items-center justify-center px-4 py-10`}>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">CanchealApp</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Entrá a tu cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">Reservá canchas en minutos y gestioná tus partidos desde una sola plataforma.</p>
        </div>

        <form onSubmit={handleLogin} className={`${ui.card} p-6 sm:p-8`}>
          <h2 className="mb-5 text-xl font-bold text-slate-900">Iniciar sesión</h2>

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
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${ui.input} mb-4`}
          />

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={`w-full ${ui.buttonPrimary}`}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
