# Stratégie SEO — Vie Publique Sénégal

> Objectif : Devenir la référence documentaire publique au Sénégal (le "Legifrance de l'Afrique francophone")
> Cible : >1 million de visites/an via SEO programmatique
> Dernière mise à jour : juin 2026
>
> **⚠️ Priorités révisées par la donnée GSC (juin 2026) — voir [`gsc-analyse-2026-06.md`](./gsc-analyse-2026-06.md).**
> L'export Search Console 12 mois (153 289 clics / 4 018 526 impressions) **recadre les priorités** :
>
> 1. **Conseil des ministres / nominations** = gisement n°1 (**303k impr/an, ~1,3 % CTR**) → problème de **CTR**, pas de classement. Action : titres datés + fraîcheur + FAQ.
> 2. **Personnalités politiques** = 277k impr, 1ʳᵉ source de clics, bcp en **page 2** → Schema.org Person + enrichissement.
> 3. **Page liste « gouvernement / ministres »** = demande directe (13,7k impr).
> 4. **PDF `/docs/`** (664k impr) : ne PAS forcer de jumeaux HTML ni tracker dans GA (décision juin 2026, cf. `gsc-analyse-2026-06.md` §4.D) — PDF + page HTML coexistent déjà ; trafic PDF → Search Console.
>
> **Indexation déjà débloquée** : 16 512 pages indexées (vs 973 estimées ici) → la Phase 1 est faite ; le sujet est désormais le **CTR**, pas l'indexation.
> Les **rapports d'organes de contrôle** (~31k impr/an) sont **10× plus petits** que le Conseil des ministres : bonne page evergreen (livrée), mais pas le levier prioritaire.

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

- ~7 800 documents publiés dans le CMS (avril 2026)
- Données structurées (type, famille, institution, date, thèmes)
- Relations entre textes (loi → décret → arrêté)
- Contenu **evergreen** (une constitution sera recherchée dans 10 ans)

### Calcul de volume (chiffres réels — avril 2026)

| Donnée source | Volume actuel | Pages générables |
|---------------|---------------|-----------------|
| Documents individuels | ~7 800 publiés | ~7 800 (16 512 pages indexées au total en juin 2026 — voir GSC) |
| Catégories documents | 5 existantes (+17 prévues) | 22 |
| Archives par année (global) | 71 années dans le CMS | 71 |
| Archives par année × catégorie | 71 × 5 catégories | 355 |
| Institutions | ~20 | 20 |
| Pages listes | — | 4 |
| Guides citoyens | — | 7 |
| **Total réaliste** | | **~8 300 pages SEO** |

> **Note** : un volume de ~40 000 « combinaisons » (type × année × institution) serait théoriquement possible mais déconseillé : la majorité des combinaisons produirait des pages vides ou thin content, que Google pénalise au lieu d'indexer. Il vaut mieux créer uniquement les pages ayant un contenu réel.

### Objectif réaliste d'indexation

> **Mis à jour juin 2026 (GSC) : objectif d'indexation DÉPASSÉ.** L'index est passé de ~10 159
> pages (28/03/2026) à **16 512** (12/06/2026). Le goulot n'est plus l'indexation mais le **CTR**
> (convertir les 4 M d'impressions/an en clics — surtout Conseil des ministres & Personnalités).

| Métrique | Actuel (juin 2026) | Objectif | Comment |
|----------|-------------------|----------|---------|
| Pages indexées | **16 512** | maintenir + qualité | Objectif initial (~5 000) dépassé |
| Pages non indexées | 10 461 | réduire le thin content | Majorité = PDF `/docs/` (non indexables, normal) |
| CTR moyen (Search) | **3,8 %** | ~6–7 % | Titres datés + fraîcheur + FAQ sur clusters à fort volume |
| Clics / Impressions (12 mois) | 153 289 / 4 018 526 | — | Référence de suivi |

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
| `/documents/annee/2024` | Tous les documents publiés en 2024 |
| `/documents/journal-officiel/annee/2024` | Journal Officiel de 2024 uniquement |
| `/documents/[category]/annee/[year]` | Documents d'une catégorie pour une année |

**État actuel du code** : **FAIT** (avril 2026)
- `app/pages/documents/annee/index.vue` — index archives (71 années, compteurs)
- `app/pages/documents/annee/[year].vue` — page année globale (tous documents)
- `app/pages/documents/[category]/annee/[year].vue` — page année par catégorie (5 catégories)
- SEO : canonical, CollectionPage schema, OG/Twitter, navigation année précédente/suivante
- Sitemap : 427 URLs ajoutées (1 index + 71 globales + 355 par catégorie)
- `[category].vue` déplacé vers `[category]/index.vue` pour supporter les sous-routes

### Niveau 3 — Pages entités (institutions)

Pages de type fiche pour chaque institution publique.

| URL | Source Directus |
|-----|----------------|
| `/institutions` | `state_entity` (collection existante) |
| `/institutions/cour-des-comptes` | `state_entity` + documents liés |
| `/institutions/assemblee-nationale` | `state_entity` |

Contenu : description, missions, documents publiés, dirigeants, sous-entités.

**État actuel du code** : ces pages générales n'existent pas (`/etat-senegal/annuaire/[slug]` existe mais est bloqué en robots.txt). En revanche, une **variante ciblée est FAITE** pour les 5 organismes de contrôle (`/documents/rapports-audit/organisme/<slug>`) — voir §3.5.

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

### 3.2 Pages archives chronologiques — **FAIT**

→ Voir [niveau 3](#niveau-3--pages-archives-chronologiques).

Fichiers créés :

- `documents/annee/index.vue` — index archives
- `documents/annee/[year].vue` — page année globale
- `documents/[category]/annee/[year].vue` — page année par catégorie
- `[category].vue` → `[category]/index.vue` (restructuration routing)

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

**État actuel** : la 1ʳᵉ intersection est **FAITE** (juin 2026) — pages dédiées par organisme
de contrôle sous `/documents/rapports-audit/organisme/<slug>` (5 institutions : Cour des
Comptes, OFNAC, IGE, CENTIF, ARMP), pour cibler « rapport `<organisme>` sénégal ».
Implémentation :

- Config partagée `AUDIT_INSTITUTION_PAGES` (slug, nom, intro éditoriale) dans
  `types/document.ts` — importée par la page **et** le sitemap.
- Filtre **dès le SSR** via `useDocuments({ auditInstitution })` (option ajoutée + verrou
  de la synchro URL pour garder l'URL propre, sans `?organisme=`).
- Page `app/pages/documents/rapports-audit/organisme/[slug].vue` : H1 unique, titre sans
  marque, **paragraphe d'intro éditorial**, JSON-LD `CollectionPage` + `ItemList`, maillage
  interne vers les autres organismes.
- Page catégorie `[category]/index.vue` : chips organisme convertis en **liens crawlables**
  vers les pages dédiées ; `canonical` des URLs `?organisme=X` redirigé vers la page dédiée
  (funnel des signaux du param vers la vraie URL).
- Sitemap : 5 URLs ajoutées.

> Segment `/organisme/` retenu pour éviter la collision de route avec la page archive
> `/documents/rapports-audit/annee`. Ce pattern est **réplicable** pour `type × thème (tags)`
> (ex. `/documents/theme/finances-publiques`) et `type × institution`.

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

### Optimiser une page catégorie / listing pour ranker #1

Une page « liste » nue (juste des items + pagination) reste du **quasi thin-content** : rien
n'y cible la requête. Leviers qui font passer ce type de page en 1ʳᵉ position, **par ordre
d'impact** (modèle de référence : pages organisme `/documents/rapports-audit/organisme/<slug>`) :

1. **Paragraphe d'intro éditorial (200+ mots)** contenant la requête cible en langage naturel
   (pas de bourrage). C'est le levier n°1.
2. **H1 = la requête exacte** (« Rapports de la Cour des Comptes du Sénégal », pas « Rapports »).
   Un seul H1 par page.
3. **Title + description calés sur la formulation réelle** des internautes — inclure « pdf »,
   « sénégal », l'année quand c'est pertinent. **Source = export GSC** (onglet Requêtes).
4. **Bloc FAQ (schema `FAQPage`)** : 3-5 questions type « C'est quoi l'OFNAC ? », « Comment
   consulter le Journal officiel ? » → capte les *People Also Ask* + rich snippet.
5. **Maillage interne à ancre descriptive** : lier vers la catégorie avec un texte d'ancre =
   la requête, depuis le hub `/documents`, le footer et les pages détail.
6. **Fraîcheur** : afficher dates + documents récents (signal d'actualité).

> ⚠️ **`<meta name="keywords">` est ignorée par Google depuis 2009** — inutile. Les « mots-clés »
> se placent dans le **texte visible** (intro, H1, FAQ, ancres), jamais dans une balise meta.
>
> ⚠️ **Le champ `tags` Directus n'est PAS une meta** : il sert à **générer des pages thématiques**
> (intersections — voir §3.5), pas à « taguer » la page courante pour Google. N'en créer que
> pour les tags ayant assez de documents (sinon thin content).

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

| Phase | Pages créées | Impact | Statut |
|-------|-------------|--------|--------|
| Extension catégories | +17 pages | "lois senegal pdf", "décrets senegal" | À faire |
| Archives par année | +427 pages | "journal officiel senegal 2024" | **FAIT** |
| Institutions | +20 pages | "cour des comptes senegal" | À faire |
| Pages listes | +4 pages | "liste ministres senegal" | À faire |
| Guides citoyens | +7 pages | "comment + [sujet] + senegal" | À faire |
| Maillage interne | 0 nouvelles | +40% temps sur site, -bounce rate | À faire |

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
| `audit_institution` | 5 valeurs (OFNAC, IGE, CENTIF, Cour des Comptes, ARMP) → pages par institution — **FAIT** (`/documents/rapports-audit/organisme/<slug>`) |
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

### Phase 3 — Pages archives par année — **FAIT** (avril 2026)

| Action | Fichier | Statut |
|--------|---------|--------|
| Page index archives | `app/pages/documents/annee/index.vue` | **FAIT** |
| Page par année (globale) | `app/pages/documents/annee/[year].vue` | **FAIT** |
| Page par année par catégorie | `app/pages/documents/[category]/annee/[year].vue` | **FAIT** |
| Restructuration routing catégories | `[category].vue` → `[category]/index.vue` | **FAIT** |
| Ajouter au sitemap | `server/api/__sitemap__/urls.ts` | **FAIT** (427 URLs) |

**APIs existantes utilisées** : `GET /api/documents?year=[year]` + `GET /api/documents/years`

**Résultat** : 427 pages ajoutées au sitemap (1 index + 71 années globales + 355 années × 5 catégories). SEO complet : canonical, CollectionPage schema, OG/Twitter, navigation années adjacentes.

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

### Fichiers existants modifiés

| Fichier | Modification | Phase | Statut |
|---------|-------------|-------|--------|
| `nuxt.config.ts` | Redirections 301 legacy + retirer disallow | 1 | À faire |
| `app/pages/documents/[category]/index.vue` | +17 entrées CATEGORY_CONFIG + migration Schema.org JO | 1-2 | À faire |
| `app/pages/documents/index.vue` | Cartes nouvelles catégories | 2 | À faire |
| `server/api/__sitemap__/urls.ts` | URLs catégories, années, institutions | 2-4 | **Années FAIT** |
| `app/pages/documents/[id]/[slug].vue` | Documents liés + badges + Schema.org conditionnel | 5-6 | À faire |
| `app/pages/assemblee-nationale/deputes/[id]/[name].vue` | Schema.org Person | 6 | À faire |
| `app/pages/personnalites/[id]/[slug].vue` | Schema.org Person | 6 | À faire |
| `app/pages/podcasts/[id]/[slug].vue` | Schema.org PodcastEpisode | 6 | À faire |
| `app/pages/conseil-des-ministres/index.vue` | Title/description CTR | 9 | À faire |
| `app/pages/nomination-senegal/index.vue` | Title/description CTR | 9 | À faire |

> Note : `[category].vue` a été déplacé vers `[category]/index.vue` (Phase 3) pour supporter les sous-routes `/[category]/annee/[year]`.

### Nouvelles pages à créer

| Fichier | URL | Phase | Statut |
|---------|-----|-------|--------|
| `app/pages/documents/annee/index.vue` | `/documents/annee` | 3 | **FAIT** |
| `app/pages/documents/annee/[year].vue` | `/documents/annee/2024` | 3 | **FAIT** |
| `app/pages/documents/[category]/annee/[year].vue` | `/documents/journal-officiel/annee/2024` | 3 | **FAIT** |
| `app/pages/documents/rapports-audit/organisme/[slug].vue` | `/documents/rapports-audit/organisme/ofnac` | 4 (variante) | **FAIT** (juin 2026) |
| `app/pages/institutions/index.vue` | `/institutions` | 4 | À faire |
| `app/pages/institutions/[slug].vue` | `/institutions/[slug]` | 4 | À faire |
| `app/pages/liste-deputes-senegal.vue` | `/liste-deputes-senegal` | 7 | À faire |
| `app/pages/liste-ministres-senegal.vue` | `/liste-ministres-senegal` | 7 | À faire |
| `app/pages/guides/[slug].vue` | `/guides/*` | 8 | À faire |

### Nouvelle API à créer

| Endpoint | Description | Phase | Statut |
|----------|-------------|-------|--------|
| `GET /api/documents/related/[id]` | Documents liés (même type/famille/institution) | 5 | À faire |

### Timeline recommandée

```text
Phase 1  → Débloquer l'indexation + consolider legacy (impact immédiat)
Phase 2  → Étendre CATEGORY_CONFIG (ajout config, fort impact)
Phase 3  → Pages archives par année — FAIT ✓
Phase 4  → Pages institutions (2 fichiers Vue)
Phase 5  → Maillage interne contextuel (1 API + badges)
Phase 6  → Schema.org enrichis
Phase 7  → Pages listes
Phase 8  → Guides citoyens
Phase 9  → Optimisation CTR continue
```

### Estimation d'impact (chiffres réels — avril 2026)

| Phase | Pages | Requêtes captables | Statut |
|-------|-------|-------------------|--------|
| Phase 1 (indexation) | +4 000 débloquées | Pages documents existantes | À faire |
| Phase 2 (catégories) | +17 | "lois senegal pdf", "décrets senegal" | À faire |
| Phase 3 (archives) | **+427** | "journal officiel senegal 2024" | **FAIT** |
| Phase 4 (institutions) | +20 | "cour des comptes senegal" | À faire |
| Phase 5 (maillage) | 0 nouvelles | +40% temps sur site | À faire |
| Phase 6 (Schema.org) | 0 nouvelles | Rich snippets, meilleur CTR | À faire |
| Phase 7 (listes) | +4 | "liste ministres senegal" | À faire |
| Phase 8 (guides) | +7 | "comment + [sujet] + senegal" | À faire |
| Phase 9 (CTR) | 0 nouvelles | +CTR sur pages existantes | À faire |

**Situation actuelle** : **973 pages indexées** sur **8 298 dans le sitemap** → objectif **~5 000 pages indexées** (principalement via Phase 1 : retrait du noindex).
