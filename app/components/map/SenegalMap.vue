<script setup lang="ts">
/**
 * SenegalMap — Composant carte principal, piloté par configuration.
 *
 * Passer un SenegalMapConfig et tout s'affiche : fond de carte, couches
 * de données (deck.gl), légende, filtres, sidebar, popups.
 *
 * Voir useMapEngine.ts pour l'architecture MapLibre + deck.gl.
 */
import type { SenegalMapConfig, LegendConfig, FilterConfig } from '~~/types/map'
import { DEFAULT_MAP_PRESETS } from '~/config/map-presets'
import { useMapEngine } from '~/composables/useMapEngine'
import { useMapLayers } from '~/composables/useMapLayers'
import { useMapPopup } from '~/composables/useMapPopup'
import { useMapFilters } from '~/composables/useMapFilters'
import { useMapExport } from '~/composables/useMapExport'
import { useMapStore } from '~/stores/map'
import type { FeatureCollection } from 'geojson'

const props = defineProps<{ config: SenegalMapConfig }>()

const emit = defineEmits<{
  'region-click': [payload: { code: string; name: string; data: any }]
  'marker-click': [payload: { layerId: string; data: any; coordinates: [number, number] }]
  'viewport-change': [payload: { center: [number, number]; zoom: number }]
  'filter-change': [payload: Record<string, any>]
  'action': [payload: { event: string; data: any }]
}>()

// ─── Core ──────────────────────────────────────────────────────
const mapContainer = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const store = useMapStore()
const engine = useMapEngine()

// ─── GeoJSON ───────────────────────────────────────────────────
const geoJsonRegions = shallowRef<FeatureCollection | null>(null)
const geoJsonDepartements = shallowRef<FeatureCollection | null>(null)
const geoJsonCommunes = shallowRef<FeatureCollection | null>(null)

// ─── Filtres ───────────────────────────────────────────────────
const filterConfigs = computed<FilterConfig[]>(() => props.config.filters ?? [])
const { activeFilters, setFilter, resetFilters, activeFilterCount } = useMapFilters(filterConfigs)

// ─── Couches deck.gl ───────────────────────────────────────────
const { layers: layerConfigs } = useMapLayers({
  datasets: computed(() => props.config.datasets),
  geoJsonRegions,
  geoJsonDepartements,
  geoJsonCommunes,
  theme: toRef(store, 'theme'),
  activeFilters,
  filterConfigs,
  viewport: engine.viewport,
  layerVisibility: toRef(store, 'layerVisibility'),
})

// ─── Popup / Export / Légende ──────────────────────────────────
const { popup, handlePickInfo, closePopup } = useMapPopup(computed(() => props.config.datasets))
const { exportPNG, exportCSV } = useMapExport()
const presets = computed(() => props.config.presets ?? DEFAULT_MAP_PRESETS)

const activeLegend = computed<LegendConfig | null>(() => {
  if (!props.config.legend) return null
  if (typeof props.config.legend === 'function') {
    const visibleDs = props.config.datasets.find((ds) => store.layerVisibility[ds.id] !== false)
    return props.config.legend(visibleDs?.id ?? '')
  }
  return props.config.legend
})

// ─── Modules deck.gl (chargés dynamiquement côté client) ──────
let DeckLayers: any = null

async function loadDeckModules() {
  const [layers, geo, agg] = await Promise.all([
    import('@deck.gl/layers'),
    import('@deck.gl/geo-layers'),
    import('@deck.gl/aggregation-layers'),
  ])
  DeckLayers = { ...layers, ...geo, ...agg }
}

/** Transforme les configs (objets plats) en instances deck.gl réelles */
function buildDeckLayers(configs: any[]): any[] {
  if (!DeckLayers) return []

  const typeMap: Record<string, string> = {
    choropleth: 'GeoJsonLayer',
    geojson: 'GeoJsonLayer',
    scatterplot: 'ScatterplotLayer',
    icon: 'ScatterplotLayer',
    heatmap: 'HeatmapLayer',
    arc: 'ArcLayer',
    path: 'PathLayer',
    text: 'TextLayer',
    cluster: 'ScatterplotLayer',
  }

  return configs
    .map((cfg) => {
      const LayerClass = DeckLayers[typeMap[cfg._type]]
      if (!LayerClass) return null
      try {
        const { _type, _dsId, clusterRadius, clusterMaxZoom, ...rest } = cfg
        return new LayerClass(rest)
      } catch (err) {
        console.warn(`[SenegalMap] Layer "${cfg._type}" creation failed:`, err)
        return null
      }
    })
    .filter(Boolean)
}

// ─── Watchers ──────────────────────────────────────────────────

// Couches → deck.gl (quand engine prête)
watch(layerConfigs, (c) => { if (engine.isReady.value) engine.updateLayers(buildDeckLayers(c)) }, { deep: true })
watch(engine.isReady, (ready) => { if (ready) engine.updateLayers(buildDeckLayers(layerConfigs.value)) })

// Viewport / filtres → store + emit
watch(engine.viewport, (v) => { store.updateViewport(v); emit('viewport-change', { center: v.center, zoom: v.zoom }) })
watch(activeFilters, (val) => { store.activeFilters = val; emit('filter-change', { ...val }) }, { deep: true })

// Thème → engine + rebuild layers
watch(() => store.theme, (t) => { engine.switchTheme(t); nextTick(() => engine.updateLayers(buildDeckLayers(layerConfigs.value))) })

// ─── Actions ───────────────────────────────────────────────────
function handleExportPNG() {
  exportPNG(() => engine.getCanvas(), {
    title: props.config.title || 'Carte du Sénégal',
    subtitle: props.config.description,
    legend: activeLegend.value,
    fileName: props.config.title?.replace(/\s+/g, '-').toLowerCase() || 'carte-senegal',
    fitBounds: () => new Promise<void>((resolve) => {
      const map = engine.mapInstance.value
      if (!map) return resolve()
      map.jumpTo({ center: [-14.45, 14.45], zoom: 5.6, pitch: 0, bearing: 0 })
      map.once('idle', () => resolve())
      setTimeout(resolve, 8000)
    }),
    captureSnapshot: () => engine.captureSnapshot(),
  })
}

function handleExportCSV() {
  const ds = props.config.datasets.find((d) => store.layerVisibility[d.id] !== false)
  if (ds) exportCSV(ds, props.config.title?.replace(/\s+/g, '-').toLowerCase() || 'carte-senegal')
}

function handleMapClick(info: any) {
  showTapHint.value = false

  if (!info.picked || !info.object) { closePopup(); return }

  handlePickInfo(info)

  const layerId = info.layer?.id?.replace('layer-', '') ?? ''
  const ds = props.config.datasets.find((d) => d.id === layerId)

  if (ds?.type === 'choropleth' && info.object?.properties) {
    store.selectRegion(info.object.properties.code ?? '')
    emit('region-click', {
      code: info.object.properties.code ?? '',
      name: info.object.properties.name ?? '',
      data: info.object.properties._mapData ?? info.object.properties,
    })
  } else {
    const coords = ds?.getPosition ? ds.getPosition(info.object) : [info.coordinate?.[0] ?? 0, info.coordinate?.[1] ?? 0]
    emit('marker-click', { layerId, data: info.object, coordinates: coords as [number, number] })
  }
}

// ─── Responsive ────────────────────────────────────────────────
const showTapHint = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
}

// ─── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  if (!mapContainer.value) return

  checkMobile()
  window.addEventListener('resize', checkMobile)
  store.initFromConfig(props.config)

  // Charger deck.gl + GeoJSON en parallèle
  const [, regions, departements, communes] = await Promise.all([
    loadDeckModules().catch(() => null),
    fetch('/geo/senegal-regions.geojson').then((r) => r.ok ? r.json() : null).catch(() => null),
    fetch('/geo/senegal-departements.geojson').then((r) => r.ok ? r.json() : null).catch(() => null),
    fetch('/geo/senegal-communes.geojson').then((r) => r.ok ? r.json() : null).catch(() => null),
  ])
  geoJsonRegions.value = regions
  geoJsonDepartements.value = departements
  geoJsonCommunes.value = communes

  await engine.initMap(mapContainer.value, {
    center: props.config.center ?? [-14.4524, 14.4974],
    zoom: props.config.zoom ?? 7,
    theme: props.config.theme ?? 'dark',
    interactionMode: props.config.interactionMode ?? 'flat',
    isMobile: isMobile.value,
    onClick: handleMapClick,
  })

  if (isMobile.value) {
    showTapHint.value = true
    setTimeout(() => { showTapHint.value = false }, 4000)
  }

  activeFilters.value = { ...store.activeFilters }
  await nextTick()
  engine.resize()
})

onUnmounted(() => window.removeEventListener('resize', checkMobile))
</script>

<template>
  <div class="senegal-map relative w-full" style="height: calc(100vh - 64px); height: calc(100dvh - 64px);">
    <!--
      Inline styles obligatoires : MapLibre injecte .maplibregl-map { position: relative }
      qui écrase Tailwind `absolute` → le container perd ses dimensions.
      Les inline styles sont prioritaires sur les sélecteurs de classe.
    -->
    <div ref="mapContainer" style="position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none;" />

    <div v-if="config.title && !isMobile" class="absolute top-4 left-4 z-20 pointer-events-none max-w-[50%]">
      <h2 class="text-base font-semibold text-white drop-shadow-lg bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
        {{ config.title }}
      </h2>
      <p v-if="config.description" class="text-xs text-gray-400 mt-1 bg-gray-900/40 backdrop-blur-sm px-3 py-1 rounded">
        {{ config.description }}
      </p>
    </div>

    <MapSidebar v-if="config.sidebar" :config="config.sidebar" :selected-data="store.selectedItem" :is-mobile="isMobile" />
    <MapLegend v-if="activeLegend" :config="activeLegend" :is-mobile="isMobile" />

    <MapFilters
      v-if="config.filters?.length"
      :filters="config.filters" :active-filters="activeFilters"
      :active-count="activeFilterCount" :is-mobile="isMobile"
      @update="setFilter" @reset="resetFilters"
    />

    <MapControls
      v-if="config.controls"
      :config="config.controls" :datasets="config.datasets" :presets="presets"
      :layer-visibility="store.layerVisibility" :theme="store.theme" :is-mobile="isMobile"
      @toggle-layer="store.toggleLayer" @fly-to="engine.flyTo"
      @toggle-theme="store.toggleTheme" @export-png="handleExportPNG" @export-csv="handleExportCSV"
      @zoom-in="engine.zoomIn()" @zoom-out="engine.zoomOut()" @reset-north="engine.resetNorth()"
    />

    <MapPopup
      v-if="popup.visible && popup.config && popup.data"
      :config="popup.config" :data="popup.data" :position="popup.position" :is-mobile="isMobile"
      @close="closePopup" @action="(e: string) => emit('action', { event: e, data: popup.data })"
    />

    <Transition name="fade">
      <div v-if="showTapHint && isMobile" class="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full pointer-events-none">
        Touchez une region pour voir les details
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="!engine.isReady.value" class="absolute inset-0 z-30 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-white mx-auto mb-3" />
        <p class="text-white text-xs sm:text-sm">Chargement de la carte…</p>
      </div>
    </div>

    <!-- WebGL context lost -->
    <div v-if="engine.isContextLost.value" class="absolute inset-0 z-40 flex items-center justify-center bg-red-900/80 px-4">
      <div class="text-center text-white p-4 sm:p-6">
        <p class="text-base sm:text-lg font-bold mb-2">Erreur WebGL</p>
        <p class="text-xs sm:text-sm">Le contexte graphique a été perdu. Rechargez la page.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.senegal-map :deep(.maplibregl-canvas) { outline: none; }

/* On fournit nos propres contrôles */
.senegal-map :deep(.maplibregl-ctrl-top-right),
.senegal-map :deep(.maplibregl-ctrl-top-left) { display: none; }

.senegal-map :deep(.maplibregl-ctrl-attrib) {
  font-size: 9px;
  background: rgba(0, 0, 0, 0.3) !important;
  color: rgba(255, 255, 255, 0.5) !important;
  border-radius: 4px;
  padding: 2px 6px;
}
.senegal-map :deep(.maplibregl-ctrl-attrib a) { color: rgba(255, 255, 255, 0.6) !important; }
</style>
