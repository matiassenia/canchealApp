import Link from 'next/link';
import ui from '../lib/ui';

export function PageShell({ children, className = '' }) {
  return <div className={`${ui.page} ${ui.pageGradient} ${className}`}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <span className={ui.badgeSuccess}>{eyebrow}</span>}
        <h1 className={`${ui.title} mt-3`}>{title}</h1>
        {description && <p className={ui.subtitle}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function StateBlock({ title, description, action, tone = 'default' }) {
  const toneClass = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-950/10 bg-white text-slate-800';
  return (
    <section className={`rounded-[1.35rem] border p-6 text-center shadow-sm ${toneClass}`}>
      <p className="text-base font-extrabold">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-lg text-sm opacity-80">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}

export function SkeletonCard() {
  return (
    <div className={`overflow-hidden ${ui.card}`}>
      <div className="h-36 animate-pulse bg-gradient-to-r from-emerald-100 to-lime-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const value = status || 'PENDING';
  const styles = {
    CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    CANCELLED: 'border-rose-200 bg-rose-50 text-rose-800',
    PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
    COMPLETED: 'border-slate-200 bg-slate-100 text-slate-700'
  };
  const labels = {
    CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada',
    PENDING: 'Pendiente',
    COMPLETED: 'Completada'
  };
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${styles[value] || styles.PENDING}`}>{labels[value] || value}</span>;
}

export function ClubCard({ club }) {
  const fieldTypes = [...new Set((club.fields || []).map((field) => field.type).filter(Boolean))];
  return (
    <article className={`group overflow-hidden ${ui.card} ${ui.cardHover}`}>
      <div className="relative h-36 bg-[linear-gradient(135deg,#064e3b,#16a34a_55%,#84cc16)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:auto,42px_42px]" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-emerald-950 shadow-sm">
          {club.fields?.length || 0} canchas
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={ui.badge}>{club.zone || 'Zona no informada'}</span>
          {fieldTypes.length > 0 && <span className={ui.badgeSuccess}>Futbol {fieldTypes.join('/')}</span>}
        </div>
        <h2 className="text-xl font-black tracking-tight text-slate-950">{club.name}</h2>
        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{club.address || 'Direccion no disponible'}</p>
        <p className="mt-4 text-sm font-bold text-emerald-800">Consultar disponibilidad</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link href={`/clubs/${club.id}`} className={`${ui.buttonSecondary} text-center`}>Ver detalle</Link>
          <Link href={`/availability?clubId=${club.id}`} className={`${ui.buttonPrimary} text-center`}>Reservar</Link>
        </div>
      </div>
    </article>
  );
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination) return null;
  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-950/10 bg-white p-3 text-sm shadow-sm sm:flex-row">
      <p className="font-semibold text-slate-600">Pagina {pagination.page} de {pagination.totalPages} · {pagination.total} clubes</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(pagination.page - 1)} disabled={!pagination.hasPreviousPage} className={ui.buttonSecondary}>Anterior</button>
        <button type="button" onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNextPage} className={ui.buttonPrimary}>Siguiente</button>
      </div>
    </div>
  );
}
