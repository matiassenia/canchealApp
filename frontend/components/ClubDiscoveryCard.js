import Link from 'next/link';
import { useRouter } from 'next/router';
import ui from '../lib/ui';

const AMENITIES_POOL = ['Iluminacion', 'Vestuarios', 'Estacionamiento', 'Buffet', 'Duchas'];

function placeholderRating(clubId) {
  return (4 + (clubId % 10) / 10).toFixed(1);
}

function placeholderPrice(clubId) {
  const base = 10000 + (clubId % 5) * 1500;
  return `$${base.toLocaleString('es-AR')}/hora`;
}

function placeholderRoofType(clubId) {
  return clubId % 2 === 0 ? 'roofed' : 'open';
}

function placeholderAmenities(clubId) {
  const start = clubId % AMENITIES_POOL.length;
  return [
    AMENITIES_POOL[start],
    AMENITIES_POOL[(start + 1) % AMENITIES_POOL.length],
    AMENITIES_POOL[(start + 2) % AMENITIES_POOL.length]
  ];
}

export function enrichClubForDiscovery(club) {
  const id = Number(club.id) || 0;
  return {
    ...club,
    discoveryRating: placeholderRating(id),
    discoveryPrice: placeholderPrice(id),
    discoveryRoofType: placeholderRoofType(id),
    discoveryAmenities: placeholderAmenities(id),
    discoveryFieldTypes: [...new Set((club.fields || []).map((f) => String(f.type)).filter(Boolean))]
  };
}

export default function ClubDiscoveryCard({ club }) {
  const router = useRouter();

  return (
    <article className={`overflow-hidden ${ui.card} ${ui.cardHover}`}>
      <div className="h-32 bg-gradient-to-r from-emerald-600 via-green-600 to-lime-500" />
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={ui.badge}>
            Zona {club.zone || 'Sin zona'}
          </span>
          <span className="text-xs font-bold text-amber-600">{club.discoveryRating} ★</span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900">{club.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{club.address || 'Direccion no disponible'}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
            {club.fields?.length || 0} canchas
          </span>
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
            {club.discoveryRoofType === 'roofed' ? 'Techada' : 'Al aire libre'}
          </span>
          {club.discoveryFieldTypes.length > 0 && (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
              Futbol {club.discoveryFieldTypes.join('/')}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {club.discoveryAmenities.map((amenity) => (
            <span key={`${club.id}-${amenity}`} className={ui.badgeSuccess}>
              {amenity}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm font-bold text-emerald-700">Desde {club.discoveryPrice}</p>

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
