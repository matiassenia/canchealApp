import Link from 'next/link';
import { useRouter } from 'next/router';
import ui from '../lib/ui';

export function enrichClubForDiscovery(club) {
  return {
    ...club,
    discoveryFieldTypes: [...new Set((club.fields || []).map((f) => String(f.type)).filter(Boolean))]
  };
}

export default function ClubDiscoveryCard({ club }) {
  const router = useRouter();

  return (
    <article className={`overflow-hidden ${ui.card} ${ui.cardHover}`}>
      <div className="relative h-32 bg-[linear-gradient(135deg,#064e3b,#16a34a_55%,#84cc16)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_28%)]" />
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
