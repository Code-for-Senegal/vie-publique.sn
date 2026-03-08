<script setup lang="ts">
/**
 * MapLayerToggles.vue — Toggles visibilité des couches (composant standalone).
 * Peut être utilisé indépendamment de MapControls si nécessaire.
 */
import type { MapDatasetConfig } from '~~/types/map'

const props = defineProps<{
  datasets: MapDatasetConfig[]
  layerVisibility: Record<string, boolean>
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()
</script>

<template>
  <div class="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-700/50 p-3 shadow-xl">
    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
      Couches de données
    </div>
    <div class="space-y-1">
      <label
        v-for="ds in datasets"
        :key="ds.id"
        class="flex items-center gap-2.5 py-1 px-1 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors group"
      >
        <div class="relative">
          <input
            type="checkbox"
            :checked="layerVisibility[ds.id] !== false"
            class="sr-only peer"
            @change="emit('toggle', ds.id)"
          >
          <div
            class="w-8 h-4 bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors"
          />
          <div
            class="absolute left-0.5 top-0.5 w-3 h-3 bg-gray-400 rounded-full peer-checked:translate-x-4 peer-checked:bg-white transition-all"
          />
        </div>
        <span v-if="ds.icon" class="text-sm">{{ ds.icon }}</span>
        <span
          class="text-xs transition-colors"
          :class="layerVisibility[ds.id] !== false ? 'text-white' : 'text-gray-500'"
        >
          {{ ds.label }}
        </span>
      </label>
    </div>
  </div>
</template>
