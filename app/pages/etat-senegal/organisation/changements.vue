<script setup lang="ts">
const {
  fromNumero,
  toNumero,
  selectedCategory,
  currentPage,
  changes,
  summary,
  allDecrees,
  fromDecree,
  toDecree,
  total,
  pageSize,
  totalPages,
  pending,
  resetFilters,
} = useEtatOrganisationChanges()

const CATEGORY_META: Record<string, { label: string; color: string; icon: string; bg: string; border: string; iconBg: string }> = {
  created: {
    label: 'Créations',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'i-heroicons-plus-circle',
    iconBg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
  deleted: {
    label: 'Suppressions',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'i-heroicons-minus-circle',
    iconBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
  rename: {
    label: 'Renommages',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'i-heroicons-pencil',
    iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  reparent: {
    label: 'Changements de tutelle',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'i-heroicons-arrows-right-left',
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  merge: {
    label: 'Fusions',
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'i-heroicons-funnel',
    iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  },
  split: {
    label: 'Scissions',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'i-heroicons-scissors',
    iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  },
}

const getCategoryMeta = (category: string) =>
  CATEGORY_META[category] ?? {
    label: category,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'i-heroicons-information-circle',
    iconBg: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }

const formatDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : null

const linkComponent = resolveComponent('NuxtLink')

// decreeOptions uses numero as value (human-readable, SEO-friendly URL param)
const decreeOptions = computed(() =>
  allDecrees.value.map(d => ({
    value: d.numero,
    label: `Décret n° ${d.numero}${d.date_publication ? ' (' + new Date(d.date_publication).getFullYear() + ')' : ''}`,
    status: d.status,
  })),
)

// Total changes count
const totalAll = computed(() => summary.value.reduce((a, s) => a + s.count, 0))

const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata()

const pageTitle = "Comparaison des décrets de répartition | Organisation de l'État du Sénégal"
const pageDescription =
  "Comparez les décrets de répartition des services de l'État du Sénégal et explorez les créations, suppressions, renommages et changements de tutelle entre décrets successifs."
const pageUrl = `${siteUrl}/etat-senegal/organisation/changements`
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
    "décrets répartition Sénégal",
    "changements organisation état Sénégal",
    "réformes administratives Sénégal",
    "comparaison décrets Sénégal",
  ].join(', '),
})

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'État du Sénégal', item: `${siteUrl}/etat-senegal` },
    { '@type': 'ListItem', position: 3, name: "Organisation de l'État", item: `${siteUrl}/etat-senegal/organisation` },
    { '@type': 'ListItem', position: 4, name: 'Comparaison des décrets', item: pageUrl },
  ],
}

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  title: "Comparaison des décrets de répartition",
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
  ],
  script: computed(() => [
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
  ]),
})
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Organisation de l\'État', to: '/etat-senegal/organisation' },
        { label: 'Comparaison des décrets' },
      ]"
      class="px-4"
    />

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="mx-auto mt-4 max-w-7xl px-4">
      <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-7 shadow-sm dark:border-blue-900 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Comparaison des décrets de répartition
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Explorez les modifications de l'organisation administrative de l'État entre deux décrets officiels.
        </p>
      </div>
    </section>

    <!-- ─── Decree selectors ───────────────────────────────────────── -->
    <section class="mx-auto mt-8 max-w-7xl px-4">
      <div class="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
        <!-- From -->
        <div class="min-w-[220px] flex-1">
          <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Décret de départ</label>
          <select
            :value="fromNumero"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            @change="fromNumero = ($event.target as HTMLSelectElement).value"
          >
            <option value="">Sélectionner un décret…</option>
            <option v-for="opt in decreeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}{{ opt.status === 'active' ? ' — actif' : '' }}
            </option>
          </select>
        </div>

        <!-- Arrow -->
        <div class="flex items-center pb-2">
          <UIcon name="i-heroicons-arrow-long-right" class="h-5 w-5 text-gray-400" />
        </div>

        <!-- To -->
        <div class="min-w-[220px] flex-1">
          <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Décret d'arrivée</label>
          <select
            :value="toNumero"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            @change="toNumero = ($event.target as HTMLSelectElement).value"
          >
            <option value="">Décret actif (défaut)</option>
            <option v-for="opt in decreeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}{{ opt.status === 'active' ? ' — actif' : '' }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- ─── Summary cards ─────────────────────────────────────────── -->
    <section v-if="summary.length" class="mx-auto mt-8 max-w-7xl px-4">
      <!-- Context line -->
      <p v-if="fromDecree && toDecree" class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ totalAll }}</span> modification{{ totalAll > 1 ? 's' : '' }}
        entre le décret <span class="font-medium text-gray-700 dark:text-gray-300">n°&nbsp;{{ fromDecree.numero }}</span>
        ({{ formatDate(fromDecree.date_publication) }})
        et le décret <span class="font-medium text-gray-700 dark:text-gray-300">n°&nbsp;{{ toDecree.numero }}</span>
        ({{ formatDate(toDecree.date_publication) }}).
      </p>

      <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))">
        <button
          v-for="stat in summary"
          :key="stat.category"
          class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:opacity-90 dark:border-gray-700 dark:bg-gray-800/50"
          :class="selectedCategory === stat.category ? 'ring-2 ring-inset ring-blue-500' : ''"
          @click="selectedCategory = selectedCategory === stat.category ? '' : stat.category"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            :class="getCategoryMeta(stat.category).iconBg"
          >
            <UIcon :name="getCategoryMeta(stat.category).icon" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">{{ stat.count }}</p>
            <p class="mt-0.5 text-xs leading-tight text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </button>
      </div>
    </section>

    <!-- ─── Filters bar ────────────────────────────────────────────── -->
    <section v-if="total > 0" class="mx-auto mt-6 max-w-7xl px-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Filtrer&nbsp;:</span>
        <button
          v-for="stat in summary"
          :key="stat.category"
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition"
          :class="[
            getCategoryMeta(stat.category).bg,
            getCategoryMeta(stat.category).color,
            getCategoryMeta(stat.category).border,
            selectedCategory === stat.category ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100',
          ]"
          @click="selectedCategory = selectedCategory === stat.category ? '' : stat.category"
        >
          <UIcon :name="getCategoryMeta(stat.category).icon" class="h-3 w-3" />
          {{ getCategoryMeta(stat.category).label }}
          <span class="ml-1 rounded-full bg-white/60 px-1 dark:bg-black/20">{{ stat.count }}</span>
        </button>

        <button
          v-if="selectedCategory"
          class="ml-2 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          @click="resetFilters"
        >
          <UIcon name="i-heroicons-x-mark" class="h-3 w-3" />
          Tout afficher
        </button>
      </div>
    </section>

    <!-- ─── Changes list ──────────────────────────────────────────── -->
    <section class="mx-auto mt-6 max-w-7xl px-4">

      <!-- Loading -->
      <div v-if="pending" class="py-12 text-center text-sm text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="mb-2 h-6 w-6 animate-spin" />
        <p>Chargement des changements…</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!changes.length" class="py-16 text-center">
        <UIcon name="i-heroicons-document-magnifying-glass" class="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ total === 0 ? 'Aucun changement entre ces deux décrets.' : 'Aucun résultat pour ce filtre.' }}
        </p>
        <button
          v-if="selectedCategory"
          class="mt-3 text-xs text-blue-600 underline underline-offset-2"
          @click="resetFilters"
        >
          Effacer le filtre
        </button>
      </div>

      <!-- Change items -->
      <ul v-else class="space-y-2">
        <li
          v-for="change in changes"
          :key="change.id"
          class="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <!-- Category icon -->
          <span
            class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            :class="getCategoryMeta(change.category).bg"
          >
            <UIcon
              :name="getCategoryMeta(change.category).icon"
              class="h-4 w-4"
              :class="getCategoryMeta(change.category).color"
            />
          </span>

          <!-- Main content — entire block is a link if entity has a public page -->
          <component
            :is="change.has_public_page && change.slug ? linkComponent : 'div'"
            :to="change.has_public_page && change.slug ? `/etat-senegal/${change.slug}` : undefined"
            class="min-w-0 flex-1"
            :class="change.has_public_page && change.slug ? 'group cursor-pointer' : ''"
          >
            <p
              class="text-sm font-medium text-gray-900 dark:text-white"
              :class="change.has_public_page && change.slug ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : ''"
            >
              {{ change.name || change.description }}
            </p>

            <!-- Parent breadcrumb -->
            <p v-if="change.root_name" class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {{ change.root_name }}
            </p>

            <!-- Old → new value for rename / reparent -->
            <div
              v-if="(change.category === 'rename' || change.category === 'reparent') && (change.old_value || change.new_value)"
              class="mt-1.5 flex flex-wrap items-center gap-1 text-xs"
            >
              <span class="rounded bg-red-50 px-1.5 py-0.5 text-red-600 line-through dark:bg-red-900/20 dark:text-red-400">
                {{ change.category === 'rename' ? (change.old_value as any)?.official_label : (change.old_value as any)?.parent_official_label }}
              </span>
              <UIcon name="i-heroicons-arrow-long-right" class="h-3.5 w-3.5 text-gray-400" />
              <span class="rounded bg-green-50 px-1.5 py-0.5 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                {{ change.category === 'rename' ? (change.new_value as any)?.official_label : (change.new_value as any)?.parent_official_label }}
              </span>
            </div>

            <span
              class="mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium"
              :class="[getCategoryMeta(change.category).bg, getCategoryMeta(change.category).color]"
            >
              {{ getCategoryMeta(change.category).label }}
            </span>
          </component>

          <!-- Arrow indicator (only for entities with a public page) -->
          <UIcon
            v-if="change.has_public_page && change.slug"
            name="i-heroicons-chevron-right"
            class="mt-1 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600"
          />
        </li>
      </ul>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          v-model="currentPage"
          :page-count="pageSize"
          :total="total"
          :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: 'rounded-lg',
          }"
        />
      </div>
    </section>

  </div>
</template>
