# Plan d'Action SEO - Vie Publique Sénégal

> Objectif : Devenir le #1 sur les recherches documentaires publiques au Sénégal
> Cible : >1 million de visites/an via SEO programmatique

---

## Diagnostic actuel

| Métrique | Valeur | Problème |
|----------|--------|----------|
| URLs sitemap | 5 958 | - |
| Pages indexées | 973 | **16% seulement** |
| Pages noindex | 5 251 | **Bloquent l'indexation** |
| Erreurs 404 | 165 | Gaspillage crawl budget |
| Crawlées non indexées | 468 | Contenu trop mince ? |
| Liens internes | 22 229 | Bon, mais pas contextuels |

### Ce qui fonctionne bien
- SSR activé (toutes pages sauf cartes WebGL)
- Schema.org sur homepage (4 schémas), actualités (NewsArticle), documents (Article)
- Breadcrumbs avec Schema.org (463 valides, 0 erreurs)
- Open Graph / Twitter Cards complets
- Sitemap dynamique depuis Directus
- Canonical URLs sur 40+ pages
- Module `@nuxtjs/seo` intégré

### Ce qui manque (vs stratégie cible)
- Pages archives chronologiques (`/documents/annee/*`)
- Pages institutions (`/institutions/*`)
- Pages listes (`/liste-*`)
- Pages guides citoyens (`/guides/*`)
- Catégories de documents manquantes (lois, décrets, arrêtés, etc.)
- Maillage contextuel (documents liés, liens institution↔document↔thème)
- Schema.org enrichis (GovernmentReport, Legislation, Person, Dataset)
- Redirection legacy `/journal-officiel-senegal` → `/documents/journal-officiel`

---

## Inventaire des pages existantes

### Pages catégories déjà en place (via `[category].vue` + `CATEGORY_CONFIG`)

| URL actuelle | Type Directus | Filtres | SEO | Schema.org |
|-------------|---------------|---------|-----|------------|
| `/documents/journal-officiel` | `official_journal` | year | OK | CollectionPage |
| `/documents/rapports-audit` | `audit_report` | audit_institution | OK | CollectionPage |
| `/documents/strategies` | `strategy` | - | OK | CollectionPage |
| `/documents/codes` | `code` | - | OK | CollectionPage |
| `/documents/budget` | `budget` | - | OK | CollectionPage |

### Hub et navigateur

| URL | Fichier | Description |
|-----|---------|-------------|
| `/documents` | `documents/index.vue` | Hub avec cartes catégories (statique) |
| `/documents/public` | `documents/public.vue` | Navigateur universel (tous filtres) |
| `/documents/[id]/[slug]` | `documents/[id]/[slug].vue` | Page détail document |

### Pages legacy (à consolider)

| URL legacy | Statut | Action |
|-----------|--------|--------|
| `/journal-officiel-senegal` | Actif, SEO riche (4 schemas) | Rediriger 301 → `/documents/journal-officiel` + migrer Schema.org |
| `/journal-officiel-senegal/[slug]` | Actif, BUG (params.id au lieu de params.slug) | Rediriger 301 |
| `/rapport-senegal` | Déjà redirigé → `/documents/rapports-audit` | OK |
| `/rapport-senegal/[slug]` | Déjà redirigé, données statiques JSON | OK |

---

## Structure Directus - Collection `documents`

### Champs exploitables pour le SEO (source : schema.json Directus)

| Champ | Type | Valeurs | Utilisation SEO |
|-------|------|---------|-----------------|
| `type` | string (required) | 23 choix dropdown | Pages par type de document |
| `family` | string | 10 choix dropdown | Pages par famille |
| `audit_institution` | string | 5 choix (OFNAC, IGE, CENTIF, Cour des Comptes, ARMP) | Pages par institution d'audit |
| `tags` | json | tableau libre | Pages thématiques |
| `publish_date` | date | date libre | Pages par année |
| `title` | string (255) | - | SEO title |
| `slug` | string (255) | auto-generated | URL SEO |
| `description` | string (255) | - | Meta description |
| `content_html` | text | rich text HTML | Contenu indexable |
| `content_markdown` | text | markdown | Contenu alternatif |
| `source_name` | string | - | Attribution |
| `source_url` | string | - | Lien source |
| `cover_image` | uuid → directus_files | - | OG image |
| `file` | uuid → directus_files | - | PDF téléchargeable |
| `featured` | boolean | true/false | Mise en avant |
| `has_summary` | boolean | true/false | Indicateur résumé dispo |
| `jo_type` | string | ordinary/special | Sous-type JO |
| `jo_number` | integer | - | Numéro JO |
| `is_scanned` | boolean | - | Qualité du document |
| `is_processed_by_ocr` | boolean | - | OCR effectué |
| `is_watermarked` | boolean | - | Filigrane |

### Types de documents (23 valeurs Directus)

| Valeur Directus | Label | Page catégorie existante ? |
|----------------|-------|---------------------------|
| `official_journal` | Journal officiel | `/documents/journal-officiel` |
| `law` | Loi | **NON** |
| `decree` | Décret | **NON** |
| `ministerial_order` | Arrêté ministériel | **NON** |
| `council_of_ministers` | Conseil des ministres | **NON** |
| `interministerial_council` | Conseil interministériel | **NON** |
| `press_release` | Communiqué | **NON** |
| `strategy` | Stratégie | `/documents/strategies` |
| `code` | Code | `/documents/codes` |
| `budget` | Budget | `/documents/budget` |
| `audit_report` | Rapport Audit | `/documents/rapports-audit` |
| `annual_report` | Rapports d'activité annuels | **NON** |
| `sectoral_report` | Rapports sectoriels | **NON** |
| `international_report` | Rapports Internationaux | **NON** |
| `election` | Election | **NON** |
| `speech` | Discours | **NON** |
| `public_notice` | Note au public | **NON** |
| `parliament_report` | Rapport Assemblée | **NON** |
| `government_bill` | Projet de loi | **NON** |
| `bill_proposal` | Proposition de loi | **NON** |
| `parliament_question` | Questions écrites de députés | **NON** |
| `general_policy_statement` | DPG | **NON** |
| `uncategorized` | Non catégorisé | NON (pas pertinent) |

### Familles de documents (10 valeurs)

| Valeur | Label | Page dédiée ? |
|--------|-------|---------------|
| `legislation` | Législation | **NON** |
| `accountability` | Rapports publics | **NON** |
| `budget` | Budget | **NON** (existe comme type, pas comme famille) |
| `strategy` | Stratégie | **NON** |
| `parliament` | Parlementaire | **NON** |
| `statistics` | Statistique | **NON** |
| `communication` | Communication | **NON** |
| `archives` | Archives | **NON** |
| `international` | International | **NON** |
| `election` | Election | **NON** |

### Recommandation Directus

**Aucune modification du schéma Directus n'est nécessaire.** Les champs `type`, `family`, `audit_institution`, `tags` et `publish_date` suffisent pour générer toutes les pages programmatiques prévues. La structure est bien conçue.

**Suggestion optionnelle** (à faire côté CMS, pas côté code) :
- S'assurer que chaque document a un `description` renseigné (résumé texte indexable)
- S'assurer que `family` est renseigné sur tous les documents (permet le filtrage par famille)

---

## PHASE 1 : Débloquer l'indexation (Semaine 1-2)

> Impact immédiat sur le nombre de pages indexées. Pas de nouveau code.

### 1.1 Audit des pages noindex
**Problème** : 5 251 pages exclues par noindex = 88% du contenu invisible
**Action** :
- [ ] Lister toutes les pages avec `robots: noindex` (dans le code et via robots.txt `disallow`)
- [ ] Identifier les pages qui **devraient** être indexées (documents légitimes)
- [ ] Retirer le noindex/disallow sur les documents publiés valides
- [ ] Garder noindex uniquement sur : pages beta, pages vides, pages admin

**Fichiers concernés** :
- `nuxt.config.ts` → section `robots.disallow`
- Pages avec `useHead({ meta: [{ name: 'robots', content: 'noindex' }] })`

### 1.2 Corriger les erreurs 404
**Action** :
- [ ] Récupérer la liste des 165 URLs en 404 depuis Google Search Console
- [ ] Créer des redirections 301 dans `nuxt.config.ts` → `routeRules`
- [ ] Vérifier les liens internes cassés

### 1.3 Consolider les pages legacy

**Action** : Rediriger les anciennes URLs vers les nouvelles.

```typescript
// nuxt.config.ts → routeRules
'/journal-officiel-senegal': { redirect: { to: '/documents/journal-officiel', statusCode: 301 } },
'/journal-officiel-senegal/**': { redirect: { to: '/documents/journal-officiel', statusCode: 301 } },
```

**Avant de rediriger** : Migrer le Schema.org riche de `journal-officiel-senegal/index.vue` (4 schemas : CollectionPage, Periodical, Dataset, GovernmentService) vers `documents/[category].vue` pour le journal-officiel.

### 1.4 Investiguer les pages crawlées non indexées (468)
**Action** :
- [ ] Identifier ces pages via GSC (rapport "Pages")
- [ ] Vérifier si contenu trop mince (thin content)
- [ ] Enrichir avec description/résumé textuel si nécessaire

---

## PHASE 2 : Étendre les pages catégories existantes (Semaine 3-4)

> Exploiter le mécanisme `[category].vue` + `CATEGORY_CONFIG` déjà en place.
> **Aucune nouvelle page Vue à créer** : on ajoute des entrées au config existant.

### 2.1 Ajouter les types manquants au `CATEGORY_CONFIG`

**Fichier** : `app/pages/documents/[category].vue`

**Types prioritaires à ajouter** (fort volume de recherche) :

| Slug catégorie | Type Directus | Titre SEO | Filtres |
|---------------|---------------|-----------|---------|
| `lois` | `law` | "Lois du Sénégal" | year |
| `decrets` | `decree` | "Décrets du Sénégal" | year |
| `arretes` | `ministerial_order` | "Arrêtés ministériels du Sénégal" | year |
| `rapports-annuels` | `annual_report` | "Rapports d'activité annuels - Sénégal" | year |
| `rapports-sectoriels` | `sectoral_report` | "Rapports sectoriels du Sénégal" | year |
| `rapports-internationaux` | `international_report` | "Rapports internationaux sur le Sénégal" | year |
| `discours` | `speech` | "Discours officiels au Sénégal" | year |
| `projets-de-loi` | `government_bill` | "Projets de loi au Sénégal" | year |
| `propositions-de-loi` | `bill_proposal` | "Propositions de loi au Sénégal" | year |
| `rapports-assemblee` | `parliament_report` | "Rapports de l'Assemblée nationale" | year |

**Types secondaires** (volume plus faible) :

| Slug catégorie | Type Directus | Titre SEO |
|---------------|---------------|-----------|
| `conseil-des-ministres` | `council_of_ministers` | "Communiqués du Conseil des ministres" |
| `conseil-interministeriel` | `interministerial_council` | "Conseils interministériels du Sénégal" |
| `communiques` | `press_release` | "Communiqués de presse officiels" |
| `notes-publiques` | `public_notice` | "Notes au public" |
| `questions-deputes` | `parliament_question` | "Questions écrites des députés" |
| `dpg` | `general_policy_statement` | "Déclarations de politique générale" |
| `elections` | `election` | "Documents électoraux du Sénégal" |

### 2.2 Mettre à jour le hub `/documents`

**Fichier** : `app/pages/documents/index.vue`

Ajouter les nouvelles cartes catégories pour les types prioritaires (lois, décrets, arrêtés, etc.) dans le hub.

### 2.3 Ajouter les catégories au sitemap

**Fichier** : `server/api/__sitemap__/urls.ts`

```typescript
// Ajouter les URLs des nouvelles catégories
const categories = [
  'journal-officiel', 'rapports-audit', 'strategies', 'codes', 'budget', // existants
  'lois', 'decrets', 'arretes', 'rapports-annuels', 'rapports-sectoriels', // nouveaux
  'rapports-internationaux', 'discours', 'projets-de-loi', 'propositions-de-loi',
  'rapports-assemblee', 'conseil-des-ministres', 'communiques', 'elections'
];
// priority: 0.8, changefreq: 'weekly'
```

---

## PHASE 3 : Pages archives par année (Semaine 4-5)

> Pages entièrement nouvelles. Google adore les archives chronologiques.

### 3.1 Créer la page `/documents/annee/[year].vue`

**Fichier à créer** : `app/pages/documents/annee/[year].vue`

**Contenu** :
- H1 : "Documents publics du Sénégal - [année]"
- Résumé statistique : nombre de documents par type/famille
- Liste paginée avec filtres par type/famille
- Navigation : liens "Année précédente" / "Année suivante"
- Schema.org : `CollectionPage`
- SEO : title, description, canonical dynamiques

**API** : `GET /api/documents?year=[year]` (existe déjà)
**API** : `GET /api/documents/years` (existe déjà → liste des années pour la navigation)

**Validation** : Vérifier que l'année demandée existe dans la liste. Sinon → 404.

### 3.2 Page index archives `/documents/annee/index.vue`

**Fichier à créer** : `app/pages/documents/annee/index.vue`

**Contenu** :
- H1 : "Archives des documents publics du Sénégal"
- Grille/timeline de toutes les années avec nombre de documents par année
- Liens vers chaque page année
- Schema.org : `CollectionPage`

### 3.3 Ajouter au sitemap

```typescript
// Générer dynamiquement les URLs des années
const years = await fetchYears(); // /api/documents/years
years.forEach(year => {
  urls.push({ loc: `/documents/annee/${year}`, changefreq: 'monthly', priority: 0.7 });
});
```

---

## PHASE 4 : Pages institutions (Semaine 5-6)

> Exploiter la collection `state_entity` existante.

### 4.1 Page index `/institutions/index.vue`

**Fichier à créer** : `app/pages/institutions/index.vue`

**Contenu** :
- H1 : "Institutions de la République du Sénégal"
- Regroupement par type (Ministères, Agences, etc.)
- Lien vers chaque institution
- Schema.org : `GovernmentOrganization` (liste)

**API** : `GET /api/state/entities` (existe) + `GET /api/state/tree` (existe)

### 4.2 Page détail `/institutions/[slug].vue`

**Fichier à créer** : `app/pages/institutions/[slug].vue`

**Contenu** :
- H1 : nom de l'institution
- Description / missions (si disponible)
- Documents liés (filtrés par tags ou audit_institution correspondante)
- Sous-entités (directions, services)
- Dirigeants (lien vers `/personnalites/`)
- Schema.org : `GovernmentOrganization`

**API** : `GET /api/state/entities/[slug]` (existe)

**Limitation** : Pas de lien direct `state_entity` ↔ `documents` dans Directus.
**Solution** : Faire correspondre `state_entity.name` avec `documents.audit_institution` ou `documents.tags` pour les rapports d'audit. Pour les autres, rechercher dans `documents.source_name`.

---

## PHASE 5 : Maillage interne contextuel (Semaine 5-7)

> Transformer les pages isolées en réseau interconnecté.

### 5.1 Section "Documents liés" sur les pages document

**Fichier** : `app/pages/documents/[id]/[slug].vue`

**Logique** :
- Documents du même `type` (5 derniers)
- Documents de la même `family` (5 derniers)
- Documents de la même `audit_institution` (si renseigné)
- Dédupliquer + exclure le document courant

**API à créer** : `GET /api/documents/related/[id]`

### 5.2 Badges liens contextuels sur chaque document

Sur chaque page document, afficher des badges/chips cliquables :
- Type de document → `/documents/[type-slug]` (utilise le mapping `CATEGORY_CONFIG`)
- Famille → `/documents/public?family=[family]`
- Institution d'audit → `/documents/rapports-audit?institution=[institution]`
- Année → `/documents/annee/[year]`

### 5.3 Navigation entre pages catégories

Sur les pages catégorie : liens vers les familles liées
Sur les pages année : liens "Année précédente" / "Année suivante"
Sur les pages institution : liens vers les types de documents publiés

---

## PHASE 6 : Schema.org enrichis (Semaine 6-8)

> Améliorer la compréhension Google du contenu.

### 6.1 Migrer le Schema.org riche du legacy `/journal-officiel-senegal`

Les 4 schemas de l'ancienne page JO doivent être migrés vers `[category].vue` pour `journal-officiel` :
- `CollectionPage` (déjà fait)
- `Periodical` (ISSN: 0851-8025)
- `Dataset`
- `GovernmentService`

### 6.2 Schema.org par type de page document détail

| Type document | Schema actuel | Schema cible |
|--------------|--------------|--------------|
| `audit_report` | `Article` | `Report` + publisher `GovernmentOrganization` |
| `law` | `Article` | `Legislation` |
| `decree` | `Article` | `Legislation` |
| `budget` | `Article` | `Dataset` |
| `speech` | `Article` | `Article` (ok) |
| Autres | `Article` | `Article` (ok) |

**Fichier** : `app/pages/documents/[id]/[slug].vue` → conditionner le Schema.org selon `document.type`

### 6.3 Schema.org sur pages personnes

| Page | Schema actuel | Schema cible |
|------|--------------|--------------|
| Députés (`assemblee-nationale/deputes/[id]/[name].vue`) | Aucun | `Person` + `GovernmentOrganization` |
| Nominations (`personnalites/[id]/[slug].vue`) | Aucun | `Person` + `Role` |
| Podcasts (`podcasts/[id]/[slug].vue`) | Aucun | `PodcastEpisode` |

---

## PHASE 7 : Pages "Listes" à fort potentiel SEO (Semaine 7-9)

> Pages Wikipedia-style qui rankent sur "liste + sujet".

### 7.1 Pages listes à créer

| URL | Source Directus | Requêtes Google ciblées |
|-----|----------------|------------------------|
| `/liste-deputes-senegal` | `assembly_deputy` (active) | "liste des députés du sénégal" |
| `/liste-ministres-senegal` | `positions` (type=Ministre) | "liste des ministres du sénégal" |
| `/liste-institutions-publiques-senegal` | `state_entity` | "institutions du sénégal" |
| `/liste-medias-senegal` | `media` | "médias sénégal" |

**Note** : Certaines listes existent peut-être déjà sous d'autres URLs (`/assemblee-nationale/deputes`, `/medias`). L'objectif est d'avoir des URLs optimisées pour les requêtes "liste + sujet" tout en évitant le contenu dupliqué → utiliser canonical ou redirection.

### 7.2 Pages combinées type × année (optionnel, si volume suffisant)

**URL** : `/documents/[category]/[year]` (ex: `/documents/lois/2024`)

**Attention** : Ne créer ces pages **que si elles contiennent au moins 3 documents** (éviter thin content).

---

## PHASE 8 : Pages guides citoyens (Semaine 9-11)

> Trafic organique via requêtes informationnelles.

### 8.1 Guides prioritaires

**URL** : `/guides/[slug]`

```
/guides/comment-consulter-journal-officiel-senegal
/guides/comment-trouver-loi-senegal
/guides/comment-lire-budget-etat-senegal
/guides/comment-suivre-elections-senegal
/guides/comment-fonctionne-assemblee-nationale-senegal
/guides/comment-acceder-rapports-cour-des-comptes
/guides/comment-suivre-conseil-des-ministres
```

**Structure de chaque guide** :
```
H1 : Comment consulter le Journal officiel du Sénégal
H2 : Qu'est-ce que le journal officiel ?
H2 : Comment y accéder sur Vie-publique.sn
H2 : Archives disponibles → lien /documents/journal-officiel
H2 : Documents récents → lien /documents/annee/2026
```

**Schema.org** : `HowTo` + `FAQPage`

**Implémentation** : Pages statiques dans `app/pages/guides/` ou contenu CMS.

---

## PHASE 9 : Optimisation des pages existantes (Semaine 10-12)

### 9.1 Titres et descriptions à fort CTR

**Pages prioritaires** (fort volume, faible CTR) :

| Page | Impressions | CTR actuel | Action |
|------|------------|------------|--------|
| /conseil-des-ministres | 15 446 | 0.74% | Réécrire title + description |
| /nomination-senegal | 8 948 | 1.44% | Réécrire title + description |

### 9.2 Résumés texte sur pages documents

**Problème** : Google n'indexe pas les PDF correctement.
**Solution** : S'assurer que `documents.description` est affiché en texte visible sur chaque page document.

Si `description` est vide :
- Extraire les premiers 300 caractères de `content_html`
- Ou afficher les métadonnées structurées (institution, date, type, famille)

### 9.3 Balises title optimisées

**Pattern recommandé** :
```
[Titre document] - [Institution] | Vie Publique Sénégal
```

---

## PHASE 10 : Sitemap et indexation avancée (continu)

### 10.1 Ajouter toutes les nouvelles pages au sitemap

**Fichier** : `server/api/__sitemap__/urls.ts`

| Type de page | Priority | Changefreq |
|-------------|----------|------------|
| `/documents/[category]` (catégories) | 0.8 | weekly |
| `/documents/annee/[year]` (archives) | 0.7 | monthly |
| `/institutions/[slug]` | 0.8 | monthly |
| `/liste-*` | 0.7 | weekly |
| `/guides/*` | 0.6 | monthly |

### 10.2 Demander l'indexation

Après chaque phase, soumettre les nouvelles URLs via Google Search Console.

---

## Récapitulatif des livrables techniques

### Fichier existant à modifier (pas de nouvelle page)

| Fichier | Modification | Phase |
|---------|-------------|-------|
| `app/pages/documents/[category].vue` | Ajouter ~17 entrées à `CATEGORY_CONFIG` | Phase 2 |
| `app/pages/documents/index.vue` | Ajouter cartes pour nouvelles catégories | Phase 2 |
| `nuxt.config.ts` | Redirections 301 legacy, retirer disallow | Phase 1 |
| `server/api/__sitemap__/urls.ts` | Ajouter catégories, années, institutions | Phase 2-4 |
| `app/pages/documents/[id]/[slug].vue` | Documents liés + badges liens + Schema.org conditionnel | Phase 5-6 |
| `app/pages/assemblee-nationale/deputes/[id]/[name].vue` | Schema.org `Person` | Phase 6 |
| `app/pages/conseil-des-ministres/index.vue` | Optimiser title/description | Phase 9 |

### Nouvelles pages à créer

| Fichier | URL | Phase |
|---------|-----|-------|
| `app/pages/documents/annee/index.vue` | `/documents/annee` | Phase 3 |
| `app/pages/documents/annee/[year].vue` | `/documents/annee/2024` | Phase 3 |
| `app/pages/institutions/index.vue` | `/institutions` | Phase 4 |
| `app/pages/institutions/[slug].vue` | `/institutions/[slug]` | Phase 4 |
| `app/pages/liste-deputes-senegal.vue` | `/liste-deputes-senegal` | Phase 7 |
| `app/pages/liste-ministres-senegal.vue` | `/liste-ministres-senegal` | Phase 7 |
| `app/pages/guides/[slug].vue` (ou statiques) | `/guides/*` | Phase 8 |

### Nouvelle API à créer

| Endpoint | Description | Phase |
|----------|-------------|-------|
| `GET /api/documents/related/[id]` | Documents liés (même type/famille/institution) | Phase 5 |

---

## Estimation du potentiel

| Phase | Pages créées | Requêtes captables |
|-------|-------------|-------------------|
| Phase 1 (indexation) | 0 nouvelles | +4 000 pages débloquées |
| Phase 2 (catégories) | +17 pages catégories | "lois senegal pdf", "décrets senegal", etc. |
| Phase 3 (archives) | +60 pages années | "journal officiel senegal 2024", "documents senegal 1960" |
| Phase 4 (institutions) | +200 pages | "cour des comptes senegal", "ministères senegal" |
| Phase 5 (maillage) | 0 nouvelles | +40% temps sur site, -bounce rate |
| Phase 6 (Schema.org) | 0 nouvelles | Rich snippets, meilleur CTR |
| Phase 7 (listes) | +4 pages | "liste ministres/députés senegal" |
| Phase 8 (guides) | +7 pages | "comment + [sujet] + senegal" |
| Phase 9 (optimisation) | 0 nouvelles | +CTR sur pages existantes |

**Total estimé** : De **973 pages indexées** → **5 000+ pages indexées** en 3 mois.

---

## Ordre d'implémentation recommandé

```
Semaine 1-2  → Phase 1 : Débloquer l'indexation + consolider legacy (impact immédiat)
Semaine 3-4  → Phase 2 : Étendre CATEGORY_CONFIG (ajout simple, fort impact)
Semaine 4-5  → Phase 3 : Pages archives par année (2 fichiers Vue)
Semaine 5-6  → Phase 4 : Pages institutions (2 fichiers Vue)
Semaine 5-7  → Phase 5 : Maillage interne contextuel (1 API + badges)
Semaine 6-8  → Phase 6 : Schema.org enrichis
Semaine 7-9  → Phase 7 : Pages listes
Semaine 9-11 → Phase 8 : Guides citoyens
Semaine 10+  → Phase 9-10 : Optimisation continue
```
