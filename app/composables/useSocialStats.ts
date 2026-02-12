import type { SocialStatsResponse } from '~~/types/social-stat';

export const useSocialStats = () => {
  const {
    data: response,
    pending: loading,
    error,
    refresh,
  } = useFetch<SocialStatsResponse>('/api/social-stats', {
    key: 'social-stats-list',
    server: true,
    lazy: false,
  });

  const stats = computed(() => response.value?.data || []);
  const visibleStats = computed(() => stats.value.filter((s) => s.display));
  const total = computed(() => response.value?.total || 0);

  return {
    stats,
    visibleStats,
    total,
    loading,
    error,
    refresh,
  };
};
