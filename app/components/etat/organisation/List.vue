<script setup lang="ts">
const {
  overview,
  entities,
  availableTypes,
  paginatedEntities,
  filteredEntities,
  listPage,
  LIST_PAGE_SIZE,
  searchTerm,
  selectedType,
  resetFilters,
  tutelleBySnapshotId,
  pending,
} = useEtatOrganisation();

const TYPE_ICONS: Record<string, string> = {
  presidence: 'i-heroicons-building-library',
  primature: 'i-heroicons-building-office-2',
  ministere: 'i-heroicons-building-office',
  cabinet: 'i-heroicons-users',
  secretariat: 'i-heroicons-document-text',
  direction: 'i-heroicons-map-pin',
  service: 'i-heroicons-squares-2x2',
  etablissement_public: 'i-heroicons-academic-cap',
  societe_nationale: 'i-heroicons-building-storefront',
  societe_participation_publique: 'i-heroicons-building-storefront',
  agence: 'i-heroicons-megaphone',
  entite_regroupement: 'i-heroicons-folder-open',
  autres_administrations: 'i-heroicons-ellipsis-horizontal-circle',
};

const TYPE_COLORS: Record<string, string> = {
  presidence: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  primature: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  ministere: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  direction: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  service: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  etablissement_public: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  societe_nationale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  societe_participation_publique:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  agence: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  cabinet: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const typeIcon = (code: string) => TYPE_ICONS[code] || 'i-heroicons-building-office';
const typeColor = (code: string) =>
  TYPE_COLORS[code] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

// Total entities shown in the list (excludes entite_regroupement which are never displayed)
const totalEntities = computed(() =>
  entities.value.filter((e) => e.type_code !== 'entite_regroupement').length,
);

const hasActiveFilters = computed(() => !!(searchTerm.value || selectedType.value));
const totalFiltered = computed(() => filteredEntities.value.length);

// Only show these 4 types as filter options
const VISIBLE_FILTER_TYPES = new Set([
  'ministere',
  'etablissement_public',
  'societe_nationale',
  'societe_participation_publique',
]);
const PLURAL_LABELS: Record<string, string> = {
  ministere: 'Ministères',
  etablissement_public: 'Établissements publics',
  societe_nationale: 'Sociétés nationales',
  societe_participation_publique: 'Sociétés à participation publique',
};
const visibleTypes = computed(() =>
  availableTypes.value.filter((t) => VISIBLE_FILTER_TYPES.has(t.code)),
);
</script>

<template>
  <div>
    <!-- Search + type filter row -->
    <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <UInput
          v-model="searchTerm"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher un ministère, une direction, une agence…"
          size="md"
        />
        <button
          v-if="searchTerm"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="searchTerm = ''"
        >
          <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
        </button>
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

    <!-- Type chips (all visible types) -->
    <div class="mb-4 flex flex-wrap gap-1.5">
      <button
        class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        :class="
          !selectedType
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
        @click="selectedType = ''"
      >
        Tous
        <span class="ml-1 text-gray-400">({{ totalEntities }})</span>
      </button>
      <button
        v-for="type in visibleTypes"
        :key="type.code"
        class="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        :class="
          selectedType === type.code
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
        "
        @click="selectedType = selectedType === type.code ? '' : type.code"
      >
        <UIcon :name="typeIcon(type.code)" class="h-3 w-3" />
        {{ PLURAL_LABELS[type.code] || type.label }}
      </button>
    </div>

    <!-- Result count -->
    <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
      <span class="font-semibold text-gray-900 dark:text-white">{{ totalFiltered }}</span>
      entité{{ totalFiltered !== 1 ? 's' : '' }}
      <template v-if="hasActiveFilters"> trouvée{{ totalFiltered !== 1 ? 's' : '' }}</template>
    </p>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center gap-3 py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-7 w-7 animate-spin text-emerald-500" />
      <p class="text-sm text-gray-500">Chargement…</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!paginatedEntities.length"
      class="rounded-xl border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900"
    >
      <UIcon name="i-heroicons-magnifying-glass" class="mx-auto mb-2 h-10 w-10 text-gray-300" />
      <p class="text-sm text-gray-500">Aucune entité ne correspond à votre recherche.</p>
      <button
        class="mt-3 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        @click="resetFilters"
      >
        Effacer les filtres
      </button>
    </div>

    <!-- List -->
    <div
      v-else
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
    >
      <div
        v-for="entity in paginatedEntities"
        :key="entity.id"
        class="group flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
      >
        <!-- Colored icon background -->
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          :class="typeColor(entity.type_code)"
        >
          <UIcon :name="typeIcon(entity.type_code)" class="h-4 w-4" />
        </span>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <NuxtLink
            v-if="entity.has_public_page"
            :to="`/etat-senegal/${entity.public_slug}`"
            class="block text-sm font-medium text-gray-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
          >
            {{ entity.name }}
          </NuxtLink>
          <p v-else class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ entity.name }}
          </p>
          <p v-if="entity.parent_name" class="mt-0.5 truncate text-xs text-gray-400">
            {{ entity.parent_name }}
            <template
              v-if="
                tutelleBySnapshotId.get(entity.snapshot_id) &&
                tutelleBySnapshotId.get(entity.snapshot_id) !== entity.parent_name
              "
            >
              <span class="mx-0.5">→</span>
              <span>{{ tutelleBySnapshotId.get(entity.snapshot_id) }}</span>
            </template>
          </p>
        </div>

        <!-- Arrow if clickable -->
        <UIcon
          v-if="entity.has_public_page"
          name="i-heroicons-chevron-right"
          class="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-emerald-500"
        />
      </div>
    </div>

    <!-- Pagination (UPagination like public.vue) -->
    <div v-if="totalFiltered > LIST_PAGE_SIZE" class="mt-6 flex justify-center">
      <UPagination
        :model-value="listPage"
        :total="totalFiltered"
        :page-count="LIST_PAGE_SIZE"
        size="sm"
        @update:model-value="listPage = $event"
        :ui="{
          wrapper: 'flex items-center gap-1',
          rounded: 'rounded-lg',
        }"
      />
    </div>
  </div>
</template>
