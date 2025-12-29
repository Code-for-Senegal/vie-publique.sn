import type { Candidate } from "~~/types/candidate";

export interface ElectoralList {
  id: string;
  name: string;
  type: "national" | "departmental" | "diaspora";
  is_substitute: boolean;
  type_scrutin?: string;
  constituency?: { name: string } | null;
  candidates: Candidate[];
}

/**
 * Composable pour récupérer les listes électorales d'une coalition (Dashboard)
 * Filtre par élection (année/type) pour assurer la cohérence des données
 */
export const useElectoralDashboardLists = (options: {
  coalitionId?: Ref<string | null> | string | null;
  constituencyId?: Ref<string | null> | string | null;
  year: Ref<number> | number;
  type: Ref<string> | string;
}) => {
  const coalitionId = isRef(options.coalitionId) ? options.coalitionId : ref(options.coalitionId);
  const constituencyId = isRef(options.constituencyId) ? options.constituencyId : ref(options.constituencyId);
  const year = isRef(options.year) ? options.year : ref(options.year);
  const type = isRef(options.type) ? options.type : ref(options.type);

  const { data, pending: loading, error, refresh } = useFetch<{ data: ElectoralList[] }>(
    "/api/elections/dashboard/lists",
    {
      query: {
        coalitionId,
        constituencyId,
        year,
        type,
      },
      key: computed(() => `dashboard-lists-${unref(coalitionId)}-${unref(constituencyId)}-${unref(year)}-${unref(type)}`),
      watch: [coalitionId, constituencyId, year, type],
      immediate: true,
      server: true,
    }
  );

  const lists = computed(() => data.value?.data || []);

  return {
    lists,
    loading,
    error,
    refresh,
  };
};
