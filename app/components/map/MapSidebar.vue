<script setup lang="ts">
/**
 * MapSidebar.vue — Panneau d'info (NYT-style)
 * Mobile: USlideover bottom sheet, déclenché par un bouton flottant.
 * Desktop: Panneau latéral droit collapsible.
 * Le container est pointer-events-none, seuls les éléments interactifs capturent.
 */
import { computed, ref, resolveComponent, type Component } from 'vue'
import type { SidebarConfig, SidebarMetric } from '~~/types/map'

const props = defineProps<{
  config: SidebarConfig
  selectedData?: any
  isMobile?: boolean
}>()

const isOpen = ref(false)
const isCollapsed = ref(false)

const sidebarWidth = computed(() => {
  const baseWidth = props.config.width ?? 340
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return Math.min(baseWidth, Math.round(window.innerWidth * 0.38))
  }
  return baseWidth
})

const metrics = computed<SidebarMetric[]>(() => {
  if (!props.config.metrics) return []
  return typeof props.config.metrics === 'function'
    ? props.config.metrics()
    : props.config.metrics
})

const dynamicComponent = computed(() => {
  if (!props.config.component) return null
  if (typeof props.config.component === 'string') {
    return resolveComponent(props.config.component)
  }
  return props.config.component as Component
})

function getTrendIcon(trend?: string) {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

function getTrendClass(trend?: string) {
  if (trend === 'up') return 'text-emerald-400'
  if (trend === 'down') return 'text-red-400'
  return 'text-gray-500'
}
</script>

<template>
  <!-- ─── MOBILE : Bouton flottant + USlideover ─────────────── -->
  <template v-if="isMobile">
    <!-- Bouton d'ouverture (pointer-events-auto pour être cliquable) -->
    <div class="absolute top-2 left-2 z-10 pointer-events-none">
      <button
        class="pointer-events-auto flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white text-xs px-3 py-2 rounded-lg shadow-lg active:scale-95 transition-all"
        style="-webkit-tap-highlight-color: transparent;"
        @click="isOpen = true"
      >
        <UIcon name="i-heroicons-chart-bar" class="w-3.5 h-3.5" />
        <span>{{ config.title }}</span>
      </button>
    </div>

    <!-- Slideover bottom sheet -->
    <USlideover
      v-model="isOpen"
      side="bottom"
      :ui="{
        height: 'max-h-[70vh]',
        background: 'bg-gray-950',
        ring: 'ring-0',
        rounded: 'rounded-t-2xl',
        shadow: 'shadow-2xl',
        overlay: { background: 'bg-black/30' },
      }"
    >
      <div class="text-white">
        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        <!-- Header -->
        <div class="px-5 pb-3 flex items-center justify-between border-b border-white/5">
          <div>
            <h3 class="text-base font-semibold tracking-tight">{{ config.title }}</h3>
            <p v-if="config.subtitle" class="text-xs text-gray-500 mt-0.5">{{ config.subtitle }}</p>
          </div>
          <button
            class="text-gray-500 hover:text-white p-1 -mr-1"
            aria-label="Fermer"
            @click="isOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Metrics grid -->
        <div v-if="metrics.length" class="px-5 py-4 grid grid-cols-2 gap-2.5">
          <div
            v-for="metric in metrics"
            :key="metric.label"
            class="bg-white/[0.03] border border-white/5 rounded-lg p-3"
          >
            <div class="text-[11px] text-gray-500 mb-1">{{ metric.label }}</div>
            <div class="text-lg font-bold tabular-nums" :style="metric.color ? { color: metric.color } : {}">
              {{ metric.value }}
            </div>
            <div
              v-if="metric.trend"
              class="text-[11px] mt-0.5 font-medium"
              :class="getTrendClass(metric.trend)"
            >
              {{ getTrendIcon(metric.trend) }} {{ metric.trendValue ?? '' }}
            </div>
          </div>
        </div>

        <!-- Dynamic component -->
        <div v-if="dynamicComponent" class="px-5 pb-5">
          <component
            :is="dynamicComponent"
            v-bind="config.componentProps ?? {}"
            :selected-data="selectedData"
          />
        </div>
      </div>
    </USlideover>
  </template>

  <!-- ─── DESKTOP : Panneau latéral ────────────────────────── -->
  <template v-else>
    <!-- Le panneau a pointer-events-auto car il est dans sa propre zone -->
    <div
      class="absolute top-0 right-0 z-10 h-full transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'w-0' : ''"
      :style="!isCollapsed ? { width: `${sidebarWidth}px` } : {}"
    >
      <!-- Toggle button -->
      <button
        v-if="config.collapsible !== false"
        class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 z-20 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800 text-white/70 hover:text-white rounded-l-lg px-1 py-6 shadow-lg transition-all border border-white/10 border-r-0"
        :aria-label="isCollapsed ? 'Ouvrir le panneau' : 'Fermer le panneau'"
        @click="isCollapsed = !isCollapsed"
      >
        <UIcon
          :name="isCollapsed ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
          class="w-3.5 h-3.5"
        />
      </button>

      <!-- Content -->
      <div
        v-show="!isCollapsed"
        class="h-full overflow-y-auto bg-gray-950/95 backdrop-blur-md border-l border-white/5 text-white"
      >
        <!-- Header -->
        <div class="p-5 border-b border-white/5">
          <h3 class="text-lg font-semibold tracking-tight">{{ config.title }}</h3>
          <p v-if="config.subtitle" class="text-sm text-gray-500 mt-1">{{ config.subtitle }}</p>
        </div>

        <!-- Metrics -->
        <div v-if="metrics.length" class="p-5 grid grid-cols-2 gap-2.5">
          <div
            v-for="metric in metrics"
            :key="metric.label"
            class="bg-white/[0.03] border border-white/5 rounded-lg p-3.5"
          >
            <div class="text-[11px] text-gray-500 mb-1.5">{{ metric.label }}</div>
            <div class="text-xl font-bold tabular-nums" :style="metric.color ? { color: metric.color } : {}">
              {{ metric.value }}
            </div>
            <div
              v-if="metric.trend"
              class="text-xs mt-1 font-medium"
              :class="getTrendClass(metric.trend)"
            >
              {{ getTrendIcon(metric.trend) }} {{ metric.trendValue ?? '' }}
            </div>
          </div>
        </div>

        <!-- Dynamic component -->
        <div v-if="dynamicComponent" class="p-5">
          <component
            :is="dynamicComponent"
            v-bind="config.componentProps ?? {}"
            :selected-data="selectedData"
          />
        </div>
      </div>
    </div>
  </template>
</template>
