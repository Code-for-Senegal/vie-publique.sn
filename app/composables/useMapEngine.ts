/**
 * useMapEngine — Moteur carte MapLibre + deck.gl
 *
 * MapLibre gère le fond de carte (tuiles CARTO) et le canvas WebGL.
 * deck.gl s'y greffe via MapboxOverlay (interleaved) pour les couches de données,
 * le tout dans un seul canvas, sans hack pointer-events.
 *
 * Si deck.gl échoue à l'init, le fond de carte reste fonctionnel.
 */

import { shallowRef, ref, onUnmounted } from 'vue'
import type { MapViewport } from '~~/types/map'
import { MAP_TILE_STYLES } from '~/config/map-presets'

type MapLibreMap = InstanceType<typeof import('maplibre-gl').Map>

export function useMapEngine() {
  const mapInstance = shallowRef<MapLibreMap | null>(null)
  const deckOverlay = shallowRef<any>(null)
  const isReady = ref(false)
  const isContextLost = ref(false)
  const viewport = ref<MapViewport>({ center: [-14.4524, 14.4974], zoom: 7 })

  let _onClickCallback: ((info: any) => void) | null = null
  let _resizeObserver: ResizeObserver | null = null

  // ─── Init ────────────────────────────────────────────────────────
  async function initMap(
    container: HTMLElement,
    options: {
      center?: [number, number]
      zoom?: number
      theme?: 'dark' | 'light'
      interactionMode?: 'flat' | '3d'
      isMobile?: boolean
      onClick?: (info: any) => void
      onHover?: (info: any) => void
    } = {},
  ) {
    destroy()
    _onClickCallback = options.onClick ?? null

    const { Map, AttributionControl } = await import('maplibre-gl')

    const center = options.center ?? [-14.4524, 14.4974]
    const zoom = options.zoom ?? 7
    const themeKey = options.theme ?? 'dark'
    const isFlat = options.interactionMode !== '3d'

    const map = new Map({
      container,
      style: MAP_TILE_STYLES[themeKey],
      center: [center[0], center[1]],
      zoom,
      minZoom: 3,
      maxZoom: 18,
      pitch: isFlat ? 0 : 30,
      bearing: 0,
      renderWorldCopies: false,
      attributionControl: false,
      preserveDrawingBuffer: true,
      ...(isFlat ? { maxPitch: 0, dragRotate: false, touchPitch: false } : {}),
    } as any)

    map.addControl(
      new AttributionControl({ compact: true, customAttribution: '© CARTO © OpenStreetMap' }),
      'bottom-left',
    )

    // WebGL context loss
    map.getCanvas().addEventListener('webglcontextlost', (e) => { isContextLost.value = true; e.preventDefault() })
    map.getCanvas().addEventListener('webglcontextrestored', () => { isContextLost.value = false })

    mapInstance.value = map

    // Attendre le chargement du style (timeout 15 s de sécurité)
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 15_000)
      if (map.loaded()) { clearTimeout(timeout); resolve() }
      else map.on('load', () => { clearTimeout(timeout); resolve() })
    })

    // Resize forcé — le canvas peut avoir des dimensions incorrectes au premier rendu
    map.resize()

    // deck.gl overlay (graceful : si ça échoue, le fond de carte reste)
    try {
      const { MapboxOverlay } = await import('@deck.gl/mapbox')
      const overlay = new MapboxOverlay({
        interleaved: true,
        layers: [],
        pickingRadius: options.isMobile ? 20 : 10,
        onClick: (info: any) => _onClickCallback?.(info),
        onHover: !options.isMobile
          ? (info: any) => {
              map.getCanvas().style.cursor = info?.picked ? 'pointer' : ''
              options.onHover?.(info || { picked: false })
            }
          : undefined,
        onError: (err: Error) => console.warn('[deck.gl]', err.message),
      } as any)
      map.addControl(overlay as any)
      deckOverlay.value = overlay
    } catch (err) {
      console.error('[useMapEngine] deck.gl init failed:', err)
    }

    // Viewport sync
    const syncViewport = () => {
      const c = map.getCenter()
      const b = map.getBounds()
      viewport.value = {
        center: [c.lng, c.lat],
        zoom: map.getZoom(),
        bounds: [[b.getSouthWest().lng, b.getSouthWest().lat], [b.getNorthEast().lng, b.getNorthEast().lat]],
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      }
    }
    map.on('moveend', syncViewport)
    map.on('zoomend', syncViewport)
    syncViewport()

    // Auto-resize du canvas quand le container change de taille
    _resizeObserver = new ResizeObserver(() => map.resize())
    _resizeObserver.observe(container)

    isReady.value = true
  }

  // ─── API publique ────────────────────────────────────────────────
  function updateLayers(layers: any[]) { deckOverlay.value?.setProps({ layers }) }

  function flyTo(lng: number, lat: number, zoom?: number, duration = 1500) {
    mapInstance.value?.flyTo({ center: [lng, lat], zoom: zoom ?? mapInstance.value.getZoom(), duration, essential: true })
  }

  function zoomIn() { mapInstance.value?.zoomIn({ duration: 300 }) }
  function zoomOut() { mapInstance.value?.zoomOut({ duration: 300 }) }
  function resetNorth() { mapInstance.value?.easeTo({ bearing: 0, pitch: 0, duration: 500 }) }
  function switchTheme(theme: 'dark' | 'light') { mapInstance.value?.setStyle(MAP_TILE_STYLES[theme]) }
  function resize() { mapInstance.value?.resize() }
  function getCanvas(): HTMLCanvasElement | null { return mapInstance.value?.getCanvas() ?? null }

  /**
   * Force un render MapLibre + deck.gl et capture le canvas en dataURL
   * immédiatement dans le callback 'render' (buffer garanti plein).
   */
  function captureSnapshot(): Promise<string | null> {
    const map = mapInstance.value
    if (!map) return Promise.resolve(null)

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000)
      map.once('render', () => {
        clearTimeout(timeout)
        try {
          resolve(map.getCanvas().toDataURL('image/png'))
        } catch {
          resolve(null)
        }
      })
      map.triggerRepaint()
    })
  }

  // ─── Cleanup ─────────────────────────────────────────────────────
  function destroy() {
    _resizeObserver?.disconnect()
    _resizeObserver = null

    if (deckOverlay.value && mapInstance.value) {
      try { mapInstance.value.removeControl(deckOverlay.value) } catch { /* already removed */ }
      deckOverlay.value = null
    }
    if (mapInstance.value) {
      mapInstance.value.remove()
      mapInstance.value = null
    }

    isReady.value = false
    _onClickCallback = null
  }

  onUnmounted(destroy)

  return {
    mapInstance, deckOverlay, isReady, isContextLost, viewport,
    initMap, updateLayers,
    flyTo, zoomIn, zoomOut, resetNorth, switchTheme,
    getCanvas, captureSnapshot, resize, destroy,
  }
}
