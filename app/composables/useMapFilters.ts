// app/composables/useMapFilters.ts
// Gère les filtres dynamiques de la carte.

import { ref, computed, watch, type Ref } from 'vue'
import type { FilterConfig } from '~~/types/map'

export function useMapFilters(filterConfigs: Ref<FilterConfig[]>) {
  // État réactif des filtres
  const activeFilters = ref<Record<string, any>>({})

  // Initialiser les filtres avec leurs valeurs par défaut
  function initFilters() {
    const defaults: Record<string, any> = {}
    for (const f of filterConfigs.value) {
      defaults[f.id] = f.defaultValue ?? null
    }
    activeFilters.value = defaults
  }

  // Re-init quand les configs changent
  watch(filterConfigs, () => initFilters(), { immediate: true })

  /** Mettre à jour un filtre */
  function setFilter(id: string, value: any) {
    activeFilters.value = { ...activeFilters.value, [id]: value }
  }

  /** Réinitialiser tous les filtres */
  function resetFilters() {
    initFilters()
  }

  /** Réinitialiser un seul filtre */
  function resetFilter(id: string) {
    const config = filterConfigs.value.find((f) => f.id === id)
    if (config) {
      setFilter(id, config.defaultValue ?? null)
    }
  }

  /** Nombre de filtres actifs (différents de la valeur par défaut) */
  const activeFilterCount = computed(() => {
    let count = 0
    for (const f of filterConfigs.value) {
      const current = activeFilters.value[f.id]
      const defaultVal = f.defaultValue
      if (JSON.stringify(current) !== JSON.stringify(defaultVal)) {
        count++
      }
    }
    return count
  })

  /** Appliquer les filtres sur un tableau de données */
  function applyFilters(data: any[]): any[] {
    if (filterConfigs.value.length === 0) return data
    return data.filter((item) => {
      return filterConfigs.value.every((f) => {
        const val = activeFilters.value[f.id]
        if (val === undefined || val === null) return true
        return f.apply(item, val)
      })
    })
  }

  return {
    activeFilters,
    activeFilterCount,
    setFilter,
    resetFilters,
    resetFilter,
    applyFilters,
    initFilters,
  }
}
