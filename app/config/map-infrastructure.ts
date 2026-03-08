// app/config/map-infrastructure.ts — Configuration carte infrastructure
import type { SenegalMapConfig, RGBAColor } from '~~/types/map'

export const infraMapConfig: SenegalMapConfig = {
  title: 'Infrastructure & Connectivité',
  description: "Électrification, eau potable, routes et couverture réseau",
  theme: 'dark',
  datasets: [
    {
      id: 'electrification',
      label: "Taux d'électrification",
      icon: '⚡',
      type: 'choropleth',
      data: [],
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d) => d.tauxElectrification,
      colorScale: {
        type: 'gradient',
        stops: [
          { value: 0, color: [50, 50, 50, 160], label: '0%' },
          { value: 50, color: [255, 200, 50, 160], label: '50%' },
          { value: 100, color: [255, 255, 100, 200], label: '100%' },
        ],
        fallback: [80, 80, 80, 80],
      },
      visible: true,
      pickable: true,
      popup: {
        title: (d) => `${d.region} — Électrification`,
        fields: [
          { key: 'tauxElectrification', label: 'Électrification', format: 'percent', suffix: '%' },
          { key: 'puissanceInstallee', label: 'Puissance installée', format: 'number', suffix: ' MW' },
          { key: 'solaire', label: 'Part solaire', format: 'percent', suffix: '%' },
        ],
      },
    },
    {
      id: 'routes',
      label: 'Routes principales',
      icon: '🛣️',
      type: 'path',
      data: [],
      getColor: (d): RGBAColor =>
        d.etat === 'bon'
          ? [34, 197, 94, 200]
          : d.etat === 'moyen'
            ? [245, 158, 11, 200]
            : [220, 38, 38, 200],
      lineWidth: 3,
      visible: false,
      pickable: true,
      popup: {
        title: (d) => d.nom,
        fields: [
          { key: 'etat', label: 'État', format: 'badge' },
          { key: 'longueur', label: 'Longueur', format: 'number', suffix: ' km' },
        ],
      },
    },
    {
      id: 'antennes',
      label: 'Antennes réseau mobile',
      icon: '📡',
      type: 'cluster',
      data: [],
      getPosition: (d) => [d.lng, d.lat],
      clusterRadius: 50,
      getColor: (d): RGBAColor =>
        d.techno === '5G'
          ? [147, 51, 234, 200]
          : d.techno === '4G'
            ? [59, 130, 246, 200]
            : [156, 163, 175, 200],
      radiusMinPixels: 4,
      radiusMaxPixels: 20,
      minZoom: 8,
      visible: false,
      pickable: true,
      popup: {
        title: (d) => d.operateur,
        fields: [
          { key: 'techno', label: 'Technologie', format: 'badge' },
          { key: 'operateur', label: 'Opérateur', format: 'text' },
        ],
      },
    },
    {
      id: 'eau-potable',
      label: 'Accès eau potable',
      icon: '💧',
      type: 'choropleth',
      data: [],
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d) => d.tauxAccesEau,
      colorScale: {
        type: 'gradient',
        stops: [
          { value: 0, color: [255, 200, 200, 160], label: '0%' },
          { value: 50, color: [100, 180, 255, 160], label: '50%' },
          { value: 100, color: [0, 100, 200, 200], label: '100%' },
        ],
        fallback: [80, 80, 80, 80],
      },
      visible: false,
      pickable: true,
      popup: {
        title: (d) => `${d.region} — Eau potable`,
        fields: [
          { key: 'tauxAccesEau', label: 'Accès eau', format: 'percent', suffix: '%' },
          { key: 'forages', label: 'Forages', format: 'number' },
        ],
      },
    },
  ],
  sidebar: {
    title: 'Infrastructure',
    metrics: () => [
      { label: 'Électrification', value: '72%', icon: '⚡', trend: 'up' as const },
      { label: 'Eau potable', value: '83%', icon: '💧' },
      { label: 'Couverture 4G', value: '65%', icon: '📡', trend: 'up' as const, trendValue: '+8%' },
    ],
  },
  legend: {
    title: "Taux d'électrification",
    type: 'gradient',
    colorScale: {
      type: 'gradient',
      stops: [
        { value: 0, color: [50, 50, 50, 160], label: '0%' },
        { value: 50, color: [255, 200, 50, 160], label: '50%' },
        { value: 100, color: [255, 255, 100, 200], label: '100%' },
      ],
      fallback: [80, 80, 80, 80],
    },
  },
  controls: {
    zoom: true,
    layerToggles: true,
    themeToggle: true,
    fullscreen: true,
    regionPresets: true,
  },
}
