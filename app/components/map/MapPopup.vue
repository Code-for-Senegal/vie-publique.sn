<script setup lang="ts">
/**
 * MapPopup.vue — Popup au clic sur la carte.
 * Desktop: popup positionné aux coordonnées pixel.
 * Mobile: bottom-sheet avec backdrop.
 */
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { PopupConfig, PopupFieldConfig } from '~~/types/map'
import { formatPopupValue, resolvePopupTitle } from '~/composables/useMapPopup'

const props = defineProps<{
  config: PopupConfig
  data: any
  position: { x: number; y: number }
  isMobile?: boolean
}>()

const emit = defineEmits<{
  close: []
  action: [event: string]
}>()

const popupRef = ref<HTMLElement | null>(null)
const adjustedPosition = ref({ left: '0px', top: '0px' })

const title = computed(() => resolvePopupTitle(props.config, props.data))
const width = computed(() => `${props.config.width ?? 280}px`)

function calculatePosition() {
  if (props.isMobile || !popupRef.value) return
  const padding = 16
  const popupW = props.config.width ?? 280
  const popupH = popupRef.value.offsetHeight || 200
  const viewW = window.innerWidth
  const viewH = window.innerHeight

  let left = props.position.x + 12
  let top = props.position.y - popupH / 2

  if (left + popupW + padding > viewW) left = props.position.x - popupW - 12
  if (top < padding) top = padding
  if (top + popupH + padding > viewH) top = viewH - popupH - padding

  adjustedPosition.value = { left: `${left}px`, top: `${top}px` }
}

// Recalculer quand la position ou les données changent (clic sur une autre région)
watch(
  () => [props.position.x, props.position.y, props.data],
  () => nextTick(calculatePosition),
)

onMounted(() => {
  calculatePosition()
  requestAnimationFrame(calculatePosition)
})

function getFieldColor(field: PopupFieldConfig): string | undefined {
  if (!field.color) return undefined
  return typeof field.color === 'function' ? field.color(props.data) : field.color
}

const chartData = computed(() => {
  if (!props.config.chart || !props.data) return []
  const items = props.data[props.config.chart.dataKey]
  if (!Array.isArray(items)) return []
  return items
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <!-- Desktop: popup positionné -->
  <div
    v-if="!isMobile"
    ref="popupRef"
    class="absolute z-30 animate-fade-in"
    :style="{ left: adjustedPosition.left, top: adjustedPosition.top, width }"
  >
    <div class="bg-gray-950/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-white overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h4 class="font-semibold text-sm truncate">{{ title }}</h4>
        <button
          class="ml-2 text-gray-500 hover:text-white transition-colors"
          aria-label="Fermer"
          @click="$emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>

      <!-- Fields -->
      <div class="px-4 py-3 space-y-2">
        <div
          v-for="field in config.fields"
          :key="field.key"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-500 text-xs">{{ field.label }}</span>
          <span
            v-if="field.format === 'badge'"
            class="px-2 py-0.5 rounded-full text-[11px] font-medium"
            :style="{
              backgroundColor: (getFieldColor(field) ?? '#6366f1') + '20',
              color: getFieldColor(field) ?? '#a5b4fc',
            }"
          >
            {{ formatPopupValue(field, data) }}
          </span>
          <span
            v-else-if="field.format === 'bar'"
            class="flex items-center gap-2"
          >
            <div class="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full"
                :style="{
                  width: `${Math.min(100, data[field.key] ?? 0)}%`,
                  backgroundColor: getFieldColor(field) ?? '#60a5fa',
                }"
              />
            </div>
            <span class="text-[11px] text-gray-300 tabular-nums">{{ formatPopupValue(field, data) }}</span>
          </span>
          <span v-else class="font-medium text-gray-200 text-xs tabular-nums">
            {{ formatPopupValue(field, data) }}
          </span>
        </div>
      </div>

      <!-- Chart -->
      <div v-if="config.chart?.type === 'horizontal-bars' && chartData.length" class="px-4 pb-3 space-y-1.5">
        <div class="text-[10px] text-gray-600 mb-2 border-t border-white/5 pt-2 uppercase tracking-wider">Details</div>
        <div v-for="(item, idx) in chartData" :key="idx" class="space-y-0.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-gray-400 truncate">
              {{ config.chart?.labelKey ? item[config.chart.labelKey] : `Item ${idx + 1}` }}
            </span>
            <span class="text-gray-200 font-medium tabular-nums">
              {{ typeof item.pourcentage === 'number' ? `${item.pourcentage.toFixed(1)}%` : '' }}
            </span>
          </div>
          <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :style="{
                width: `${Math.min(100, item.pourcentage ?? 0)}%`,
                backgroundColor:
                  (config.chart?.colorKey && item[config.chart.colorKey])
                    ?? config.chart?.colors?.[item[config.chart?.labelKey ?? '']]
                    ?? '#60a5fa',
              }"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="config.actions?.length" class="px-4 py-2 border-t border-white/5 flex gap-2">
        <button
          v-for="action in config.actions"
          :key="action.event"
          class="flex-1 text-[11px] text-center bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-gray-300"
          @click="$emit('action', action.event)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile: backdrop + bottom-sheet -->
  <template v-else>
    <div class="fixed inset-0 z-30 bg-black/20" @click="$emit('close')" />
    <div
      class="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-md border-t border-white/5 text-white rounded-t-2xl max-h-[55vh] overflow-y-auto animate-slide-up"
      style="-webkit-overflow-scrolling: touch;"
    >
      <div class="flex justify-center pt-2 pb-1">
        <div class="w-10 h-1 rounded-full bg-gray-600" />
      </div>
      <div class="px-4 pb-5">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-base">{{ title }}</h4>
          <button
            class="text-gray-500 active:text-white p-1 -mr-1"
            aria-label="Fermer"
            @click="$emit('close')"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="field in config.fields"
            :key="field.key"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-500">{{ field.label }}</span>
            <span
              v-if="field.format === 'badge'"
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :style="{
                backgroundColor: (getFieldColor(field) ?? '#6366f1') + '20',
                color: getFieldColor(field) ?? '#a5b4fc',
              }"
            >{{ formatPopupValue(field, data) }}</span>
            <span
              v-else-if="field.format === 'bar'"
              class="flex items-center gap-2"
            >
              <div class="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: `${Math.min(100, data[field.key] ?? 0)}%`, backgroundColor: getFieldColor(field) ?? '#60a5fa' }" />
              </div>
              <span class="text-xs text-gray-300 tabular-nums">{{ formatPopupValue(field, data) }}</span>
            </span>
            <span v-else class="font-medium text-gray-200 tabular-nums">{{ formatPopupValue(field, data) }}</span>
          </div>
        </div>

        <!-- Chart mobile -->
        <div v-if="config.chart?.type === 'horizontal-bars' && chartData.length" class="space-y-1.5 mt-3 pt-3 border-t border-white/5">
          <div class="text-[10px] text-gray-600 mb-2 uppercase tracking-wider">Details</div>
          <div v-for="(item, idx) in chartData" :key="idx" class="space-y-0.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400 truncate">{{ config.chart?.labelKey ? item[config.chart.labelKey] : `Item ${idx + 1}` }}</span>
              <span class="text-gray-200 font-medium tabular-nums">{{ typeof item.pourcentage === 'number' ? `${item.pourcentage.toFixed(1)}%` : '' }}</span>
            </div>
            <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="{ width: `${Math.min(100, item.pourcentage ?? 0)}%`, backgroundColor: (config.chart?.colorKey && item[config.chart.colorKey]) ?? config.chart?.colors?.[item[config.chart?.labelKey ?? '']] ?? '#60a5fa' }" />
            </div>
          </div>
        </div>

        <div v-if="config.actions?.length" class="flex gap-2 mt-4">
          <button
            v-for="action in config.actions"
            :key="action.event"
            class="flex-1 text-sm text-center bg-white/5 active:bg-white/10 px-3 py-2.5 rounded-lg transition-colors"
            @click="$emit('action', action.event)"
          >{{ action.label }}</button>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.15s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up 0.2s ease-out;
}
</style>
