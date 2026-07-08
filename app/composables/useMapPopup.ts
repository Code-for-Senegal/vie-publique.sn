// app/composables/useMapPopup.ts
// Gère l'affichage et le formatage des popups au clic sur la carte.

import { ref, type Ref } from 'vue'
import type { MapDatasetConfig, PopupConfig, PopupFieldConfig, MapPopupState } from '~~/types/map'

export function useMapPopup(datasets: Ref<MapDatasetConfig[]>) {
  const popup = ref<MapPopupState>({
    visible: false,
    config: null,
    data: null,
    position: { x: 0, y: 0 },
    layerId: '',
  })

  /** Ouvrir un popup suite à un clic deck.gl */
  function handlePickInfo(info: any) {
    if (!info.picked || !info.object) {
      closePopup()
      return
    }

    // Trouver le dataset correspondant à la couche cliquée
    const layerId = info.layer?.id ?? ''
    const dsId = layerId.replace('layer-', '')
    const ds = datasets.value.find((d) => d.id === dsId)
    if (!ds?.popup) {
      closePopup()
      return
    }

    // Extraire les données (choroplèthe = properties._mapData, sinon = object direct)
    let itemData = info.object
    if (ds.type === 'choropleth' && info.object?.properties?._mapData) {
      itemData = info.object.properties._mapData
    }

    // Position du popup en pixels (x, y sur l'écran)
    const pos = info.pixel
      ? { x: info.pixel[0], y: info.pixel[1] }
      : { x: info.x ?? 0, y: info.y ?? 0 }

    popup.value = {
      visible: true,
      config: ds.popup,
      data: itemData,
      position: pos,
      layerId: dsId,
    }
  }

  /** Fermer le popup */
  function closePopup() {
    popup.value = {
      ...popup.value,
      visible: false,
      data: null,
      config: null,
    }
  }

  return {
    popup,
    handlePickInfo,
    closePopup,
  }
}

// ─── Utilitaires de formatage pour les champs popup ──────────────

export function formatPopupValue(field: PopupFieldConfig, data: any): string {
  const rawValue = data?.[field.key]
  if (rawValue === undefined || rawValue === null) return '—'

  // Custom formatter
  if (field.formatter) {
    return field.formatter(rawValue, data)
  }

  let formatted: string

  switch (field.format) {
    case 'number':
      formatted = typeof rawValue === 'number'
        ? rawValue.toLocaleString('fr-FR')
        : String(rawValue)
      break
    case 'percent':
      formatted = typeof rawValue === 'number'
        ? rawValue.toFixed(1)
        : String(rawValue)
      break
    case 'currency':
      formatted = typeof rawValue === 'number'
        ? rawValue.toLocaleString('fr-FR')
        : String(rawValue)
      break
    case 'date':
      formatted = rawValue instanceof Date
        ? rawValue.toLocaleDateString('fr-FR')
        : String(rawValue)
      break
    case 'badge':
    case 'bar':
    case 'text':
    default:
      formatted = String(rawValue)
  }

  return `${field.prefix ?? ''}${formatted}${field.suffix ?? ''}`
}

/** Résoudre le titre du popup (string ou fonction) */
export function resolvePopupTitle(popup: PopupConfig, data: any): string {
  if (typeof popup.title === 'function') {
    return popup.title(data)
  }
  return popup.title
}
