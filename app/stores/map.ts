// app/stores/map.ts — Store Pinia GÉNÉRIQUE pour le système de carte
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SenegalMapConfig, MapViewport } from '~~/types/map'

export const useMapStore = defineStore('map', () => {
  // ─── État générique — fonctionne pour TOUT type de carte ────────
  const activeConfig = ref<SenegalMapConfig | null>(null)
  const activeFilters = ref<Record<string, any>>({})
  const selectedRegion = ref<string | null>(null)
  const selectedItem = ref<any>(null)
  const theme = ref<'dark' | 'light'>('dark')
  const viewport = ref<MapViewport>({
    center: [-14.4524, 14.4974],
    zoom: 7,
  })

  /** Visibilité des couches, toggleable par l'utilisateur */
  const layerVisibility = ref<Record<string, boolean>>({})

  /** Initialise le store à partir d'une config */
  function initFromConfig(config: SenegalMapConfig) {
    activeConfig.value = config
    theme.value = config.theme ?? 'dark'
    viewport.value = {
      center: config.center ?? [-14.4524, 14.4974],
      zoom: config.zoom ?? 7,
    }
    // Init visibilité depuis les datasets
    layerVisibility.value = Object.fromEntries(
      config.datasets.map((ds) => [ds.id, ds.visible ?? true]),
    )
    // Init filtres depuis les configs
    activeFilters.value = Object.fromEntries(
      (config.filters ?? []).map((f) => [f.id, f.defaultValue]),
    )
    selectedRegion.value = null
    selectedItem.value = null
  }

  /** Toggle la visibilité d'une couche */
  function toggleLayer(id: string) {
    layerVisibility.value[id] = !layerVisibility.value[id]
  }

  /** Met à jour une valeur de filtre */
  function setFilter(id: string, value: any) {
    activeFilters.value = { ...activeFilters.value, [id]: value }
  }

  /** Met à jour le viewport */
  function updateViewport(v: Partial<MapViewport>) {
    viewport.value = { ...viewport.value, ...v }
  }

  /** Sélectionne une région */
  function selectRegion(code: string | null) {
    selectedRegion.value = code
  }

  /** Sélectionne un item (point, feature, etc.) */
  function selectItem(item: any) {
    selectedItem.value = item
  }

  /** Toggle le thème */
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  /** Reset les filtres aux valeurs par défaut */
  function resetFilters() {
    if (!activeConfig.value?.filters) return
    activeFilters.value = Object.fromEntries(
      activeConfig.value.filters.map((f) => [f.id, f.defaultValue]),
    )
  }

  return {
    // State
    activeConfig,
    activeFilters,
    selectedRegion,
    selectedItem,
    theme,
    viewport,
    layerVisibility,
    // Actions
    initFromConfig,
    toggleLayer,
    setFilter,
    updateViewport,
    selectRegion,
    selectItem,
    toggleTheme,
    resetFilters,
  }
})
