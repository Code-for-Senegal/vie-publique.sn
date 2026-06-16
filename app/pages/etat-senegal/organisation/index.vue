<script setup lang="ts">
const { overview } = useEtatOrganisation()

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata()

const pageTitle = "Organisation de l'État du Sénégal | Vie Publique Sénégal"
const pageDescription =
  "Explorez l'organisation administrative de l'État du Sénégal : ministères, directions, agences, sociétés nationales, sociétés à participation publique et établissements publics selon les décrets officiels."
const pageUrl = `${siteUrl}/etat-senegal/organisation`
const ogImage = `${siteUrl}/nomination-3.png`

useSeoMeta({
  title: pageTitle,
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
    "organisation état Sénégal",
    "ministères Sénégal",
    "établissements publics Sénégal",
    "organigramme état Sénégal",
    "décret répartition services",
  ].join(', '),
})

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'État du Sénégal', item: `${siteUrl}/etat-senegal` },
    { '@type': 'ListItem', position: 3, name: "Organisation de l'État", item: pageUrl },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: pageTitle,
  description: pageDescription,
  url: pageUrl,
  inLanguage: 'fr-SN',
  isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
}

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  title: "Organisation de l'État du Sénégal",
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: computed(() => [
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
    { type: 'application/ld+json', children: JSON.stringify(webPageSchema) },
  ]),
})
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Organisation de l\'État' },
      ]"
      class="px-4"
    />

    <!-- ─── Hero ─────────────────────────────────────────────────── -->
    <section class="mx-auto mt-4 max-w-7xl px-4">
      <div
        class="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-7 shadow-sm dark:border-blue-900 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 sm:px-10 sm:py-8"
      >
        <!-- Decorative blobs -->
        <div class="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/20" />
        <div class="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-800/20" />

        <div class="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
          <!-- Left: title + description -->
          <div class="flex-1">
            <!-- Decree badge + date on the same line -->
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span
                v-if="overview?.decree"
                class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300"
              >
                <UIcon name="i-heroicons-document-text" class="h-3.5 w-3.5" />
                Décret n° {{ overview.decree.numero }}
              </span>
              <span
                v-if="overview?.decree?.date_publication"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                - en vigueur depuis le {{ formatDate(overview.decree.date_publication) }}
              </span>
            </div>

            <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Organisation administrative de l'État du Sénégal
            </h1>
            <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Explorez l'organigramme officiel, les entités publiques et les changements entre décrets de répartition des services.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Stats ────────────────────────────────────────────────── -->
    <section class="mx-auto mt-6 max-w-7xl px-4">
      <EtatOrganisationStatsGrid />
    </section>

    <!-- ─── Explorer (tree + list) ───────────────────────────────── -->
    <section class="mx-auto mt-12 px-4">
      <div class="mb-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <h2 class="text-base font-semibold text-gray-500 dark:text-gray-400">
          Explorer l'organigramme
        </h2>
        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <EtatOrganisationExplorer />
    </section>

    <!-- ─── Explorer CTAs ──────────────────────────────────────── -->
    <section class="mx-auto mt-12 max-w-7xl px-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <!-- Historique -->
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-800 dark:bg-amber-900/20 sm:items-start sm:justify-between"
        >
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-clock" class="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Organigrammes des décrets antérieurs
              </p>
              <p class="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                Consultez l'organisation telle qu'elle était définie par les décrets précédents.
              </p>
            </div>
          </div>
          <UButton
            to="/etat-senegal/organisation/historique"
            color="amber"
            variant="solid"
            size="sm"
            icon="i-heroicons-arrow-right"
            trailing
            class="shrink-0 sm:self-end"
          >
            Voir l'historique
          </UButton>
        </div>

        <!-- Comparaison décrets -->
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 dark:border-blue-800 dark:bg-blue-900/20 sm:items-start sm:justify-between"
        >
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-arrows-right-left" class="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p class="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Comparer deux décrets
              </p>
              <p class="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
                Explorez les créations, suppressions, renommages et changements de tutelle entre deux décrets successifs.
              </p>
            </div>
          </div>
          <UButton
            to="/etat-senegal/organisation/changements"
            color="blue"
            variant="solid"
            size="sm"
            icon="i-heroicons-arrow-right"
            trailing
            class="shrink-0 sm:self-end"
          >
            Voir les changements
          </UButton>
        </div>
      </div>
    </section>

    <!-- ─── Recent changes (hidden) ──────────────────────────────── -->
    <!-- <section class="mx-auto mt-16 max-w-7xl px-4">
      <div class="mb-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <h2 class="text-base font-semibold text-gray-500 dark:text-gray-400">
          Historique des modifications
        </h2>
        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <EtatOrganisationRecentChanges :overview="overview ?? null" />
    </section> -->
  </div>
</template>
