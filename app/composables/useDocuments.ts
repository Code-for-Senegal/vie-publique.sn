import type { Document } from '~~/types/document';

export interface DocumentsOptions {
  /** ID du document pour récupération unitaire */
  id?: string | Ref<string>;

  /** Type de document fixe (ex: 'audit_report', 'official_journal') */
  type?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Filtre année initial (ex: '2026'). Appliqué AVANT le premier fetch pour le SSR */
  year?: string;

  /** Filtre famille initial (ex: 'statistics'). Appliqué AVANT le premier fetch pour le SSR */
  family?: string;

  /**
   * Organisme d'audit initial (ex: 'OFNAC'). Appliqué AVANT le premier fetch pour le SSR.
   * Utilisé par les pages dédiées /documents/rapports-audit/organisme/<slug>.
   */
  auditInstitution?: string;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les documents
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { documents, loading, searchQuery, setSearchQuery } = useDocuments({ type: 'audit_report' });
 *
 * // Détail d'un document
 * const { document, loading } = useDocuments({ id: '123' });
 */
export const useDocuments = (options: DocumentsOptions = {}) => {
  const route = useRoute();

  // Pour un document unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<Document>({
      collection: 'documents',
      id: options.id as string | Ref<string>,
    });

    return {
      // Données
      document: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité
      documents: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-publish_date'),
      filterValue: ref('all'),
      yearFilter: ref<string>('all'),
      auditInstitutionFilter: ref<string>(''),
      familyFilter: ref<string>('all'),
      itemsPerPage: ref(options.limit || 10),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),

      // Méthodes vides pour compatibilité
      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setFilterValue: () => {},
      setItemsPerPage: () => {},
      setAuditInstitutionFilter: (_v: string) => {},
      setFamilyFilter: (_v: string) => {},
      resetFilters: () => {},
    };
  }

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || '-publish_date',
    defaultItemsPerPage: options.limit || 10,
    defaultFilter: 'all',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q', // ?q=audit
      filter: options.type === 'audit_report' ? 'organisme' : 'type', // ?organisme=OFNAC ou ?type=law
      page: 'page',
      sort: 'sort',
    },
  });

  // Gestion du filtre par année
  // Initialisé via options.year pour que le PREMIER fetch (SSR inclus) soit déjà filtré.
  const yearFilter = ref<string>(options.year || 'all');

  // Gestion du filtre par organisme d'audit
  // Initialisé via options.auditInstitution pour que le PREMIER fetch (SSR inclus)
  // soit déjà filtré sur les pages dédiées par organisme.
  const auditInstitutionFilter = ref<string>(options.auditInstitution || '');

  // Gestion du filtre par famille de documents
  // Initialisé via options.family pour que le PREMIER fetch (SSR inclus) soit déjà filtré.
  const familyFilter = ref<string>(options.family || 'all');

  // Quand l'organisme est imposé par la page (page dédiée par organisme),
  // on ne lit/écrit PAS le query param ?organisme : l'URL reste propre.
  const lockAuditInstitution = !!options.auditInstitution;

  // Lecture des filtres depuis l'URL
  onMounted(() => {
    if (route.query.year) {
      yearFilter.value = route.query.year as string;
    }
    if (!lockAuditInstitution && route.query.organisme) {
      auditInstitutionFilter.value = route.query.organisme as string;
    }
    if (route.query.family) {
      familyFilter.value = route.query.family as string;
    }
  });

  // Synchronisation du filtre année avec l'URL
  watch(yearFilter, () => {
    const query: any = { ...route.query };
    if (yearFilter.value && yearFilter.value !== 'all') {
      query.year = yearFilter.value;
    } else {
      delete query.year;
    }
    useRouter().replace({ query });
  });

  // Synchronisation du filtre organisme avec l'URL
  // (désactivée sur les pages dédiées où l'organisme est imposé)
  watch(auditInstitutionFilter, () => {
    if (lockAuditInstitution) return;
    const query: any = { ...route.query };
    if (auditInstitutionFilter.value) {
      query.organisme = auditInstitutionFilter.value;
    } else {
      delete query.organisme;
    }
    useRouter().replace({ query });
  });

  // Synchronisation du filtre famille avec l'URL
  watch(familyFilter, () => {
    const query: any = { ...route.query };
    if (familyFilter.value && familyFilter.value !== 'all') {
      query.family = familyFilter.value;
    } else {
      delete query.family;
    }
    useRouter().replace({ query });
  });

  // Construction des filtres spécifiques aux documents
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Type de document fixe (passé en option)
    if (options.type) {
      filters.type = options.type;
    }

    // Filtre dynamique selon le type de document
    const filterVal = state.filterValue.value;

    if (filterVal && filterVal !== 'all') {
      if (options.type === 'official_journal') {
        // Pour journal officiel : filtre par année via filterType (legacy)
        filters.filterType = yearFilter.value !== 'all' ? yearFilter.value : filterVal;
      } else if (options.type === 'audit_report') {
        // Pour rapports d'audit : filtre par organisme via filterType (legacy)
        filters.filterType = filterVal;
      } else if (!options.type) {
        // Sans type spécifique : filtre par type de document
        filters.type = filterVal;
      }
    }

    // Filtre par année (paramètre dédié)
    if (yearFilter.value && yearFilter.value !== 'all') {
      filters.year = yearFilter.value;
    }

    // Filtre par organisme d'audit (paramètre dédié)
    if (auditInstitutionFilter.value) {
      filters.audit_institution = auditInstitutionFilter.value;
    }

    // Filtre par famille de documents
    if (familyFilter.value && familyFilter.value !== 'all') {
      filters.family = familyFilter.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<Document>({
    collection: 'documents',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.apiSearchQuery,
  });

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  // Recalage des pages hors-limites.
  // Si l'URL demande une page > totalPages (ex: ?page=3 alors que la collection
  // filtrée ne contient qu'1 page), le CMS renvoie un tableau vide et l'UI
  // afficherait « Aucun résultat » à tort, sans pagination pour revenir en arrière.
  // On recale donc sur la dernière page valide une fois les données chargées.
  watch([totalPages, collection.loading], () => {
    if (!collection.loading.value && state.currentPage.value > totalPages.value) {
      state.currentPage.value = totalPages.value;
    }
  });

  const setAuditInstitutionFilter = (value: string) => {
    auditInstitutionFilter.value = value;
    state.currentPage.value = 1;
  };

  const setFamilyFilter = (value: string) => {
    familyFilter.value = value;
    state.currentPage.value = 1;
  };

  return {
    // Données
    documents: collection.items,
    document: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    filterValue: state.filterValue,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux documents
    yearFilter,
    auditInstitutionFilter,
    familyFilter,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setFilterValue: state.setFilterValue,
    setItemsPerPage: state.setItemsPerPage,
    setAuditInstitutionFilter,
    setFamilyFilter,
    resetFilters: state.resetFilters,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: state.hasActiveFilters,

    // Alias pour compatibilité avec ancien code
    setSelectedFilter: state.setFilterValue,
    documentType: computed(() => options.type || ''),
    filterType: state.filterValue,
    setTotalItems: () => {}, // Deprecated - géré automatiquement
    setType: (type: string) => {
      // Note: changer le type nécessite une nouvelle instance du composable
      console.warn('setType is deprecated - create a new useDocuments instance with the new type');
    },
  };
};
