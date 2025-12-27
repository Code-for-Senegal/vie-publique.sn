<template>
  <div class="container mx-auto px-4 py-4">
    <UButton
      icon="i-heroicons-arrow-left"
      class="mb-2"
      variant="ghost"
      label="Retour"
      color="gray"
      @click="handleReturn()"
    />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur est survenue lors de l'affichage des informations du député."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <div v-else-if="deputy" class="mt-3 flex flex-col gap-4 md:flex-row">
      <div class="w-full md:w-1/3">
        <div class="md:z-1 sticky top-[84px] bg-gray-100 md:bg-transparent">
          <AssemblyProfileHeader :deputy="deputy" />
        </div>
      </div>

      <div class="flex w-full flex-col gap-5 md:w-2/3">
        <!-- BIO -->
        <AssemblyBiography :deputy="deputy" />

        <!-- COMMISSIONS -->
        <UCard v-if="deputiesCommissions.length">
          <h2 class="mb-4 text-xl font-bold">Commissions</h2>

          <div v-if="deputiesCommissionsFiltered.length === 0">
            <p class="text-sm text-gray-500">Aucune commission</p>
          </div>
          <div v-else>
            <p class="my-4 text-sm text-gray-500 dark:text-gray-50">
              Membres des commissions suivantes:
            </p>

            <div
              v-for="commission in deputiesCommissionsFiltered"
              :key="commission.assembly_commission_id.id"
              class="transition-all hover:shadow-lg"
            >
              <NuxtLink
                :to="`/assemblee-nationale/commissions/${commission.assembly_commission_id.id}`"
              >
                <ul class="flex gap-4">
                  <li class="mb-2 text-sm underline">
                    <UIcon name="i-heroicons-arrow-top-right-on-square" size="sm" />
                    {{ commission.assembly_commission_id.name }}
                  </li>
                </ul>
              </NuxtLink>
            </div>
          </div>
        </UCard>

        <!-- QUESTIONS ECRITES -->
        <AssemblyDeputyQuestion :deputy="deputy" />
      </div>
    </div>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500">Député non trouvé</div>
  </div>
</template>

<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();
const router = useRouter();

// ✅ Utilisation de la nouvelle architecture SSR
const deputyId = computed(() => route.params.id as string);

const { deputy, loading, error } = useAssemblyDeputies({ id: deputyId.value });
const { commissions: deputiesCommissions } = useAssemblyDeputyCommissions(deputyId.value);

const deputyFullName = computed(() => {
  if (!deputy.value) return '';
  return `${deputy.value.first_name} ${deputy.value.last_name}`;
});

const title = computed(() => {
  if (!deputy.value) return 'Chargement...';
  return `${deputyFullName.value} - Député ${deputy.value.electoral_list?.name || ''} | Assemblée nationale Sénégal`;
});

const description = computed(() => {
  if (!deputy.value) return '';
  const age = deputy.value.birthdate ? calculateAge(deputy.value.birthdate) : '';
  const ageText = age ? `, ${age} ans` : '';
  const listText = deputy.value.electoral_list?.name
    ? ` de la liste ${deputy.value.electoral_list.name}`
    : '';
  return `Découvrez le profil et l'activité parlementaire de ${deputyFullName.value}${ageText}, député${listText} à l'Assemblée nationale du Sénégal.`;
});

const url = computed(() => {
  if (!route.params.id) return siteUrl;
  // Utilise l'URL complète avec le nom du député si disponible
  if (deputy.value && route.fullPath) {
    return `${siteUrl}${route.fullPath}`;
  }
  // Fallback avec juste l'ID
  return `${siteUrl}/assemblee-nationale/deputes/${route.params.id}`;
});

const image = computed(() => {
  const photo = deputy.value?.photo;
  // Si photo est un objet (relation Directus), on essaie de récupérer l'ID
  const photoId =
    typeof photo === 'object' && photo !== null && 'id' in photo ? (photo as any).id : photo;

  if (typeof photoId !== 'string') {
    return `${siteUrl}/images/vpsn-share-elections.png`;
  }

  // Utilisation de useCmsImage (safe) puis concaténation manuelle avec siteUrl (safe)
  const relativeUrl = useCmsImage(photoId);
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${siteUrl}${relativeUrl}`;
});

const getSafeString = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return '';
};

// SEO Setup
useSeoMeta({
  title: () => getSafeString(title.value),
  ogTitle: () => getSafeString(title.value),
  description: () => getSafeString(description.value),
  ogDescription: () => getSafeString(description.value),
  ogImage: () => image.value,
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => getSafeString(title.value),
  twitterDescription: () => getSafeString(description.value),
  twitterImage: () => image.value,
  keywords: () =>
    [
      ...keywords,
      `${deputyFullName.value}`,
      'député Sénégal',
      'Assemblée nationale Sénégal',
      'parlementaire sénégalais',
      deputy.value?.electoral_list?.name || '',
      deputy.value?.residence || '',
    ]
      .filter(Boolean)
      .join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'profile' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
  ],
});

// Structured Data
useSchemaOrg([
  defineBreadcrumb({
    itemListElement: () => [
      { name: 'Accueil', item: '/' },
      { name: 'Assemblée nationale', item: '/assemblee-nationale' },
      { name: 'Députés', item: '/assemblee-nationale/deputes' },
      { name: deputyFullName.value || 'Député', item: url.value },
    ],
  }),
  definePerson({
    name: () => deputyFullName.value,
    givenName: () => getSafeString(deputy.value?.first_name),
    familyName: () => getSafeString(deputy.value?.last_name),
    jobTitle: 'Député',
    description: () => getSafeString(description.value),
    image: () => image.value,
    url: () => url.value,
    birthDate: () => deputy.value?.birthdate,
    gender: () => deputy.value?.gender,
    address: () =>
      deputy.value?.residence
        ? {
            '@type': 'PostalAddress',
            addressLocality: deputy.value.residence,
            addressCountry: 'SN',
          }
        : undefined,
    worksFor: {
      '@type': 'GovernmentOrganization',
      name: 'Assemblée nationale du Sénégal',
      url: `${siteUrl}/assemblee-nationale`,
    },
    memberOf: () =>
      deputy.value?.electoral_list
        ? {
            '@type': 'PoliticalParty',
            name: deputy.value.electoral_list.name,
          }
        : undefined,
  }),
]);

// Helper function
function calculateAge(birthdate: string): number {
  const birthDate = new Date(birthdate);
  const today = new Date();
  return today.getFullYear() - birthDate.getFullYear();
}

const deputiesCommissionsFiltered = computed(() => {
  return deputiesCommissions.value.filter((commission) => commission.assembly_commission_id);
});

// Liste des routes valides pour le retour
const validReturnPaths = [
  '/assemblee-nationale/deputes',
  '/assemblee-nationale/commissions',
  '/assemblee-nationale/bureau',
  '/assemblee-nationale/groupes',
];

// Gestion du retour
const handleReturn = () => {
  // Vérifie si on a un referer dans l'historique de navigation
  const previousRoute = router.options.history.state.back;

  // Si on a un referer et qu'il fait partie des routes valides
  if (
    typeof previousRoute === 'string' &&
    validReturnPaths.some((path) => previousRoute.startsWith(path))
  ) {
    router.back();
  } else {
    // Sinon, redirection vers la liste des députés par défaut
    router.push('/assemblee-nationale/deputes');
  }
};
</script>
