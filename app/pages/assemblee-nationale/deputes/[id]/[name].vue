<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb
        :items="[
          { label: 'Assemblée nationale', to: '/assemblee-nationale' },
          { label: 'Députés', to: '/assemblee-nationale/deputes' },
          { label: deputyFullName || 'Détail' },
        ]"
      />
    </div>

    <!-- Sticky Header mobile -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 md:relative md:border-0 md:bg-transparent md:backdrop-blur-none"
    >
      <div class="container mx-auto px-4 py-3 md:py-4">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/assemblee-nationale/deputes"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 md:hidden"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-sm font-semibold text-gray-900 dark:text-white md:text-lg">
              {{ deputyFullName || 'Député' }}
            </h1>
          </div>
          <SocialShare v-if="deputy" :title="deputyFullName" :url="url" />
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div class="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 dark:bg-gray-800">
          <USkeleton class="h-24 w-24 rounded-full" />
          <USkeleton class="h-5 w-40" />
          <USkeleton class="h-4 w-32" />
        </div>
        <div class="space-y-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
          <USkeleton class="h-5 w-24" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="mx-auto mb-3 h-10 w-10 text-red-500"
        />
        <h3 class="font-semibold text-red-800 dark:text-red-200">Erreur</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-300">Une erreur est survenue</p>
        <NuxtLink
          to="/assemblee-nationale/deputes"
          class="mt-4 inline-block text-sm text-red-600 underline dark:text-red-400"
        >
          Retourner aux députés
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else-if="deputy" class="space-y-4 md:flex md:gap-6 md:space-y-0">
        <!-- Profile Card - Sticky on desktop -->
        <div class="md:w-1/3">
          <div class="md:sticky md:top-20">
            <AssemblyProfileHeader :deputy="deputy" />
          </div>
        </div>

        <!-- Main Content -->
        <div class="space-y-4 md:w-2/3">
          <!-- Biography -->
          <AssemblyBiography :deputy="deputy" />

          <!-- Commissions -->
          <section
            v-if="deputiesCommissions.length"
            class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
          >
            <h2 class="mb-3 text-sm font-bold text-gray-900 dark:text-white md:text-base">
              Commissions
            </h2>

            <div v-if="deputiesCommissionsFiltered.length === 0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Aucune commission</p>
            </div>
            <div v-else class="space-y-2">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Membre des commissions suivantes :
              </p>
              <div class="space-y-1.5">
                <NuxtLink
                  v-for="commission in deputiesCommissionsFiltered"
                  :key="commission.assembly_commission_id.id"
                  :to="`/assemblee-nationale/commissions/${commission.assembly_commission_id.id}`"
                  class="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 transition-colors active:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 md:hover:bg-blue-100"
                >
                  <UIcon name="i-heroicons-users" class="h-4 w-4 shrink-0" />
                  <span class="line-clamp-1">{{ commission.assembly_commission_id.name }}</span>
                  <UIcon
                    name="i-heroicons-chevron-right"
                    class="ml-auto h-4 w-4 shrink-0 opacity-50"
                  />
                </NuxtLink>
              </div>
            </div>
          </section>

          <!-- Questions -->
          <AssemblyDeputyQuestion :deputy="deputy" />
        </div>
      </div>

      <!-- Not found -->
      <div v-else class="rounded-2xl bg-gray-100 p-8 text-center dark:bg-gray-800">
        <UIcon name="i-heroicons-user" class="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p class="text-gray-500 dark:text-gray-400">Député non trouvé</p>
        <NuxtLink
          to="/assemblee-nationale/deputes"
          class="mt-3 inline-block text-sm text-blue-600 underline dark:text-blue-400"
        >
          Retourner aux députés
        </NuxtLink>
      </div>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();

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
  // Breadcrumb émis par <AppBreadcrumb> (source unique) — pas de defineBreadcrumb ici
  // pour éviter la fusion @graph qui dupliquait les items (§7 CLAUDE.md).
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
</script>
