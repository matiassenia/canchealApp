import Link from 'next/link';
import { useRouter } from 'next/router';
import ui from '../lib/ui';
import { getClubExperienceMeta } from '../lib/club-experience';
import { FeatureBadges, RankingPill, RatingSummary } from './ui-kit';

export function enrichClubForDiscovery(club) {
  return {
    ...club,
    discoveryFieldTypes: [...new Set((club.fields || []).map((f) => String(f.type)).filter(Boolean))]
  };
}

export default function ClubDiscoveryCard({ club }) {
  const router = useRouter();
  const meta = getClubExperienceMeta(club);

  return (
    <article className={`overflow-hidden ${ui.card} ${ui.cardHover}`}>
      <div className="relative h-52 bg-[linear-gradient(135deg,#064e3b,#16a34a_55%,#84cc16)]">
        <div className="absolute inset-0 bg-[url('/images/football-field.svg')] bg-cover bg-center opacity-85 transition duration-500 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-transparent to-white/5" />
        <div className="absolute left-4 top-4"><RankingPill value={meta.rankingLabel} /></div>
        <div className="absolute bottom-4 right-4"><RatingSummary rating={meta.ratingAverage} reviewsCount={meta.reviewsCount} /></div>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={ui.badge}>
            Zona {club.zone || 'Sin zona'}
          </span>
          <span className="text-xs font-bold text-emerald-700">{club.fields?.length || 0} canchas</span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900">{club.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{club.address || 'Direccion no disponible'}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
            {club.fields?.length || 0} canchas
          </span>
          {club.discoveryFieldTypes.length > 0 && (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
              Futbol {club.discoveryFieldTypes.join('/')}
            </span>
          )}
        </div>

        <div className="mt-3"><FeatureBadges features={meta.features} /></div>
        <blockquote className="mt-3 rounded-2xl bg-emerald-50/80 p-3 text-xs font-semibold leading-5 text-emerald-950/75">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-emerald-800/70">Opinion destacada</span>
          <span className="italic">“{meta.reviewPreview}”</span>
        </blockquote>

        <p className="mt-4 text-sm font-bold text-emerald-700">Consultar disponibilidad</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/clubs/${club.id}`}
            className={`${ui.buttonSecondary} text-center`}
          >
            Ver perfil
          </Link>
          <button
            type="button"
            onClick={() => router.push(`/availability?clubId=${club.id}`)}
            className={ui.buttonPrimary}
          >
            Reservar
          </button>
        </div>
      </div>
    </article>
  );
}
