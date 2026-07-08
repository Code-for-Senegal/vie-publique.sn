import type { WhistleblowingSubjectsResponse } from '~~/types/corruption';
import mockData from '../../data/whistleblowing-subjects.mock.json';

export default defineCachedEventHandler(
  async () => {
    // V1 mock — remplacer par un appel Directus quand prêt
    return mockData as WhistleblowingSubjectsResponse;
  },
  {
    maxAge: 60 * 60, // 1h cache
    name: 'whistleblowing-subjects',
  },
);
