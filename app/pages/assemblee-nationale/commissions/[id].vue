<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

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
  return commission.value.president?.photo
    ? useCmsImageAbsolute(commission.value.president.photo)
    : defaultImage;
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
  <div class="container mx-auto px-4 py-4">
    <div class="mx-auto max-w-6xl">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        label="Retour à la liste"
        color="gray"
        @click="router.back()"
      />

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <UAlert
        v-else-if="error"
        title="Erreur de chargement"
        description="Impossible de charger les informations de la commission"
        color="red"
        icon="i-heroicons-exclamation-triangle"
      />

      <!-- Contenu de la commission -->
      <div v-else-if="commission" class="space-y-8 dark:text-black">
        <!-- En-tête de la commission -->
        <div class="rounded-lg bg-white p-2 shadow-sm">
          <h1 class="mb-2 text-2xl font-bold md:text-3xl">
            {{ commission.name }}
          </h1>

          <div class="prose prose-gray max-w-none">
            <p class="text-gray-600">{{ commission.description }}</p>
          </div>
        </div>

        <!-- Bureau de la commission -->
        <div class="rounded-lg bg-white p-2 shadow-sm">
          <h2 class="mb-6 text-xl font-bold">Bureau de la commission</h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <!-- Président -->
            <NuxtLink
              v-if="commission.president"
              :to="`/assemblee-nationale/deputes/${commission.president.id}/${$getSlugifyUrlPath(commission.president.first_name + '-' + commission.president.last_name)}`"
              class="flex items-center space-x-4"
            >
              <img
                :src="getImageUrl(commission.president.photo)"
                :alt="commission.president.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission.president.first_name }}
                  {{ commission.president.last_name }}
                </div>
                <div class="text-sm text-gray-500">Président(e)</div>
              </div>
            </NuxtLink>

            <div v-if="commission.vice_president" class="flex items-center space-x-4">
              <img
                v-if="commission.vice_president.photo"
                :src="getImageUrl(commission.vice_president.photo)"
                :alt="commission.vice_president.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <UAvatar
                v-else
                :src="
                  commission.vice_president.gender === 'M'
                    ? '/adobe-default-profil-man.jpg'
                    : '/adobe-default-profil-women.jpg'
                "
                alt="Default image"
                size="3xl"
                class="m-4 shadow-md"
              />
              <div>
                <div class="font-medium">
                  {{ commission.vice_president.first_name }}
                  {{ commission.vice_president.last_name }}
                </div>
                <div class="text-sm text-gray-500">Vice-président(e)</div>
              </div>
            </div>

            <!-- 1er Vice-président -->
            <NuxtLink
              v-if="commission['1st_vice_president']"
              :to="`/assemblee-nationale/deputes/${commission['1st_vice_president'].id}/${$getSlugifyUrlPath(commission['1st_vice_president'].first_name + '-' + commission['1st_vice_president'].last_name)}`"
              class="flex items-center space-x-4"
            >
              <img
                v-if="commission['1st_vice_president'].photo"
                :src="getImageUrl(commission['1st_vice_president'].photo)"
                :alt="commission['1st_vice_president'].first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <UAvatar
                v-else
                :src="
                  commission['1st_vice_president'].gender === 'M'
                    ? '/adobe-default-profil-man.jpg'
                    : '/adobe-default-profil-women.jpg'
                "
                alt="Default image"
                size="3xl"
                class="m-4 shadow-md"
              />
              <div>
                <div class="font-medium">
                  {{ commission['1st_vice_president'].first_name }}
                  {{ commission['1st_vice_president'].last_name }}
                </div>
                <div class="text-sm text-gray-500">1er Vice-président(e)</div>
              </div>
            </NuxtLink>

            <NuxtLink
              v-if="commission['2nd_vice_president']"
              :to="`/assemblee-nationale/deputes/${commission['2nd_vice_president'].id}/${$getSlugifyUrlPath(commission['2nd_vice_president'].first_name + '-' + commission['2nd_vice_president'].last_name)}`"
              class="flex items-center space-x-4"
            >
              <img
                :src="getImageUrl(commission['2nd_vice_president'].photo)"
                :alt="commission['2nd_vice_president'].first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission['2nd_vice_president'].first_name }}
                  {{ commission['2nd_vice_president'].last_name }}
                </div>
                <div class="text-sm text-gray-500">2e Vice-président(e)</div>
              </div>
            </NuxtLink>

            <!-- Vice-secretary -->
            <div v-if="commission.secretary" class="flex items-center space-x-4">
              <img
                :src="getImageUrl(commission.secretary.photo)"
                :alt="commission.secretary.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission.secretary.first_name }}
                  {{ commission.secretary.last_name }}
                </div>
                <div class="text-sm text-gray-500">Secrétaire</div>
              </div>
            </div>

            <!-- reporter -->
            <div v-if="commission.reporter" class="flex items-center space-x-4">
              <img
                :src="getImageUrl(commission.reporter.photo)"
                :alt="commission.reporter.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission.reporter.first_name }}
                  {{ commission.reporter.last_name }}
                </div>
                <div class="text-sm text-gray-500">Rapporteur</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Membres de la commission -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h2 class="mb-6 text-xl font-bold">Membres de la commission</h2>

          <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <AssemblyDeputyCard
              v-for="deputy in regularMembers"
              :key="deputy.id"
              :deputy="deputy"
            />
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="py-8 text-center text-gray-500">Commission non trouvée</div>
    </div>
  </div>
</template>
