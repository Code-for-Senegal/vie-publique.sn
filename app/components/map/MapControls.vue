<script setup lang="ts">
/**
 * MapControls.vue — Contrôles carte professionnels
 * Toolbar vertical avec icônes propres. pointer-events-none sur le container,
 * pointer-events-auto uniquement sur les boutons.
 */
import type { MapControlsConfig, MapDatasetConfig, MapRegionPreset } from '~~/types/map'

const props = defineProps<{
  config: MapControlsConfig
  datasets: MapDatasetConfig[]
  presets: MapRegionPreset[]
  layerVisibility: Record<string, boolean>
  theme: 'dark' | 'light'
  isMobile?: boolean
}>()

const emit = defineEmits<{
  'toggle-layer': [id: string]
  'fly-to': [lng: number, lat: number, zoom?: number]
  'toggle-theme': []
  'export-png': []
  'export-csv': []
  'zoom-in': []
  'zoom-out': []
  'reset-north': []
}>()

const showLayerPanel = ref(false)
const showPresets = ref(false)
const showExportMenu = ref(false)

function closeAll() {
  showLayerPanel.value = false
  showPresets.value = false
  showExportMenu.value = false
}

function togglePanel(panel: 'layers' | 'presets' | 'export') {
  const wasOpen = panel === 'layers' ? showLayerPanel.value
    : panel === 'presets' ? showPresets.value
    : showExportMenu.value
  closeAll()
  if (!wasOpen) {
    if (panel === 'layers') showLayerPanel.value = true
    else if (panel === 'presets') showPresets.value = true
    else showExportMenu.value = true
  }
}

const isFullscreen = ref(false)
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
</script>

<template>
  <!-- Container : pointer-events-none pour laisser la carte recevoir les gestes -->
  <div class="absolute z-10 pointer-events-none" :class="isMobile ? 'bottom-4 right-3' : 'bottom-6 left-4'">
    <div class="flex flex-col gap-1.5">
      <!-- Zoom -->
      <div class="flex flex-col bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden pointer-events-auto shadow-lg">
        <button
          class="map-ctrl-btn border-b border-white/10"
          aria-label="Zoom avant"
          @click="emit('zoom-in')"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
        </button>
        <button
          class="map-ctrl-btn"
          aria-label="Zoom arrière"
          @click="emit('zoom-out')"
        >
          <UIcon name="i-heroicons-minus" class="w-4 h-4" />
        </button>
      </div>

      <!-- Compass / Reset North -->
      <button
        class="map-ctrl-btn bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg pointer-events-auto"
        aria-label="Réinitialiser l'orientation"
        @click="emit('reset-north')"
      >
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
      </button>

      <!-- Layers -->
      <div v-if="config.layerToggles" class="relative">
        <button
          class="map-ctrl-btn bg-gray-900/80 backdrop-blur-sm rounded-lg border shadow-lg pointer-events-auto"
          :class="showLayerPanel ? 'border-blue-500/50 text-blue-400' : 'border-white/10'"
          aria-label="Couches"
          @click="togglePanel('layers')"
        >
          <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4" />
        </button>

        <!-- Layer panel -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showLayerPanel"
            class="absolute bottom-0 mb-0 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/10 p-3 shadow-xl min-w-[200px] pointer-events-auto"
            :class="isMobile ? 'right-full mr-2' : 'left-full ml-2'"
          >
            <div class="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5">Couches</div>
            <div class="space-y-1">
              <label
                v-for="ds in datasets"
                :key="ds.id"
                class="flex items-center gap-2.5 text-xs cursor-pointer group py-1.5 px-1.5 rounded-md hover:bg-white/5 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="layerVisibility[ds.id] !== false"
                  class="rounded-sm bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0 w-3.5 h-3.5"
                  @change="emit('toggle-layer', ds.id)"
                >
                <span class="text-gray-300 group-hover:text-white transition-colors">{{ ds.label }}</span>
              </label>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Presets -->
      <div v-if="config.regionPresets" class="relative">
        <button
          class="map-ctrl-btn bg-gray-900/80 backdrop-blur-sm rounded-lg border shadow-lg pointer-events-auto"
          :class="showPresets ? 'border-blue-500/50 text-blue-400' : 'border-white/10'"
          aria-label="Navigation rapide"
          @click="togglePanel('presets')"
        >
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showPresets"
            class="absolute bottom-0 mb-0 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/10 py-1.5 shadow-xl min-w-[160px] pointer-events-auto"
            :class="isMobile ? 'right-full mr-2' : 'left-full ml-2'"
          >
            <button
              v-for="preset in presets"
              :key="preset.id"
              class="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              @click="emit('fly-to', preset.lng, preset.lat, preset.zoom); closeAll()"
            >
              {{ preset.label }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Theme toggle -->
      <button
        v-if="config.themeToggle"
        class="map-ctrl-btn bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg pointer-events-auto"
        aria-label="Changer le thème"
        @click="emit('toggle-theme')"
      >
        <UIcon :name="theme === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-4 h-4" />
      </button>

      <!-- Fullscreen (desktop) -->
      <button
        v-if="config.fullscreen && !isMobile"
        class="map-ctrl-btn bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg pointer-events-auto"
        aria-label="Plein écran"
        @click="toggleFullscreen"
      >
        <UIcon :name="isFullscreen ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'" class="w-4 h-4" />
      </button>

      <!-- Export -->
      <div v-if="config.export" class="relative">
        <button
          class="map-ctrl-btn bg-gray-900/80 backdrop-blur-sm rounded-lg border shadow-lg pointer-events-auto"
          :class="showExportMenu ? 'border-blue-500/50 text-blue-400' : 'border-white/10'"
          aria-label="Exporter"
          @click="togglePanel('export')"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showExportMenu"
            class="absolute bottom-0 mb-0 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/10 py-1.5 shadow-xl min-w-[150px] pointer-events-auto"
            :class="isMobile ? 'right-full mr-2' : 'left-full ml-2'"
          >
            <button
              class="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
              @click="emit('export-png'); closeAll()"
            >
              <UIcon name="i-heroicons-photo" class="w-3.5 h-3.5 text-gray-500" />
              Export PNG
            </button>
            <button
              class="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
              @click="emit('export-csv'); closeAll()"
            >
              <UIcon name="i-heroicons-table-cells" class="w-3.5 h-3.5 text-gray-500" />
              Export CSV
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-ctrl-btn {
  @apply flex items-center justify-center
    w-9 h-9
    text-white/80 text-sm
    hover:text-white hover:bg-gray-800/90
    active:scale-95
    transition-all cursor-pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
