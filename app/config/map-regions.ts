// app/config/map-regions.ts — Données des 14 régions du Sénégal
import type { SenegalRegion } from '~~/types/map'

export const SENEGAL_REGIONS: SenegalRegion[] = [
  {
    code: 'DK',
    name: 'Dakar',
    latitude: 14.7167,
    longitude: -17.4677,
    departments: ['Dakar', 'Guédiawaye', 'Pikine', 'Rufisque', 'Keur Massar'],
    population: 4_000_000,
  },
  {
    code: 'TH',
    name: 'Thiès',
    latitude: 14.7833,
    longitude: -16.95,
    departments: ['Thiès', 'Mbour', 'Tivaouane'],
    population: 2_200_000,
  },
  {
    code: 'SL',
    name: 'Saint-Louis',
    latitude: 16.0326,
    longitude: -16.4818,
    departments: ['Saint-Louis', 'Dagana', 'Podor'],
    population: 1_100_000,
  },
  {
    code: 'ZG',
    name: 'Ziguinchor',
    latitude: 12.5681,
    longitude: -16.2719,
    departments: ['Ziguinchor', 'Bignona', 'Oussouye'],
    population: 700_000,
  },
  {
    code: 'KL',
    name: 'Kaolack',
    latitude: 14.1652,
    longitude: -16.0758,
    departments: ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
    population: 1_100_000,
  },
  {
    code: 'KD',
    name: 'Kolda',
    latitude: 12.8833,
    longitude: -14.95,
    departments: ['Kolda', 'Médina Yoro Foulah', 'Vélingara'],
    population: 800_000,
  },
  {
    code: 'TC',
    name: 'Tambacounda',
    latitude: 13.7709,
    longitude: -13.6673,
    departments: ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
    population: 900_000,
  },
  {
    code: 'KG',
    name: 'Kédougou',
    latitude: 12.5605,
    longitude: -12.1747,
    departments: ['Kédougou', 'Saraya', 'Salémata'],
    population: 200_000,
  },
  {
    code: 'MT',
    name: 'Matam',
    latitude: 15.6559,
    longitude: -13.2554,
    departments: ['Matam', 'Kanel', 'Ranérou'],
    population: 700_000,
  },
  {
    code: 'FK',
    name: 'Fatick',
    latitude: 14.3389,
    longitude: -16.4111,
    departments: ['Fatick', 'Foundiougne', 'Gossas'],
    population: 900_000,
  },
  {
    code: 'DB',
    name: 'Diourbel',
    latitude: 14.65,
    longitude: -16.2333,
    departments: ['Diourbel', 'Bambey', 'Mbacké'],
    population: 1_800_000,
  },
  {
    code: 'LG',
    name: 'Louga',
    latitude: 15.6167,
    longitude: -16.2167,
    departments: ['Louga', 'Kébémer', 'Linguère'],
    population: 1_000_000,
  },
  {
    code: 'SD',
    name: 'Sédhiou',
    latitude: 12.7081,
    longitude: -15.5569,
    departments: ['Sédhiou', 'Bounkiling', 'Goudomp'],
    population: 500_000,
  },
  {
    code: 'KF',
    name: 'Kaffrine',
    latitude: 14.1059,
    longitude: -15.5509,
    departments: ['Kaffrine', 'Birkelane', 'Koungheul', 'Malem Hodar'],
    population: 700_000,
  },
]

/** Centre du Sénégal */
export const SENEGAL_CENTER: [number, number] = [-14.4524, 14.4974]

/** Zoom par défaut pour voir tout le pays */
export const SENEGAL_DEFAULT_ZOOM = 7

/** Lookup rapide région par code */
export const REGIONS_BY_CODE = Object.fromEntries(
  SENEGAL_REGIONS.map((r) => [r.code, r]),
) as Record<string, SenegalRegion>

/** Population totale */
export const SENEGAL_TOTAL_POPULATION = SENEGAL_REGIONS.reduce((s, r) => s + r.population, 0)
