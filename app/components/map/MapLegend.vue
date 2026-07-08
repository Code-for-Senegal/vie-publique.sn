<script setup lang="ts">
/**
 * MapLegend.vue — Légende compacte, collapsible.
 * Container pointer-events-none, contenu pointer-events-auto.
 */
import { computed, ref } from 'vue'
import type { LegendConfig } from '~~/types/map'

const props = defineProps<{
  config: LegendConfig
  isMobile?: boolean
}>()

const isCollapsed = ref(false)

const positionClasses = computed(() => {
  if (props.isMobile) return 'bottom-4 left-3'

  const pos = props.config.position ?? 'bottom-right'
  const map: Record<string, string> = {
    'bottom-right': 'bottom-6 right-4',
    'bottom-left': 'bottom-6 left-16',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  }
  return map[pos] ?? map['bottom-right']
})

const gradientCSS = computed(() => {
  if (props.config.type !== 'gradient' || !props.config.colorScale) return ''
  const stops = props.config.colorScale.stops
  if (!stops.length) return ''

  const min = stops[0].value
  const max = stops[stops.length - 1].value
  const range = max - min || 1

  const cssStops = stops.map((s) => {
    const pct = ((s.value - min) / range) * 100
    return `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.color[3] / 255}) ${pct}%`
  })
  return `linear-gradient(to right, ${cssStops.join(', ')})`
})

const gradientLabels = computed(() => {
  if (!props.config.colorScale?.stops) return []
  const stops = props.config.colorScale.stops
  if (stops.length <= 3) return stops.map((s) => s.label ?? String(s.value))
  return [
    stops[0].label ?? String(stops[0].value),
    stops[Math.floor(stops.length / 2)].label ?? String(stops[Math.floor(stops.length / 2)].value),
    stops[stops.length - 1].label ?? String(stops[stops.length - 1].value),
  ]
})
</script>

<template>
  <div
    class="absolute z-10 pointer-events-none"
    :class="positionClasses"
  >
    <div
      class="pointer-events-auto bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg transition-all"
      :class="[
        isCollapsed ? 'px-2 py-1.5' : 'px-3 py-2.5',
        isMobile ? 'max-w-[200px]' : 'max-w-[220px]',
      ]"
    >
      <!-- Header (cliquable pour toggle) -->
      <button
        class="flex items-center gap-1.5 w-full text-left"
        @click="isCollapsed = !isCollapsed"
      >
        <h5 class="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex-1">
          {{ config.title }}
        </h5>
        <UIcon
          :name="isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          class="w-3 h-3 text-gray-500"
        />
      </button>

      <!-- Content -->
      <div v-show="!isCollapsed" class="mt-2">
        <!-- Gradient legend -->
        <div v-if="config.type === 'gradient' && config.colorScale">
          <div
            class="h-2.5 w-full rounded-full"
            :style="{ background: gradientCSS }"
          />
          <div class="flex justify-between mt-1">
            <span
              v-for="(label, idx) in gradientLabels"
              :key="idx"
              class="text-[10px] text-gray-500"
            >
              {{ label }}
            </span>
          </div>
        </div>

        <!-- Items legend -->
        <div v-else-if="config.type === 'items' && config.items?.length" class="space-y-1.5">
          <div
            v-for="item in config.items"
            :key="item.label"
            class="flex items-center gap-2"
          >
            <span
              class="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
              :style="{ backgroundColor: item.color }"
            />
            <span class="text-[11px] text-gray-400 flex-1 truncate">{{ item.label }}</span>
            <span v-if="item.count !== undefined" class="text-[10px] text-gray-600">
              {{ item.count }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
