// app/composables/useSupercluster.ts
// Clustering réutilisable via Supercluster pour les grands jeux de données de points.

import { ref, computed, watch, type Ref } from 'vue'
import type { MapViewport } from '~~/types/map'

interface ClusterOptions {
  radius?: number
  maxZoom?: number
  getPosition: (item: any) => [number, number]
}

interface ClusterPoint {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    cluster: boolean
    cluster_id?: number
    point_count?: number
    point_count_abbreviated?: string
    originalData?: any
  }
}

export function useSupercluster(
  data: Ref<any[]>,
  viewport: Ref<MapViewport>,
  options: ClusterOptions,
) {
  const clusterIndex = ref<any>(null)
  const clusters = ref<ClusterPoint[]>([])
  const isLoaded = ref(false)

  // Créer les points GeoJSON à partir des données
  const geoJsonPoints = computed(() => {
    return data.value.map((item) => {
      const [lng, lat] = options.getPosition(item)
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat],
        },
        properties: {
          cluster: false,
          originalData: item,
        },
      }
    })
  })

  // Initialiser Supercluster quand les données changent
  watch(
    geoJsonPoints,
    async (points) => {
      if (points.length === 0) {
        clusters.value = []
        return
      }

      const Supercluster = (await import('supercluster')).default
      const index = new Supercluster({
        radius: options.radius ?? 60,
        maxZoom: options.maxZoom ?? 16,
        map: (props: any) => ({ originalData: props.originalData }),
        reduce: (accumulated: any, props: any) => {
          // On garde les données du premier point dans le cluster
          if (!accumulated.originalData) {
            accumulated.originalData = props.originalData
          }
        },
      })

      index.load(points as any)
      clusterIndex.value = index
      isLoaded.value = true

      // Recalculer les clusters
      updateClusters()
    },
    { immediate: true },
  )

  // Recalculer les clusters quand le viewport change
  watch(
    () => [viewport.value.zoom, viewport.value.bounds],
    () => {
      updateClusters()
    },
  )

  function updateClusters() {
    if (!clusterIndex.value || !viewport.value.bounds) {
      clusters.value = geoJsonPoints.value as any
      return
    }

    const bounds = viewport.value.bounds
    const zoom = Math.floor(viewport.value.zoom)

    try {
      clusters.value = clusterIndex.value.getClusters(
        [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
        zoom,
      )
    } catch {
      clusters.value = []
    }
  }

  /** Obtenir les enfants d'un cluster */
  function getClusterLeaves(clusterId: number, limit = 100): any[] {
    if (!clusterIndex.value) return []
    try {
      return clusterIndex.value.getLeaves(clusterId, limit)
    } catch {
      return []
    }
  }

  /** Obtenir le zoom pour étendre un cluster */
  function getClusterExpansionZoom(clusterId: number): number {
    if (!clusterIndex.value) return 16
    try {
      return clusterIndex.value.getClusterExpansionZoom(clusterId)
    } catch {
      return 16
    }
  }

  return {
    clusters,
    clusterIndex,
    isLoaded,
    getClusterLeaves,
    getClusterExpansionZoom,
    updateClusters,
  }
}
