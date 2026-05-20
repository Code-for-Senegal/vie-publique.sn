<script setup lang="ts">
const { overview, pending } = useEtatOrganisation()

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
  </div>
</template>
