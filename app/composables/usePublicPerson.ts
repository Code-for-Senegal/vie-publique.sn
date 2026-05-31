import type { PublicPersonDetail } from '~/types/public-person';

/**
 * Composable pour récupérer le détail d'une personnalité publique.
 *
 * @example
 * const { person, loading, error } = usePublicPerson('123');
 */
export const usePublicPerson = (id: string | Ref<string>) => {
  const resolvedId = computed(() => unref(id));

  const { data, pending, error, refresh } = useFetch(
    () => `/api/public-persons/${resolvedId.value}`,
    {
      key: computed(() => `public-person-${resolvedId.value}`),
    },
  );

  const person = computed<PublicPersonDetail | null>(() => {
    if (!data.value) return null;
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
  };
};
