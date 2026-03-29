<script setup lang="ts">
import type { PublicProjectSector, PublicPolicy, PublicProjectMode } from '~~/types/public-project';

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
  mode?: PublicProjectMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'global',
});

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
    <div class="flex items-center gap-3">
      <div class="relative flex-1">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          :value="search"
          placeholder="Rechercher un projet, ministère..."
          class="block w-full rounded-2xl border-transparent bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 transition-all focus:border-transparent focus:ring-2 focus:ring-inset focus:ring-cyan-500 dark:bg-gray-800 dark:text-white dark:ring-white/10 dark:focus:ring-cyan-400"
          @input="onSearchInput"
        />
      </div>
      <button
        class="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-inset transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 dark:bg-gray-800 dark:hover:bg-gray-750"
        :class="
          hasActiveFilters
            ? 'text-cyan-600 ring-cyan-500/50 dark:text-cyan-400 dark:ring-cyan-400/50'
            : 'text-gray-700 ring-gray-200 dark:text-gray-300 dark:ring-white/10'
        "
        @click="showFilters = !showFilters"
      >
        <UIcon name="i-heroicons-funnel" class="h-4 w-4" />
        <span class="hidden sm:inline">Filtres</span>
        <span
          v-if="hasActiveFilters"
          class="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400"
          >!</span
        >
      </button>
      <button
        v-if="hasActiveFilters"
        class="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-3 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:ring-white/10 dark:hover:bg-gray-750 dark:hover:text-gray-200"
        @click="$emit('reset')"
      >
        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
        <span class="hidden lg:inline">Réinitialiser</span>
      </button>
    </div>

    <!-- Panneau de filtres (collapsible) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="max-h-0 opacity-0 transform -translate-y-2"
      enter-to-class="max-h-[800px] opacity-100 transform translate-y-0"
      leave-from-class="max-h-[800px] opacity-100 transform translate-y-0"
      leave-to-class="max-h-0 opacity-0 transform -translate-y-2"
    >
      <div
        v-show="showFilters"
        class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:ring-white/5 p-5 mt-2"
      >
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <!-- Année -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Année</label
            >
            <select
              :value="year ? String(year) : ''"
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
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
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
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
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
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
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
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
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
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
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
              @change="
                $emit('update:region', ($event.target as HTMLSelectElement).value || undefined)
              "
            >
              <option v-for="opt in regionOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- PRES (visible uniquement en mode global) -->
          <div v-if="mode === 'global'">
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
              >Type PRES</label
            >
            <select
              :value="isPres"
              class="form-select block w-full rounded-xl border-transparent bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900/50 dark:text-white dark:focus:bg-gray-900 transition-colors"
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
