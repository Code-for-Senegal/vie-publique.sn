<script setup lang="ts">
import { NuxtLink } from '#components';
import type { EtatOrganisationEntity } from '~~/types/etat-organisation';

const { entities, overview, pending } = useEtatOrganisation();
const route = useRoute();
const router = useRouter();

// ── Entity type config ───────────────────────────────────────────
const TYPE_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  etablissement_public: {
    label: 'Établissements publics',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'i-heroicons-academic-cap',
  },
  societe_nationale: {
    label: 'Sociétés nationales',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    border: 'border-rose-200 dark:border-rose-800',
    icon: 'i-heroicons-building-storefront',
  },
  societe_participation_publique: {
    label: 'Sociétés à participation publique',
    color: 'text-pink-700 dark:text-pink-300',
    bg: 'bg-pink-50 dark:bg-pink-900/30',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'i-heroicons-chart-bar',
  },
};

const TARGET_TYPES = Object.keys(TYPE_META);
const PAGE_SIZE = 12;

// ── Filters synced to URL ─────────────────────────────────────────
const search = computed({
  get: () => (route.query.search as string) || '',
  set: (v: string) =>
    router.push({ query: { ...route.query, search: v || undefined, page: undefined } }),
});

const activeType = computed({
  get: () => (route.query.type as string) || 'all',
  set: (v: string) =>
    router.push({
      query: {
        ...route.query,
        type: v !== 'all' ? v : undefined,
        search: undefined,
        page: undefined,
      },
    }),
});

const currentPage = computed({
  get: () => Math.max(1, parseInt((route.query.page as string) || '1', 10)),
  set: (v: number) =>
    router.push({ query: { ...route.query, page: v > 1 ? String(v) : undefined } }),
});

const normalizeStr = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// ── All EP/SN/SPP ─────────────────────────────────────────────────
const allTargetEntities = computed<EtatOrganisationEntity[]>(() =>
  entities.value.filter((e) => TARGET_TYPES.includes(e.type_code)),
);

// ── Counts per type ───────────────────────────────────────────────
const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const e of allTargetEntities.value) {
    counts[e.type_code] = (counts[e.type_code] ?? 0) + 1;
  }
  return counts;
});

const totalAll = computed(() => allTargetEntities.value.length);

// ── Filtered list ─────────────────────────────────────────────────
const filteredEntities = computed<EtatOrganisationEntity[]>(() => {
  let list = allTargetEntities.value;

  if (activeType.value !== 'all') {
    list = list.filter((e) => e.type_code === activeType.value);
  }

  if (search.value.trim()) {
    const q = normalizeStr(search.value.trim());
    list = list.filter(
      (e) =>
        normalizeStr(e.name).includes(q) ||
        (e.parent_name && normalizeStr(e.parent_name).includes(q)),
    );
  }

  return list;
});

const totalFiltered = computed(() => filteredEntities.value.length);
const totalPages = computed(() => Math.ceil(totalFiltered.value / PAGE_SIZE));

// ── Paginated list ────────────────────────────────────────────────
const paginatedEntities = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredEntities.value.slice(start, start + PAGE_SIZE);
});

const hasActiveFilters = computed(() => !!(search.value || activeType.value !== 'all'));

const resetFilters = () =>
  router.push({ query: { ...route.query, search: undefined, type: undefined, page: undefined } });

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

// ── SEO ───────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Établissements publics, Sociétés nationales et SPP du Sénégal',
  description:
    "Liste officielle des établissements publics (EP), sociétés nationales (SN) et sociétés à participation publique (SPP) du Sénégal selon le décret de répartition des services de l'État en vigueur.",
  ogTitle: 'Entités publiques du Sénégal',
  ogDescription:
    "Établissements publics, sociétés nationales et sociétés à participation publique selon le décret de répartition des services de l'État.",
});

useHead({ title: 'Entités publiques du Sénégal' });
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Organisation de l\'État', to: '/etat-senegal/organisation' },
        { label: 'Enitites publiques' },
      ]"
      class="px-4"
    />

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="mx-auto mt-4 max-w-7xl px-4">
      <div
        class="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-7 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 sm:px-10 sm:pb-6 sm:pt-8"
      >
        <div class="relative z-10">
          <!-- Decree badge + date -->
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span
              v-if="overview?.decree"
              class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <UIcon name="i-heroicons-document-text" class="h-3.5 w-3.5" />
              Décret n°&nbsp;{{ overview.decree.numero }}
            </span>
            <span
              v-if="overview?.decree?.date_publication"
              class="text-xs text-gray-400 dark:text-gray-500"
            >
              - en vigueur depuis le {{ formatDate(overview.decree.date_publication) }}
            </span>
          </div>

          <h1 class="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Établissements publics, Sociétés nationales et SPP
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Liste officielle des entités économiques et parapubliques de l'État du Sénégal selon le
            décret de répartition en vigueur.
          </p>
        </div>
      </div>
    </section>

    <!-- ─── Filters + Search ─────────────────────────────────────── -->
    <section class="mx-auto mt-6 max-w-7xl px-4">
      <!-- Type chips — same style as EtatOrganisationList -->
      <div class="mb-4 flex flex-wrap gap-1.5">
        <button
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          :class="
            activeType === 'all'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          "
          @click="activeType = 'all'"
        >
          Tous
          <span class="ml-1 text-gray-400">({{ totalAll }})</span>
        </button>
        <button
          v-for="(meta, code) in TYPE_META"
          :key="code"
          class="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          :class="
            activeType === code
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          "
          @click="activeType = activeType === code ? 'all' : code"
        >
          <UIcon :name="meta.icon" class="h-3 w-3" />
          {{ meta.label }}
          <span class="ml-0.5 text-gray-400">({{ typeCounts[code] ?? 0 }})</span>
        </button>
      </div>

      <!-- Search + clear -->
      <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div class="flex-1">
          <UInput
            :model-value="search"
            icon="i-heroicons-magnifying-glass"
            :placeholder="
              activeType === 'all'
                ? 'Rechercher un établissement, une société…'
                : `Rechercher parmi les ${TYPE_META[activeType]?.label ?? ''}…`
            "
            size="md"
            @update:model-value="search = $event"
          />
        </div>
        <button
          v-if="hasActiveFilters"
          class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="resetFilters"
        >
          <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          Effacer
        </button>
      </div>

      <!-- Result count -->
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <template v-if="pending">Chargement…</template>
        <template v-else>
          <span class="font-semibold text-gray-900 dark:text-white">{{ totalFiltered }}</span>
          entité{{ totalFiltered !== 1 ? 's' : '' }}
          <template v-if="hasActiveFilters"> trouvée{{ totalFiltered !== 1 ? 's' : '' }}</template>
        </template>
      </p>
    </section>

    <!-- ─── Skeleton loader ──────────────────────────────────────── -->
    <section v-if="pending" class="mx-auto mt-6 max-w-7xl px-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 12"
          :key="i"
          class="h-36 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>
    </section>

    <!-- ─── No results ───────────────────────────────────────────── -->
    <section v-else-if="!filteredEntities.length" class="mx-auto mt-12 max-w-7xl px-4 text-center">
      <UIcon
        name="i-heroicons-building-library"
        class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
      />
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Aucune entité trouvée{{ search ? ' pour "' + search + '"' : '' }}.
      </p>
      <button
        v-if="hasActiveFilters"
        class="mt-3 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        @click="resetFilters"
      >
        Effacer les filtres
      </button>
    </section>

    <!-- ─── Cards grid ───────────────────────────────────────────── -->
    <section v-else class="mx-auto mt-6 max-w-7xl px-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <component
          :is="entity.has_public_page ? NuxtLink : 'div'"
          v-for="entity in paginatedEntities"
          :key="entity.id"
          :to="entity.has_public_page ? `/etat-senegal/${entity.public_slug}` : undefined"
          class="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-emerald-700"
          :class="entity.has_public_page ? 'cursor-pointer' : ''"
        >
          <!-- Type badge + chevron row -->
          <div class="flex items-center justify-between gap-2">
            <span
              v-if="TYPE_META[entity.type_code]"
              class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold"
              :class="[
                TYPE_META[entity.type_code].bg,
                TYPE_META[entity.type_code].color,
                TYPE_META[entity.type_code].border,
              ]"
            >
              <UIcon :name="TYPE_META[entity.type_code].icon" class="h-3 w-3" />
              {{ TYPE_META[entity.type_code].label }}
            </span>
            <UIcon
              v-if="entity.has_public_page"
              name="i-heroicons-chevron-right"
              class="ml-auto h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-emerald-500"
            />
          </div>

          <!-- Name -->
          <p class="flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
            {{ entity.name }}
          </p>

          <!-- Tutelle (parent) -->
          <div
            v-if="entity.parent_name"
            class="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400"
          >
            <UIcon
              name="i-heroicons-building-office-2"
              class="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400"
            />
            <span class="leading-snug">{{ entity.parent_name }}</span>
          </div>

          <!-- Contact info -->
          <div class="mt-auto flex flex-wrap gap-x-4 gap-y-1">
            <a
              v-if="entity.web_site"
              :href="entity.web_site"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400"
              @click.stop
            >
              <UIcon name="i-heroicons-globe-alt" class="h-3.5 w-3.5 shrink-0" />
              Site web
            </a>
            <a
              v-if="entity.email"
              :href="`mailto:${entity.email}`"
              class="inline-flex items-center gap-1 truncate text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400"
              @click.stop
            >
              <UIcon name="i-heroicons-envelope" class="h-3.5 w-3.5 shrink-0" />
              {{ entity.email }}
            </a>
          </div>
        </component>
      </div>

      <!-- ─── Pagination ──────────────────────────────────────────── -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          :model-value="currentPage"
          :page-count="PAGE_SIZE"
          :total="totalFiltered"
          :max="7"
          :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: 'rounded-lg',
          }"
          @update:model-value="currentPage = $event"
        />
      </div>
    </section>
  </div>
</template>
