<script setup lang="ts">
const { overview, pending, entities } = useEtatOrganisation()

const TYPE_ICONS_STATS: Record<string, string> = {
  ministere: 'i-heroicons-building-office',
  etablissement_public: 'i-heroicons-academic-cap',
  societe_nationale: 'i-heroicons-building-storefront',
  societe_participation_publique: 'i-heroicons-building-storefront',
}
const TYPE_COLORS_STATS: Record<string, string> = {
  ministere: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  etablissement_public: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  societe_nationale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  societe_participation_publique: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}
const STAT_TYPES = ['ministere', 'etablissement_public', 'societe_nationale', 'societe_participation_publique']
const PLURAL_LABELS: Record<string, string> = {
  ministere: 'Ministères',
  etablissement_public: 'Établissements publics',
  societe_nationale: 'Sociétés nationales',
  societe_participation_publique: 'Sociétés à participation publique',
}
const TYPE_LINKS: Record<string, string> = {
  ministere: '/etat-senegal/ministeres',
  etablissement_public: '/etat-senegal/entites-publiques?type=etablissement_public',
  societe_nationale: '/etat-senegal/entites-publiques?type=societe_nationale',
  societe_participation_publique: '/etat-senegal/entites-publiques?type=societe_participation_publique',
}
const typeStats = computed(() => {
  const counts = new Map<string, number>()
  const labels = new Map<string, string>()
  for (const entity of entities.value) {
    if (STAT_TYPES.includes(entity.type_code)) {
      counts.set(entity.type_code, (counts.get(entity.type_code) || 0) + 1)
      if (!labels.has(entity.type_code)) labels.set(entity.type_code, entity.type_label)
    }
  }
  return STAT_TYPES.filter(code => counts.has(code)).map(code => ({
    code,
    label: PLURAL_LABELS[code] || labels.get(code) || code,
    count: counts.get(code) || 0,
    icon: TYPE_ICONS_STATS[code] || 'i-heroicons-building-office',
    color: TYPE_COLORS_STATS[code] || 'bg-gray-100 text-gray-600',
  }))
})

const CHANGE_CATEGORY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  created: { label: 'Nouvelle entité', color: 'green', icon: 'i-heroicons-plus-circle' },
  deleted: { label: 'Suppression', color: 'red', icon: 'i-heroicons-minus-circle' },
  rename: { label: 'Renommage', color: 'blue', icon: 'i-heroicons-pencil' },
  reparent: { label: 'Changement de tutelle', color: 'amber', icon: 'i-heroicons-arrows-right-left' },
  merge: { label: 'Fusion', color: 'purple', icon: 'i-heroicons-funnel' },
  split: { label: 'Scission', color: 'orange', icon: 'i-heroicons-scissors' },
}

const getCategoryMeta = (category: string) =>
  CHANGE_CATEGORY_LABELS[category] || { label: category, color: 'gray', icon: 'i-heroicons-information-circle' }

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

useSeoMeta({
  title: "Organisation de l'État du Sénégal",
  description:
    "Explorez l'organisation administrative de l'État du Sénégal : ministères, directions, agences, socièté nationale, socièté à participation publique et établissements publics selon les décrets officiels.",
  ogTitle: "Organisation de l'État du Sénégal",
  ogDescription:
    "Structure officielle de l'État du Sénégal basée sur les décrets de répartition des services.",
})

useHead({
  title: "Organisation de l'État",
  meta: [{ name: 'robots', content: 'index,follow' }],
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

            <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
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
    <section v-if="typeStats.length" class="mx-auto mt-6 max-w-7xl px-4">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NuxtLink
          v-for="stat in typeStats"
          :key="stat.code"
          :to="TYPE_LINKS[stat.code]"
          class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600"
        >
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="stat.color">
            <UIcon :name="stat.icon" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">{{ stat.count }}</p>
            <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </NuxtLink>
      </div>
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

    <!-- ─── Recent changes ────────────────────────────────────────── -->
    <section class="mx-auto mt-16 max-w-7xl px-4">
      <div class="mb-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <h2 class="text-base font-semibold text-gray-500 dark:text-gray-400">
          Historique des modifications
        </h2>
        <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <EtatOrganisationRecentChanges :overview="overview ?? null" />
    </section>
  </div>
</template>
