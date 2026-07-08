# Systeme de carte interactif — Guide developpeur

> MapLibre GL v5 + deck.gl v9, pilote par configuration.

## Architecture

```
SenegalMapConfig (objet de config)
      |
      v
SenegalMap.vue ─── useMapEngine ─── MapLibre GL (fond de carte)
      |                   |
      |                   └── deck.gl MapboxOverlay (couches de donnees)
      |
      ├── useMapLayers ─── fabrique les configs deck.gl
      ├── useMapPopup ──── gestion des popups
      ├── useMapFilters ── filtres reactifs
      ├── useMapExport ─── export PNG/CSV
      └── useMapStore ──── etat Pinia (theme, viewport, selection)
```

**Principe :** MapLibre gere le canvas WebGL et les tuiles CARTO. deck.gl s'y greffe via `MapboxOverlay` en mode interleaved (un seul canvas, pas de hack `pointer-events`). Si deck.gl echoue, le fond de carte reste fonctionnel.

**Fichiers cles :**

| Fichier | Role |
|---------|------|
| `types/map.ts` | Types TS complets (SenegalMapConfig, MapDatasetConfig, etc.) |
| `app/composables/useMapEngine.ts` | Init MapLibre + deck.gl overlay |
| `app/composables/useMapLayers.ts` | Factory : config → couches deck.gl |
| `app/composables/useMapPopup.ts` | Gestion popups (pick events) |
| `app/composables/useMapFilters.ts` | Filtres reactifs |
| `app/composables/useMapExport.ts` | Export PNG / CSV |
| `app/composables/useSupercluster.ts` | Clustering de points |
| `app/components/map/SenegalMap.vue` | Composant principal |
| `app/stores/map.ts` | Store Pinia (theme, viewport, layers) |
| `app/config/map-regions.ts` | 14 regions du Senegal (codes, coords, pop) |
| `app/config/map-presets.ts` | Presets navigation + styles de tuiles |

---

## Quick start : creer une nouvelle carte en 3 etapes

### Etape 1 — Creer la config

```ts
// app/config/map-education.ts
import type { SenegalMapConfig } from '~~/types/map'

export const educationMapConfig: SenegalMapConfig = {
  title: 'Education',
  description: 'Taux de scolarisation par region',
  theme: 'dark',
  datasets: [
    {
      id: 'scolarisation',
      label: 'Taux de scolarisation',
      type: 'choropleth',
      visible: true,
      data: [],                        // sera rempli par la page
      joinField: 'regionCode',         // cle dans vos donnees
      geoJoinField: 'code',            // cle dans le GeoJSON
      getValue: (d) => d.taux,
      colorScale: {
        type: 'gradient',
        stops: [
          { value: 0,   color: [255, 200, 200, 160], label: 'Faible' },
          { value: 50,  color: [255, 255, 100, 160], label: 'Moyen' },
          { value: 100, color: [0, 180, 0, 160],     label: 'Eleve' },
        ],
        fallback: [128, 128, 128, 80],
      },
      pickable: true,
      popup: {
        title: (d) => d.region,
        fields: [
          { key: 'taux', label: 'Scolarisation', format: 'percent', suffix: '%' },
          { key: 'population', label: 'Population', format: 'number' },
        ],
      },
    },
  ],
  legend: {
    title: 'Taux de scolarisation',
    type: 'gradient',
    colorScale: { /* meme que ci-dessus */ },
  },
  controls: { zoom: true, themeToggle: true, export: true },
}
```

### Etape 2 — Creer la page

```vue
<!-- app/pages/carte/education.vue -->
<script setup lang="ts">
import { educationMapConfig } from '~/config/map-education'

definePageMeta({ ssr: false, layout: 'fullscreen' })

const { data: testData } = await useFetch('/data/test-education.json')

const config = computed(() => ({
  ...educationMapConfig,
  datasets: educationMapConfig.datasets.map((ds) => ({
    ...ds,
    data: testData.value?.datasets?.[ds.id] ?? ds.data,
  })),
}))
</script>

<template>
  <MapSenegalMap :config="config" />
</template>
```

### Etape 3 — Ajouter les donnees

```json
// public/data/test-education.json
{
  "datasets": {
    "scolarisation": [
      { "regionCode": "DK", "region": "Dakar", "taux": 92, "population": 4000000 },
      { "regionCode": "TH", "region": "Thies", "taux": 78, "population": 2200000 }
    ]
  }
}
```

C'est tout. La carte se charge automatiquement avec le choropleth, les popups et la legende.

---

## Reference des types

### `SenegalMapConfig`

```ts
interface SenegalMapConfig {
  title: string
  description?: string
  theme?: 'dark' | 'light'
  center?: [number, number]       // defaut : [-14.45, 14.50]
  zoom?: number                   // defaut : 7
  interactionMode?: 'flat' | '3d'
  datasets: MapDatasetConfig[]
  sidebar?: SidebarConfig
  legend?: LegendConfig | ((activeDataset: string) => LegendConfig)
  filters?: FilterConfig[]
  controls?: MapControlsConfig
  presets?: MapRegionPreset[]
}
```

### `MapDatasetConfig`

Chaque dataset = une couche de donnees sur la carte.

| Propriete | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Identifiant unique |
| `label` | `string` | Label affiche dans les controles |
| `type` | `LayerType` | Type de couche (voir ci-dessous) |
| `data` | `any[]` | Donnees brutes (reactif via ref/computed) |
| `visible` | `boolean` | Visible par defaut |
| `joinField` | `string` | Cle de jointure dans les donnees |
| `geoJoinField` | `string` | Cle correspondante dans le GeoJSON |
| `getValue` | `(d) => number` | Valeur numerique pour colorier |
| `getPosition` | `(d) => [lng, lat]` | Position pour scatterplot/icon |
| `colorScale` | `ColorScale` | Echelle de couleurs |
| `popup` | `PopupConfig` | Configuration du popup au clic |
| `pickable` | `boolean` | Rendre cliquable |

### Les 9 types de couches (`LayerType`)

| Type | deck.gl Layer | Usage |
|------|---------------|-------|
| `choropleth` | GeoJsonLayer | Regions/departements colores |
| `scatterplot` | ScatterplotLayer | Cercles proportionnels |
| `heatmap` | HeatmapLayer | Carte de chaleur |
| `icon` | ScatterplotLayer | Icones categorisees |
| `arc` | ArcLayer | Arcs entre deux points (flux) |
| `path` | PathLayer | Lignes/routes |
| `text` | TextLayer | Labels textuels |
| `cluster` | ScatterplotLayer | Points clusters (Supercluster) |
| `geojson` | GeoJsonLayer | GeoJSON brut |

### `ColorScale`

```ts
interface ColorScale {
  type: 'gradient' | 'category' | 'threshold'
  stops: { value: number; color: [r, g, b, a]; label?: string }[]
  fallback: [r, g, b, a]  // couleur si donnee absente
}
```

### `PopupConfig`

```ts
interface PopupConfig<T> {
  title: string | ((d: T) => string)
  fields: {
    key: string
    label: string
    format?: 'number' | 'percent' | 'currency' | 'date' | 'text' | 'bar' | 'badge'
    suffix?: string
    prefix?: string
  }[]
  chart?: { type: 'horizontal-bars' | 'pie' | 'donut' | 'sparkline'; ... }
  actions?: { label: string; event: string }[]
}
```

---

## Composables

### `useMapEngine()`

Initialise MapLibre + deck.gl overlay.

```ts
const engine = useMapEngine()

// Init
await engine.initMap(container, {
  center: [-14.45, 14.50],
  zoom: 7,
  theme: 'dark',
  interactionMode: 'flat',
  onClick: (info) => { /* pick event */ },
})

// API
engine.isReady           // ref<boolean>
engine.isContextLost     // ref<boolean>  (WebGL perdu)
engine.viewport          // ref<MapViewport>
engine.mapInstance        // shallowRef<MapLibreMap>
engine.updateLayers(layers)
engine.switchTheme('light')
engine.flyTo({ lng, lat, zoom })
engine.zoomIn() / zoomOut() / resetNorth()
engine.resize()
engine.getCanvas()       // pour export PNG
engine.destroy()
```

### `useMapLayers(options)`

Fabrique les configs de couches deck.gl a partir des datasets.

```ts
const { layers } = useMapLayers({
  datasets: computed(() => config.datasets),
  geoJsonRegions,
  geoJsonDepartements,
  geoJsonCommunes,
  theme: toRef(store, 'theme'),
  activeFilters,
  filterConfigs,
  viewport: engine.viewport,
  layerVisibility: toRef(store, 'layerVisibility'),
})
```

Retourne un `computed<any[]>` de configs qui sont ensuite transformees en instances deck.gl par `SenegalMap.vue`.

### `useMapPopup(datasets)`

```ts
const { popup, handlePickInfo, closePopup } = useMapPopup(datasetsRef)

// popup.visible, popup.config, popup.data, popup.position
```

### `useMapFilters(filterConfigs)`

```ts
const { activeFilters, setFilter, resetFilters, activeFilterCount } = useMapFilters(filtersRef)

setFilter('annee', 2025)
resetFilters()
```

### `useMapExport()`

```ts
const { exportPNG, exportCSV } = useMapExport()

exportPNG(() => engine.getCanvas(), {
  title: 'Ma carte',
  legend: legendConfig,
  fileName: 'ma-carte',
})

exportCSV(dataset, 'ma-carte')
```

---

## Sous-composants

### `<MapSenegalMap :config="config" />`

Composant principal. Accepte un `SenegalMapConfig` et affiche tout automatiquement.

**Events :**
- `@region-click` — `{ code, name, data }`
- `@marker-click` — `{ layerId, data, coordinates }`
- `@viewport-change` — `{ center, zoom }`
- `@filter-change` — `Record<string, any>`
- `@action` — `{ event, data }`

### `<MapControls />`

Barre d'outils de la carte (zoom, toggles, theme, export).

### `<MapLegend />`

Legende gradient ou categorielle. Collapsible, positionnement configurable.

### `<MapFilters />`

Panneau de filtres (select, multi-select, range, toggle, search).

### `<MapSidebar />`

Panneau lateral avec metriques + composant dynamique.

### `<MapPopup />`

Popup positionne sur la carte (desktop) ou bottom sheet (mobile).

### `<MapLayerToggles />`

Toggles on/off par couche (standalone, utilisable hors MapControls).

### `<MapExportButton />`

Bouton export PNG/CSV (standalone).

---

## Pieges connus

### 1. CSS inline obligatoire sur le container de la carte

MapLibre injecte `.maplibregl-map { position: relative }` qui ecrase la classe Tailwind `absolute`. Le container perd ses dimensions et la carte ne s'affiche pas.

**Solution :** utiliser des styles inline sur le container :
```html
<div ref="mapContainer" style="position: absolute; inset: 0; width: 100%; height: 100%;" />
```

Les styles inline ont la priorite sur les selecteurs de classe.

### 2. `ssr: false` obligatoire

MapLibre et deck.gl necessitent le DOM et WebGL. Les pages carte doivent etre client-only :
```ts
definePageMeta({ ssr: false, layout: 'fullscreen' })
```

Pour embarquer une carte dans une page SSR (ex: dashboard), utiliser `<ClientOnly>` :
```vue
<ClientOnly>
  <MapSenegalMap :config="config" />
  <template #fallback>
    <div class="animate-pulse bg-gray-100 h-96 rounded-xl" />
  </template>
</ClientOnly>
```

### 3. Modules deck.gl charges dynamiquement

Les imports deck.gl sont asynchrones (import dynamique dans `SenegalMap.vue`) pour ne pas bloquer le bundle SSR.

### 4. GeoJSON : champ `code` pour la jointure

Les fichiers GeoJSON dans `public/geo/` ont des features avec `properties.code` et `properties.name`. Le champ `geoJoinField` dans la config doit correspondre a `code`.

### 5. Donnees reactives

Les donnees `data: []` dans la config sont enrichies apres le fetch. Le systeme est reactif : mettez a jour `datasets[].data` et les couches se reconstruisent.

### 6. Pointer events

Les overlays de la carte utilisent le pattern `pointer-events-none` sur le container et `pointer-events-auto` sur les elements interactifs, pour ne pas bloquer les interactions avec la carte.

---

## Exemple complet — Config minimale fonctionnelle

```ts
// app/config/map-demo.ts
import type { SenegalMapConfig } from '~~/types/map'

export const demoMapConfig: SenegalMapConfig = {
  title: 'Demo',
  theme: 'dark',
  datasets: [
    {
      id: 'demo-choropleth',
      label: 'Donnees demo',
      type: 'choropleth',
      visible: true,
      data: [],
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d) => d.value,
      colorScale: {
        type: 'gradient',
        stops: [
          { value: 0,   color: [200, 200, 255, 160], label: 'Bas' },
          { value: 100, color: [0, 0, 200, 200],     label: 'Haut' },
        ],
        fallback: [128, 128, 128, 80],
      },
      pickable: true,
      popup: {
        title: (d) => d.name,
        fields: [
          { key: 'value', label: 'Valeur', format: 'number' },
        ],
      },
    },
  ],
  controls: { zoom: true },
}
```

```json
// public/data/test-demo.json
{
  "datasets": {
    "demo-choropleth": [
      { "regionCode": "DK", "name": "Dakar",  "value": 95 },
      { "regionCode": "TH", "name": "Thies",  "value": 72 },
      { "regionCode": "SL", "name": "Saint-Louis", "value": 45 }
    ]
  }
}
```

```vue
<!-- app/pages/carte/demo.vue -->
<script setup lang="ts">
import { demoMapConfig } from '~/config/map-demo'

definePageMeta({ ssr: false, layout: 'fullscreen' })

const { data: testData } = await useFetch('/data/test-demo.json')

const config = computed(() => ({
  ...demoMapConfig,
  datasets: demoMapConfig.datasets.map((ds) => ({
    ...ds,
    data: testData.value?.datasets?.[ds.id] ?? [],
  })),
}))
</script>

<template>
  <MapSenegalMap :config="config" />
</template>
```

Resultat : une carte choropleth du Senegal avec popups et zoom, en ~30 lignes de code.

---

## Codes des 14 regions

| Code | Region | Population |
|------|--------|------------|
| DK | Dakar | 4 000 000 |
| TH | Thies | 2 200 000 |
| DB | Diourbel | 1 800 000 |
| SL | Saint-Louis | 1 100 000 |
| KL | Kaolack | 1 100 000 |
| LG | Louga | 1 000 000 |
| TC | Tambacounda | 900 000 |
| FK | Fatick | 900 000 |
| KD | Kolda | 800 000 |
| ZG | Ziguinchor | 700 000 |
| MT | Matam | 700 000 |
| KF | Kaffrine | 700 000 |
| SD | Sedhiou | 500 000 |
| KG | Kedougou | 200 000 |

Definis dans `app/config/map-regions.ts`. Constantes utiles : `SENEGAL_CENTER`, `SENEGAL_DEFAULT_ZOOM`, `REGIONS_BY_CODE`.

---

## Comment fonctionne le choropleth (jointure GeoJSON ↔ donnees)

Le choropleth ne necessite **aucune latitude/longitude** dans les donnees. Le mecanisme repose sur une **jointure par code** entre 2 sources :

### Source 1 — GeoJSON (les formes)

```json
{
  "properties": { "code": "DK", "name": "Dakar" },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [[[[-17.39, 14.67], [-17.40, 14.68], ...]]]
  }
}
```

Le GeoJSON contient les **polygones complets** de chaque region (des centaines de coordonnees formant le contour). C'est lui qui "dessine" la forme.

### Source 2 — Vos donnees (les valeurs)

```json
{ "regionCode": "DK", "pibParHabitant": 980000, "tauxChomage": 12.5 }
```

Juste des chiffres avec un **code de jointure**. Pas besoin de coordonnees.

### Le processus de jointure (useMapLayers.ts)

```
Donnees: regionCode "DK" ──┐
                            ├── MATCH → les donnees sont attachees au polygone
GeoJSON: code "DK" ────────┘
```

Concretement, le code fait :

1. **Construire un index** : `Map<code, donnees>` a partir de `data[]`
2. **Enrichir le GeoJSON** : pour chaque feature, chercher le code dans l'index et attacher les donnees dans `_mapData`
3. **Colorier** : `getValue(item)` extrait la valeur numerique, `colorScale` la convertit en couleur RGBA par interpolation

```
PIB 190 000 → rouge clair  [255, 235, 235]
PIB 500 000 → jaune         [255, 200, 80]
PIB 980 000 → vert fonce   [0, 80, 0]
```

Les champs de jointure sont configurables :

| Config | Defaut | Description |
|--------|--------|-------------|
| `joinField` | `'regionCode'` | Cle dans vos donnees |
| `geoJoinField` | `'code'` | Cle dans le GeoJSON |

---

## Les 3 niveaux geographiques

Le systeme charge **3 fichiers GeoJSON** au demarrage :

| Niveau | Fichier | Contenu | Geometrie |
|--------|---------|---------|-----------|
| **Regions** | `senegal-regions.geojson` (509 Ko) | 14 regions | `MultiPolygon` (contours complets) |
| **Departements** | `senegal-departements.geojson` (885 Ko) | 45 departements | `Polygon` (contours complets) |
| **Communes** | `senegal-communes.geojson` (10 Ko) | 58 communes | `Point` (coordonnees uniquement) |

### Affichage progressif selon le zoom

Plus on zoome, plus on voit de details :

```
Zoom < 7   →  Regions uniquement (polygones colores + labels en gras)
Zoom >= 7  →  + Departements (bordures fines + labels)
Zoom >= 9  →  + Communes (labels en italique, taille 9px)
Zoom >= 11 →  Labels communes agrandis (11px)
```

### Detail par niveau

**Regions** — le choropleth principal :
- Polygones **remplis** avec couleur selon les donnees (PIB, chomage, etc.)
- Labels en gras au centroide de chaque region
- C'est le seul niveau qui est **colorie** par les donnees

**Departements** — decoupage interne :
- Seulement les **bordures** (traits fins), pas de remplissage
- Labels des noms de departements (Bakel, Pikine, Mbour...)
- Opacite progressive : 35% au zoom 7, 60% au zoom 9+

**Communes** — points d'interet :
- Ce sont des **Points** (pas des polygones), affiches comme labels texte
- Style italique, plus petit, pour ne pas surcharger
- Apparaissent au zoom le plus pousse

### Colorier les departements ?

Actuellement, seules les **regions** sont coloriees. Mais le systeme pourrait colorier les departements de la meme maniere — il suffirait de :
1. Fournir un dataset avec `joinField` correspondant aux codes departements (`BAK`, `PIK`, etc.)
2. Le GeoJSON departements a deja les polygones complets
3. Le mecanisme de jointure est identique

---

## Export PNG et CSV

### Export PNG — Capture carte presentee

L'export genere une image complete avec titre, carte, legende et footer.

**Probleme resolu :** deck.gl en mode interleaved efface le buffer WebGL entre les frames. Un simple `drawImage(canvas)` capture un buffer vide.

**Solution :** `captureSnapshot()` dans `useMapEngine` :
1. Appelle `map.triggerRepaint()` pour forcer un cycle de rendu
2. Dans le callback `render` (buffer **garanti plein**), appelle `canvas.toDataURL('image/png')`
3. Convertit le dataURL en `Image` (bitmap statique, independant du buffer WebGL)
4. Dessine cette `Image` sur le canvas d'export

```ts
// useMapEngine.ts
captureSnapshot(): Promise<string | null>

// Utilisation dans SenegalMap.vue
exportPNG(() => engine.getCanvas(), {
  title: 'Ma carte',
  legend: legendConfig,
  captureSnapshot: () => engine.captureSnapshot(),
  fitBounds: () => new Promise((resolve) => {
    map.jumpTo({ center: [-14.45, 14.45], zoom: 5.6 })
    map.once('idle', resolve)  // attendre les tuiles
  }),
})
```

### Export CSV

Exporte les donnees du dataset actif en CSV (UTF-8 avec BOM).

- Les colonnes sont deduites des champs `popup.fields` (ou toutes les cles de data si pas de popup)
- Les headers utilisent les labels du popup
- Encoding correct des valeurs (guillemets, virgules, retours a la ligne)

---

## Carte embarquee dans un dashboard

La carte peut etre integree dans une page SSR (ex: `/dashboard/economie`) via `<ClientOnly>` :

```vue
<div class="relative overflow-hidden rounded-xl" style="height: 340px">
  <ClientOnly>
    <MapSenegalMap :config="mapConfig" />
    <template #fallback>
      <div class="animate-pulse bg-gray-100 h-full rounded-xl" />
    </template>
  </ClientOnly>
</div>
```

**Astuce CSS :** Forcer la carte a remplir le parent (au lieu de `100vh`) :

```css
.dashboard-map :deep(.senegal-map) {
  height: 100% !important;
}
```

### Filtres globaux du dashboard

Le dashboard economique utilise des filtres qui s'appliquent a toutes les sections simultanement (carte, KPIs, tableau, graphiques).

Architecture : les filtres vivent dans la page via des `ref()` simples, pas dans un composable dedie :

```ts
const activeSectors = ref<string[]>([])
const activeTendances = ref<string[]>([])
const activeRegions = ref<string[]>([])

const filteredRegions = computed(() =>
  regions.value.filter((r) => {
    if (activeSectors.value.length && !activeSectors.value.includes(r.secteurDominant)) return false
    if (activeTendances.value.length && !activeTendances.value.includes(r.tendance)) return false
    if (activeRegions.value.length && !activeRegions.value.includes(r.regionCode)) return false
    return true
  })
)
```

Toutes les sections utilisent `filteredRegions` au lieu de `regions`, sauf le graphique d'evolution nationale qui reste inchange.

Les KPIs sont recalcules dynamiquement : PIB = somme des filtres, chomage = moyenne ponderee par population.
