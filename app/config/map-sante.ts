// app/config/map-sante.ts — Configuration carte santé
import type { SenegalMapConfig, RGBAColor } from '~~/types/map'

export const santeMapConfig: SenegalMapConfig = {
  title: 'Couverture Sanitaire',
  description: 'Vaccination, centres de santé et foyers épidémiques',
  theme: 'dark',
  datasets: [
    {
      id: 'couverture-vaccinale',
      label: 'Vaccination (% couverture)',
      icon: '💉',
      type: 'choropleth',
      visible: true,
      data: [],
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d) => d.tauxVaccination,
      colorScale: {
        type: 'threshold',
        stops: [
          { value: 0, color: [220, 38, 38, 160], label: '< 50%' },
          { value: 50, color: [245, 158, 11, 160], label: '50-70%' },
          { value: 70, color: [234, 179, 8, 160], label: '70-85%' },
          { value: 85, color: [34, 197, 94, 160], label: '85-95%' },
          { value: 95, color: [0, 128, 0, 160], label: '> 95%' },
        ],
        fallback: [128, 128, 128, 80],
      },
      pickable: true,
      popup: {
        title: (d) => `${d.region} — Santé`,
        fields: [
          { key: 'tauxVaccination', label: 'Vaccination', format: 'percent', suffix: '%' },
          { key: 'centresSante', label: 'Centres de santé', format: 'number' },
          { key: 'medecinsParHab', label: 'Médecins/10k hab', format: 'number' },
          { key: 'litHopital', label: "Lits d'hôpital", format: 'number' },
        ],
      },
    },
    {
      id: 'hopitaux',
      label: 'Hôpitaux & Centres de santé',
      icon: '🏥',
      type: 'scatterplot',
      visible: true,
      minZoom: 8,
      data: [],
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => d.capaciteLits * 50,
      radiusMinPixels: 5,
      radiusMaxPixels: 30,
      getColor: (d): RGBAColor =>
        d.type === 'hopital' ? [59, 130, 246, 200] : [168, 85, 247, 200],
      pickable: true,
      popup: {
        title: (d) => d.nom,
        fields: [
          { key: 'type', label: 'Type', format: 'badge' },
          { key: 'capaciteLits', label: 'Capacité (lits)', format: 'number' },
          { key: 'specialites', label: 'Spécialités', format: 'text' },
        ],
      },
    },
    {
      id: 'epidemies',
      label: 'Foyers épidémiques',
      icon: '⚠️',
      type: 'heatmap',
      visible: false,
      data: [],
      getPosition: (d) => [d.lng, d.lat],
      getValue: (d) => d.casConfirmes,
      opacity: 180,
    },
  ],
  sidebar: {
    title: 'Santé au Sénégal',
    metrics: () => [
      { label: 'Vaccination', value: '78%', icon: '💉', color: '#22c55e' },
      { label: 'Centres de santé', value: '2 450', icon: '🏥' },
      { label: 'Médecins/10k hab', value: '0.7', icon: '👨‍⚕️', trend: 'up' as const },
    ],
  },
  legend: {
    title: 'Couverture vaccinale',
    type: 'gradient',
    colorScale: {
      type: 'threshold',
      stops: [
        { value: 0, color: [220, 38, 38, 160], label: '< 50%' },
        { value: 50, color: [245, 158, 11, 160], label: '50-70%' },
        { value: 85, color: [34, 197, 94, 160], label: '85%+' },
      ],
      fallback: [128, 128, 128, 80],
    },
  },
  controls: {
    zoom: true,
    layerToggles: true,
    themeToggle: true,
    search: true,
    regionPresets: true,
  },
}
