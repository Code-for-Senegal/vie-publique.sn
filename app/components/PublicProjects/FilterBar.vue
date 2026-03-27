<script setup lang="ts">
import type { PublicProjectSector, PublicPolicy } from '~~/types/public-project';

interface Props {
  sectors: PublicProjectSector[];
  policies: PublicPolicy[];
  ministries: { id: number; name: string }[];
  regions: string[];
  years: { year: number; yearId: number }[];
  versions: { id: number; label: string; yearId: number }[];
  // État actuel des filtres
  search: string;
  year?: number;
  version?: number;
  sectorId?: number;
  policyId?: number;
  ministryId?: number;
  region?: string;
  isPres: 'all' | 'true' | 'false';
  hasActiveFilters: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:search': [value: string];
  'update:year': [value: number | undefined];
  'update:version': [value: number | undefined];
  'update:sectorId': [value: number | undefined];
  'update:policyId': [value: number | undefined];
  'update:ministryId': [value: number | undefined];
  'update:region': [value: string | undefined];
  'update:isPres': [value: 'all' | 'true' | 'false'];
  reset: [];
}>();

const showFilters = ref(false);

// Options pour les sélecteurs
const yearOptions = computed(() => [
  { label: 'Toutes les années', value: '' },
  ...props.years.map((y) => ({ label: String(y.year), value: String(y.year) })),
]);

const versionOptions = computed(() => [
  { label: 'Toutes les versions', value: '' },
  ...props.versions.map((v) => ({ label: v.label, value: String(v.id) })),
]);

const sectorOptions = computed(() => [
  { label: 'Tous les secteurs', value: '' },
  ...props.sectors.map((s) => ({ label: s.name, value: String(s.id) })),
]);

const policyOptions = computed(() => [
  { label: 'Tous les axes', value: '' },
  ...props.policies.map((p) => ({ label: p.title, value: String(p.id) })),
]);

const ministryOptions = computed(() => [
  { label: 'Tous les ministères', value: '' },
  ...props.ministries.map((m) => ({ label: m.name, value: String(m.id) })),
]);

const regionOptions = computed(() => [
  { label: 'Toutes les régions', value: '' },
  ...props.regions.map((r) => ({ label: r, value: r })),
]);

const presOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'PRES', value: 'true' },
  { label: 'Non PRES', value: 'false' },
];

// Helpers pour émettre les changements
const onSearchInput = (e: Event) => {
  emit('update:search', (e.target as HTMLInputElement).value);
};

const onSelectChange = (
  emitEvent:
    | 'update:year'
    | 'update:version'
    | 'update:sectorId'
    | 'update:policyId'
    | 'update:ministryId',
  value: string,
) => {
  emit(emitEvent, value ? parseInt(value) : undefined);
};
</script>

<template>
  <div class="space-y-3">
    <!-- Barre de recherche + toggle filtres -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          :value="search"
          placeholder="Rechercher un projet..."
          class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          @input="onSearchInput"
        />
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        :class="{
          'border-primary-500 text-primary-600 dark:border-primary-500 dark:text-primary-400':
            hasActiveFilters,
        }"
        @click="showFilters = !showFilters"
      >
        <UIcon name="i-heroicons-funnel" class="h-4 w-4" />
        <span class="hidden sm:inline">Filtres</span>
        <span
          v-if="hasActiveFilters"
          class="bg-primary-500 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
          >!</span
        >
      </button>
      <button
        v-if="hasActiveFilters"
        class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        @click="$emit('reset')"
      >
        <UIcon name="i-heroicons-x-mark" class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">Réinitialiser</span>
      </button>
    </div>

    <!-- Panneau de filtres (collapsible) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-96 opacity-100"
      leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-show="showFilters"
        class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <!-- Année -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Année</label
            >
            <select
              :value="year ? String(year) : ''"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="onSelectChange('update:year', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="opt in yearOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Version -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Version</label
            >
            <select
              :value="version ? String(version) : ''"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="onSelectChange('update:version', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="opt in versionOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Secteur -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Secteur</label
            >
            <select
              :value="sectorId ? String(sectorId) : ''"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="
                onSelectChange('update:sectorId', ($event.target as HTMLSelectElement).value)
              "
            >
              <option v-for="opt in sectorOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Axe / Politique -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Axe / Politique</label
            >
            <select
              :value="policyId ? String(policyId) : ''"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="
                onSelectChange('update:policyId', ($event.target as HTMLSelectElement).value)
              "
            >
              <option v-for="opt in policyOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Ministère -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Ministère</label
            >
            <select
              :value="ministryId ? String(ministryId) : ''"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="
                onSelectChange('update:ministryId', ($event.target as HTMLSelectElement).value)
              "
            >
              <option v-for="opt in ministryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Région -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Région</label
            >
            <select
              :value="region || ''"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="
                $emit('update:region', ($event.target as HTMLSelectElement).value || undefined)
              "
            >
              <option v-for="opt in regionOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- PRES -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Type PRES</label
            >
            <select
              :value="isPres"
              class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="$emit('update:isPres', ($event.target as HTMLSelectElement).value as any)"
            >
              <option v-for="opt in presOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
