<script setup lang="ts">
import { NuxtLink } from '#components';

const { institutions, filtered, dissolved, search, pending } = useEtatOrganisationInstitutions();

// Nombre stable d'institutions actives (indépendant de la recherche)
const activeCount = computed(() => institutions.value.filter((i) => !i.dissolved).length);

// ── SEO ───────────────────────────────────────────────────────────
const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata();

// Short title for <title> tag — template adds "| Vie-Publique.sn", so keep base ≤42 chars
const pageTitleShort = 'Institutions constitutionnelles | Sénégal';
// Descriptive title for og:title / social sharing
const pageTitle = 'Institutions constitutionnelles du Sénégal | Vie Publique Sénégal';
const pageDescription =
  "Liste des institutions constitutionnelles du Sénégal : Présidence, Assemblée nationale, Sénat, Conseil constitutionnel, Conseil d'État, Cour des comptes.";
const pageUrl = `${siteUrl}/etat-senegal/institutions`;
const ogImage = `${siteUrl}/nomination-3.png`;

useSeoMeta({
  title: pageTitleShort,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImage,
  keywords: [
    ...keywords,
    'institutions constitutionnelles Sénégal',
    'institutions République Sénégal',
    'Présidence République Sénégal',
    'Assemblée nationale Sénégal',
    'Sénat Sénégal',
    'Conseil constitutionnel Sénégal',
    'Cour des comptes Sénégal',
    'Conseil d\'État Sénégal',
  ].join(', '),
});

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: pageTitle,
  description: pageDescription,
  url: pageUrl,
  inLanguage: 'fr-SN',
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  },
  about: {
    '@type': 'GovernmentOrganization',
    name: 'République du Sénégal',
    url: 'https://www.gouv.sn',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'État du Sénégal', item: `${siteUrl}/etat-senegal` },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Institutions constitutionnelles',
      item: pageUrl,
    },
  ],
};

const itemListSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Institutions constitutionnelles du Sénégal',
  description: pageDescription,
  url: pageUrl,
  numberOfItems: activeCount.value,
  itemListElement: institutions.value
    .filter((i) => !i.dissolved && i.has_public_page)
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'GovernmentOrganization',
        name: item.name,
        ...(item.description && { description: item.description }),
        url: `${siteUrl}/etat-senegal/institutions/${item.slug}`,
        ...(item.web_site && { sameAs: item.web_site }),
      },
    })),
}));

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: computed(() => [
    { type: 'application/ld+json', children: JSON.stringify(collectionPageSchema) },
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
    ...(institutions.value.length > 0
      ? [{ type: 'application/ld+json', children: JSON.stringify(itemListSchema.value) }]
      : []),
  ]),
});
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Institutions constitutionnelles' },
      ]"
      class="px-4"
    />

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="mx-auto mt-4 max-w-7xl px-4">
      <div
        class="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-7 shadow-sm dark:border-blue-900 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 sm:px-10 sm:py-8"
      >
        <div
          class="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/20"
        />
        <div
          class="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-800/20"
        />

        <div class="relative z-10">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300"
            >
              <UIcon name="i-heroicons-building-library" class="h-3.5 w-3.5" />
              République du Sénégal
            </span>
          </div>

          <h1
            class="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl"
          >
            Institutions constitutionnelles
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
            <span v-if="!pending" class="font-semibold text-blue-700 dark:text-blue-400">
              {{ activeCount }}
            </span>
            institution{{ activeCount !== 1 ? 's' : '' }} constitutionnelle{{
              activeCount !== 1 ? 's' : ''
            }}
            de la République du Sénégal.
          </p>
        </div>
      </div>
    </section>

    <!-- ─── Search ───────────────────────────────────────────────── -->
    <section class="mx-auto mt-6 max-w-7xl px-4">
      <div class="relative">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher une institution…"
          class="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />
        <button
          v-if="search"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Effacer"
          @click="search = ''"
        >
          <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
        </button>
      </div>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <template v-if="pending">Chargement…</template>
        <template v-else-if="search">
          {{ filtered.length }} résultat{{ filtered.length > 1 ? 's' : '' }} sur
          {{ institutions.length }}
        </template>
        <template v-else
          >{{ institutions.length }} institution{{ institutions.length > 1 ? 's' : '' }}</template
        >
      </p>
    </section>

    <!-- ─── Skeleton ─────────────────────────────────────────────── -->
    <section v-if="pending" class="mx-auto mt-6 max-w-7xl px-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 6"
          :key="n"
          class="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
        />
      </div>
    </section>

    <!-- ─── Empty ─────────────────────────────────────────────────── -->
    <section
      v-else-if="!pending && filtered.length === 0 && dissolved.length === 0"
      class="mx-auto mt-6 max-w-7xl px-4"
    >
      <div
        class="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
      >
        Aucune institution trouvée.
      </div>
    </section>

    <template v-else-if="!pending">
      <!-- ─── Grid institutions actives ───────────────────────────── -->
      <section v-if="filtered.length > 0" class="mx-auto mt-6 max-w-7xl px-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <component
            :is="item.has_public_page ? NuxtLink : 'div'"
            v-for="item in filtered"
            :key="item.id"
            :to="item.has_public_page ? `/etat-senegal/institutions/${item.slug}` : undefined"
            class="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            :class="{
              'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700':
                item.has_public_page,
            }"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-100 dark:ring-blue-900"
                :class="
                  item.logo
                    ? 'border border-gray-200 bg-white dark:border-gray-700'
                    : 'bg-blue-100 dark:bg-blue-900'
                "
              >
                <img
                  v-if="item.logo"
                  :src="useCmsImage(item.logo)"
                  :alt="item.name"
                  class="h-full w-full object-contain"
                  loading="lazy"
                />
                <UIcon
                  v-else
                  name="i-heroicons-building-library"
                  class="h-5 w-5 text-blue-700 dark:text-blue-300"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300"
                >
                  {{ item.name }}
                </p>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ item.type_label }}
                </p>
              </div>
              <UIcon
                v-if="item.has_public_page"
                name="i-heroicons-arrow-right"
                class="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-gray-600"
              />
            </div>

            <p
              v-if="item.description"
              class="line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ item.description }}
            </p>

            <div
              v-if="item.web_site"
              class="mt-auto flex gap-3 border-t border-gray-100 pt-3 dark:border-gray-800"
            >
              <a
                :href="item.web_site"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                @click.stop
              >
                <UIcon name="i-heroicons-globe-alt" class="h-3.5 w-3.5" />
                Site web
              </a>
            </div>
          </component>
        </div>
      </section>

      <!-- ─── Institutions supprimées ──────────────────────────────── -->
      <section v-if="dissolved.length > 0" class="mx-auto mt-10 max-w-7xl px-4">
        <div class="mb-4 flex items-center gap-3">
          <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span
            class="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500"
          >
            <UIcon name="i-heroicons-archive-box-x-mark" class="h-4 w-4" />
            Institutions supprimées
          </span>
          <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in dissolved"
            :key="item.id"
            class="flex flex-col gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/40 p-5 dark:border-red-900/40 dark:bg-red-950/10"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-red-100 dark:ring-red-900/40"
                :class="
                  item.logo
                    ? 'border border-gray-200 bg-white dark:border-gray-700'
                    : 'bg-red-100 dark:bg-red-900/30'
                "
              >
                <img
                  v-if="item.logo"
                  :src="useCmsImage(item.logo)"
                  :alt="item.name"
                  class="h-full w-full object-contain grayscale"
                  loading="lazy"
                />
                <UIcon
                  v-else
                  name="i-heroicons-building-library"
                  class="h-5 w-5 text-red-400 dark:text-red-700"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-1.5">
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  >
                    <UIcon name="i-heroicons-x-circle" class="h-3 w-3" />
                    Supprimée
                  </span>
                </div>
                <p
                  class="truncate text-sm font-medium text-gray-400 line-through dark:text-gray-600"
                >
                  {{ item.name }}
                </p>
                <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-600">
                  {{ item.type_label }}
                </p>
              </div>
            </div>

            <p
              v-if="item.description"
              class="line-clamp-2 text-xs text-gray-400 dark:text-gray-600"
            >
              {{ item.description }}
            </p>

            <!-- Lien vers le vote d'abrogation -->
            <NuxtLink
              v-if="item.dissolution_vote_slug"
              :to="`/assemblee-nationale/votes/${item.dissolution_vote_slug}`"
              class="mt-auto flex items-center gap-1.5 border-t border-red-100 pt-3 text-xs text-red-600 hover:underline dark:border-red-900/30 dark:text-red-500"
            >
              <UIcon name="i-heroicons-document-text" class="h-3.5 w-3.5 shrink-0" />
              Voir le vote d'abrogation
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
