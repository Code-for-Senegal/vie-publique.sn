import type { CorruptionDashboardResponse } from '~~/types/corruption';
import mockData from '../../data/corruption-dashboard.mock.json';

export default defineCachedEventHandler(
  async () => {
    // V1 mock — remplacer par un appel Directus quand prêt
    return mockData as CorruptionDashboardResponse;
  },
  {
    maxAge: 60 * 5, // 5 minutes cache
    name: 'dashboard-corruption',
  },
);
