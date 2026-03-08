<script setup lang="ts">
interface RegionOption {
  code: string;
  name: string;
}

const props = defineProps<{
  sectors: string[];
  regions: RegionOption[];
  activeSectors: string[];
  activeTendances: string[];
  activeRegions: string[];
  filteredCount: number;
}>();

const emit = defineEmits<{
  'update:activeSectors': [string[]];
  'update:activeTendances': [string[]];
  'update:activeRegions': [string[]];
  reset: [];
}>();

const isOpen = ref(false);

const secteurStyle: Record<string, { label: string; icon: string }> = {
  services: { label: 'Services', icon: '🏢' },
  agriculture: { label: 'Agriculture', icon: '🌾' },
  mines: { label: 'Mines', icon: '⛏️' },
  peche: { label: 'Pêche', icon: '🐟' },
  industrie: { label: 'Industrie', icon: '🏭' },
};

const tendanceOptions: { key: string; label: string }[] = [
  { key: 'up', label: 'Hausse ↑' },
  { key: 'down', label: 'Baisse ↓' },
  { key: 'stable', label: 'Stable →' },
];

const hasFilters = computed(
  () =>
    props.activeSectors.length > 0 ||
    props.activeTendances.length > 0 ||
    props.activeRegions.length > 0,
);

const activeCount = computed(
  () => props.activeSectors.length + props.activeTendances.length + props.activeRegions.length,
);

const totalRegions = computed(() => props.regions.length);

function toggleItem(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

function toggleSector(s: string) {
  emit('update:activeSectors', toggleItem(props.activeSectors, s));
}
function toggleTendance(t: string) {
  emit('update:activeTendances', toggleItem(props.activeTendances, t));
}
function toggleRegion(r: string) {
  emit('update:activeRegions', toggleItem(props.activeRegions, r));
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/80">
    <!-- Barre compacte (toujours visible) -->
    <button
      class="flex w-full items-center justify-between px-2.5 py-1.5 sm:px-3"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-funnel-20-solid"
          class="h-3.5 w-3.5"
          :class="hasFilters ? 'text-sky-400' : 'text-gray-500'"
        />
        <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Filtres</span>
        <span
          v-if="hasFilters"
          class="rounded-full bg-sky-500/20 px-1.5 py-px text-[9px] font-bold tabular-nums text-sky-400"
        >
          {{ activeCount }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full border px-2 py-px text-[10px] font-bold tabular-nums"
          :class="
            hasFilters
              ? 'border-sky-500/40 bg-sky-500/10 text-sky-500 dark:text-sky-400'
              : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
          "
        >
          {{ filteredCount }} / {{ totalRegions }} régions
        </span>
        <UIcon
          name="i-heroicons-chevron-down-20-solid"
          class="h-3.5 w-3.5 text-gray-500 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </button>

    <!-- Panneau dépliable -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-96 opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="isOpen" class="overflow-hidden">
        <div class="border-t border-gray-100 px-2.5 pb-2 pt-1.5 dark:border-gray-800 sm:px-3">
          <!-- Filter groups -->
          <div class="space-y-1.5">
            <!-- Secteur -->
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="mr-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                Secteur
              </span>
              <button
                v-for="s in sectors"
                :key="s"
                class="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all"
                :class="
                  activeSectors.includes(s)
                    ? 'border-sky-500/40 bg-sky-500/20 text-sky-600 dark:text-sky-300'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300'
                "
                @click="toggleSector(s)"
              >
                {{ (secteurStyle[s] ?? { icon: '', label: s }).icon }}
                {{ (secteurStyle[s] ?? { icon: '', label: s }).label }}
              </button>
            </div>

            <!-- Tendance -->
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="mr-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                Tendance
              </span>
              <button
                v-for="t in tendanceOptions"
                :key="t.key"
                class="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all"
                :class="
                  activeTendances.includes(t.key)
                    ? 'border-sky-500/40 bg-sky-500/20 text-sky-600 dark:text-sky-300'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300'
                "
                @click="toggleTendance(t.key)"
              >
                {{ t.label }}
              </button>
            </div>

            <!-- Régions -->
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="mr-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                Régions
              </span>
              <button
                v-for="r in regions"
                :key="r.code"
                class="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all"
                :class="
                  activeRegions.includes(r.code)
                    ? 'border-sky-500/40 bg-sky-500/20 text-sky-600 dark:text-sky-300'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300'
                "
                @click="toggleRegion(r.code)"
              >
                {{ r.name }}
              </button>
            </div>
          </div>

          <!-- Reset -->
          <div v-if="hasFilters" class="mt-2 flex justify-end">
            <button
              class="flex items-center gap-0.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-px text-[10px] font-semibold text-red-400 transition-colors hover:bg-red-500/20"
              @click="$emit('reset')"
            >
              Réinitialiser
              <span class="text-[9px]">✕</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
