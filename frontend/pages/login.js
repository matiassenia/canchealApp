
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
  const [showPassword, setShowPassword] = useState(false);
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
      if (!res.ok) throw new Error('El correo o la contraseña son incorrectos.');

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
      setError(err.message || 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${ui.page} ${ui.pageGradient} grid min-h-screen place-items-center px-4 py-10`}>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-[linear-gradient(135deg,#052e16,#166534_55%,#84cc16)] p-8 text-white lg:block">
          <Link href="/" className="text-xl font-black">Cancheal<span className="text-lime-300">App</span></Link>
          <div className="mt-28">
            <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-lime-200">Volver a la cancha</p>
            <h1 className="mt-5 text-4xl font-black leading-tight">Reserva turnos y organiza tu proximo partido.</h1>
            <p className="mt-4 text-sm leading-6 text-emerald-50/85">Accede a clubes, canchas y reservas desde una experiencia simple y profesional.</p>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-7">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800 lg:hidden">CanchealApp</Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Entra a tu cuenta</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Reserva canchas en minutos y gestiona tus partidos desde una sola plataforma.</p>
          </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email" className={ui.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${ui.input} mb-4`}
            autoComplete="email"
            required
          />

          <label htmlFor="password" className={ui.label}>Contraseña</label>
          <div className="mb-4 flex rounded-xl border border-emerald-950/15 bg-white focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-200/70">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3.5 py-3 text-sm outline-none"
              autoComplete="current-password"
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
    </div>
  );
}
