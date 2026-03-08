// app/config/map-economie.ts — Configuration carte économique
import type { SenegalMapConfig, RGBAColor } from '~~/types/map'

export const economieMapConfig: SenegalMapConfig = {
  title: 'Indicateurs Économiques',
  description: 'PIB, chômage et flux commerciaux par région',
  theme: 'dark',
  datasets: [
    {
      id: 'pib-region',
      label: 'PIB par région',
      icon: '💰',
      type: 'choropleth',
      visible: true,
      data: [],
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d) => d.pibParHabitant,
      colorScale: {
        type: 'gradient',
        stops: [
          { value: 0, color: [255, 235, 235, 160], label: '< 200k FCFA' },
          { value: 250000, color: [255, 165, 0, 160], label: '250k' },
          { value: 500000, color: [34, 197, 94, 160], label: '500k' },
          { value: 1000000, color: [0, 100, 0, 160], label: '> 1M FCFA' },
        ],
        fallback: [128, 128, 128, 80],
      },
      pickable: true,
      popup: {
        title: (d) => d.region,
        fields: [
          { key: 'pibParHabitant', label: 'PIB/hab', format: 'currency', suffix: ' FCFA' },
          { key: 'tauxChomage', label: 'Chômage', format: 'percent', suffix: '%' },
          { key: 'population', label: 'Population', format: 'number' },
          { key: 'secteurDominant', label: 'Secteur principal', format: 'badge' },
        ],
      },
    },
    {
      id: 'marches',
      label: 'Marchés',
      icon: '🏪',
      type: 'icon',
      visible: true,
      minZoom: 8,
      data: [],
      getPosition: (d) => [d.lng, d.lat],
      pickable: true,
      popup: {
        title: (d) => d.nom,
        fields: [
          { key: 'type', label: 'Type', format: 'badge' },
          { key: 'volumeJournalier', label: 'Volume/jour', format: 'currency', suffix: ' FCFA' },
        ],
      },
    },
    {
      id: 'flux-commerciaux',
      label: 'Flux commerciaux',
      icon: '↔️',
      type: 'arc',
      visible: false,
      data: [],
      getSourcePosition: (d) => [d.origineLng, d.origineLat],
      getTargetPosition: (d) => [d.destLng, d.destLat],
      getSourceColor: () => [0, 200, 255, 200] as RGBAColor,
      getTargetColor: () => [255, 100, 50, 200] as RGBAColor,
      pickable: true,
    },
  ],
  sidebar: {
    title: 'Économie du Sénégal',
    metrics: () => [
      { label: 'PIB national', value: '17 800 Mds FCFA', icon: '💰' },
      { label: 'Croissance', value: '+4.2%', icon: '📈', trend: 'up' as const, trendValue: '+0.8%' },
      { label: 'Inflation', value: '3.1%', icon: '📊', trend: 'down' as const, color: '#22c55e' },
    ],
  },
  legend: {
    title: 'PIB par habitant (FCFA)',
    type: 'gradient',
    colorScale: {
      type: 'gradient',
      stops: [
        { value: 0, color: [255, 235, 235, 160], label: 'Faible' },
        { value: 500000, color: [255, 165, 0, 160], label: 'Moyen' },
        { value: 1000000, color: [0, 100, 0, 160], label: 'Élevé' },
      ],
      fallback: [128, 128, 128, 80],
    },
  },
  filters: [
    {
      id: 'annee',
      label: 'Année',
      type: 'select',
      options: [2020, 2021, 2022, 2023, 2024, 2025].map((y) => ({
        label: `${y}`,
        value: y,
      })),
      defaultValue: 2025,
      apply: (item, val) => item.annee === val,
    },
    {
      id: 'secteur',
      label: 'Secteur',
      type: 'multi-select',
      options: [
        { label: 'Agriculture', value: 'agriculture' },
        { label: 'Pêche', value: 'peche' },
        { label: 'Industrie', value: 'industrie' },
        { label: 'Services', value: 'services' },
        { label: 'Mines', value: 'mines' },
      ],
      defaultValue: [],
      apply: (item, val) => val.length === 0 || val.includes(item.secteur),
    },
  ],
  controls: {
    zoom: true,
    layerToggles: true,
    themeToggle: true,
    export: true,
    regionPresets: true,
  },
}
