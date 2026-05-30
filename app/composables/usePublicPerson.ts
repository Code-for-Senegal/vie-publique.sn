import type { PublicPersonDetail } from '~/types/public-person';

/**
 * Composable pour récupérer le détail d'une personnalité publique.
 * Gère la résolution legacy (ancien positions.id -> nouveau public_persons.id).
 *
 * @example
 * const { person, loading, error, isLegacyRedirect } = usePublicPerson('123');
 */
export const usePublicPerson = (id: string | Ref<string>) => {
  const resolvedId = computed(() => unref(id));

  const { data, pending, error, refresh } = useFetch(
    () => `/api/public-persons/${resolvedId.value}`,
    {
      key: computed(() => `public-person-${resolvedId.value}`),
    },
  );

  // Gestion de la redirection legacy (301)
  const isLegacyRedirect = computed(() => data.value?.redirect === true);
  const redirectTo = computed(() => data.value?.redirectTo || null);

  // Si c'est un redirect legacy, effectuer la navigation
  watch(
    data,
    (newData) => {
      if (newData?.redirect && newData?.redirectTo) {
        navigateTo(newData.redirectTo, { redirectCode: 301 });
      }
    },
    { immediate: true },
  );

  const person = computed<PublicPersonDetail | null>(() => {
    if (!data.value || data.value.redirect) return null;
    return data.value.person as PublicPersonDetail;
  });

  // Nomination actuelle
  const currentAppointment = computed(() => person.value?.current_appointment || null);

  // Historique des nominations
  const appointments = computed(() => person.value?.appointments || []);

  // Réseaux sociaux disponibles
  const socialLinks = computed(() => {
    if (!person.value) return [];
    const links: { name: string; url: string; icon: string }[] = [];
    if (person.value.facebook)
      links.push({ name: 'Facebook', url: person.value.facebook, icon: 'i-simple-icons-facebook' });
    if (person.value.twitter)
      links.push({ name: 'X (Twitter)', url: person.value.twitter, icon: 'i-simple-icons-x' });
    if (person.value.instagram)
      links.push({
        name: 'Instagram',
        url: person.value.instagram,
        icon: 'i-simple-icons-instagram',
      });
    if (person.value.tiktok)
      links.push({ name: 'TikTok', url: person.value.tiktok, icon: 'i-simple-icons-tiktok' });
    if (person.value.linkedin)
      links.push({
        name: 'LinkedIn',
        url: person.value.linkedin,
        icon: 'i-simple-icons-linkedin',
      });
    if (person.value.website)
      links.push({ name: 'Site web', url: person.value.website, icon: 'i-heroicons-globe-alt' });
    return links;
  });

  return {
    person,
    currentAppointment,
    appointments,
    socialLinks,
    loading: pending,
    error,
    refresh,
    isLegacyRedirect,
    redirectTo,
  };
};
