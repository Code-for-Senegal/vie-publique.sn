<script setup lang="ts">
const route = useRoute();
const nominationId = route.params.id as string;

// Utilisation du composable pour récupérer la nomination
const { nomination, loading, error } = useNominations({ id: nominationId });

// Utilisation du composable pour les métadonnées
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

// Computed pour les métadonnées dynamiques
const title = computed(() =>
  nomination.value
    ? `${nomination.value.name} - ${nomination.value.role} | Vie-Publique.sn`
    : 'Nomination | Vie-Publique.sn',
);

const description = computed(() => {
  if (!nomination.value) return 'Détails de la nomination présidentielle';
  const org = nomination.value.organisation ? ` à ${nomination.value.organisation}` : '';
  return nomination.value.description
    ? `${nomination.value.description.substring(0, 155)}...`
    : `${nomination.value.name} - ${nomination.value.role}${org}. Nomination du président Bassirou Diomaye Faye.`;
});

const url = computed(() => `${siteUrl}/personnalites/${route.params.id}/${route.params.slug}`);

const image = computed(() => {
  if (!nomination.value?.photo) return `${siteUrl}/nomination-3.png`;
  return useCmsImage(nomination.value.photo);
});

// SEO Meta Tags
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: computed(() =>
    [
      ...keywords,
      nomination.value?.name || '',
      nomination.value?.role || '',
      nomination.value?.organisation || '',
      'nomination Sénégal',
      'Diomaye Faye',
    ].join(', '),
  ),
});

// Schema.org pour le référencement
const personSchema = computed(() => {
  if (!nomination.value) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: nomination.value.name,
    jobTitle: nomination.value.role,
    worksFor: nomination.value.organisation
      ? {
          '@type': 'Organization',
          name: nomination.value.organisation,
        }
      : undefined,
    image: image.value,
    description: description.value,
    url: url.value,
    gender: nomination.value.sexe === 'M' ? 'Male' : 'Female',
    alumniOf: nomination.value.formation
      ? {
          '@type': 'EducationalOrganization',
          name: nomination.value.formation,
        }
      : undefined,
  };
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
      name: 'Personnalités',
      item: `${siteUrl}/annuaires`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: nomination.value?.name || 'Nomination',
      item: url.value,
    },
  ],
}));

// Head Configuration
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'profile' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
  ],
  script: computed(() => {
    const scripts = [];
    if (personSchema.value) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(personSchema.value),
      });
    }
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema.value),
    });
    return scripts;
  }),
});

// Formatage de la date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Type labels
const typeLabels: Record<string, string> = {
  ministre: 'Ministre',
  dg: 'Directeur Général',
  pca: 'PCA',
  sg: 'Secrétaire Général',
  autre: 'Autre',
};

const getTypeLabel = (type: string | null) => {
  if (!type) return null;
  return typeLabels[type.toLowerCase()] || type;
};

// Initiales pour l'avatar fallback
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
};

// Statut de la nomination
const isActive = computed(() => !nomination.value?.endDate);

// Conserver les query params pour le retour
const backUrl = computed(() => {
  const referer = route.query.ref as string;
  if (referer === 'gouvernement') {
    return '/gouvernement-senegal';
  }
  const query = { ...route.query };
  delete query.ref;
  return {
    path: '/nomination-senegal',
    query,
  };
});

const backLabel = computed(() => {
  const referer = route.query.ref as string;
  return referer === 'gouvernement' ? 'Gouvernement' : 'Nominations';
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb
        :items="[{ label: backLabel, to: backUrl }, { label: nomination?.name || 'Personnalité' }]"
      />
    </div>

    <main class="container mx-auto px-4 pt-2">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="mx-auto max-w-3xl space-y-4">
        <!-- Hero skeleton -->
        <div
          class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 sm:p-8"
        >
          <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <USkeleton class="h-28 w-28 shrink-0 rounded-full sm:h-36 sm:w-36" />
            <div class="flex-1 space-y-3 text-center sm:text-left">
              <USkeleton class="mx-auto h-7 w-48 rounded sm:mx-0" />
              <USkeleton class="mx-auto h-5 w-64 rounded sm:mx-0" />
              <USkeleton class="mx-auto h-4 w-40 rounded sm:mx-0" />
              <div class="flex justify-center gap-2 pt-2 sm:justify-start">
                <USkeleton class="h-6 w-20 rounded-full" />
                <USkeleton class="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <!-- Info skeleton -->
        <div class="grid gap-3 sm:grid-cols-2">
          <USkeleton v-for="n in 4" :key="n" class="h-20 rounded-xl" />
        </div>
        <!-- Bio skeleton -->
        <div
          class="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        >
          <USkeleton class="h-6 w-48 rounded" />
          <USkeleton class="h-4 w-full rounded" />
          <USkeleton class="h-4 w-full rounded" />
          <USkeleton class="h-4 w-3/4 rounded" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-16">
        <div
          class="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <p class="text-sm font-medium text-red-900 dark:text-red-200">Erreur de chargement</p>
          <p class="mt-1 text-xs text-red-700 dark:text-red-300">
            Impossible de charger les informations
          </p>
          <div class="mt-4 flex justify-center gap-2">
            <UButton color="red" variant="soft" size="sm" @click="$router.go(0)">
              Réessayer
            </UButton>
            <NuxtLink :to="backUrl">
              <UButton color="gray" variant="soft" size="sm"> Retour </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="nomination" class="mx-auto max-w-3xl space-y-4">
        <!-- Hero Card -->
        <div
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        >
          <div class="p-6 sm:p-8">
            <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <!-- Photo -->
              <div class="relative shrink-0">
                <img
                  v-if="nomination.photo"
                  :src="useCmsImage(nomination.photo)"
                  :alt="nomination.name"
                  class="h-28 w-28 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800 sm:h-36 sm:w-36"
                />
                <div
                  v-else
                  class="flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 ring-4 ring-gray-100 dark:bg-gray-700 dark:ring-gray-800 sm:h-36 sm:w-36"
                >
                  <span class="text-3xl font-semibold text-gray-500 dark:text-gray-400 sm:text-4xl">
                    {{ getInitials(nomination.name) }}
                  </span>
                </div>
                <!-- Status indicator -->
                <span
                  class="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900"
                  :class="isActive ? 'bg-green-500' : 'bg-gray-400'"
                  :title="isActive ? 'En fonction' : 'Fin de fonction'"
                >
                  <UIcon
                    :name="isActive ? 'i-heroicons-check-20-solid' : 'i-heroicons-minus-20-solid'"
                    class="h-3 w-3 text-white"
                  />
                </span>
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1 text-center sm:text-left">
                <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {{ nomination.name }}
                </h1>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  {{ nomination.role }}
                </p>
                <p
                  v-if="nomination.organisation"
                  class="mt-0.5 text-sm text-gray-500 dark:text-gray-500"
                >
                  {{ nomination.organisation }}
                </p>

                <!-- Badges -->
                <div class="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <!-- Status badge -->
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                      isActive
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800'
                        : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                    "
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="isActive ? 'bg-green-500' : 'bg-gray-400'"
                    />
                    {{ isActive ? 'En fonction' : 'Fin de fonction' }}
                  </span>
                  <!-- Type badge -->
                  <span
                    v-if="getTypeLabel(nomination.type)"
                    class="bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:ring-primary-800 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                  >
                    {{ getTypeLabel(nomination.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid gap-3 sm:grid-cols-2">
          <!-- Date de nomination -->
          <div
            class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20"
            >
              <UIcon
                name="i-heroicons-calendar-days-20-solid"
                class="h-4.5 w-4.5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
              >
                Nomination
              </p>
              <p class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(nomination.nominationDate) }}
              </p>
            </div>
          </div>

          <!-- Date de fin -->
          <div
            v-if="nomination.endDate"
            class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20"
            >
              <UIcon
                name="i-heroicons-calendar-days-20-solid"
                class="h-4.5 w-4.5 text-red-600 dark:text-red-400"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
              >
                Fin de fonction
              </p>
              <p class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(nomination.endDate) }}
              </p>
            </div>
          </div>

          <!-- Formation -->
          <div
            v-if="nomination.formation"
            class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20"
            >
              <UIcon
                name="i-heroicons-academic-cap-20-solid"
                class="h-4.5 w-4.5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
              >
                Formation
              </p>
              <p class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                {{ nomination.formation }}
              </p>
            </div>
          </div>

          <!-- Prédécesseur -->
          <div
            v-if="nomination.predecessor"
            class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20"
            >
              <UIcon
                name="i-heroicons-arrow-path-20-solid"
                class="h-4.5 w-4.5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
              >
                Prédécesseur
              </p>
              <p class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                {{ nomination.predecessor }}
              </p>
            </div>
          </div>
        </div>

        <!-- Biography Section -->
        <div
          v-if="nomination.bio"
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        >
          <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              Biographie et Parcours
            </h2>
          </div>
          <div class="p-6">
            <div
              class="prose-a:text-primary-600 dark:prose-a:text-primary-400 prose prose-sm max-w-none dark:prose-invert sm:prose prose-headings:text-gray-900 prose-p:text-gray-600 dark:prose-headings:text-white dark:prose-p:text-gray-400"
              v-html="nomination.bio"
            ></div>
          </div>
        </div>

        <!-- Portrait fallback -->
        <div
          v-else-if="nomination.portrait"
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        >
          <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Portrait</h2>
          </div>
          <div class="p-6">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {{ nomination.portrait }}
            </p>
          </div>
        </div>

        <!-- Empty bio placeholder -->
        <div
          v-else
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        >
          <div class="px-6 py-12 text-center">
            <div
              class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-gray-400" />
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Biographie</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              La biographie de {{ nomination.name }} sera bientôt disponible.
            </p>
          </div>
        </div>

        <!-- Back link -->
        <div class="pt-2">
          <NuxtLink
            :to="backUrl"
            class="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <UIcon name="i-heroicons-arrow-left-20-solid" class="h-4 w-4" />
            Retour aux {{ backLabel.toLowerCase() }}
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>
