<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

// ✅ Nouvelle architecture : useCmsCollection avec mode détail (id)
// Plus besoin de onMounted ni de fetchById
const { commission, loading, error } = useAssemblyCommissions({
  id: route.params.id as string,
});

const title = computed(() => {
  if (!commission.value) return 'Chargement...';
  return `${commission.value.name} | Commission Assemblée nationale Sénégal`;
});

const description = computed(() => {
  if (!commission.value) return '';
  const presidentText = commission.value.president
    ? ` Présidée par ${commission.value.president.first_name} ${commission.value.president.last_name}.`
    : '';
  const membersCount = commission.value.members?.length || 0;
  return `${commission.value.description || commission.value.name}${presidentText} Commission composée de ${membersCount} députés de l'Assemblée nationale du Sénégal.`;
});

const url = computed(() => {
  if (!route.params.id) return siteUrl;
  return `${siteUrl}/assemblee-nationale/commissions/${route.params.id}`;
});

const image = computed(() => {
  if (!commission.value) return defaultImage;
  if (!commission.value.president?.photo) return defaultImage;
  const relativeUrl = useCmsImage(commission.value.president.photo);
  // Construire l'URL absolue sans appeler useCmsImageAbsolute (qui utilise un composable)
  return relativeUrl.startsWith('http') ? relativeUrl : `${siteUrl}${relativeUrl}`;
});

const commissionSchema = computed(() => {
  if (!commission.value) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: commission.value.name,
    description:
      commission.value.description ||
      `Commission parlementaire spécialisée de l'Assemblée nationale du Sénégal`,
    url: url.value,
    identifier: commission.value.id,
    organizationType: 'Commission parlementaire',
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'Assemblée nationale du Sénégal',
      url: `${siteUrl}/assemblee-nationale`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sénégal',
    },
    numberOfEmployees: commission.value.members?.length || 0,
  };

  // Ajouter le président si disponible
  if (commission.value.president) {
    schema.leader = {
      '@type': 'Person',
      name: `${commission.value.president.first_name} ${commission.value.president.last_name}`,
      givenName: commission.value.president.first_name,
      familyName: commission.value.president.last_name,
      jobTitle: 'Président de commission',
      image: commission.value.president.photo
        ? useCmsImage(commission.value.president.photo)
        : undefined,
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Assemblée nationale du Sénégal',
      },
    };
  }

  // Ajouter les membres du bureau
  const organizationalMembers = [];

  if (commission.value.vice_president) {
    organizationalMembers.push({
      '@type': 'Person',
      name: `${commission.value.vice_president.first_name} ${commission.value.vice_president.last_name}`,
      jobTitle: 'Vice-président de commission',
    });
  }

  if (commission.value['1st_vice_president']) {
    organizationalMembers.push({
      '@type': 'Person',
      name: `${commission.value['1st_vice_president'].first_name} ${commission.value['1st_vice_president'].last_name}`,
      jobTitle: '1er Vice-président de commission',
    });
  }

  if (commission.value['2nd_vice_president']) {
    organizationalMembers.push({
      '@type': 'Person',
      name: `${commission.value['2nd_vice_president'].first_name} ${commission.value['2nd_vice_president'].last_name}`,
      jobTitle: '2e Vice-président de commission',
    });
  }

  if (commission.value.secretary) {
    organizationalMembers.push({
      '@type': 'Person',
      name: `${commission.value.secretary.first_name} ${commission.value.secretary.last_name}`,
      jobTitle: 'Secrétaire de commission',
    });
  }

  if (commission.value.reporter) {
    organizationalMembers.push({
      '@type': 'Person',
      name: `${commission.value.reporter.first_name} ${commission.value.reporter.last_name}`,
      jobTitle: 'Rapporteur de commission',
    });
  }

  if (organizationalMembers.length > 0) {
    schema.member = organizationalMembers;
  }

  return schema;
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Assemblée nationale',
      item: `${siteUrl}/assemblee-nationale`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Commissions',
      item: `${siteUrl}/assemblee-nationale/commissions`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: commission.value?.name || 'Commission',
      item: url.value,
    },
  ],
}));

const webPageSchema = computed(() => {
  if (!commission.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title.value,
    description: description.value,
    url: url.value,
    image: image.value,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
    about: {
      '@type': 'GovernmentOrganization',
      name: 'Assemblée nationale du Sénégal',
    },
    mainEntity: commissionSchema.value,
  };
});

// SEO Setup
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
  keywords: () =>
    [
      ...keywords,
      commission.value?.name || '',
      'commission parlementaire Sénégal',
      'Assemblée nationale commission',
      commission.value?.president
        ? `${commission.value.president.first_name} ${commission.value.president.last_name}`
        : '',
      'députés commission',
      'travail législatif',
    ]
      .filter(Boolean)
      .join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: 'Assemblée nationale du Sénégal' },
    { property: 'og:type', content: 'website' },
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
      { name: 'Commissions', item: '/assemblee-nationale/commissions' },
      { name: commission.value?.name || 'Commission', item: url.value },
    ],
  }),
  defineOrganization({
    '@type': 'GovernmentOrganization',
    name: () => commission.value?.name,
    description: () =>
      commission.value?.description ||
      `Commission parlementaire spécialisée de l'Assemblée nationale du Sénégal`,
    url: () => url.value,
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'Assemblée nationale du Sénégal',
      url: `${siteUrl}/assemblee-nationale`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sénégal',
    },
    numberOfEmployees: () => commission.value?.members?.length || 0,
    member: () => {
      const members = [];
      if (commission.value?.president)
        members.push({
          '@type': 'Person',
          jobTitle: 'Président',
          name: `${commission.value.president.first_name} ${commission.value.president.last_name}`,
        });
      // Simplified member list for schema to avoid bloating
      return members;
    },
  }),
]);

// ✅ Plus besoin de onMounted : les données sont chargées automatiquement via SSR

// Function to get full image URL using CMS proxy
const getImageUrl = (imageId: string) => {
  return useCmsImage(imageId);
};

// Get bureau members IDs to filter them out from regular members
const getBureauMembersIds = computed(() => {
  if (!commission.value) return [];
  const ids = [];

  if (commission.value.president?.id) ids.push(commission.value.president.id);
  if (commission.value.vice_president?.id) ids.push(commission.value.vice_president.id);
  if (commission.value['1st_vice_president']?.id)
    ids.push(commission.value['1st_vice_president'].id);
  if (commission.value['2nd_vice_president']?.id)
    ids.push(commission.value['2nd_vice_president'].id);
  if (commission.value['secretary']?.id) ids.push(commission.value['secretary'].id);
  if (commission.value['reporter']?.id) ids.push(commission.value['reporter'].id);

  return ids;
});

// Filter regular members (excluding bureau members)
const regularMembers = computed(() => {
  if (!commission.value?.members) return [];

  return commission.value.members.filter(
    (member: any) => !getBureauMembersIds.value.includes(member.id),
  );
});

const deputyUrl = computed((deputy: any) => {
  const fullName = `${deputy.first_name}-${deputy.last_name}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `/assemblee-nationale/deputes/${deputy.id}/${fullName}`;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sticky Header Mobile -->
    <div class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 md:relative md:border-0 md:bg-transparent md:py-6 md:backdrop-blur-none dark:md:bg-transparent">
      <div class="mx-auto max-w-6xl">
        <!-- Breadcrumb desktop only -->
        <div class="mb-2 hidden md:block">
          <AppBreadcrumb
:items="[
            { label: 'Assemblée nationale', to: '/assemblee-nationale' },
            { label: 'Commissions', to: '/assemblee-nationale/commissions' },
            { label: commission?.name || 'Détail' }
          ]" />
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Back button mobile -->
          <NuxtLink 
            to="/assemblee-nationale/commissions" 
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95 dark:bg-gray-700 md:hidden"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </NuxtLink>
          
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-lg font-semibold text-gray-900 dark:text-white md:text-2xl">
              {{ commission?.name || 'Commission' }}
            </h1>
            <p v-if="commission?.members" class="text-sm text-gray-500 dark:text-gray-400">
              {{ commission.members.length }} membres
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-0">
      <!-- Loading state -->
      <div v-if="loading" class="space-y-6">
        <!-- Header skeleton -->
        <div class="rounded-2xl bg-white p-6 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <USkeleton class="mb-3 h-6 w-2/3" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="mt-2 h-4 w-3/4" />
        </div>
        <!-- Bureau skeleton -->
        <div class="rounded-2xl bg-white p-6 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <USkeleton class="mb-6 h-6 w-48" />
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div v-for="i in 6" :key="i" class="flex items-center gap-4">
              <USkeleton class="h-14 w-14 rounded-full" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-2xl bg-red-50 p-6 text-center dark:bg-red-900/20">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="font-medium text-red-800 dark:text-red-300">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">Impossible de charger les informations de la commission</p>
        <NuxtLink 
          to="/assemblee-nationale/commissions"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux commissions
        </NuxtLink>
      </div>

      <!-- Contenu de la commission -->
      <div v-else-if="commission" class="space-y-6">
        <!-- Description -->
        <div v-if="commission.description" class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
              <UIcon name="i-heroicons-building-library" class="h-6 w-6" />
            </div>
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-white">À propos</h2>
              <p class="mt-1 text-gray-600 dark:text-gray-400">{{ commission.description }}</p>
            </div>
          </div>
        </div>

        <!-- Bureau de la commission -->
        <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="mb-5 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <UIcon name="i-heroicons-user-group" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Bureau de la commission</h2>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <!-- Président -->
            <NuxtLink
              v-if="commission.president"
              :to="`/assemblee-nationale/deputes/${commission.president.id}/${$getSlugifyUrlPath(commission.president.first_name + '-' + commission.president.last_name)}`"
              class="group flex items-center gap-4 rounded-xl bg-emerald-50 p-4 transition-all active:scale-[0.99] hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
            >
              <img
                :src="getImageUrl(commission.president.photo)"
                :alt="commission.president.first_name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ commission.president.first_name }} {{ commission.president.last_name }}
                </div>
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                  <UIcon name="i-heroicons-star" class="h-3 w-3" />
                  Président(e)
                </span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-emerald-400 transition-transform group-hover:translate-x-1" />
            </NuxtLink>

            <!-- Vice-président -->
            <NuxtLink
              v-if="commission.vice_president"
              :to="`/assemblee-nationale/deputes/${commission.vice_president.id}/${$getSlugifyUrlPath(commission.vice_president.first_name + '-' + commission.vice_president.last_name)}`"
              class="group flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all active:scale-[0.99] hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
            >
              <img
                v-if="commission.vice_president.photo"
                :src="getImageUrl(commission.vice_president.photo)"
                :alt="commission.vice_president.first_name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
              />
              <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-gray-600 dark:ring-gray-500">
                <UIcon name="i-heroicons-user" class="h-7 w-7 text-gray-400 dark:text-gray-300" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ commission.vice_president.first_name }} {{ commission.vice_president.last_name }}
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">Vice-président(e)</span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
            </NuxtLink>

            <!-- 1er Vice-président -->
            <NuxtLink
              v-if="commission['1st_vice_president']"
              :to="`/assemblee-nationale/deputes/${commission['1st_vice_president'].id}/${$getSlugifyUrlPath(commission['1st_vice_president'].first_name + '-' + commission['1st_vice_president'].last_name)}`"
              class="group flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all active:scale-[0.99] hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
            >
              <img
                v-if="commission['1st_vice_president'].photo"
                :src="getImageUrl(commission['1st_vice_president'].photo)"
                :alt="commission['1st_vice_president'].first_name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
              />
              <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-gray-600 dark:ring-gray-500">
                <UIcon name="i-heroicons-user" class="h-7 w-7 text-gray-400 dark:text-gray-300" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ commission['1st_vice_president'].first_name }} {{ commission['1st_vice_president'].last_name }}
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">1er Vice-président(e)</span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
            </NuxtLink>

            <!-- 2e Vice-président -->
            <NuxtLink
              v-if="commission['2nd_vice_president']"
              :to="`/assemblee-nationale/deputes/${commission['2nd_vice_president'].id}/${$getSlugifyUrlPath(commission['2nd_vice_president'].first_name + '-' + commission['2nd_vice_president'].last_name)}`"
              class="group flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all active:scale-[0.99] hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
            >
              <img
                v-if="commission['2nd_vice_president'].photo"
                :src="getImageUrl(commission['2nd_vice_president'].photo)"
                :alt="commission['2nd_vice_president'].first_name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
              />
              <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-gray-600 dark:ring-gray-500">
                <UIcon name="i-heroicons-user" class="h-7 w-7 text-gray-400 dark:text-gray-300" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ commission['2nd_vice_president'].first_name }} {{ commission['2nd_vice_president'].last_name }}
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">2e Vice-président(e)</span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
            </NuxtLink>

            <!-- Secrétaire -->
            <NuxtLink
              v-if="commission.secretary"
              :to="`/assemblee-nationale/deputes/${commission.secretary.id}/${$getSlugifyUrlPath(commission.secretary.first_name + '-' + commission.secretary.last_name)}`"
              class="group flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all active:scale-[0.99] hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
            >
              <img
                v-if="commission.secretary.photo"
                :src="getImageUrl(commission.secretary.photo)"
                :alt="commission.secretary.first_name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
              />
              <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-gray-600 dark:ring-gray-500">
                <UIcon name="i-heroicons-user" class="h-7 w-7 text-gray-400 dark:text-gray-300" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ commission.secretary.first_name }} {{ commission.secretary.last_name }}
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">Secrétaire</span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
            </NuxtLink>

            <!-- Rapporteur -->
            <NuxtLink
              v-if="commission.reporter"
              :to="`/assemblee-nationale/deputes/${commission.reporter.id}/${$getSlugifyUrlPath(commission.reporter.first_name + '-' + commission.reporter.last_name)}`"
              class="group flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all active:scale-[0.99] hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
            >
              <img
                v-if="commission.reporter.photo"
                :src="getImageUrl(commission.reporter.photo)"
                :alt="commission.reporter.first_name"
                class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
              />
              <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-gray-600 dark:ring-gray-500">
                <UIcon name="i-heroicons-user" class="h-7 w-7 text-gray-400 dark:text-gray-300" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900 dark:text-white">
                  {{ commission.reporter.first_name }} {{ commission.reporter.last_name }}
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">Rapporteur</span>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
            </NuxtLink>
          </div>
        </div>

        <!-- Membres de la commission -->
        <div v-if="regularMembers.length > 0" class="rounded-2xl bg-white p-5 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <div class="mb-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                <UIcon name="i-heroicons-users" class="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Membres</h2>
            </div>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {{ regularMembers.length }} députés
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <AssemblyDeputyCard
              v-for="deputy in regularMembers"
              :key="deputy.id"
              :deputy="deputy"
            />
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <UIcon name="i-heroicons-building-library" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="font-medium text-gray-900 dark:text-white">Commission non trouvée</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cette commission n'existe pas ou a été supprimée
        </p>
        <NuxtLink 
          to="/assemblee-nationale/commissions"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux commissions
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
