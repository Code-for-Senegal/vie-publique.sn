import type { Coalition } from "~~/types/coalition";

interface UseCoalitionsOptions {
    year?: number | Ref<number>;
    type?: string | Ref<string>;
    ranking?: boolean | Ref<boolean>;
    id?: string | Ref<string | null>;
    constituencyId?: string | number | Ref<string | number | null>;
}

/**
 * Composable pour gérer les coalitions électorales du Dashboard
 */
export const useElectoralCoalitions = (options: UseCoalitionsOptions = {}) => {
  const year = isRef(options.year) ? options.year : ref(options.year);
  const type = isRef(options.type) ? options.type : ref(options.type);
  const ranking = isRef(options.ranking) ? options.ranking : ref(options.ranking);
  const id = isRef(options.id) ? options.id : ref(options.id);
  const constituencyId = isRef(options.constituencyId) ? options.constituencyId : ref(options.constituencyId);

  const query = computed(() => {
      const params: Record<string, any> = {};
      if (year.value) params.year = year.value;
      if (type.value) params.type = type.value;
      if (ranking.value) params.ranking = "true";
      if (constituencyId.value) params.constituency_id = constituencyId.value;
      return params;
  });

  const apiUrl = computed(() => id.value 
      ? `/api/elections/coalitions/${id.value}` 
      : "/api/elections/dashboard/coalitions"
  );

  const { data, pending: loading, error, refresh } = useFetch<{
    data: Coalition[] | Coalition;
    coalition?: Coalition;
  }>(apiUrl, {
    query,
    key: computed(() => `dashboard-coalitions-${id.value || 'list'}-${year.value || 'all'}-${type.value || 'all'}-${ranking.value || 'false'}`),
    server: false,
    watch: [year, type],
  });

  const coalitions = computed(() => {
      if (id.value) return [];
      if (Array.isArray(data.value?.data)) return data.value.data;
      return [];
  });

  return {
    coalitions,
    loading,
    error,
    refresh,
  };
};
