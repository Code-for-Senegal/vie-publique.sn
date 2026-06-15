<script setup lang="ts">
const { allDecrees, selectedDecreeNumero } = useEtatOrganisation()
const router = useRouter()
const route = useRoute()

const { siteName, siteUrl, themeColor } = useSiteMetadata()

// Archived decrees only (exclude active)
const archivedDecrees = computed(() =>
  allDecrees.value.filter((d) => d.status !== 'active'),
)

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

// Set default to most recent archived — only if no decree in URL, only after hydration
const defaultSet = ref(false)
const setDefault = () => {
  if (defaultSet.value || route.query.decree || !archivedDecrees.value.length) return
  defaultSet.value = true
  const sorted = [...archivedDecrees.value].sort((a, b) => {
    const da = a.date_publication ? new Date(a.date_publication).getTime() : 0
    const db = b.date_publication ? new Date(b.date_publication).getTime() : 0
    return db - da
  })
  router.replace({ query: { ...route.query, decree: sorted[0]!.numero } })
}

onMounted(() => {
  setDefault()
  // If data wasn't ready yet on mount, wait for it
  watch(archivedDecrees, setDefault)
})

const selectedDecree = computed(() =>
  archivedDecrees.value.find((d) => d.numero === selectedDecreeNumero.value) ?? null,
)

// v-model for the <select> — writes directly to the URL via selectedDecreeNumero setter

// ── SEO ────────────────────────────────────────────────────────────
const pageTitle = computed(() =>
  selectedDecree.value
    ? `Organisation de l'État - Décret n°${selectedDecree.value.numero} | Vie Publique Sénégal`
    : "Organisation de l'État - Archives | Vie Publique Sénégal",
)
const pageDescription =
  "Consultez l'organisation administrative de l'État du Sénégal selon les décrets précédents. Archives des organigrammes officiels."
const pageUrl = `${siteUrl}/etat-senegal/organisation`
const canonicalUrl = pageUrl

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogUrl: `${siteUrl}/etat-senegal/organisation/historique`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  robots: 'noindex, follow',
})

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: canonicalUrl }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
  ],
})
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Organisation de l\'État', to: '/etat-senegal/organisation' },
        { label: 'Archives' },
      ]"
      class="px-4"
    />

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="mx-auto mt-4 max-w-7xl px-4">
      <div
        class="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-7 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:px-10 sm:pb-6 sm:pt-8"
      >
        <div class="relative z-10">
          <!-- Title -->
          <h1 class="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Organisation de l'État
            <span class="text-gray-500 dark:text-gray-400">- Archives</span>
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Consultez l'organisation administrative selon les décrets précédents.
          </p>

          <!-- Decree selector + link to active -->
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <template v-if="archivedDecrees.length > 1">
              <label for="decree-select" class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                Décret n°
              </label>
              <div class="relative">
                <select
                  id="decree-select"
                  v-model="selectedDecreeNumero"
                  class="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option
                    v-for="decree in archivedDecrees"
                    :key="decree.id"
                    :value="decree.numero"
                  >
                    {{ decree.numero }}
                  </option>
                </select>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                />
              </div>
            </template>
            <template v-else-if="selectedDecree">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Décret n°&nbsp;{{ selectedDecree.numero }}
              </span>
            </template>

            <span
              v-if="selectedDecree?.date_publication"
              class="text-xs text-gray-400 dark:text-gray-500"
            >
              Publié le {{ formatDate(selectedDecree.date_publication) }}
            </span>

            <NuxtLink
              to="/etat-senegal/organisation"
              class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
              Organisation actuelle
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Stats ────────────────────────────────────────────────── -->
    <section v-if="archivedDecrees.length > 0" class="mx-auto mt-6 max-w-7xl px-4">
      <EtatOrganisationStatsGrid :clickable="false" />
    </section>



    <!-- ─── Explorer ─────────────────────────────────────────────── -->
    <section v-if="archivedDecrees.length > 0" class="mx-auto mt-6 max-w-7xl px-4">
      <EtatOrganisationExplorer :hide-archive-banner="true" />
    </section>

    <!-- ─── CTA Comparaison ───────────────────────────────────────── -->
    <section v-if="archivedDecrees.length > 0" class="mx-auto mt-12 max-w-7xl px-4">
      <div
        class="flex flex-col items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 dark:border-blue-800 dark:bg-blue-900/20 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-arrows-right-left" class="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <p class="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Comparer deux décrets
            </p>
            <p class="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
              Visualisez les créations, suppressions, renommages et changements de tutelle entre deux décrets successifs.
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
          class="shrink-0 self-center sm:self-auto"
        >
          Voir les changements
        </UButton>
      </div>
    </section>
  </div>
</template>
