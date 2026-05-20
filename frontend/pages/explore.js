import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import withAuth from '../components/withAuth';
import { apiFetch } from '../lib/api';
import ClubDiscoveryCard, { enrichClubForDiscovery } from '../components/ClubDiscoveryCard';

function ExplorePage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [fieldTypeFilter, setFieldTypeFilter] = useState('all');
  const [roofFilter, setRoofFilter] = useState('all');

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('/clubs');
        const data = await res.json();
        const parsed = Array.isArray(data) ? data.map(enrichClubForDiscovery) : [];
        setClubs(parsed);
      } catch (err) {
        setError('No se pudieron cargar los clubes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const zones = useMemo(() => {
    const unique = [...new Set(clubs.map((club) => club.zone).filter(Boolean))];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = club.name.toLowerCase().includes(search.toLowerCase().trim());
      const matchesZone = zoneFilter === 'all' || club.zone === zoneFilter;
      const matchesFieldType =
        fieldTypeFilter === 'all' || (club.discoveryFieldTypes || []).includes(fieldTypeFilter);
      const matchesRoof = roofFilter === 'all' || club.discoveryRoofType === roofFilter;

      return matchesSearch && matchesZone && matchesFieldType && matchesRoof;
    });
  }, [clubs, search, zoneFilter, fieldTypeFilter, roofFilter]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Explorar clubes</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Descubri canchas por zona, tipo y servicios. Reserva rapido desde un solo lugar.
          </p>
        </header>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar club..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />

            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="all">Todas las zonas</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>

            <select
              value={fieldTypeFilter}
              onChange={(e) => setFieldTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="5">Futbol 5</option>
              <option value="7">Futbol 7</option>
              <option value="11">Futbol 11</option>
            </select>

            <select
              value={roofFilter}
              onChange={(e) => setRoofFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="all">Techadas y abiertas</option>
              <option value="roofed">Techadas</option>
              <option value="open">Al aire libre</option>
            </select>
          </div>
        </section>

        {loading ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl bg-white shadow">
                <div className="h-32 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </section>
        ) : error ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="font-semibold text-red-600">{error}</p>
            <p className="mt-2 text-sm text-slate-600">Intenta nuevamente en unos segundos.</p>
          </section>
        ) : filteredClubs.length === 0 ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="font-semibold text-slate-900">No encontramos clubes con esos filtros.</p>
            <p className="mt-2 text-sm text-slate-600">Prueba con otra zona o borra algunos filtros.</p>
          </section>
        ) : (
          <>
            <div className="mb-3 text-sm font-medium text-slate-600">{filteredClubs.length} clubes encontrados</div>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <ClubDiscoveryCard key={club.id} club={club} />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default withAuth(ExplorePage);
