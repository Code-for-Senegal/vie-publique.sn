# Stratégie SEO — Vie Publique Sénégal

> Objectif : Devenir la référence documentaire publique au Sénégal (le "Legifrance de l'Afrique francophone")
> Cible : >1 million de visites/an via SEO programmatique
> Dernière mise à jour : avril 2026

---

## Table des matières

1. [Principe : le SEO programmatique](#1-principe--le-seo-programmatique)
2. [Architecture pyramidale SEO](#2-architecture-pyramidale-seo)
3. [Les 6 types de pages SEO à créer](#3-les-6-types-de-pages-seo-à-créer)
4. [Maillage interne](#4-maillage-interne)
5. [Optimisations SEO on-page](#5-optimisations-seo-on-page)
6. [Requêtes Google à dominer](#6-requêtes-google-à-dominer)
7. [Estimation du trafic potentiel](#7-estimation-du-trafic-potentiel)
8. [Features SEO à fort impact](#8-features-seo-à-fort-impact)
9. [Pièges à éviter](#9-pièges-à-éviter)
10. [Stratégie multi-domaine](#10-stratégie-multi-domaine)
11. [Plan d'implémentation](#11-plan-dimplémentation)
12. [Récapitulatif des livrables](#12-récapitulatif-des-livrables)

---

## 1. Principe : le SEO programmatique

Le SEO programmatique consiste à **générer automatiquement des milliers de pages utiles** à partir de données structurées. C'est la stratégie utilisée par Wikipedia, Legifrance, Gov.uk, OpenStates et Ballotpedia.

### Pourquoi ça marche pour Vie-publique.sn

- Beaucoup de documents (10 000+)
- Données structurées (type, famille, institution, date, thèmes)
- Relations entre textes (loi → décret → arrêté)
- Contenu **evergreen** (une constitution sera recherchée dans 10 ans)

### Calcul de volume

| Donnée source | Volume | Pages générables |
|---------------|--------|-----------------|
| Documents | 10 000 | 10 000 |
| Institutions | 20 | 20 |
| Thèmes/familles | 10 | 10 |
| Années | 60+ | 60 |
| Combinaisons (type × année, type × institution...) | - | ~40 000 |
| **Total potentiel** | | **~50 000 pages SEO** |

---

## 2. Architecture pyramidale SEO

Modèle en 5 niveaux, du plus général au plus spécifique. Chaque niveau alimente le niveau supérieur en liens internes.

```
HOME (niveau 0)
 ├── Pages piliers (niveau 1)          → /lois-senegal, /rapports-publics-senegal
 │     ├── Pages catégories (niveau 2) → /documents/lois, /documents/rapports-audit
 │     │     ├── Pages archives (niveau 3)  → /documents/annee/2024
 │     │     └── Pages entités (niveau 3)   → /institutions/cour-des-comptes
 │     └── Pages listes (niveau 2)     → /liste-deputes-senegal
 └── Pages documents (niveau 4)        → /documents/4613/rapport-cour-comptes-2024
```

### Niveau 1 — Pages piliers (trafic massif)

Pages d'atterrissage optimisées pour les requêtes les plus recherchées.

| URL cible | Requêtes captées |
|-----------|-----------------|
| `/lois-senegal` | loi senegal, loi senegal pdf |
| `/decrets-senegal` | décret senegal |
| `/rapports-publics-senegal` | rapport cour des comptes senegal |
| `/journal-officiel-senegal` | journal officiel senegal pdf |
| `/institutions-senegal` | institutions du senegal |

Contenu type : texte explicatif (200+ mots) + liste des sous-catégories + documents récents + liens vers les catégories.

### Niveau 2 — Pages catégories

Pages de listing par type de document, avec filtres et pagination.

**État actuel du code** : 5 catégories configurées dans `CATEGORY_CONFIG` de `[category].vue` :

| Catégorie existante | Type Directus | Status |
|-------------------|---------------|--------|
| `journal-officiel` | `official_journal` | **Fait** |
| `rapports-audit` | `audit_report` | **Fait** |
| `strategies` | `strategy` | **Fait** |
| `codes` | `code` | **Fait** |
| `budget` | `budget` | **Fait** |

**Catégories à ajouter** (types Directus existants sans page catégorie) :

| Slug | Type Directus | Label |
|------|---------------|-------|
| `lois` | `law` | Lois du Sénégal |
| `decrets` | `decree` | Décrets du Sénégal |
| `arretes` | `ministerial_order` | Arrêtés ministériels |
| `rapports-annuels` | `annual_report` | Rapports d'activité annuels |
| `rapports-sectoriels` | `sectoral_report` | Rapports sectoriels |
| `rapports-internationaux` | `international_report` | Rapports internationaux |
| `discours` | `speech` | Discours officiels |
| `projets-de-loi` | `government_bill` | Projets de loi |
| `propositions-de-loi` | `bill_proposal` | Propositions de loi |
| `rapports-assemblee` | `parliament_report` | Rapports Assemblée nationale |
| `conseil-des-ministres` | `council_of_ministers` | Communiqués du Conseil des ministres |
| `communiques` | `press_release` | Communiqués de presse |
| `elections` | `election` | Documents électoraux |
| `dpg` | `general_policy_statement` | Déclarations de politique générale |
| `questions-deputes` | `parliament_question` | Questions écrites des députés |
| `notes-publiques` | `public_notice` | Notes au public |

### Niveau 3 — Pages archives chronologiques

Pages par année, très appréciées par Google.

| URL | Contenu |
|-----|---------|
| `/documents/annee` | Index : toutes les années avec compteur |
| `/documents/annee/2024` | Documents publiés en 2024, résumé statistique par type |
| `/documents/annee/1960` | Archives historiques 1960 |

**État actuel du code** : ces pages n'existent pas encore.

### Niveau 3 — Pages entités (institutions)

Pages de type fiche pour chaque institution publique.

| URL | Source Directus |
|-----|----------------|
| `/institutions` | `state_entity` (collection existante) |
| `/institutions/cour-des-comptes` | `state_entity` + documents liés |
| `/institutions/assemblee-nationale` | `state_entity` |

Contenu : description, missions, documents publiés, dirigeants, sous-entités.

**État actuel du code** : ces pages n'existent pas (`/etat-senegal/annuaire/[slug]` existe mais est bloqué en robots.txt).

### Niveau 4 — Pages documents individuels

Pages de détail pour chaque document.

**État actuel du code** : `documents/[id]/[slug].vue` — **Fait** avec :
- Canonical URL dynamique
- Schema.org : Article + BreadcrumbList
- OG/Twitter meta dynamiques
- Breadcrumb 4 niveaux

---

## 3. Les 6 types de pages SEO à créer

### 3.1 Pages catégories (extension du CATEGORY_CONFIG existant)

→ Voir la liste au [niveau 2](#niveau-2--pages-catégories) ci-dessus.
Mécanisme existant, il suffit d'ajouter des entrées au config.

### 3.2 Pages archives chronologiques

→ Voir [niveau 3](#niveau-3--pages-archives-chronologiques).
Fichiers à créer : `documents/annee/index.vue` + `documents/annee/[year].vue`.

### 3.3 Pages institutions

→ Voir [niveau 3](#niveau-3--pages-entités-institutions).
Fichiers à créer : `institutions/index.vue` + `institutions/[slug].vue`.

### 3.4 Pages listes (technique Wikipedia)

Pages de listes structurées qui rankent sur "liste + sujet".

| URL | Source | Requêtes ciblées |
|-----|--------|-----------------|
| `/liste-deputes-senegal` | `assembly_deputy` | "liste des députés du sénégal" |
| `/liste-ministres-senegal` | `positions` (type=Ministre) | "liste des ministres du sénégal" |
| `/liste-institutions-publiques-senegal` | `state_entity` | "institutions du sénégal" |
| `/liste-medias-senegal` | `media` | "médias sénégal" |

**État actuel du code** : ces pages n'existent pas. Note : certaines listes existent sous d'autres URLs (`/assemblee-nationale/deputes`, `/medias`). Utiliser canonical ou redirection pour éviter le contenu dupliqué.

### 3.5 Pages relations / intersections

Pages générées automatiquement aux croisements des métadonnées Directus.

Exemples :
- `/rapports/cour-des-comptes` → documents type=audit_report + institution=Cour des Comptes
- `/rapports/finances-publiques` → documents type=audit_report + tags=finances
- `/documents/cour-des-comptes` → tous les documents liés à la Cour des Comptes
- `/documents/2024` → filtre par date

Chaque intersection = une porte d'entrée SEO supplémentaire.

**Champs Directus exploitables** : `type`, `family`, `audit_institution`, `tags`, `publish_date`.

### 3.6 Pages guides citoyens (longue traîne)

Pages pédagogiques répondant aux questions des citoyens.

| URL | Question ciblée |
|-----|----------------|
| `/guides/comment-consulter-journal-officiel-senegal` | comment consulter le journal officiel |
| `/guides/comment-trouver-loi-senegal` | comment trouver une loi au sénégal |
| `/guides/comment-lire-budget-etat-senegal` | comment lire le budget de l'état |
| `/guides/comment-suivre-elections-senegal` | comment suivre les élections |
| `/guides/comment-acceder-rapports-cour-des-comptes` | rapport cour des comptes |
| `/guides/comment-suivre-conseil-des-ministres` | communiqué conseil des ministres |

Structure type :
```
H1 : Comment consulter le Journal officiel du Sénégal
H2 : Qu'est-ce que le journal officiel ?
H2 : Comment y accéder sur Vie-publique.sn
H2 : Archives disponibles → lien /documents/journal-officiel
H2 : Documents récents → lien /documents/annee/2026
```

Schema.org : `HowTo` + `FAQPage`

**État actuel du code** : ces pages n'existent pas (des guides électoraux existent sous `/elections/`).

---

## 4. Maillage interne

### Principe

Chaque page doit pointer vers les entités liées. Google comprend les relations.

```
Document
   ↕
Institution ← → Thème
   ↕              ↕
Archives    ← → Catégorie
```

### Sur les pages documents (`/documents/[id]/[slug]`)

Afficher des badges/chips cliquables :
- **Type** → `/documents/[category-slug]`
- **Famille** → `/documents/public?family=[family]`
- **Institution d'audit** → `/documents/rapports-audit?institution=[institution]`
- **Année** → `/documents/annee/[year]`
- **Documents liés** → mêmes type/famille/institution (section "Documents similaires")

### Maillage juridique

Quand un document mentionne une loi, un décret ou un arrêté, créer des liens :
- "Ce décret applique la loi X"
- "Ce décret modifie le décret Y"
- "Ce décret abroge l'arrêté Z"

C'est exactement ce que fait Legifrance. Nécessite un champ de relations dans Directus (ou extraction automatique).

### Navigation entre pages

- Pages catégorie → liens vers les familles liées
- Pages année → liens "Année précédente" / "Année suivante"
- Pages institution → liens vers les types de documents publiés

---

## 5. Optimisations SEO on-page

### Title

Pattern recommandé :
```
[Titre document] - [Institution] | Vie Publique Sénégal
```

Pour les pages qui changent souvent (conseil des ministres, nominations), inclure le mois/année dynamiquement.

### Description

Résumé clair en 155 caractères. Si `documents.description` est vide :
- Extraire les premiers 300 caractères de `content_html`
- Ou afficher les métadonnées structurées (institution, date, type)

### Schema.org

| Type de page | Schema actuel | Schema cible |
|-------------|---------------|--------------|
| Documents (détail) | `Article` | Conditionnel selon type : `Report`, `Legislation`, `Dataset` |
| Pages catégories | `CollectionPage` | `CollectionPage` (OK) |
| Institutions | Aucun | `GovernmentOrganization` |
| Députés | Aucun | `Person` + `GovernmentOrganization` |
| Guides | Aucun | `HowTo` + `FAQPage` |
| Podcasts | Aucun | `PodcastEpisode` |
| Homepage | `GovernmentOrganization` | `Organization` (ce n'est PAS un site gouvernemental) |

### Résumé texte indexable

Google n'indexe pas les PDF correctement. Chaque page document doit contenir un résumé texte visible (pas seulement le lien PDF).

---

## 6. Requêtes Google à dominer

### Requêtes à fort volume (documentaire)

```
journal officiel senegal pdf
loi senegal pdf
rapport cour des comptes senegal
budget senegal pdf
constitution senegal pdf
décret nomination senegal
```

### Requêtes à fort volume (institutionnel)

```
liste des ministres senegal
institutions senegal
cour des comptes senegal
assemblee nationale senegal
```

### Requêtes long tail (guides)

```
comment consulter le journal officiel du senegal
comment trouver une loi au senegal
communiqué conseil des ministres aujourd'hui
nominations conseil des ministres sénégal aujourd'hui
```

### Requêtes listes (Wikipedia-style)

```
liste des députés du sénégal
liste des ministres du sénégal
liste des lois du sénégal
```

---

## 7. Estimation du trafic potentiel

### Par type de contenu

| Type | Trafic estimé/an |
|------|-----------------|
| Documents publics (lois, décrets, rapports) | 200 000 |
| Journal officiel | 150 000 |
| Institutions | 100 000 |
| Guides citoyens | 200 000 |
| Élections | 200 000 |
| **Total** | **600 000 – 1 200 000** |

### Par type de page SEO

| Phase | Pages créées | Impact |
|-------|-------------|--------|
| Extension catégories | +17 pages | "lois senegal pdf", "décrets senegal" |
| Archives par année | +60 pages | "journal officiel senegal 2024" |
| Institutions | +200 pages | "cour des comptes senegal" |
| Pages listes | +4 pages | "liste ministres senegal" |
| Guides citoyens | +7 pages | "comment + [sujet] + senegal" |
| Maillage interne | 0 nouvelles | +40% temps sur site, -bounce rate |

---

## 8. Features SEO à fort impact

### 8.1 Moteur de recherche juridique

Recherche full-text dans toutes les lois du Sénégal. Très recherché, aucun concurrent sérieux.

### 8.2 Timeline législative

Afficher l'évolution d'un texte dans le temps :
```
Code de la route : versions 1970 → 2024
```

Google adore les timelines.

### 8.3 Fiches personnalités publiques

Pages enrichies pour les personnalités politiques :
```
/personnalites/ousmane-sonko
/personnalites/bassirou-diomaye-faye
```

**État actuel du code** : `personnalites/[id]/[slug].vue` existe déjà.

### 8.4 Nominations administratives

Pages de nominations par le conseil des ministres — très recherché, très peu exploité au Sénégal.

**État actuel du code** : `nomination-senegal/index.vue` existe, 8 948 impressions mais CTR faible (1,44%).

---

## 9. Pièges à éviter

### Thin content (pages vides)

Ne jamais créer de pages sans contenu substantiel. Chaque page doit contenir :
- Texte explicatif (100+ mots minimum)
- Liste de documents ou d'éléments
- Liens internes contextuels

Sinon Google considère cela comme du thin content → pénalité potentielle.

### Pages avec noindex non voulu

Vérifier régulièrement que les pages de documents ne sont pas accidentellement bloquées. Actuellement 5 251 pages en noindex → la majorité devrait être indexée.

### URLs avec IDs numériques

Les URLs `/documents/4613/rapport-xxx` contiennent un ID sans valeur SEO. Si la migration est trop lourde, garder tel quel mais s'assurer que les canonicals sont bien en place (c'est fait).

---

## 10. Stratégie multi-domaine

### archives.sn ↔ vie-publique.sn

| Domaine | Rôle |
|---------|------|
| `archives.sn` | Stockage documentaire brut |
| `vie-publique.sn` | Pages éditoriales + SEO |

`archives.sn` doit pointer vers `vie-publique.sn` avec des balises canonical pour concentrer l'autorité SEO sur un seul domaine.

---

## Annexe : Champs Directus exploitables

### Types de documents (23 valeurs)

| Valeur Directus | Label | Page catégorie ? |
|----------------|-------|-----------------|
| `official_journal` | Journal officiel | **Fait** |
| `law` | Loi | À créer |
| `decree` | Décret | À créer |
| `ministerial_order` | Arrêté ministériel | À créer |
| `council_of_ministers` | Conseil des ministres | À créer |
| `interministerial_council` | Conseil interministériel | À créer |
| `press_release` | Communiqué | À créer |
| `strategy` | Stratégie | **Fait** |
| `code` | Code | **Fait** |
| `budget` | Budget | **Fait** |
| `audit_report` | Rapport Audit | **Fait** |
| `annual_report` | Rapports d'activité annuels | À créer |
| `sectoral_report` | Rapports sectoriels | À créer |
| `international_report` | Rapports Internationaux | À créer |
| `election` | Élection | À créer |
| `speech` | Discours | À créer |
| `public_notice` | Note au public | À créer |
| `parliament_report` | Rapport Assemblée | À créer |
| `government_bill` | Projet de loi | À créer |
| `bill_proposal` | Proposition de loi | À créer |
| `parliament_question` | Questions de députés | À créer |
| `general_policy_statement` | DPG | À créer |
| `uncategorized` | Non catégorisé | Non pertinent |

### Familles de documents (10 valeurs)

| Valeur | Label |
|--------|-------|
| `legislation` | Législation |
| `accountability` | Rapports publics |
| `budget` | Budget |
| `strategy` | Stratégie |
| `parliament` | Parlementaire |
| `statistics` | Statistique |
| `communication` | Communication |
| `archives` | Archives |
| `international` | International |
| `election` | Élection |

### Autres champs utiles

| Champ | Utilisation SEO |
|-------|----------------|
| `audit_institution` | 5 valeurs (OFNAC, IGE, CENTIF, Cour des Comptes, ARMP) → pages par institution |
| `tags` | Tableau libre → pages thématiques |
| `publish_date` | → pages par année |
| `family` | 10 valeurs → pages par famille |

**Aucune modification du schéma Directus n'est nécessaire.** Les champs existants suffisent pour générer toutes les pages programmatiques.

---

## 11. Plan d'implémentation

### Phase 1 — Débloquer l'indexation (impact immédiat, pas de nouveau code)

| Action | Fichier | Détail |
|--------|---------|--------|
| Auditer les 5 251 pages noindex | `nuxt.config.ts` + pages avec `useHead` noindex | Retirer noindex des `/documents/[id]/[slug]` valides |
| Corriger les 165 erreurs 404 | `nuxt.config.ts` routeRules | Exporter liste GSC, créer redirections 301 |
| Consolider pages legacy JO | `nuxt.config.ts` routeRules | Rediriger `/journal-officiel-senegal` → `/documents/journal-officiel` |
| Migrer Schema.org legacy JO | `documents/[category].vue` | Migrer Periodical, Dataset, GovernmentService depuis l'ancienne page JO |
| Traiter les 18 soft 404 | Pages concernées | Enrichir contenu ou retourner vrai 404 |
| Traiter les 468 pages crawlées non indexées | Pages concernées | Enrichir contenu, maillage interne |

**Pages legacy à consolider** :

| URL legacy | Statut actuel | Action |
|-----------|---------------|--------|
| `/journal-officiel-senegal` | Actif, 4 schemas riches | Rediriger 301 → `/documents/journal-officiel` (après migration Schema.org) |
| `/journal-officiel-senegal/[slug]` | Actif, bug params | Rediriger 301 |
| `/rapport-senegal` | Déjà redirigé | OK |
| `/rapport-senegal/[slug]` | Déjà redirigé | OK |

### Phase 2 — Étendre les catégories documents (ajout config, pas de nouvelle page)

| Action | Fichier |
|--------|---------|
| Ajouter ~17 entrées au `CATEGORY_CONFIG` | `app/pages/documents/[category].vue` |
| Ajouter cartes pour nouvelles catégories | `app/pages/documents/index.vue` |
| Ajouter URLs catégories au sitemap | `server/api/__sitemap__/urls.ts` |

Voir la liste complète des catégories à ajouter dans [section 2 — Niveau 2](#niveau-2--pages-catégories).

### Phase 3 — Pages archives par année (2 fichiers Vue à créer)

| Action | Fichier |
|--------|---------|
| Page index archives | `app/pages/documents/annee/index.vue` |
| Page par année | `app/pages/documents/annee/[year].vue` |
| Ajouter au sitemap | `server/api/__sitemap__/urls.ts` |

**APIs existantes** : `GET /api/documents?year=[year]` + `GET /api/documents/years`

### Phase 4 — Pages institutions (2 fichiers Vue à créer)

| Action | Fichier |
|--------|---------|
| Page index institutions | `app/pages/institutions/index.vue` |
| Page détail institution | `app/pages/institutions/[slug].vue` |
| Ajouter au sitemap | `server/api/__sitemap__/urls.ts` |

**APIs existantes** : `GET /api/state/entities` + `GET /api/state/tree` + `GET /api/state/entities/[slug]`

**Limitation** : Pas de lien direct `state_entity` ↔ `documents` dans Directus.
**Solution** : Faire correspondre `state_entity.name` avec `documents.audit_institution` ou `documents.tags` pour les rapports d'audit. Pour les autres, rechercher dans `documents.source_name`.

### Phase 5 — Maillage interne contextuel (1 API à créer)

| Action | Fichier |
|--------|---------|
| Section "Documents liés" | `app/pages/documents/[id]/[slug].vue` |
| Badges liens contextuels (type, famille, année) | `app/pages/documents/[id]/[slug].vue` |
| **API documents liés** | `server/api/documents/related/[id].ts` — **À CRÉER** |

**Logique API `GET /api/documents/related/[id]`** :
- Documents du même `type` (5 derniers)
- Documents de la même `family` (5 derniers)
- Documents de la même `audit_institution` (si renseigné)
- Dédupliquer + exclure le document courant

### Phase 6 — Schema.org enrichis

| Action | Fichier |
|--------|---------|
| Schema.org conditionnel sur documents (Report, Legislation, Dataset) | `app/pages/documents/[id]/[slug].vue` |
| Schema.org Person sur députés | `app/pages/assemblee-nationale/deputes/[id]/[name].vue` |
| Schema.org Person sur personnalités | `app/pages/personnalites/[id]/[slug].vue` |
| Schema.org PodcastEpisode | `app/pages/podcasts/[id]/[slug].vue` |

### Phase 7 — Pages listes Wikipedia-style

| Action | Fichier |
|--------|---------|
| Liste députés | `app/pages/liste-deputes-senegal.vue` |
| Liste ministres | `app/pages/liste-ministres-senegal.vue` |

Note : utiliser canonical vers les pages existantes (`/assemblee-nationale/deputes`) ou redirection, selon la stratégie choisie.

### Phase 8 — Pages guides citoyens

| Action | Fichier |
|--------|---------|
| Guides (statiques ou CMS) | `app/pages/guides/[slug].vue` ou pages statiques |

### Phase 9 — Optimisation CTR pages existantes

| Action | Fichier |
|--------|---------|
| Title/description dynamique conseil-des-ministres | `app/pages/conseil-des-ministres/index.vue` |
| Title/description dynamique nominations | `app/pages/nomination-senegal/index.vue` |

---

## 12. Récapitulatif des livrables

### Fichiers existants à modifier

| Fichier | Modification | Phase |
|---------|-------------|-------|
| `nuxt.config.ts` | Redirections 301 legacy + retirer disallow | 1 |
| `app/pages/documents/[category].vue` | +17 entrées CATEGORY_CONFIG + migration Schema.org JO | 1-2 |
| `app/pages/documents/index.vue` | Cartes nouvelles catégories | 2 |
| `server/api/__sitemap__/urls.ts` | URLs catégories, années, institutions | 2-4 |
| `app/pages/documents/[id]/[slug].vue` | Documents liés + badges + Schema.org conditionnel | 5-6 |
| `app/pages/assemblee-nationale/deputes/[id]/[name].vue` | Schema.org Person | 6 |
| `app/pages/personnalites/[id]/[slug].vue` | Schema.org Person | 6 |
| `app/pages/podcasts/[id]/[slug].vue` | Schema.org PodcastEpisode | 6 |
| `app/pages/conseil-des-ministres/index.vue` | Title/description CTR | 9 |
| `app/pages/nomination-senegal/index.vue` | Title/description CTR | 9 |

### Nouvelles pages à créer

| Fichier | URL | Phase |
|---------|-----|-------|
| `app/pages/documents/annee/index.vue` | `/documents/annee` | 3 |
| `app/pages/documents/annee/[year].vue` | `/documents/annee/2024` | 3 |
| `app/pages/institutions/index.vue` | `/institutions` | 4 |
| `app/pages/institutions/[slug].vue` | `/institutions/[slug]` | 4 |
| `app/pages/liste-deputes-senegal.vue` | `/liste-deputes-senegal` | 7 |
| `app/pages/liste-ministres-senegal.vue` | `/liste-ministres-senegal` | 7 |
| `app/pages/guides/[slug].vue` | `/guides/*` | 8 |

### Nouvelle API à créer

| Endpoint | Description | Phase |
|----------|-------------|-------|
| `GET /api/documents/related/[id]` | Documents liés (même type/famille/institution) | 5 |

### Timeline recommandée

```
Phase 1  → Débloquer l'indexation + consolider legacy (impact immédiat)
Phase 2  → Étendre CATEGORY_CONFIG (ajout config, fort impact)
Phase 3  → Pages archives par année (2 fichiers Vue)
Phase 4  → Pages institutions (2 fichiers Vue)
Phase 5  → Maillage interne contextuel (1 API + badges)
Phase 6  → Schema.org enrichis
Phase 7  → Pages listes
Phase 8  → Guides citoyens
Phase 9  → Optimisation CTR continue
```

### Estimation d'impact

| Phase | Pages | Requêtes captables |
|-------|-------|-------------------|
| Phase 1 (indexation) | +4 000 débloquées | Pages documents existantes |
| Phase 2 (catégories) | +17 | "lois senegal pdf", "décrets senegal" |
| Phase 3 (archives) | +60 | "journal officiel senegal 2024" |
| Phase 4 (institutions) | +200 | "cour des comptes senegal" |
| Phase 5 (maillage) | 0 nouvelles | +40% temps sur site |
| Phase 6 (Schema.org) | 0 nouvelles | Rich snippets, meilleur CTR |
| Phase 7 (listes) | +4 | "liste ministres senegal" |
| Phase 8 (guides) | +7 | "comment + [sujet] + senegal" |
| Phase 9 (CTR) | 0 nouvelles | +CTR sur pages existantes |

**Total** : De **973 pages indexées** → **5 000+ pages indexées**.
