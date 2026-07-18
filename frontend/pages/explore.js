import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import withAuth from '../components/withAuth';
import { apiFetch } from '../lib/api';
import ClubDiscoveryCard, { enrichClubForDiscovery } from '../components/ClubDiscoveryCard';
import ui from '../lib/ui';
import { PageHeader, SkeletonCard, StateBlock } from '../components/ui-kit';

function ExplorePage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [fieldTypeFilter, setFieldTypeFilter] = useState('all');

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('/clubs?page=1&limit=50');
        const data = await res.json();
        const clubRows = Array.isArray(data) ? data : (data.data || []);
        const parsed = clubRows.map(enrichClubForDiscovery);
        setClubs(parsed);
      } catch {
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
      return matchesSearch && matchesZone && matchesFieldType;
    });
  }, [clubs, search, zoneFilter, fieldTypeFilter]);

  return (
    <div className={`${ui.page} ${ui.pageGradient}`}>
      <Navbar />

      <main className={ui.container}>
        <PageHeader eyebrow="Marketplace de canchas" title="Explorar clubes" description="Busca por nombre, zona o modalidad y llega rapido al detalle del club." />

        <section className={`mb-6 ${ui.card} p-4 sm:p-5`}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar club..."
              className={ui.input}
            />

            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className={ui.input}
            >
              <option value="all">Todas las zonas</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>

            <select
              value={fieldTypeFilter}
              onChange={(e) => setFieldTypeFilter(e.target.value)}
              className={ui.input}
            >
              <option value="all">Todos los tipos</option>
              <option value="5">Futbol 5</option>
              <option value="7">Futbol 7</option>
              <option value="11">Futbol 11</option>
            </select>
          </div>
        </section>

        {loading ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <SkeletonCard key={item} />)}
          </section>
        ) : error ? (
          <StateBlock title="No se pudieron cargar los clubes" description={error} tone="error" />
        ) : filteredClubs.length === 0 ? (
          <StateBlock title="No encontramos clubes con esos filtros" description="Proba con otra zona, nombre o modalidad de cancha." />
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
