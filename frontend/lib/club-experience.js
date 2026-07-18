// Temporary deterministic presentation data.
// Replace with backend-provided ratings and reviews.
export const FEATURE_POOL = ['Futbol 5', 'Futbol 7', 'Techada', 'Buffet', 'Duchas', 'Estacionamiento', 'Iluminacion LED'];
export const RANKING_POOL = ['Mejor valoradas', 'Mas reservadas', 'Tendencia', 'Mejor precio'];
export const REVIEW_POOL = [
  'Excelente iluminacion y turnos faciles de reservar.',
  'Muy buena experiencia para organizar partidos despues del trabajo.',
  'Canchas cuidadas y proceso de reserva simple.',
  'Buen acceso y horarios claros para jugar con amigos.'
];

export function stableNumber(id, min, max) {
  const seed = Number(id) || 1;
  return min + (seed % (max - min + 1));
}

export function getClubExperienceMeta(club) {
  const id = Number(club?.id) || 1;
  const fieldTypes = [...new Set((club?.fields || []).map((field) => String(field.type)).filter(Boolean))];
  const fallbackFeatures = [
    ...fieldTypes.map((type) => `Futbol ${type}`),
    FEATURE_POOL[id % FEATURE_POOL.length],
    FEATURE_POOL[(id + 2) % FEATURE_POOL.length],
    FEATURE_POOL[(id + 4) % FEATURE_POOL.length]
  ];
  const mockRatingAverage = Number((4.2 + (id % 7) / 10).toFixed(1));

  return {
    ratingAverage: club?.ratingAverage ?? mockRatingAverage,
    reviewsCount: club?.reviewsCount ?? stableNumber(id, 18, 146),
    reservationCount: club?.reservationCount ?? null,
    popularityScore: club?.popularityScore ?? null,
    rankingLabel: club?.rankingLabel ?? RANKING_POOL[id % RANKING_POOL.length],
    features: Array.isArray(club?.features) && club.features.length > 0
      ? club.features
      : [...new Set(fallbackFeatures)].slice(0, 5),
    reviewPreview: club?.reviewPreview ?? REVIEW_POOL[id % REVIEW_POOL.length]
  };
}
