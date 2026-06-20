<script setup lang="ts">
import { NuxtLink } from '#components'
import type { EtatOrganisationChange } from '~~/types/etat-organisation'

const router = useRouter();
const route = useRoute();

const TOP_LEVEL_TYPES = new Set(['presidence', 'primature'])
const isChangeClickable = (change: EtatOrganisationChange) =>
  change.has_public_page && !!change.slug && TOP_LEVEL_TYPES.has(change.type_code ?? '')

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
  availablePairs,
  isPairAvailable,
} = useEtatOrganisationChanges();

const CATEGORY_META: Record<
  string,
  { label: string; color: string; icon: string; bg: string; border: string; iconBg: string }
> = {
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
};

const getCategoryMeta = (category: string) =>
  CATEGORY_META[category] ?? {
    label: category,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'i-heroicons-information-circle',
    iconBg: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

// Pairs sorted by to.date_publication descending
const sortedAvailablePairs = computed(() =>
  [...availablePairs.value].sort((a, b) => {
    const da = a.to.date_publication ? new Date(a.to.date_publication).getTime() : 0;
    const db = b.to.date_publication ? new Date(b.to.date_publication).getTime() : 0;
    return db - da;
  }),
);

// Decrees that appear as 'from' in at least one valid pair
const fromDecreeOptions = computed(() => {
  const validFromNums = new Set(availablePairs.value.map((p) => p.from.numero));
  return allDecrees.value
    .filter((d) => validFromNums.has(d.numero))
    .sort((a, b) => {
      const da = a.date_publication ? new Date(a.date_publication).getTime() : 0;
      const db = b.date_publication ? new Date(b.date_publication).getTime() : 0;
      return db - da;
    });
});

// Decrees that are valid 'to' targets for the currently selected 'from'
const toDecreeOptions = computed(() => {
  if (!fromNumero.value) return [];
  return availablePairs.value
    .filter((p) => p.from.numero === fromNumero.value)
    .map((p) => allDecrees.value.find((d) => d.numero === p.to.numero) ?? p.to)
    .sort((a, b) => {
      const da = a.date_publication ? new Date(a.date_publication).getTime() : 0;
      const db = b.date_publication ? new Date(b.date_publication).getTime() : 0;
      return db - da;
    });
});

// When fromNumero changes, reset toNumero only if its current value is no longer valid
watch(fromNumero, () => {
  if (!availablePairs.value.length) return; // pairs not loaded yet, don't reset
  const stillValid = toDecreeOptions.value.some((d) => d.numero === toNumero.value);
  if (!stillValid) {
    toNumero.value = toDecreeOptions.value[0]?.numero ?? '';
  }
});

// Auto-select the most recent available pair when data loads and nothing is set
// Use a single router.replace to avoid the double-push race condition where
// the second push reads stale route.query and drops the first value.
const initializeDefaults = () => {
  if (!availablePairs.value.length) return;
  if (fromNumero.value) return; // already set via URL

  const defaultPair = sortedAvailablePairs.value[0];
  if (defaultPair) {
    router.replace({
      query: {
        ...route.query,
        from: defaultPair.from.numero,
        to: defaultPair.to.numero,
        page: undefined,
        category: undefined,
      },
    });
  }
};

watch(availablePairs, initializeDefaults, { immediate: true });

// Total changes count
const totalAll = computed(() => summary.value.reduce((a, s) => a + s.count, 0));

const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata();

const pageTitle = "Comparaison des décrets de répartition | Organisation de l'État du Sénégal";
const pageDescription =
  "Comparez les décrets de répartition des services de l'État du Sénégal et explorez les créations, suppressions, renommages et changements de tutelle entre décrets successifs.";
const pageUrl = `${siteUrl}/etat-senegal/organisation/changements`;
const ogImage = `${siteUrl}/nomination-3.png`;

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
    'décrets répartition Sénégal',
    'changements organisation état Sénégal',
    'réformes administratives Sénégal',
    'comparaison décrets Sénégal',
  ].join(', '),
});

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'État du Sénégal', item: `${siteUrl}/etat-senegal` },
    {
      '@type': 'ListItem',
      position: 3,
      name: "Organisation de l'État",
      item: `${siteUrl}/etat-senegal/organisation`,
    },
    { '@type': 'ListItem', position: 4, name: 'Comparaison des décrets', item: pageUrl },
  ],
};

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  title: 'Comparaison des décrets de répartition',
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: computed(() => [
    { type: 'application/ld+json', children: JSON.stringify(breadcrumbSchema) },
  ]),
});
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
      <div
        class="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-7 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 sm:px-10 sm:pb-6 sm:pt-8"
      >
        <div class="relative z-10">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Comparaison des décrets de répartition
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Explorez les modifications de l'organisation administrative de l'État entre deux décrets officiels.
          </p>
        </div>
      </div>
    </section>

    <!-- ─── Decree selectors ──────────────────────────────────────── -->
    <section class="mx-auto mt-6 max-w-7xl px-4">
      <!-- No comparison data at all -->
      <div
        v-if="!pending && availablePairs.length === 0"
        class="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      >
        <UIcon name="i-heroicons-information-circle" class="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p class="font-medium">Aucune donnée de comparaison disponible pour le moment.</p>
          <p class="mt-0.5 text-xs opacity-80">
            Les comparaisons entre décrets seront accessibles une fois les données d'évolution importées.
          </p>
        </div>
      </div>

      <!-- Selectors (only shown when pairs exist or still loading) -->
      <div v-else class="flex flex-wrap items-center gap-2">
        <!-- Label -->
        <span class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
          Décret de départ :
        </span>

        <!-- Single decree: pill only -->
        <span
          v-if="fromDecreeOptions.length === 1 && fromDecree"
          class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Décret n°&nbsp;{{ fromDecree.numero }}
        </span>

        <!-- Multiple decrees: select -->
        <div v-else class="relative">
          <select
            id="from-decree-select"
            v-model="fromNumero"
            :disabled="pending"
            class="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option v-for="d in fromDecreeOptions" :key="d.numero" :value="d.numero">
              Décret n°&nbsp;{{ d.numero }}
            </option>
          </select>
          <UIcon
            name="i-heroicons-chevron-down"
            class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          />
        </div>

        <!-- Arrow + to decree pill (immediately after the select) -->
        <template v-if="toDecree">
          <UIcon name="i-heroicons-arrow-long-right" class="h-4 w-4 shrink-0 text-gray-400" />
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            <UIcon name="i-heroicons-check-circle" class="h-3.5 w-3.5 shrink-0" />
            Décret n°&nbsp;{{ toDecree.numero }}
            <span v-if="toDecree.status === 'active'" class="opacity-70">&nbsp;- actif</span>
          </span>
        </template>

        <!-- Back link (pushed to the far right) -->
        <NuxtLink
          to="/etat-senegal/organisation"
          class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
          Organisation actuelle
        </NuxtLink>
      </div>

      <!-- Invalid pair via URL (non-consecutive) -->
      <div
        v-if="!isPairAvailable && fromDecree && toDecree && availablePairs.length > 0"
        class="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="mt-0.5 h-4 w-4 shrink-0" />
        <span
          >Aucune comparaison directe disponible entre le décret
          <strong>{{ fromDecree.numero }}</strong> et le décret
          <strong>{{ toDecree.numero }}</strong> (décrets non consécutifs). Utilisez le
          sélecteur ci-dessus pour choisir une paire valide.</span
        >
      </div>
    </section>

    <!-- ─── Summary cards ─────────────────────────────────────────── -->
    <section v-if="summary.length" class="mx-auto mt-8 max-w-7xl px-4">
      <!-- Context line -->
      <p v-if="fromDecree && toDecree" class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ totalAll }}</span>
        modification{{ totalAll > 1 ? 's' : '' }} entre le décret
        <span class="font-medium text-gray-700 dark:text-gray-300"
          >n°&nbsp;{{ fromDecree.numero }}</span
        >
        ({{ formatDate(fromDecree.date_publication) }}) et le décret
        <span class="font-medium text-gray-700 dark:text-gray-300"
          >n°&nbsp;{{ toDecree.numero }}</span
        >
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
            <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">
              {{ stat.count }}
            </p>
            <p class="mt-0.5 text-xs leading-tight text-gray-500 dark:text-gray-400">
              {{ stat.label }}
            </p>
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
            selectedCategory === stat.category
              ? 'ring-2 ring-blue-500'
              : 'opacity-70 hover:opacity-100',
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
        <UIcon
          name="i-heroicons-document-magnifying-glass"
          class="mx-auto mb-3 h-10 w-10 text-gray-300"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{
            total === 0
              ? 'Aucun changement entre ces deux décrets.'
              : 'Aucun résultat pour ce filtre.'
          }}
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

          <!-- Main content -->
          <div class="min-w-0 flex-1">
            <component
              :is="isChangeClickable(change) ? NuxtLink : 'p'"
              :to="isChangeClickable(change) ? `/etat-senegal/${change.slug}` : undefined"
              class="text-sm font-medium text-gray-900 dark:text-white"
              :class="isChangeClickable(change) ? 'hover:text-blue-600 dark:hover:text-blue-400' : ''"
            >
              {{ change.name || change.description }}
            </component>

            <!-- Parent breadcrumb -->
            <p v-if="change.root_name" class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {{ change.root_name }}
            </p>

            <!-- Old → new value for rename / reparent -->
            <div
              v-if="
                (change.category === 'rename' || change.category === 'reparent') &&
                (change.old_value || change.new_value)
              "
              class="mt-1.5 flex flex-wrap items-center gap-1 text-xs"
            >
              <span
                class="rounded bg-red-50 px-1.5 py-0.5 text-red-600 line-through dark:bg-red-900/20 dark:text-red-400"
              >
                {{
                  change.category === 'rename'
                    ? (change.old_value as any)?.official_label
                    : (change.old_value as any)?.parent_official_label
                }}
              </span>
              <UIcon name="i-heroicons-arrow-long-right" class="h-3.5 w-3.5 text-gray-400" />
              <span
                class="rounded bg-green-50 px-1.5 py-0.5 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              >
                {{
                  change.category === 'rename'
                    ? (change.new_value as any)?.official_label
                    : (change.new_value as any)?.parent_official_label
                }}
              </span>
            </div>
          </div>
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
