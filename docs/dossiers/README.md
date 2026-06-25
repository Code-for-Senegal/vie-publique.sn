# Feature « Dossiers »

Pages de référence vivantes sur un sujet public important. Un dossier centralise et explique
un thème en liant les contenus existants du site (documents, actualités, vidéos/podcasts,
personnalités, entités publiques) et en ajoutant des blocs éditoriaux (intro, nouveautés, FAQ,
chronologie, comparatif, sources).

- **Listing** : `/dossiers`
- **Détail** : `/dossiers/<slug>` (ex. `/dossiers/code-du-travail-senegal-2026`)

Objectif : devenir **la page de référence** (n°1 Google) sur chaque sujet traité.

## Documentation

- [`directus-schema.md`](./directus-schema.md) — **modèle de données Directus à créer** (collection, champs, relations, permissions). À lire en premier.
- [`seo.md`](./seo.md) — checklist SEO (canonical, OG, JSON-LD, sitemap, indexation).

## Architecture (frontend Nuxt)

Le code suit les patterns existants du projet (cf. `documents` / `actualites`).

| Couche | Fichier | Rôle |
| --- | --- | --- |
| Types | `types/dossier.ts` | `Dossier`, `DossierListItem`, blocs & relations |
| API liste | `server/api/dossiers/index.get.ts` | Liste paginée, **publiés uniquement**, recherche + tag, cache 5 min |
| API détail | `server/api/dossiers/[slug].get.ts` | Détail par slug, relations M2M résolues & filtrées, 404 si non publié |
| Composable liste | `app/composables/useDossiers.ts` | `useCmsCollection` + `useCollectionState` (pagination, recherche, URL sync) |
| Composable détail | `app/composables/useDossier.ts` | Fetch SSR par slug (`useAsyncData`) |
| Page liste | `app/pages/dossiers/index.vue` | Grille de cartes, recherche, pagination, SEO `CollectionPage` |
| Page détail | `app/pages/dossiers/[slug].vue` | Hero, sommaire, sections, SEO `Article` + `FAQPage`, 404 propre |
| Composants | `app/components/Dossier/*` | `DossierCard`, `DossierHero`, `DossierSection`, `DossierHighlights`, `DossierTimeline`, `DossierFaq`, `DossierComparison`, `DossierRelated{Documents,News,Persons,Entities,Videos}`, `DossierLinks` |
| Sitemap | `server/api/__sitemap__/urls.ts` | Section « 3b. Dossiers thématiques » (priority 0.9, changefreq weekly) |
| Feature flag | `app/config/features.config.ts` | `menu_dossiers` (activé tous environnements) |
| Menu | `app/pages/menu.vue` | Carte « Dossiers » + couleur |

## Sections de la page détail

Chaque section ne s'affiche **que si elle est renseignée** (gestion des relations/blocs vides) :

1. **Hero** — titre, résumé, cover, dates (publication / mise à jour)
2. **Sommaire** — ancres vers les sections présentes
3. **Introduction** — `intro_html` + `content_html`
4. **Principales nouveautés** — `highlights`
5. **Documents liés** — relation `documents`
6. **Comparatif** — `comparison`
7. **Chronologie** — `timeline`
8. **Actualités liées** — relation `news`
9. **Vidéos & médias** — relation `podcasts`
10. **Institutions & entités concernées** — relation `public_entities` (ministères, agences, institutions…)
11. **Personnalités concernées** — relation `public_persons`
12. **FAQ** — `faq` (+ JSON-LD `FAQPage`)
13. **Sources & ressources** — `sources` (liens internes `/…` ou externes `https://…`, auto-détectés)
14. **Partage social** + date de mise à jour

## Workflow rédacteur (Directus)

1. Créer un dossier (`status = draft`), saisir titre, slug, résumé, cover.
2. Rédiger l'intro et le contenu (WYSIWYG).
3. Renseigner les blocs utiles (nouveautés, FAQ, chronologie, comparatif) via les
   formulaires « List » — laisser vides ceux qui ne s'appliquent pas.
4. Lier les contenus existants (documents, actualités, podcasts, personnalités, entités publiques).
5. Renseigner `seo_title` / `seo_description` si besoin d'un libellé spécifique.
6. Passer `status = published` → la page devient publique, indexable et apparaît au sitemap.

> Les brouillons (`draft`) ne sont **jamais** exposés : l'API renvoie 404, ils n'apparaissent
> ni dans la liste, ni dans le sitemap.

## Gestion des erreurs

- **Dossier introuvable** → `GET /api/dossiers/<slug>` renvoie 404 → la page lève `createError(404)` → `error.vue` (404 stylé).
- **Dossier non publié** → traité comme introuvable (404).
- **Relations vides** → la section correspondante n'est pas rendue (composant `DossierSection` avec prop `empty`).
- **Feature désactivée** (`menu_dossiers = false`) → les pages renvoient 404.

## Tester en local

```bash
npm run dev   # http://localhost:3000

# API
curl http://localhost:3000/api/dossiers
curl http://localhost:3000/api/dossiers/code-du-travail-senegal-2026

# Pages
#  http://localhost:3000/dossiers
#  http://localhost:3000/dossiers/code-du-travail-senegal-2026

# Sitemap
curl http://localhost:3000/sitemap.xml | grep dossiers
```

## Prérequis

Le modèle Directus doit être créé au préalable — voir [`directus-schema.md`](./directus-schema.md).
Tant que la collection `dossiers` n'existe pas côté Directus, les API renvoient une liste vide
/ 404 sans casser le reste du site (erreurs catchées et loguées).
