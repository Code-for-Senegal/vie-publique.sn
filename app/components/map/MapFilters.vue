<script setup lang="ts">
/**
 * MapFilters.vue — Filtres dynamiques.
 * Container pointer-events-none. Panel pointer-events-auto.
 */
import { ref } from 'vue'
import type { FilterConfig } from '~~/types/map'

const props = defineProps<{
  filters: FilterConfig[]
  activeFilters: Record<string, any>
  activeCount?: number
  isMobile?: boolean
}>()

const emit = defineEmits<{
  update: [id: string, value: any]
  reset: []
}>()

const showFilters = ref(false)

function handleUpdate(id: string, value: any) {
  emit('update', id, value)
}

function toggleArrayValue(id: string, value: string | number) {
  const current = props.activeFilters[id] ?? []
  const idx = current.indexOf(value)
  const newVal = idx === -1 ? [...current, value] : current.filter((_: any, i: number) => i !== idx)
  emit('update', id, newVal)
}
</script>

<template>
  <!-- Container pointer-events-none -->
  <div
    class="absolute z-10 pointer-events-none"
    :class="isMobile ? 'top-2 right-2' : 'top-4 right-4'"
  >
    <!-- Mobile: bouton toggle + dropdown -->
    <template v-if="isMobile">
      <button
        class="pointer-events-auto flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white text-xs px-3 py-2 rounded-lg shadow-lg active:scale-95 transition-all"
        style="-webkit-tap-highlight-color: transparent;"
        @click="showFilters = !showFilters"
      >
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-3.5 h-3.5" />
        <span>Filtres</span>
        <span
          v-if="activeCount"
          class="bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
        >{{ activeCount }}</span>
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="showFilters"
          class="pointer-events-auto absolute top-full right-0 mt-2 bg-gray-950/95 backdrop-blur-md rounded-lg border border-white/10 px-3 py-3 text-white shadow-xl w-[260px] max-h-[60vh] overflow-y-auto"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Filtres</span>
            <button
              v-if="activeCount && activeCount > 0"
              class="text-[11px] text-blue-400 hover:text-blue-300"
              @click="$emit('reset')"
            >
              Reinitialiser
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="filter in filters" :key="filter.id">
              <label class="block text-[11px] text-gray-500 mb-1.5">{{ filter.label }}</label>
              <!-- Select -->
              <select
                v-if="filter.type === 'select'"
                :value="activeFilters[filter.id]"
                class="w-full bg-gray-800/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
                @change="handleUpdate(filter.id, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in filter.options" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
              </select>
              <!-- Multi-select chips -->
              <div v-else-if="filter.type === 'multi-select'" class="flex flex-wrap gap-1.5">
                <button
                  v-for="opt in filter.options"
                  :key="String(opt.value)"
                  class="px-2.5 py-1.5 rounded-full text-xs border transition-colors"
                  :class="(activeFilters[filter.id] ?? []).includes(opt.value)
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-white/5 border-white/10 text-gray-400'"
                  @click="toggleArrayValue(filter.id, opt.value)"
                >{{ opt.label }}</button>
              </div>
              <!-- Toggle -->
              <div v-else-if="filter.type === 'toggle'" class="flex gap-1">
                <button
                  v-for="opt in filter.options"
                  :key="String(opt.value)"
                  class="flex-1 px-2 py-1.5 rounded-lg text-xs text-center transition-colors"
                  :class="activeFilters[filter.id] === opt.value
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-white/5 text-gray-500 border border-white/5'"
                  @click="handleUpdate(filter.id, opt.value)"
                >{{ opt.label }}</button>
              </div>
              <!-- Range -->
              <div v-else-if="filter.type === 'range'" class="flex items-center gap-2">
                <input
                  type="range"
                  :min="filter.min ?? 0" :max="filter.max ?? 100" :step="filter.step ?? 1"
                  :value="activeFilters[filter.id] ?? filter.min ?? 0"
                  class="w-full accent-blue-500"
                  @input="handleUpdate(filter.id, Number(($event.target as HTMLInputElement).value))"
                >
                <span class="text-xs text-gray-400 min-w-[30px] text-right tabular-nums">{{ activeFilters[filter.id] ?? filter.min ?? 0 }}</span>
              </div>
              <!-- Search -->
              <input
                v-else-if="filter.type === 'search'"
                type="text"
                :value="activeFilters[filter.id] ?? ''"
                placeholder="Rechercher..."
                class="w-full bg-gray-800/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50"
                @input="handleUpdate(filter.id, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <!-- Desktop: panneau fixe -->
    <div v-else class="pointer-events-auto bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/10 px-4 py-3 text-white shadow-lg max-w-[240px]">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Filtres</span>
        <button
          v-if="activeCount && activeCount > 0"
          class="text-[11px] text-blue-400 hover:text-blue-300"
          @click="$emit('reset')"
        >
          Reinitialiser ({{ activeCount }})
        </button>
      </div>

      <div class="space-y-3">
        <div v-for="filter in filters" :key="filter.id">
          <label class="block text-[11px] text-gray-500 mb-1.5">{{ filter.label }}</label>
          <select
            v-if="filter.type === 'select'"
            :value="activeFilters[filter.id]"
            class="w-full bg-gray-800/50 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            @change="handleUpdate(filter.id, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="opt in filter.options" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
          </select>
          <div v-else-if="filter.type === 'multi-select'" class="flex flex-wrap gap-1.5">
            <button
              v-for="opt in filter.options"
              :key="String(opt.value)"
              class="px-2 py-1 rounded-full text-xs border transition-colors"
              :class="(activeFilters[filter.id] ?? []).includes(opt.value)
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'"
              @click="toggleArrayValue(filter.id, opt.value)"
            >{{ opt.label }}</button>
          </div>
          <div v-else-if="filter.type === 'toggle'" class="flex gap-1">
            <button
              v-for="opt in filter.options"
              :key="String(opt.value)"
              class="flex-1 px-2 py-1 rounded-lg text-xs text-center transition-colors"
              :class="activeFilters[filter.id] === opt.value
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'"
              @click="handleUpdate(filter.id, opt.value)"
            >{{ opt.label }}</button>
          </div>
          <div v-else-if="filter.type === 'range'" class="flex items-center gap-2">
            <input
              type="range"
              :min="filter.min ?? 0" :max="filter.max ?? 100" :step="filter.step ?? 1"
              :value="activeFilters[filter.id] ?? filter.min ?? 0"
              class="w-full accent-blue-500"
              @input="handleUpdate(filter.id, Number(($event.target as HTMLInputElement).value))"
            >
            <span class="text-xs text-gray-400 min-w-[30px] text-right tabular-nums">{{ activeFilters[filter.id] ?? filter.min ?? 0 }}</span>
          </div>
          <input
            v-else-if="filter.type === 'search'"
            type="text"
            :value="activeFilters[filter.id] ?? ''"
            placeholder="Rechercher..."
            class="w-full bg-gray-800/50 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50"
            @input="handleUpdate(filter.id, ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>
    </div>
  </div>
</template>
