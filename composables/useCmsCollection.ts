export interface CmsCollectionOptions {
  collection: string;
  id?: string;
  fields?: string[];
  filters?: Record<string, any>;
  sort?: Ref<string> | string;
  limit?: Ref<number> | number;
  page?: Ref<number> | number;
  search?: Ref<string> | string;
  transform?: (data: any) => any;
}

export const useCmsCollection = <T>(options: CmsCollectionOptions) => {
  const {
    collection,
    id,
    fields = [],
    filters = {},
    sort = "-publish_date",
    limit = 10,
    page = 1,
    search = "",
    transform,
  } = options;

  // Construction des paramètres de requête réactifs
  const query = computed(() => {
    const params: Record<string, any> = {};

    // Si c'est une collection (liste)
    if (!id) {
      params.limit = unref(limit);
      params.page = unref(page);
      params.sortBy = unref(sort);
    }

    // Ajout des filtres
    const resolvedFilters = unref(filters);
    if (resolvedFilters && Object.keys(resolvedFilters).length > 0) {
      Object.keys(resolvedFilters).forEach((key) => {
        if (resolvedFilters[key] !== undefined && resolvedFilters[key] !== "") {
          params[key] = resolvedFilters[key];
        }
      });
    }

    // Ajout de la recherche
    const searchValue = unref(search);
    if (searchValue) {
      params.search = searchValue;
    }

    // Ajout des champs si spécifiés
    if (fields.length > 0) {
      params.fields = fields.join(",");
    }

    return params;
  });

  // Construction de l'URL selon la collection
  const url = computed(() => {
    if (id) {
      return `/api/${collection}/${id}`;
    } else {
      return `/api/${collection}`;
    }
  });

  // Appel API
  const { data, pending, error, refresh } = useFetch(url, {
    query: id ? undefined : query, // Pas de query params pour les détails
    transform: (response: any) => {
      // Transformation par défaut selon le type de collection
      let items: any[] = [];
      let paginationData = {};

      if (id) {
        // Pour les détails
        items = [
          response.document ||
          response.nomination ||
          response.media ||
          response.commission ||
          response.group ||
          response.question ||
          response.vote ||
          response.deputy ||
          response.item ||
          response.data
        ];
        paginationData = {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
        };
      } else {
        // Pour les collections - structure standardisée
        items =
          response.documents ||
          response.news ||
          response.nominations ||
          response.medias ||
          response.media ||
          response.commissions ||
          response.groups ||
          response.office ||
          response.questions ||
          response.votes ||
          response.deputies ||
          response.items ||
          response.data ||
          [];
        paginationData = response.pagination || {
          page: unref(page),
          limit: unref(limit),
          total: response.total || response.totalCount || response.totalCommissions || response.totalGroups || response.totalQuestions || response.totalVotes || response.totalDeputies || 0,
          totalPages: Math.ceil(
            (response.total || response.totalCount || response.totalCommissions || response.totalGroups || response.totalQuestions || response.totalVotes || response.totalDeputies || 0) / unref(limit),
          ),
        };
      }

      const baseData = {
        items,
        pagination: paginationData,
      };

      return transform ? transform(baseData) : baseData;
    },
  });

  return {
    items: computed(() => data.value?.items || []) as ComputedRef<T[]>,
    item: computed(() => data.value?.items[0] as T | undefined),
    loading: computed(() => pending.value),
    pagination: computed(() => data.value?.pagination),
    error,
    refresh,
  };
};
