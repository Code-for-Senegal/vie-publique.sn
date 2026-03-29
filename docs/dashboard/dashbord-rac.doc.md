# Dashboard RAC 2025 - Documentation technique

## Vue d'ensemble

Dashboard citoyen de la **Revue Annuelle Conjointe (RAC) 2025** du Sénégal.
Affiche l'état de mise en oeuvre de la politique economique et sociale en 2024.

- **URL** : `/dashboard/rac-2025-revue-annuelle-conjointe-senegal`
- **Feature flag** : `menu_dashboard_rac` (activé en `dev` et `test`)
- **Layout** : `fullscreen`, SSR désactivé (`ssr: false`)
- **SEO** : `noindex, nofollow, noarchive`

## Sources de données

| Fichier | Description |
|---------|------------|
| `public/data/test-rac.json` | Données RAC (KPI, sections sectorielles, pôles territoriaux, SND) |
| `public/geo/senegal-mapping-pole-regions.json` | Mapping des 8 pôles territoriaux vers les 14 régions |

### Structure du JSON RAC

```
test-rac.json
├── overview.cards[]          # 7 KPI macroéconomiques (PIB, inflation, etc.)
├── overview.highlights[]     # Points positifs
├── overview.challenges[]     # Points de vigilance
├── sections[]                # 14 secteurs groupés en 4 familles
│   ├── group: secteurs_productifs        (agriculture, élevage, pêche, industrie)
│   ├── group: secteurs_appui_production  (énergie, finances, numérique)
│   ├── group: secteurs_sociaux           (éducation, santé, eau, environnement)
│   └── group: gouvernance_paix_securite  (justice, gouvernance territoriale)
├── territorial_poles.datasets[]  # Données cartographiques par pôle
└── snd_2025_2029                 # Cadre SND (processus, cibles, indicateurs)
```

## Architecture des fichiers

### Page

| Fichier | Rôle |
|---------|------|
| `app/pages/dashboard/rac-2025-revue-annuelle-conjointe-senegal.vue` | Page principale, scroll unique |

### Composants (`app/components/Rac/`)

| Composant | Rôle | Props principales |
|-----------|------|-------------------|
| `OverviewCards.vue` | Grille de 7 KPI macroéconomiques | `cards: RacCard[]` |
| `SectionCard.vue` | Carte sectorielle colorée avec max 3 métriques | `section`, `color`, `icon`, `maxMetrics` |
| `MapByPole.vue` | Carte choroplèthe deck.gl par pôle territorial | `datasets`, `poleMapping` |
| `SndTargets.vue` | Accordéon Méthodologie & SND 2025-2029 | `setupProcess`, `targets`, `exampleIndicators` |

### Fichiers de config modifiés

| Fichier | Modification |
|---------|-------------|
| `app/config/features.config.ts` | Ajout du flag `menu_dashboard_rac` |
| `app/pages/menu.vue` | Carte de navigation + couleur teal |
| `app/pages/dashboard/index.vue` | Lien dans la liste des dashboards de test |

## Sections de la page (scroll unique)

L'ordre de lecture est pensé pour un citoyen non-expert :

1. **Hero** - Titre centré, badge année, sous-titre, source
2. **Chiffres clés 2024** - 7 KPI en grille (2 col mobile, 4 col desktop), bordure colorée selon tendance
3. **A retenir** - 2 cartes côte à côte : "Ce qui s'améliore" (vert) + "Points de vigilance" (ambre)
4. **Carte territoriale** - Choroplèthe deck.gl, 8 pôles, sélecteur de dataset
5. **Bilan par secteur** - 4 groupes avec cartes colorées :
   - Secteurs productifs → `amber` (jaune)
   - Appui à la production → `emerald` (vert)
   - Secteurs sociaux → `rose` (rouge)
   - Gouvernance → `violet`
6. **Méthodologie & SND** - Accordéon fermé par défaut, contient processus RAC + indicateurs SND en cartes
7. **Footer source** - Référence document officiel

## Design

### Couleurs par groupe sectoriel

| Groupe | Couleur Tailwind | Usage |
|--------|-----------------|-------|
| Secteurs productifs | `amber` | Bordure, fond, icône, badge |
| Appui à la production | `emerald` | Bordure, fond, icône, badge |
| Secteurs sociaux | `rose` | Bordure, fond, icône, badge |
| Gouvernance | `violet` | Bordure, fond, icône, badge |

### Cartes sectorielles (SectionCard)

- Bordure colorée (`border-2`) + fond teinté
- Icône 40x40 + titre + badge ministère
- Max 3 métriques affichées en gros chiffres (`text-2xl font-extrabold`) dans des sous-cartes blanches
- Flèche de tendance + delta compact
- Un seul défi affiché en résumé

### Carte deck.gl (MapByPole)

- 3 couches : choroplèthe (régions colorées par pôle), scatterplot (cercles fond), text (labels valeurs)
- 8 couleurs catégorielles pour les 8 pôles
- Normalisation des noms de pôles (accents, préfixe "Pôle")
- Centre géographique calculé pour chaque pôle (moyenne lat/lng des régions)
- Sélecteur de dataset si plusieurs datasets disponibles
- Sync dark mode via `useMapStore()`

## Dépendances réutilisées (non modifiées)

- `app/components/Map/SenegalMap.vue` - Composant carte deck.gl
- `app/config/map-regions.ts` - `SENEGAL_REGIONS` (14 régions avec coordonnées)
- `types/map.ts` - `SenegalMapConfig`, `RGBAColor`
- `app/components/AppBreadcrumb.vue` - Fil d'Ariane
- Nuxt UI : `UIcon`

## Evolution possible

- Remplacer `public/data/test-rac.json` par un endpoint API (`/api/rac/2025`)
- Ajouter les données RAC d'autres années
- Activer le feature flag en production (`environments: ['dev', 'test', 'production']`)
- Ajouter un export PDF du dashboard
