import type {
  EtatOrganisationInstitutionsResponse,
  EtatOrganisationInstitution,
  EtatOrganisationInstitutionDetailResponse,
} from '~~/types/etat-organisation';

export function useEtatOrganisationInstitutions() {
  const route = useRoute();
  const router = useRouter();

  const search = computed({
    get: () => (route.query.search as string) || '',
    set: (v: string) => router.push({ query: { ...route.query, search: v || undefined } }),
  });

  const { data, pending, error, refresh } = useAsyncData<EtatOrganisationInstitutionsResponse>(
    'etat-organisation-institutions',
    () => $fetch('/api/etat-organisation/institutions'),
    { server: true },
  );

  const normalizeStr = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const institutions = computed<EtatOrganisationInstitution[]>(
    () => data.value?.institutions ?? [],
  );

  const filtered = computed<EtatOrganisationInstitution[]>(() => {
    const active = institutions.value.filter((i) => !i.dissolved);
    if (!search.value.trim()) return active;
    const q = normalizeStr(search.value.trim());
    return active.filter((i) => normalizeStr(i.name).includes(q));
  });

  const dissolved = computed<EtatOrganisationInstitution[]>(() => {
    const archived = institutions.value.filter((i) => i.dissolved);
    if (!search.value.trim()) return archived;
    const q = normalizeStr(search.value.trim());
    return archived.filter((i) => normalizeStr(i.name).includes(q));
  });

  const getBySlug = (slug: string) => institutions.value.find((i) => i.slug === slug) ?? null;

  // ── Detail fetch (driven by route param :slug) ────────────────
  const selectedSlug = computed(() => (route.params.slug as string) || '');

  const {
    data: institutionData,
    pending: institutionPending,
    error: institutionError,
    refresh: refreshInstitution,
  } = useAsyncData<EtatOrganisationInstitutionDetailResponse>(
    () => `etat-organisation-institution-${selectedSlug.value}`,
    () =>
      selectedSlug.value
        ? $fetch(`/api/etat-organisation/institutions/${selectedSlug.value}`)
        : Promise.resolve(null),
    { server: true, watch: [selectedSlug] },
  );

  const institution = computed(() => institutionData.value?.institution ?? null);

  return {
    institutions,
    filtered,
    dissolved,
    search,
    pending,
    error,
    refresh,
    getBySlug,
    institution,
    institutionPending,
    institutionError,
    refreshInstitution,
  };
}
