# PRD - Annuaire des Personnalités Publiques

**Dernière mise à jour** : 2026-05-30
**Status** : Migration terminée (positions -> public_persons + public_person_appointments)

---

## 1. Objectif

Fournir un annuaire complet et accessible des personnalités publiques du Sénégal : membres du gouvernement, hauts fonctionnaires nommés, magistrats, députés. L'annuaire permet aux citoyens de consulter qui occupe quel poste, depuis quand, et avec quelles informations de profil.

**Migration terminée** : l'annuaire est passé d'un modèle centré "nominations" (collection `positions`) à un modèle centré "personnalités publiques" (collections `public_persons` + `public_person_appointments`), permettant l'historique des fonctions par personne. Toutes les pages (liste, détail, gouvernement, nominations) sont migrées et l'ancien code legacy a été supprimé.

---

## 2. Périmètre fonctionnel actuel (legacy)

### 2.1 Pages et URLs actuelles

| Page | URL | Collection CMS | Status |
|------|-----|---------------|--------|
| Hub Annuaires | `/annuaires` | - | Conservé (+ entrée Gouvernement ajoutée) |
| Annuaire personnalités | `/personnalites-senegal` | `public_persons` + `public_person_appointments` | **DONE** (nouvelle page) |
| Gouvernement | `/gouvernement-senegal` | `public_persons` + `public_person_appointments` | **DONE** (migré) |
| Fiche personnalité | `/personnalites/[id]/[slug]` | `public_persons` + `public_person_appointments` | **DONE** (migrée) |
| Nominations | `/nomination-senegal` | `public_persons` + `public_person_appointments` | **DONE** (migrée vers usePublicPersons) |
| Magistrature | `/justice/magistrature` | JSON statique | Inchangé pour l'instant |
| Conseil des ministres | `/conseil-des-ministres` | CMS news | Inchangé |

### 2.2 Fonctionnalités par page (existant)

#### `/nomination-senegal` - Annuaire nominations

- Recherche textuelle (nom, rôle, organisation)
- Filtres : type de nomination (Ministre, Directeur, PCA...), genre (Homme/Femme)
- Pagination server-side (25 items/page)
- Compteurs par type et par genre
- Synchronisation filtres <-> URL (`?q=...&type=...&gender=...&page=...`)
- Cards avec photo, nom, rôle, organisation, date de nomination
- SEO : Schema.org WebPage + BreadcrumbList + GovernmentOrganization

#### `/gouvernement-senegal` - Gouvernement actuel

- Premier Ministre mis en avant
- Grille des Ministres (3 colonnes desktop)
- Grille des Secrétaires d'État
- Statistiques : total, ministres, secrétaires, femmes/hommes
- Filtre automatique : seuls les membres actifs (sans `endDate` ou `endDate >= aujourd'hui`)
- Liens vers les fiches individuelles `/personnalites/[id]/[slug]`
- SEO : Schema.org GovernmentOrganization + Person

#### `/personnalites/[id]/[slug]` - Fiche personnalité

- Photo, nom, rôle, organisation
- Date de nomination, date de fin (si applicable)
- Formation, prédécesseur, note/rating
- Biographie HTML (si disponible dans le CMS)
- Structure URL par ID (requête rapide) + slug (SEO)
- Redirect legacy `/portraits/*` -> `/personnalites/*`
- SEO : Schema.org Person

#### `/justice/magistrature` - Magistrature

- Liste des nominations dans la magistrature
- Affichage : nom, photo, nouveau poste, ancien poste, juridiction, date, prédécesseur
- Tri par date de nomination (décroissant)
- Source de données : fichier JSON statique (~80+ magistrats)

#### `/conseil-des-ministres` - Communiqués

- Liste des communiqués officiels (catégorie "Conseil des ministres" du CMS)
- Recherche et pagination
- Tri par date (plus récent en premier)
- Page détail avec contenu HTML complet, date, image

---

## 3. Migration CMS : `positions` -> `public_persons` + `public_person_appointments`

### 3.1 Problème avec le modèle actuel (`positions`)

La collection `positions` est un modèle plat : **1 ligne = 1 personne + 1 nomination**. Limites :

- **Pas d'historique** : si une personne change de poste, soit on crée une 2e ligne (doublon de personne), soit on écrase l'ancienne nomination.
- **Données personne mélangées avec les données de poste** : bio, formation, réseaux sociaux sont sur la même ligne que le rôle et la date de nomination.
- **Pas de relation prédécesseur/successeur structurée** : le champ `predecessor` est un simple texte libre (pas une FK).
- **Pas de source documentaire** : impossible de lier une nomination à un décret ou document officiel.

### 3.2 Nouveau modèle (cible)

Deux collections normalisées dans le groupe "Annuaire" du CMS :

#### Collection `public_persons` (la personne)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| id | integer (PK, auto) | oui | Identifiant unique |
| status | string | oui | draft / published / archived |
| sort | integer | non | Ordre d'affichage |
| full_name | string | oui | Nom complet |
| slug | string | oui | Slug URL |
| sexe | string (male/female) | oui | Genre |
| registration_number | string (unique) | non | Matricule (usage futur) |
| short_bio | text | non | Biographie courte |
| long_bio | text (rich HTML) | non | Biographie détaillée |
| education | text | non | Formation |
| photo | uuid -> directus_files | non | Photo de profil |
| facebook | text | non | Lien Facebook |
| twitter | text | non | Lien Twitter/X |
| instagram | text | non | Lien Instagram |
| tiktok | text | non | Lien TikTok |
| linkedin | text | non | Lien LinkedIn |
| website | text | non | Site web personnel |
| current_appointment | integer -> public_person_appointments | non | Nomination actuelle (M2O) |
| ~~legacy_position_id~~ | ~~integer~~ | ~~non~~ | ~~Ancien positions.id~~ — **SUPPRIMÉ** : les IDs ont été préservés lors de la migration, ce champ n'est plus utilisé |

#### Collection `public_person_appointments` (les nominations/fonctions)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| id | integer (PK, auto) | oui | Identifiant unique |
| status | string | oui | draft / published / archived |
| sort | integer | non | Ordre d'affichage |
| person | integer -> public_persons | oui | La personnalité (M2O) |
| position_title | text | oui | Intitulé du poste (ex: "Ministre des Finances") |
| position_category | string | oui | Catégorie (Ministre, Directeur général, PCA, Ambassadeur...) |
| position_category_slug | string | non | Slug de la catégorie (pour filtres URL) |
| organization_label | text | oui | Organisme (ex: "Ministère de l'Économie") |
| appointment_date | datetime | oui | Date de prise de fonction |
| end_date | datetime | non | Date de fin de fonction |
| end_reason | string | non | Motif fin : retirement, dismissed, reassigned, resigned, deceased, replaced, other |
| is_current | boolean | oui | Nomination en cours (true/false) |
| predecessor | integer -> public_persons | non | Prédécesseur (relation M2O) |
| predecessor_label | string | non | Nom prédécesseur (fallback texte) |
| successor | integer -> public_persons | non | Successeur (relation M2O) |
| successor_label | string | non | Nom successeur (fallback texte) |
| source_label | string | non | Libellé source (ex: "Décret n°2024-xxx") |
| source_document | integer -> documents | non | Document officiel lié (M2O) |
| source_link | string | non | URL source externe |
| source_excerpt | text | non | Extrait du document source |
| end_source_label | string | non | Source de la fin de fonction |
| end_source_document | integer -> documents | non | Document de fin lié (M2O) |
| end_source_excerpt | text | non | Extrait document de fin |
| notes | text | non | Notes internes |

#### Relations clés

```
public_persons (1) ──→ (N) public_person_appointments
    │                           │
    ├── current_appointment ←───┘  (raccourci vers la nomination active)
    │
    └── (legacy_position_id supprimé — IDs préservés lors de la migration)

public_person_appointments.predecessor ──→ public_persons
public_person_appointments.successor   ──→ public_persons
public_person_appointments.source_document ──→ documents
public_person_appointments.end_source_document ──→ documents
```

### 3.3 Mapping ancien -> nouveau

| `positions` (ancien) | `public_persons` (nouveau) | `public_person_appointments` (nouveau) |
|----------------------|----------------------------|---------------------------------------|
| id | id (préservé) | - |
| name | full_name | - |
| slug | slug | - |
| sexe (Monsieur/Madame) | sexe (male/female) | - |
| bio | long_bio | - |
| formation | education | - |
| photo | photo | - |
| facebook, twitter... | facebook, twitter... | - |
| rating | - (supprimé) | - |
| - | - | position_title (= ancien role) |
| type | - | position_category |
| role | - | position_title |
| organisation | - | organization_label |
| nominationDate | - | appointment_date |
| endDate | - | end_date |
| predecessor (texte) | - | predecessor_label + predecessor (FK) |
| description | - | notes ou source_excerpt |

### 3.4 Problèmes de migration identifiés

#### P1 : Collision d'IDs — RÉSOLU

Les anciennes URLs Google sont du type `/personnalites/5/ahmadou-al-aminou-lo` où `5` = `positions.id`.

**Solution appliquée** : les IDs de l'ancienne collection `positions` ont été préservés dans `public_persons` lors de la migration. Pas de collision, pas besoin de fallback `legacy_position_id`. Les anciennes URLs fonctionnent directement.

#### P2 : Changement de valeurs pour le genre

Ancien : `Monsieur` / `Madame` -> Nouveau : `male` / `female`

**Impact** : les filtres sur les API et l'affichage doivent être adaptés.

#### P3 : Champ `rating` supprimé

Le champ `rating` existait sur `positions` mais n'existe plus sur `public_persons`.

**Impact** : retirer l'affichage du rating sur la fiche personnalité.

#### P4 : Champ `type` éclaté en relation

Ancien : `positions.type` = texte libre sur la même ligne.
Nouveau : `public_person_appointments.position_category` sur la table des nominations.

**Impact** : pour afficher le type d'une personne, il faut passer par sa nomination actuelle (`current_appointment -> position_category`).

#### P5 : Prédécesseur structuré

Ancien : `positions.predecessor` = texte libre ("Moussa Diop").
Nouveau : `public_person_appointments.predecessor` = FK vers `public_persons` + `predecessor_label` en fallback.

**Impact** : le prédécesseur peut maintenant être cliquable (lien vers sa fiche).

---

## 4. Architecture cible

### 4.1 Nouvelles pages et URLs

| Page | URL | Collection CMS | Nouveau |
|------|-----|---------------|---------|
| **Annuaire personnalités** | `/personnalites-senegal` | `public_persons` + `public_person_appointments` | OUI |
| Fiche personnalité | `/personnalites/[id]/[slug]` | `public_persons` + `public_person_appointments` | MIGRÉ |
| Gouvernement actuel | `/gouvernement-senegal` | `public_persons` + `public_person_appointments` | MIGRÉ |
| Nominations | `/nomination-senegal` | `public_persons` + `public_person_appointments` | **DONE** (migrée) |

**Choix URL de la nouvelle page liste** : `/personnalites-senegal`
- Cohérent avec le pattern existant (`nomination-senegal`, `gouvernement-senegal`)
- SEO : mot-clé "personnalités" + "Sénégal" dans l'URL
- Évite de squatter `/personnalites` qui est le préfixe des fiches détail (`/personnalites/[id]/[slug]`)

### 4.2 Nouvelles routes API

| Endpoint | Méthode | Source | Cache | Usage |
|----------|---------|--------|-------|-------|
| `/api/public-persons` | GET | `public_persons` + `current_appointment` | 1h | Liste paginée avec nomination actuelle |
| `/api/public-persons/:id` | GET | `public_persons` + appointments | 1h | Détail + historique nominations |
| `/api/public-persons/stats` | GET | `public_person_appointments` | 1h | Stats par catégorie, genre |
| ~~`/api/public-persons/resolve/:id/:slug`~~ | ~~GET~~ | - | - | ~~Supprimé (IDs préservés, pas besoin de résolution)~~ |
| `/api/government/current` | GET | `public_persons` + `public_person_appointments` | 6h | Gouvernement actuel (migré) |

### 4.3 Nouveaux composables

| Composable | Responsabilité |
|------------|---------------|
| `usePublicPersons()` | Liste : filtres (catégorie, genre, recherche), pagination, sync URL |
| `usePublicPerson(id)` | Détail : données personne + historique nominations + réseaux sociaux |
| `useGovernment()` | Migré vers les nouvelles collections |

### 4.4 Nouveaux types TypeScript

```typescript
// types/public-person.ts

export interface PublicPerson {
  id: number;
  full_name: string;
  slug: string;
  sexe: 'male' | 'female';
  short_bio?: string | null;
  long_bio?: string | null;
  education?: string | null;
  photo?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  website?: string | null;
  current_appointment?: PublicPersonAppointment | null;
}

export interface PublicPersonAppointment {
  id: number;
  position_title: string;
  position_category: string;
  position_category_slug?: string | null;
  organization_label: string;
  appointment_date: string;
  end_date?: string | null;
  end_reason?: string | null;
  is_current: boolean;
  predecessor_label?: string | null;
  predecessor?: PublicPerson | null; // relation
  successor_label?: string | null;
  successor?: PublicPerson | null;   // relation
  source_label?: string | null;
  source_link?: string | null;
  notes?: string | null;
}
```

### 4.5 Data flow cible

```
Directus CMS
  ├── public_persons
  └── public_person_appointments
        │
        ▼
  Server API Routes (cache 1h-6h)
  ├── /api/public-persons        (liste + filtres)
  ├── /api/public-persons/:id    (détail + historique)
  ├── /api/public-persons/stats  (statistiques)
  └── /api/government/current    (gouvernement migré)
        │
        ▼
  Composables métier
  ├── usePublicPersons()
  ├── usePublicPerson()
  └── useGovernment()
        │
        ▼
  Pages Vue
  ├── /personnalites-senegal     (nouvelle liste)
  ├── /personnalites/[id]/[slug] (détail migré)
  └── /gouvernement-senegal      (migré)
```

---

## 5. Spécifications fonctionnelles cibles

### 5.1 Page `/personnalites-senegal` - Annuaire des personnalités publiques

**Titre SEO** : `Annuaire des personnalités publiques au Sénégal | Vie Publique Sénégal`

**Fonctionnalités** :
- Recherche textuelle sur `full_name`, `current_appointment.position_title`, `current_appointment.organization_label`
- Filtres :
  - Par catégorie de poste (Ministre, Directeur général, PCA, Ambassadeur...) via `position_category_slug`
  - Par genre (Homme/Femme) via `sexe`
- Pagination server-side (25 items/page)
- Compteurs dynamiques par catégorie et par genre
- Sync URL : `?q=...&category=...&gender=...&page=...`
- Cards affichant : photo, nom, poste actuel, organisation, date de nomination
- Indicateur "en fonction" / "fin de fonction" via `is_current`
- SEO : Schema.org WebPage + BreadcrumbList + GovernmentOrganization

**Scope des personnalités affichées** :
- Ministres, Premier Ministre, Secrétaires d'État
- Directeurs généraux, Directeurs
- PCA, PCS
- Gouverneurs, Préfets, Sous-préfets
- Ambassadeurs, Consuls généraux
- DAGE, Inspecteurs
- Toute personnalité publiée dans `public_persons`

### 5.2 Page `/personnalites/[id]/[slug]` - Fiche personnalité (migrée)

**Titre SEO** : `{Nom complet} - Profil public, fonctions et nominations | Vie Publique Sénégal`

**Données affichées depuis `public_persons`** :
- full_name, photo
- short_bio (résumé)
- long_bio (biographie HTML complète)
- sexe
- education
- Réseaux sociaux (facebook, twitter, instagram, tiktok, linkedin, website)

**Données affichées depuis `public_person_appointments`** :
- Nomination actuelle (via `current_appointment`) : position_title, organization_label, appointment_date
- Historique des fonctions : liste chronologique de toutes les nominations
- Pour chaque nomination : position_title, organization_label, appointment_date, end_date, end_reason
- Prédécesseur (cliquable si FK renseignée, sinon texte via predecessor_label)
- Successeur (idem)
- Source documentaire si disponible (source_label, lien vers document)

**Éléments retirés vs l'ancien** :
- Champ `rating` : supprimé
- Champ `portrait` (texte) : remplacé par `short_bio` et `long_bio`

### 5.3 Page `/gouvernement-senegal` (migrée + refonte design/SEO)

Alimentée par les nouvelles collections, avec refonte complète du design et du SEO (mai 2026).

**Data flow** :

- API : `GET /api/government/current` → filtre `public_persons` où `current_appointment.position_category _in ['Premier Ministre', 'Ministre', "Secrétaire d'État"]` et `is_current = true`
- Le filtre ne vérifie **pas** le `status` de l'appointment (uniquement `public_persons.status = published`)
- Le champ M2O `current_appointment` sur `public_persons` doit être renseigné pour que la personne apparaisse
- PM : `position_category = "Premier Ministre"` → card hero photo-centric
- Ministres : `position_category = "Ministre"` → grille portrait cards
- Secrétaires d'État : `position_category = "Secrétaire d'État"` → même grille
- Liens vers `/personnalites/{public_persons.id}/{slug}`

**Design (refonte mai 2026)** :

- Layout pleine page `min-h-screen bg-gray-50 dark:bg-gray-950` (suppression du wrapper `UCard`)
- Header sticky avec titre + stats inline (badges compacts : membres, femmes, %)
- PM : card hero avec photo portrait à gauche + infos à droite (desktop), photo pleine largeur + gradient overlay (mobile)
- Ministres + Secrétaires : cards photo portrait `aspect-[3/4]` avec gradient overlay `from-black/80 via-black/20 to-transparent`, texte blanc en overlay, hover `scale-105 + shadow-lg`
- Grille responsive : `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- Photo par défaut `/unknown_member.webp` si pas de photo
- Suppression des icônes "IA" devant les titres de section
- Style inspiré de la page députés (`/assemblee-nationale/deputes`)

**SEO (refonte mai 2026)** :

- Title : `Gouvernement du Sénégal — Composition actuelle sous Bassirou Diomaye Faye | Vie Publique Sénégal`
- Meta description enrichie avec mots-clés : "gouvernement actuel sénégal", "liste ministres sénégal", etc.
- 4 schemas JSON-LD : WebSite, WebPage, BreadcrumbList (3 niveaux), GovernmentOrganization (avec chaque membre en Person)
- Schema GovernmentOrganization dynamique via `computed()` pour inclure les données réactives
- Meta géographiques : `geo.region`, `geo.position`, `ICBM` (coordonnées Dakar)
- Canonical, Open Graph, Twitter Card

### 5.4 Logique de résolution d'URL sur la page détail

La page `/personnalites/[id]/[slug]` gère 2 cas :

**Cas A — URL par ID (nominal)** :
```
/personnalites/{public_persons.id}/{public_persons.slug}
```
- Requête : `public_persons` WHERE `id = :id`
- Si trouvé : afficher la fiche, canonical = cette URL

**Cas B — Rien trouvé** :
- Retourner une **erreur 404** propre

**Note** : la logique de résolution legacy (fallback par `legacy_position_id`) a été supprimée car les IDs de l'ancienne collection `positions` ont été préservés lors de la migration vers `public_persons`. Les anciennes URLs Google `/personnalites/{positions.id}/...` fonctionnent directement puisque `positions.id == public_persons.id`.

### 5.5 Page `/nomination-senegal` — DONE

**Stratégie appliquée** : Option A — la page a basculé sur `usePublicPersons()` (mêmes API `public_persons` + `public_person_appointments`). Elle affiche les personnalités triées par date de nomination décroissante, constituant une vue filtrée du nouvel annuaire.

**Nettoyage effectué** :
- Supprimé `server/api/nominations/index.get.ts`, `[id].get.ts`, `stats.get.ts` (anciennes API `positions`)
- Supprimé `composables/useNominations.ts` (ancien composable)
- Supprimé `legacy_position_id` de l'API, du type TypeScript et du composable `usePublicPerson`
- Page `/nomination-senegal` réécrite avec `usePublicPersons({ sort: '-current_appointment.appointment_date' })`
- Menu mis à jour : entrée "Personnalités publiques" → `/personnalites-senegal`

**Évolution future possible** : redirection 301 de `/nomination-senegal` vers `/personnalites-senegal` si la page n'a plus de raison d'exister séparément.

### 5.6 Redirections SEO

| Ancienne URL | Nouvelle URL | Type |
|-------------|-------------|------|
| `/portraits/*` | `/personnalites/*` | 301 (existant dans nuxt.config) |
| `/personnalites/{positions.id}/{slug}` | Fonctionne directement (IDs préservés lors de la migration) | - |
| `/nomination-senegal` | Conservé comme vue filtrée (migrée vers `usePublicPersons`) | - |

---

## 6. Hub `/annuaires` - Liste complète

Le hub regroupe tous les annuaires du site (7 entrées) :

| Annuaire | URL | Source de données | Status |
|----------|-----|-------------------|--------|
| **Gouvernement** | `/gouvernement-senegal` | `public_persons` + `public_person_appointments` | **DONE** (migré) |
| **Personnalités publiques** | `/personnalites-senegal` | `public_persons` + `public_person_appointments` | **DONE** (nouveau) |
| Nominations | `/nomination-senegal` | `public_persons` + `public_person_appointments` | **DONE** (migrée) |
| Sites web publics | `/annuaire-sites-publics-senegal` | CSV GitHub (repo externe), parsé avec PapaParse | Existant |
| Médias reconnus | `/medias` | CMS Directus (status="compliant") | Existant |
| Aide à la presse | `/medias/aide-presse` | JSON statique `assets/data/medias-fadp.json` | Existant |
| Députés | `/assemblee-nationale/deputes` | CMS Directus, collection `assembly/deputies` | Existant |

---

## 7. Évolutions prévues (post-migration)

### 7.1 Distinction nommés / élus

**Problème** : Actuellement tous les `public_persons` sont traités de la même façon. Mais un ministre (nommé par décret) et un député ou maire (élu par vote) n'ont pas le même statut. L'ajout futur de présidents, maires et députés dans cette collection rend cette distinction nécessaire.

**Solution envisagée** : ajouter un champ `person_type` sur `public_person_appointments` (ou sur `public_persons` directement) :

| Valeur | Description | Exemples |
|--------|-------------|----------|
| `nominated` | Nommé par décret/arrêté | Ministre, DG, PCA, Ambassadeur, Gouverneur |
| `elected` | Élu par vote | Député, Maire, Président de la République |
| `appointed_judiciary` | Nommé dans la magistrature | Magistrat, Procureur |

**Impact** :
- Nouveau filtre sur la page liste (`?type=nominated` / `?type=elected`)
- Statistiques séparées nommés vs élus
- Permet d'intégrer progressivement : députés, maires, président

### 7.2 Évolution des filtres (select au lieu de pills)

**Problème** : Avec 14+ catégories de postes et l'ajout futur de filtres (type nommé/élu, gouvernement, régime), les boutons pills ne scaleront pas.

**Solution envisagée** : passer les filtres catégorie et genre en `<select>` ou en dropdown Nuxt UI :

```
[Catégorie ▾] [Genre ▾] [Type ▾] [Recherche...]
```

- Plus compact, permet d'afficher 3-4 filtres sur une ligne
- Compatible mobile (select natif)
- Conserve la sync URL (`?category=ministre&gender=female&type=nominated`)

### 7.3 Liaison avec l'annuaire des services de l'État

**Objectif** : créer un maillage interne entre les personnalités et les entités publiques.

**Principe** :
- L'annuaire des services de l'État (`/annuaire-services-etat`) contient les structures (ministères, agences, directions...)
- Chaque `public_person_appointment` a déjà un `organization_label` (texte)
- **Évolution** : ajouter une FK `organization` -> collection `public_entities` (ou équivalent) dans Directus

**Liens internes créés** :
- Page personnalité -> lien vers la fiche de l'organisation (`/services-etat/{slug}`)
- Page organisation -> liste des personnalités affectées (actuelles et historiques)
- Page gouvernement -> liens vers les ministères correspondants

```
public_person_appointments.organization ──→ public_entities
                                              │
                                              ├── Page personnalité : "Ministre des Finances → Ministère de l'Économie"
                                              └── Page entité : "Ministère de l'Économie → Ministre : Cheikh Diba"
```

### 7.4 Liaison nominations ↔ gouvernement ↔ régime

**Objectif** : rattacher chaque nomination à un gouvernement spécifique et un régime présidentiel.

**Nouveau modèle CMS envisagé** :

```
presidents (ou regimes)
├── id, full_name, start_date, end_date
├── person -> public_persons (le président est aussi une personnalité)
└── label : "Présidence Bassirou Diomaye Faye"

governments
├── id, label ("Gouvernement Ousmane Sonko I")
├── president -> presidents
├── prime_minister -> public_persons
├── start_date, end_date
└── decree_reference (décret de nomination)

public_person_appointments
├── ... (champs existants)
├── government -> governments (FK)      ← NOUVEAU
└── regime -> presidents (FK)           ← NOUVEAU (optionnel, déduit via government)
```

**Liens internes créés** :
- Page personnalité : "Nommé sous le Gouvernement Sonko I" (lien)
- Page gouvernement : composition complète avec liens vers chaque membre
- Page régime : liste de tous les gouvernements d'un président
- Comparaison de gouvernements : composition à une date donnée
- Historique : frise chronologique des gouvernements successifs

### 7.5 Maillage interne global (SEO)

Synthèse de tous les liens internes créés par ces évolutions :

```
Personnalité ←→ Organisation (service de l'État)
Personnalité ←→ Gouvernement
Personnalité ←→ Prédécesseur / Successeur (déjà fait)
Gouvernement ←→ Régime / Président
Organisation ←→ Gouvernement (via ministères)
Nomination   ←→ Document source (décret)
```

### 7.6 Autres évolutions

- **Migrer la magistrature vers `public_persons`** : les magistrats seraient des `public_persons` avec des appointments de type `appointed_judiciary`
- **Intégration députés** : `public_persons` avec appointments de type `elected`, catégorie "Député"
- **Intégration maires** : idem, catégorie "Maire"
- **Timeline des nominations** : frise chronologique par personne ou par poste
- **Notifications de changement** : alerte PWA sur nouvelles nominations
- **Export PDF/CSV** : export de l'annuaire filtré
- **Recherche transversale** : recherche unifiée sur tous les annuaires

### 7.7 Technique

- **Cache invalidation** : webhook Directus -> purge du cache Nuxt
- **Tests E2E** : scénarios critiques de résolution d'URL (ancien ID, nouveau ID, 404)
- **Schema.org enrichi** : GovernmentOrganization, GovernmentService pour les entités liées

---

## 8. Plan d'exécution

### Phase 1 : Fondations API + Types -- DONE

1. ~~**Créer les types TypeScript** : `PublicPerson`, `PublicPersonAppointment` dans `types/public-person.ts`~~
2. ~~**Créer `server/api/public-persons/index.get.ts`** : liste paginée avec recherche, filtres (category, gender), jointure `current_appointment`~~
3. ~~**Créer `server/api/public-persons/[id].get.ts`** : détail complet + toutes les nominations triées par date + résolution legacy~~
4. ~~**Créer `server/api/public-persons/stats.get.ts`** : agrégations par position_category (avec slug) et par sexe~~

**Note** : l'API stats retourne `totalsByCategory` au format `{ slug: { label, count } }` pour correspondre au filtrage par `position_category_slug` de l'API liste.

### Phase 2 : Composables -- DONE

5. ~~**Créer `composables/usePublicPersons.ts`** : mode liste avec `useCmsCollection` + `useCollectionState`, filtres catégorie/genre, sync URL~~
6. ~~**Créer `composables/usePublicPerson.ts`** : mode détail, gestion du fallback legacy ID, données personne + historique nominations~~

### Phase 3 : Nouvelle page liste -- DONE

7. ~~**Créer `pages/personnalites-senegal/index.vue`** : annuaire complet avec recherche, filtres par catégorie (14 catégories) et genre, pagination, cards, SEO~~
8. ~~**Mettre à jour `pages/annuaires.vue`** : ajout des entrées Gouvernement et Personnalités publiques~~

### Phase 4 : Migration page détail -- DONE

9. ~~**Migrer `pages/personnalites/[id]/[slug].vue`** : utiliser `usePublicPerson()`, historique des nominations, résolution legacy avec redirect 301, suppression du champ `rating`~~
10. ~~**Mettre à jour les liens** dans `/gouvernement-senegal` et `/personnalites-senegal` pour pointer vers les bons IDs~~

**Améliorations supplémentaires réalisées sur la page détail** :
- Badge catégorie "Autre" masqué (pas de valeur ajoutée)
- Cards info allégées : seules date de nomination et formation restent dans la grille info
- Historique des fonctions enrichi avec prédécesseur (cliquable), successeur, source documentaire, notes
- Historique déplacé avant la biographie (info prioritaire)
- Réseaux sociaux affichés (facebook, twitter, instagram, tiktok, linkedin, website)
- Bouton de partage social (SocialShare)
- Dark mode corrigé
- SEO : Schema.org Person, canonical URLs, meta tags optimisés

### Phase 5 : Migration gouvernement -- DONE

11. ~~**Migrer `server/api/government/current.get.ts`** : alimenter depuis `public_persons` + `public_person_appointments`~~
12. ~~**Migrer `composables/useGovernment.ts`** : adapter aux nouvelles structures~~
13. ~~**Mettre à jour `pages/gouvernement-senegal/index.vue`** : adapter au nouveau format de données~~
14. ~~**Refonte design + SEO** (mai 2026) : layout pleine page, cards photo portrait, gradient overlay, schemas JSON-LD enrichis, meta géo~~ (voir section 5.3 pour détails)

### Phase 6 : SEO et redirections -- DONE

15. ~~**Redirection legacy** : logique de résolution dans l'API `[id].get.ts` (fallback `legacy_position_id`)~~
16. ~~**Canonical URLs** : vérifiées sur toutes les pages migrées~~
17. ~~**Tests SEO validés** : ancien ID -> 301, nouveau ID -> affichage, inexistant -> 404~~

### Phase 7 : Nettoyage -- DONE

17. ~~**Stratégie `/nomination-senegal`** : Option A appliquée — page migrée vers `usePublicPersons()`, vue filtrée par date de nomination~~
18. ~~**Documenter** les changements dans ce PRD~~
19. ~~**Supprimer les anciens fichiers et le code legacy** :~~
    - ~~`server/api/nominations/index.get.ts`, `[id].get.ts`, `stats.get.ts` — supprimés~~
    - ~~`composables/useNominations.ts` — supprimé~~
    - ~~`legacy_position_id` retiré de l'API, des types TypeScript et du composable `usePublicPerson`~~
    - ~~Menu mis à jour : "Personnalités publiques" → `/personnalites-senegal`~~

### Phase 8 : Enrichissement du modèle -- A FAIRE

#### 8a. Distinction nommés / élus (voir 7.1)

20. **Ajouter le champ** `person_type` (`nominated` / `elected` / `appointed_judiciary`) dans Directus sur `public_person_appointments`
21. **Mettre à jour l'API** `stats.get.ts` : ajouter agrégation par `person_type`
22. **Mettre à jour l'API** `index.get.ts` : ajouter filtre `filterType`
23. **Mettre à jour la page liste** : ajouter le filtre type + passer les filtres en `<select>` (voir 7.2)

#### 8b. Gouvernements et régimes (voir 7.4)

24. **Créer les collections Directus** : `presidents` (ou `regimes`) et `governments`
25. **Ajouter la FK** `government` sur `public_person_appointments`
26. **Créer l'API** `/api/governments` : liste des gouvernements avec composition
27. **Créer la page** `/gouvernements` : historique de tous les gouvernements
28. **Enrichir la page détail** personnalité : afficher le gouvernement de rattachement

#### 8c. Liaison avec l'annuaire des services de l'État (voir 7.3)

29. **Ajouter la FK** `organization` -> `public_entities` sur `public_person_appointments`
30. **Enrichir la page détail** personnalité : lien vers la fiche organisation
31. **Enrichir la page détail** organisation : liste des personnalités affectées
32. **Maillage interne SEO** : liens croisés systématiques entre entités

#### 8d. Intégration des élus

33. **Ajouter les députés** comme `public_persons` avec appointments `elected` / catégorie "Député"
34. **Ajouter les maires** comme `public_persons` avec appointments `elected` / catégorie "Maire"
35. **Ajouter le Président** comme `public_persons` avec appointment `elected` / catégorie "Président"
36. **Migrer la magistrature** : appointments `appointed_judiciary`

---

## 9. Points d'attention CMS

### 9.1 Cohérence des statuts d'appointments

L'API `government/current` ne filtre **pas** sur le `status` de l'appointment (uniquement sur `public_persons.status = published`). En revanche, l'API `stats` et la page `/personnalites-senegal` filtrent sur `public_person_appointments.status = published`. Les appointments doivent être publiés pour apparaître de manière cohérente sur toutes les pages.

### 9.2 Champ M2O `current_appointment`

Le champ `current_appointment` sur `public_persons` est un raccourci M2O vers `public_person_appointments`. Il doit être renseigné manuellement dans Directus pour que la personne apparaisse sur la page gouvernement et dans les filtres par catégorie. Si ce champ est `null`, la personne est invisible même si un appointment `is_current = true` existe dans la table des nominations.

### 9.3 Unicité du Premier Ministre actif

Le code prend `primeMinister[0]` (premier résultat). Un seul appointment avec `position_category = "Premier Ministre"` et `is_current = true` doit exister à un instant donné. Lors d'un changement de PM, penser à mettre `is_current = false` et `end_date` sur l'ancien.

---

## 10. Tests de validation

### 10.1 Résolution d'URL (critique)

| Scénario | URL testée | Résultat attendu |
|----------|-----------|------------------|
| Nouvelle URL valide | `/personnalites/{new_id}/ousmane-sonko` | Affiche la fiche, canonical = cette URL |
| Ancienne URL Google | `/personnalites/5/ahmadou-al-aminou-lo` | 301 -> `/personnalites/{new_id}/ahmadou-al-aminou-lo` |
| Ancien ID + mauvais slug | `/personnalites/5/wrong-slug` | 301 -> `/personnalites/{new_id}/{correct_slug}` |
| ID inexistant | `/personnalites/99999/personne` | 404 propre |
| Slug seul sans match | `/personnalites/abc/test` | 404 propre (id non numérique) |

### 10.2 Fonctionnels

| Scénario | Page | Résultat attendu |
|----------|------|------------------|
| Recherche "Sonko" | `/personnalites-senegal?q=Sonko` | Filtre les personnalités contenant "Sonko" |
| Filtre Ministre | `/personnalites-senegal?category=ministre` | N'affiche que les ministres actifs/passés |
| Filtre Femme | `/personnalites-senegal?gender=female` | N'affiche que les femmes |
| Page 2 | `/personnalites-senegal?page=2` | Affiche les items 26-50 |
| F5 avec filtres | Recharger la page avec query params | Filtres préservés |
| Historique nominations | Fiche détail d'une personne | Liste chronologique de toutes ses fonctions |
| Gouvernement actuel | `/gouvernement-senegal` | PM + ministres + secrétaires en poste |

### 10.3 SEO

| Vérification | Méthode |
|-------------|---------|
| SSR : données dans le HTML initial | `View Source` (Ctrl+U) |
| Canonical correct | Inspecter `<link rel="canonical">` |
| Schema.org valide | Google Rich Results Test |
| Pas de contenu dupliqué | Vérifier qu'aucune ancienne URL ne renvoie du contenu sans redirect |
| Meta title/description | Inspecter les balises meta |

---

## 11. Docs techniques associées

- [MIGRATION-NOMINATIONS.md](./MIGRATION-NOMINATIONS.md) - Détail de la migration architecture 3 couches (legacy, pour référence)
- [feature-gouvernement-senegal.md](./feature-gouvernement-senegal.md) - Spécifications page gouvernement (sera mis à jour après migration)
