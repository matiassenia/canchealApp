import Link from 'next/link';
import ui from '../lib/ui';
import { getClubExperienceMeta } from '../lib/club-experience';

export function PremiumSurface({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] border border-white/55 bg-white/72 shadow-[0_24px_90px_rgba(6,78,59,0.14)] backdrop-blur-xl ring-1 ring-emerald-950/5 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(132,204,22,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.52),transparent_45%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function StarRating({ value }) {
  const rating = Number(value) || 0;
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = rounded >= star ? 'full' : rounded >= star - 0.5 ? 'half' : 'empty';
        if (fill === 'half') {
          return (
            <span key={star} className="relative inline-block text-slate-300">
              ★
              <span className="absolute inset-0 w-1/2 overflow-hidden text-amber-500">★</span>
            </span>
          );
        }
        return <span key={star} className={fill === 'full' ? 'text-amber-500' : 'text-slate-300'}>★</span>;
      })}
    </span>
  );
}

export function RatingSummary({ rating, reviewsCount }) {
  const numericRating = Number(rating) || 0;
  const label = `${numericRating.toFixed(1)} de 5, basado en ${reviewsCount} opiniones`;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-emerald-950 shadow-sm ring-1 ring-emerald-950/10" aria-label={label}>
      <StarRating value={numericRating} />
      <span>{numericRating.toFixed(1)}</span>
      <span className="font-semibold text-slate-500">({reviewsCount})</span>
    </div>
  );
}

export function FeatureBadges({ features = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {features.map((feature) => (
        <span key={feature} className="rounded-full border border-emerald-950/10 bg-white/70 px-2.5 py-1 text-[11px] font-extrabold text-emerald-950 shadow-sm backdrop-blur">
          {feature}
        </span>
      ))}
    </div>
  );
}

export function RankingPill({ value }) {
  return <span className="rounded-full bg-emerald-950/90 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-lime-200 shadow-lg shadow-emerald-950/20">{value}</span>;
}

export function KpiCard({ label, value, hint, accent = 'lime' }) {
  const accentClass = accent === 'emerald' ? 'from-emerald-500/22 to-lime-200/30' : 'from-lime-300/35 to-emerald-200/25';
  return (
    <PremiumSurface className="p-5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`} />
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-900/70">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{value}</p>
      {hint && <p className="mt-2 text-sm leading-5 text-slate-600">{hint}</p>}
    </PremiumSurface>
  );
}

export function PageShell({ children, className = '' }) {
  return (
    <div className={`${ui.page} ${ui.pageGradient} ${className}`}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(90deg,#052e16_1px,transparent_1px),linear-gradient(#052e16_1px,transparent_1px)] [background-size:36px_36px]" />
      {children}
    </div>
  );
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
  const toneClass = tone === 'error' ? 'border-rose-200 bg-rose-50/90 text-rose-800' : 'border-white/60 bg-white/70 text-slate-800 backdrop-blur-xl';
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
      <div className="h-52 animate-pulse bg-gradient-to-br from-emerald-200 via-lime-100 to-emerald-100" />
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
  const meta = getClubExperienceMeta(club);
  return (
    <article className={`group overflow-hidden ${ui.card} ${ui.cardHover}`}>
      <div className="relative h-56 bg-[linear-gradient(135deg,#052e16,#15803d_46%,#84cc16)]">
        <div className="absolute inset-0 bg-[url('/images/football-field.svg')] bg-cover bg-center opacity-85 transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-emerald-950/10 to-white/5" />
        <div className="absolute left-4 top-4"><RankingPill value={meta.rankingLabel} /></div>
        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-emerald-950 shadow-sm backdrop-blur">
          {club.fields?.length || 0} canchas
        </div>
        <div className="absolute bottom-4 right-4"><RatingSummary rating={meta.ratingAverage} reviewsCount={meta.reviewsCount} /></div>
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={ui.badge}>{club.zone || 'Zona no informada'}</span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-slate-950">{club.name}</h2>
        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{club.address || 'Direccion no disponible'}</p>
        <div className="mt-4"><FeatureBadges features={meta.features} /></div>
        <blockquote className="mt-4 rounded-2xl border border-emerald-950/10 bg-emerald-50/65 p-3 text-xs font-semibold leading-5 text-emerald-950/75">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-emerald-800/70">Opinion destacada</span>
          <span className="italic">“{meta.reviewPreview}”</span>
        </blockquote>
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
    <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 text-sm shadow-sm backdrop-blur-xl sm:flex-row">
      <p className="font-semibold text-slate-600">Pagina {pagination.page} de {pagination.totalPages} · {pagination.total} clubes</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(pagination.page - 1)} disabled={!pagination.hasPreviousPage} className={ui.buttonSecondary}>Anterior</button>
        <button type="button" onClick={() => onPageChange(pagination.page + 1)} disabled={!pagination.hasNextPage} className={ui.buttonPrimary}>Siguiente</button>
      </div>
    </div>
  );
}
