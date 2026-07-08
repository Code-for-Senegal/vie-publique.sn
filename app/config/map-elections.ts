// app/config/map-elections.ts — Configuration carte élections
import type { SenegalMapConfig, RGBAColor } from '~~/types/map'

/** Convertit un hex en RGBA */
function hexToRgba(hex: string, alpha = 160): RGBAColor {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, alpha]
}

const candidats = [
  { id: 'c1', nom: 'Candidat A', couleur: '#00A86B' },
  { id: 'c2', nom: 'Candidat B', couleur: '#FF6B35' },
  { id: 'c3', nom: 'Candidat C', couleur: '#1E90FF' },
]

export const electionMapConfig: SenegalMapConfig = {
  title: 'Élections Présidentielles 2024',
  description: 'Résultats par région',
  theme: 'dark',
  datasets: [
    {
      id: 'resultats-regions',
      label: 'Résultats par région',
      icon: '🗳️',
      type: 'choropleth',
      visible: true,
      data: [],
      joinField: 'regionCode',
      geoJoinField: 'code',
      getColor: (d) => {
        const candidat = candidats.find((c) => c.id === d.candidatEnTete)
        return hexToRgba(candidat?.couleur ?? '#888888', 160)
      },
      pickable: true,
      popup: {
        title: (d) => d.nom,
        fields: [
          { key: 'tauxParticipation', label: 'Participation', format: 'percent', suffix: '%' },
          { key: 'inscrits', label: 'Inscrits', format: 'number' },
          { key: 'votants', label: 'Votants', format: 'number' },
          { key: 'bulletinsNuls', label: 'Bulletins nuls', format: 'number' },
        ],
        chart: {
          type: 'horizontal-bars',
          dataKey: 'resultats',
          labelKey: 'candidatNom',
          colorKey: 'candidatCouleur',
        },
        actions: [{ label: 'Voir départements', icon: '🔍', event: 'drill-down' }],
      },
    },
    {
      id: 'bureaux-vote',
      label: 'Bureaux de vote',
      icon: '📍',
      type: 'cluster',
      visible: false,
      minZoom: 10,
      data: [],
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => Math.sqrt(d.inscrits) * 10,
      radiusMinPixels: 4,
      radiusMaxPixels: 25,
      clusterRadius: 60,
      pickable: true,
      popup: {
        title: (d) => d.nom,
        fields: [
          { key: 'inscrits', label: 'Inscrits', format: 'number' },
          { key: 'votants', label: 'Votants', format: 'number' },
        ],
      },
    },
  ],
  sidebar: {
    title: 'Résultats Nationaux',
    metrics: () => [
      { label: 'Participation', value: '65.2%', icon: '🗳️', color: '#00A86B' },
      { label: 'Inscrits', value: '7 371 890', icon: '👥' },
      { label: 'Bureaux dépouillés', value: '98%', icon: '📊', trend: 'up' as const },
    ],
  },
  filters: [
    {
      id: 'mode',
      label: 'Affichage',
      type: 'select',
      options: [
        { label: 'Candidat en tête', value: 'candidat' },
        { label: 'Participation', value: 'participation' },
        { label: 'Bulletins nuls', value: 'nuls' },
      ],
      defaultValue: 'candidat',
      apply: () => true,
    },
    {
      id: 'tour',
      label: 'Tour',
      type: 'toggle',
      options: [
        { label: '1er tour', value: 1 },
        { label: '2e tour', value: 2 },
      ],
      defaultValue: 1,
      apply: (item, val) => item.tour === val,
    },
  ],
  legend: {
    title: 'Candidats',
    type: 'items',
    items: candidats.map((c) => ({ label: c.nom, color: c.couleur })),
  },
  controls: {
    zoom: true,
    navigation: true,
    layerToggles: true,
    regionPresets: true,
    themeToggle: true,
    export: true,
  },
}
