<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const url = `${siteUrl}/personnalites-senegal`;
const image = `${siteUrl}/nomination-3.png`;

const { $dateformat } = useNuxtApp();
const route = useRoute();

const {
  persons,
  loading,
  error,
  currentPage,
  searchQuery,
  filterCategory,
  filterGender,
  totalItems,
  totalPages,
  totalsByCategory,
  totalsByGender,
  hasActiveFilters,
  resetFilters,
  setCurrentPage,
  setSearchQuery,
  setFilterCategory,
  setFilterGender,
} = usePublicPersons();

// SEO
const title = 'Annuaire des personnalités publiques au Sénégal | Vie Publique Sénégal';
const description =
  'Annuaire complet des personnalités publiques du Sénégal : ministres, directeurs généraux, PCA, ambassadeurs, gouverneurs et hauts fonctionnaires. Profils, fonctions et nominations.';

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
  image,
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: [
    {
      '@type': 'GovernmentOrganization',
      name: 'Gouvernement du Sénégal',
    },
  ],
  mainEntity: {
    '@type': 'ItemList',
    name: 'Personnalités publiques du Sénégal',
    description: 'Annuaire des personnalités publiques et hauts fonctionnaires',
  },
};

const breadcrumbSchema = {
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
      name: 'Annuaires',
      item: `${siteUrl}/annuaires`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Personnalités publiques',
      item: url,
    },
  ],
};

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
  keywords: [
    ...keywords,
    'personnalités publiques Sénégal',
    'ministres Sénégal',
    'directeurs généraux Sénégal',
    'PCA Sénégal',
    'hauts fonctionnaires Sénégal',
    'annuaire gouvernement Sénégal',
  ].join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
    { name: 'geo.position', content: '14.7645042;-17.3660286' },
    { name: 'ICBM', content: '14.7645042, -17.3660286' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(pageSchema),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema),
    },
  ],
});

// URL vers la fiche détail
const getDetailUrl = (person: any) => {
  const slug =
    person.slug ||
    person.full_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  return {
    path: `/personnalites/${person.id}/${slug}`,
    query: { ...route.query },
  };
};

// Total
const totalCount = computed(
  () => totalsByGender.value.maleCount + totalsByGender.value.femaleCount,
);

// Reset page sur changement de recherche/filtres
watch(searchQuery, () => {
  filterCategory.value = 'all';
  filterGender.value = 'all';
  currentPage.value = 1;
});

watch([filterCategory, filterGender], () => {
  currentPage.value = 1;
});

// Label genre pour affichage
const getGenderLabel = (sexe: string) => (sexe === 'female' ? 'Nommée' : 'Nommé');
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb
        :items="[{ label: 'Annuaires', to: '/annuaires' }, { label: 'Personnalités publiques' }]"
      />
    </div>

    <!-- SEO hidden heading -->
    <h1 class="sr-only">
      Annuaire des personnalités publiques du Sénégal — Ministres, Directeurs généraux, PCA,
      Ambassadeurs, Gouverneurs
    </h1>

    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- Title Row -->
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            Annuaire des Personnalités publiques du Sénégal
          </h2>
          <div class="flex items-center gap-3">
            <span
              v-if="totalCount"
              class="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-heroicons-user-group-20-solid" class="h-3.5 w-3.5" />
              {{ totalCount }} personnalités
            </span>
          </div>
        </div>

        <!-- Search -->
        <div class="group relative mt-3">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <UIcon
              name="i-heroicons-magnifying-glass-20-solid"
              class="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-gray-500"
            />
          </div>
          <input
            type="search"
            :value="searchQuery"
            placeholder="Rechercher une personnalité..."
            class="block w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-10 text-sm text-gray-900 ring-1 ring-transparent transition-all placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-gray-800/80 dark:focus:ring-gray-500 sm:py-2.5"
            @input="setSearchQuery(($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            @click="setSearchQuery('')"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"
            >
              <UIcon
                name="i-heroicons-x-mark-20-solid"
                class="h-3.5 w-3.5 text-gray-600 dark:text-gray-300"
              />
            </span>
          </button>
        </div>

        <!-- Gender Filters -->
        <div class="mt-3 flex gap-2">
          <button
            class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
            :class="[
              filterGender === 'male'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700',
            ]"
            @click="setFilterGender(filterGender === 'male' ? 'all' : 'male')"
          >
            <UIcon name="i-heroicons-user-20-solid" class="h-3.5 w-3.5" />
            Hommes
            <span v-if="totalsByGender.maleCount" class="ml-0.5 text-[10px] opacity-70"
              >({{ totalsByGender.maleCount }})</span
            >
          </button>
          <button
            class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
            :class="[
              filterGender === 'female'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700',
            ]"
            @click="setFilterGender(filterGender === 'female' ? 'all' : 'female')"
          >
            <UIcon name="i-heroicons-user-20-solid" class="h-3.5 w-3.5" />
            Femmes
            <span v-if="totalsByGender.femaleCount" class="ml-0.5 text-[10px] opacity-70"
              >({{ totalsByGender.femaleCount }})</span
            >
          </button>
        </div>

        <!-- Category Filters -->
        <nav
          class="scrollbar-hide -mx-4 mt-2 overflow-x-auto px-4 pb-1"
          aria-label="Filtrer par catégorie"
        >
          <div v-if="loading" class="flex gap-2 py-0.5">
            <USkeleton v-for="n in 5" :key="n" class="h-7 w-20 shrink-0 rounded-full" />
          </div>
          <div v-else class="flex gap-1.5 py-0.5">
            <button
              v-for="(catData, slug) in totalsByCategory"
              :key="slug"
              class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
              :class="[
                filterCategory === slug
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700',
              ]"
              @click="setFilterCategory(filterCategory === slug ? 'all' : (slug as string))"
            >
              {{ catData.label }}
              <span class="text-[10px] opacity-70">({{ catData.count }})</span>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 pt-4">
      <!-- Filter indicator -->
      <p
        v-if="hasActiveFilters"
        class="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
      >
        <span v-if="filterGender !== 'all'" class="inline-flex items-center gap-1">
          <span
            class="h-2 w-2 rounded-full"
            :class="filterGender === 'male' ? 'bg-blue-500' : 'bg-purple-500'"
          />
          {{ filterGender === 'male' ? 'Hommes' : 'Femmes' }}
        </span>
        <span v-if="filterCategory !== 'all'" class="inline-flex items-center gap-1">
          <span class="bg-primary-500 h-2 w-2 rounded-full" />
          {{ totalsByCategory[filterCategory]?.label || filterCategory }}
        </span>
        <span v-if="searchQuery"> · "{{ searchQuery }}"</span>
        <button
          class="text-primary-600 hover:text-primary-700 dark:text-primary-400 ml-1 underline underline-offset-2"
          @click="
            resetFilters();
            setSearchQuery('');
          "
        >
          Effacer
        </button>
      </p>

      <!-- Loading -->
      <div v-if="loading" class="space-y-2">
        <div
          v-for="n in 6"
          :key="n"
          class="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        >
          <USkeleton class="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />
          <div class="flex flex-1 flex-col justify-center space-y-2">
            <USkeleton class="h-4 w-2/5 rounded" />
            <USkeleton class="h-3 w-full rounded" />
            <USkeleton class="h-3 w-1/3 rounded" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-12">
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
            Impossible de charger les personnalités
          </p>
          <UButton color="red" variant="soft" size="sm" class="mt-4" @click="$router.go(0)">
            Réessayer
          </UButton>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="persons.length === 0" class="py-16 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-user-group" class="h-8 w-8 text-gray-400" />
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">Aucune personnalité trouvée</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Essayez une autre recherche ou modifiez les filtres
        </p>
        <UButton
          v-if="hasActiveFilters || searchQuery"
          color="gray"
          variant="soft"
          size="sm"
          class="mt-4"
          @click="
            resetFilters();
            setSearchQuery('');
          "
        >
          Réinitialiser les filtres
        </UButton>
      </div>

      <!-- List -->
      <div v-else>
        <div class="space-y-2">
          <NuxtLink
            v-for="person in persons"
            :key="person.id"
            :to="getDetailUrl(person)"
            class="group flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-gray-200 active:scale-[0.99] dark:bg-gray-900 dark:ring-gray-800 dark:hover:ring-gray-700"
          >
            <!-- Photo -->
            <div class="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <img
                :src="person.photo ? useCmsImage(person.photo) : '/unknown_member.webp'"
                :alt="person.full_name"
                class="h-full w-full rounded-full object-cover ring-2 ring-gray-100 transition-shadow group-hover:ring-gray-200 dark:ring-gray-700 dark:group-hover:ring-gray-600"
                loading="lazy"
              />
              <span
                v-if="person.current_appointment && !person.current_appointment.is_current"
                class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"
                title="Fin de fonction"
              >
                <UIcon name="i-heroicons-x-mark-20-solid" class="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            <!-- Content -->
            <div class="flex min-w-0 flex-1 flex-col justify-center">
              <h2
                class="group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate text-sm font-semibold text-gray-900 dark:text-white"
              >
                {{ person.full_name }}
              </h2>
              <p
                v-if="person.current_appointment"
                class="mt-0.5 line-clamp-1 text-xs text-gray-600 dark:text-gray-400"
              >
                {{ person.current_appointment.position_title }}
              </p>
              <p
                v-if="person.current_appointment?.organization_label"
                class="line-clamp-1 text-xs text-gray-500 dark:text-gray-500"
              >
                {{ person.current_appointment.organization_label }}
              </p>
              <div
                v-if="person.current_appointment?.appointment_date"
                class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5"
              >
                <time class="text-[11px] text-gray-400 dark:text-gray-500">
                  {{ getGenderLabel(person.sexe) }} le
                  {{ $dateformat(person.current_appointment.appointment_date) }}
                </time>
                <span
                  v-if="person.current_appointment.end_date"
                  class="text-[11px] text-red-500 dark:text-red-400"
                >
                  Fin de fonction le {{ $dateformat(person.current_appointment.end_date) }}
                </span>
              </div>
            </div>

            <!-- Arrow -->
            <div class="hidden items-center sm:flex">
              <UIcon
                name="i-heroicons-chevron-right-20-solid"
                class="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400"
              />
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <UPagination
            :model-value="currentPage"
            :total="totalItems"
            :page-count="25"
            size="sm"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: 'rounded-lg',
            }"
            @update:model-value="setCurrentPage"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
