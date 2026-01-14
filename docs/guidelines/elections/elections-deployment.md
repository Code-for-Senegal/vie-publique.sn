# 🚀 Migration du Schéma Électoral – Guide de Déploiement (Test → Prod)

> Guide complet pour migrer du schéma existant vers le nouveau schéma électoral optimisé

**Dernière mise à jour** : 2026-01-05

---

## 📋 Vue d'ensemble

Ce document explique **comment migrer du schéma existant vers le nouveau schéma** en détaillant toutes les différences entre les deux versions.

### Fichiers de schéma

| Version | Fichier | Taille | Description |
|---------|---------|--------|-------------|
| **ANCIEN** | [export-elections.json](../../../docs/elections/dashboard-electoral/export-elections.json) | 9,443 lignes | Schéma actuellement en production |
| **NOUVEAU** | [elections-schema.json](../../../docs/elections/dashboard-electoral/elections-schema.json) | 12,402 lignes | Schéma amélioré avec nouvelles fonctionnalités |

### Statistiques des changements

| Métrique | Ancien | Nouveau | Différence |
|----------|--------|---------|------------|
| **Collections** | 14 | 15 | **+1** |
| **Champs totaux** | 171 | 221 | **+50** |
| **Relations** | 30 | 36 | **+6** |

---

## 🆕 1. Collections ajoutées (1 nouvelle)

### 1.1 Collection `guide_electorale` 📹 ⭐ NOUVELLE

**Fonction** : Tutoriels vidéo YouTube pour expliquer le processus électoral

**Nombre de champs** : 10

**Champs clés** :

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id` | integer | Auto | Identifiant unique |
| `status` | string | Non | Statut (draft/published) |
| `sort` | integer | Non | Ordre d'affichage |
| `titre` | string | **Oui** | Titre de la vidéo |
| `description` | text | Non | Description (Markdown) |
| `url_youtube` | string | Non | Lien YouTube |
| `type_election` | string | **Oui** | Type d'élection (presidentielle, legislative, locale) |
| `langue` | string | Non | Langue (Français, Wolof, Pulaar, etc.) |

**Aucune relation définie** (collection autonome).

**Impact** :
- ✅ Guides vidéo pédagogiques
- ✅ Multilingue (Français, langues nationales)
- ✅ Filtrage par type d'élection

**Pages impactées** :
- `/elections-senegal/guide-electoral` : Page dédiée aux tutoriels
- Dashboard électoral (onglet "Guide")

---

## 🔄 2. Collections modifiées (4 collections)

### 2.1 Collection `documents` - Relation M2M avec `elections` ⭐ MAJEUR

> ⚠️ **Important** : La collection `documents` existe déjà en production. Une relation Many-to-Many (M2M) avec collection de jonction `elections_documents` est utilisée pour lier documents et élections.

**Fonction** : Gestion centralisée des documents officiels liés aux élections (codes électoraux, décrets, guides PDF, etc.)

**Relation M2M** :

```
elections.documents (junction) → documents (Many-to-Many)
  ↓
Collection de jonction: elections_documents
  - id (PK)
  - elections_id (FK → elections)
  - documents_id (FK → documents)
```

**Récupération des documents** :

Les documents sont récupérés directement lors du fetch de l'élection via l'endpoint `/api/elections/dashboard/config` :

```typescript
fields: [
  "id", "year", "type", "name", "status",
  // ... autres champs
  "documents.documents_id.id",
  "documents.documents_id.slug",
  "documents.documents_id.title",
  "documents.documents_id.description",
  "documents.documents_id.type",
  "documents.documents_id.file",
  "documents.documents_id.cover_image",
  "documents.documents_id.publish_date",
  "documents.documents_id.status"
]
```

**Option à ajouter** :

> 📝 **Important** : Ajouter l'option `"election"` aux valeurs possibles du champ `type` pour identifier les documents en rapport avec une élection.

**Impact** :
- ✅ Permet d'associer plusieurs documents à une élection (relation M2M)
- ✅ Centralise tous les documents électoraux (codes, guides, décrets)
- ✅ Utilise la collection `documents` existante (pas de nouvelle collection)
- ✅ Plus flexible qu'une relation M2O (un document peut être lié à plusieurs élections)
- ✅ Un seul appel API pour récupérer l'élection ET ses documents (performance optimisée)

**Pages impactées** :
- `/elections-senegal/legislation` : Affiche les documents filtrés par élection
- Dashboard électoral (onglet "Documents") : Affiche les documents de l'élection actuelle

**Migration** : Aucune migration de données requise.

---

### 2.2 Collection `election_constituencies` (+2 champs)

**Modifications** :

| Action | Champ | Type | Interface | Description |
|--------|-------|------|-----------|-------------|
| ➕ **AJOUT** | `nationale_type` | string | select-dropdown | Type de circonscription nationale |
| ➕ **AJOUT** | `parent` | integer | select-dropdown-m2o | Relation hiérarchique (→ election_constituencies) |

**Relation ajoutée** :

```
election_constituencies.parent → election_constituencies (Many-to-One)
```

**Impact** :
- ✅ Support de hiérarchies (département → arrondissement → commune)
- ✅ Typologie de circonscriptions nationales

**Migration** : Aucune migration de données requise (champs optionnels).

---

### 2.3 Collection `election_candidates` ⚠️ BREAKING CHANGE

**Modifications** :

| Action | Champ | Type | Interface | Description |
|--------|-------|------|-----------|-------------|
| ➕ **AJOUT** | `role` | string | select-dropdown | Rôle du candidat (titulaire/suppleant/autre) |
| ❌ **SUPPRESSION** | `is_substitute` | boolean | boolean | Indicateur de suppléant (remplacé par `role`) |

**Impact** :
- ⚠️ **Breaking change** : Le champ `is_substitute` n'existe plus
- ✅ Plus flexible : Support de plusieurs rôles (titulaire, suppléant, etc.)
- ✅ Extensible : Facilite l'ajout de nouveaux rôles

**Migration de données OBLIGATOIRE** :

```sql
-- Étape 1 : Ajouter le nouveau champ (fait automatiquement par import schéma)
-- Étape 2 : Migrer les données
UPDATE election_candidates
SET role = CASE
  WHEN is_substitute = true THEN 'suppleant'
  WHEN is_substitute = false THEN 'titulaire'
  ELSE 'titulaire'
END;

-- Étape 3 : Supprimer l'ancien champ (fait automatiquement par import schéma)
```

**Code à mettre à jour** :

```typescript
// ❌ ANCIEN CODE (ne fonctionne plus)
const suppléants = candidates.filter(c => c.is_substitute === true);

// ✅ NOUVEAU CODE
const suppléants = candidates.filter(c => c.role === 'suppleant');
```

---

### 2.4 Collection `elections` (+10 champs)

**Modifications** :

| Action | Champ | Type | Interface | Description |
|--------|-------|------|-----------|-------------|
| ➕ **AJOUT** | `documents` | alias | list-m2m | **Relation Many-to-Many vers documents** (via `elections_documents`) |
| ➕ **AJOUT** | `participation_rate` | float | input | Taux de participation (%) |
| ➕ **AJOUT** | `processed_pv_rate` | float | input | Taux de PV traités (%) |
| ➕ **AJOUT** | `rounds` | integer | input | Nombre de tours |
| ➕ **AJOUT** | `election_date` | date | datetime | Date de l'élection |
| ➕ **AJOUT** | `date_round_2` | date | datetime | Date du second tour |
| ➕ **AJOUT** | `registration_deadline` | timestamp | datetime | Date limite d'inscription |
| ➕ **AJOUT** | `campaign_start_date` | date | datetime | Début de campagne |
| ➕ **AJOUT** | `campaign_end_date` | date | datetime | Fin de campagne |
| ➕ **AJOUT** | `description` | text | textarea | Description de l'élection |

**Relation ajoutée** :

```
elections.documents (M2M via elections_documents)
  ↓
Collection de jonction: elections_documents
  - elections_id (FK → elections)
  - documents_id (FK → documents)
  ↓
documents
```

**Impact** :
- ✅ Accès facile aux documents d'une élection via `election.documents`
- ✅ Relation Many-to-Many flexible (un document peut être lié à plusieurs élections)
- ✅ Calendrier électoral complet (inscription, campagne, scrutin, 2e tour)
- ✅ Métriques en temps réel (participation, PV traités)
- ✅ Support multi-tours (présidentielles)

**Migration** : Aucune migration de données requise (champs optionnels).

**Exemple d'utilisation** :

```typescript
// Récupérer une élection avec ses documents via l'API config
const config = await $fetch('/api/elections/dashboard/config');

// Trouver une élection spécifique
const election = config.elections.find(e => e.year === 2024 && e.type === 'legislative');

// election.documents contient tous les documents publiés liés
console.log(election.documents); // [{ id, title, slug, type, file, ... }]
```

---

## ➕ 3. Catégorie à créer dans `news_category`

> ⚠️ **Important** : Les collections `news` et `news_category` existent déjà en production.

**Action requise** : Créer une nouvelle catégorie **"Election"** dans la collection `news_category`.

**Procédure** :

1. Directus → Content → `news_category`
2. Créer une nouvelle entrée
3. Remplir les champs :
   - `name` : "Election"
   - `slug` : "election"
   - `description` : "Actualités électorales" (optionnel)
   - `status` : "published"
4. Sauvegarder

**Impact** :
- ✅ Permet de catégoriser les articles sur les élections
- ✅ Utilisé pour le filtrage dans la page landing élections
- ✅ Utilisé dans la section "Actualités Électorales"

---


## ✅ 5. Collections sans changement (9 collections)

Les collections suivantes existent dans les deux schémas **sans aucune modification** :

- `election_coalition`
- `election_coalition_videos`
- `election_electoral_lists`
- `election_map_national`
- `election_map_diaspora`
- `Bureau_vote`
- `chargement_pv`
- `resultats`
- `carte`

**Impact** : Aucune migration requise pour ces collections.

---

## 📥 Instructions d'importation du nouveau schéma

> ⚠️ **Rappel important** :
> - La collection `guide_electorale` sera créée automatiquement
> - Le champ `election_id` sera ajouté à la collection `documents` existante
> - Une catégorie "Election" doit être créée manuellement dans `news_category`
> - La collection `Documents` (majuscule) doit être supprimée si elle existe

### Prérequis

- ✅ Accès admin à Directus (environnement de test puis production)
- ✅ **BACKUP COMPLET** de la base de données avant migration
- ✅ Vérifier les permissions utilisateurs Directus
- ✅ S'assurer que les fichiers de schéma sont à jour

---

Créez manuellement les éléments suivants.

#### A. Créer la relation M2M entre `elections` et `documents`

> ⚠️ **Important** : Créer une relation Many-to-Many avec collection de jonction automatique.

1. Éditer la collection **"elections"**
2. Ajouter un nouveau champ **"documents"**
3. Configuration :
   - **Type** : Alias (Many-to-Many)
   - **Interface** : list-m2m
   - **Related Collection** : documents
   - **Junction Collection** : elections_documents (créée automatiquement)
   - **Display Template** : {{title}}

4. **Modifier le champ `type` dans documents** (existant) :
   - Ajouter l'option `"election"` aux valeurs possibles
   - Cette option permet d'identifier les documents en rapport avec une élection

> 📝 La collection de jonction `elections_documents` sera créée automatiquement par Directus avec les champs :
> - `id` (PK)
> - `elections_id` (FK → elections)
> - `documents_id` (FK → documents)

---

#### B. Créer la collection `guide_electorale`

1. Créer une nouvelle collection **"guide_electorale"**
2. Configuration :
   - **Icon** : video_library
   - **Display Template** : `{{titre}}`
   - **Group** : Election
   - **Archive Field** : status
   - **Sort Field** : sort

3. Ajouter les champs :

| Champ | Type | Interface | Options |
|-------|------|-----------|---------|
| `id` | Integer | input | Auto-increment, PK |
| `status` | String | select-dropdown | draft, published |
| `sort` | Integer | input | Ordre d'affichage |
| `titre` | String | input | Requis, max 255 |
| `description` | Text | input-rich-text-md | Optionnel, Markdown |
| `url_youtube` | String | input | Requis, validation URL |
| `type_election` | String | select-dropdown | presidentielle, legislative, locale |
| `langue` | String | input | Français, Wolof, Pulaar, etc. |

---

#### C. Ajouter les champs manquants

**Dans `election_constituencies`** :

| Champ | Type | Interface | Options |
|-------|------|-----------|---------|
| `nationale_type` | String | select-dropdown | Types nationaux |
| `parent` | Integer | select-dropdown-m2o | → election_constituencies |

**Dans `election_candidates`** :

| Champ | Type | Interface | Options |
|-------|------|-----------|---------|
| `role` | String | select-dropdown | titulaire, suppleant, autre |

⚠️ **Puis migrer les données** de `is_substitute` vers `role` (voir section Migration).

**Dans `elections`** :

| Champ | Type | Interface |
|-------|------|-----------|
| `documents` | Alias | list-m2m (→ documents via elections_documents) |
| `participation_rate` | Float | input |
| `processed_pv_rate` | Float | input |
| `rounds` | Integer | input |
| `election_date` | Date | datetime |
| `date_round_2` | Date | datetime |
| `registration_deadline` | Timestamp | datetime |
| `campaign_start_date` | Date | datetime |
| `campaign_end_date` | Date | datetime |
| `description` | Text | textarea |

---

#### D. Créer la catégorie "Election" dans `news_category`

1. Directus → Content → **"news_category"**
2. Créer une nouvelle entrée
3. Remplir les champs :
   - `name` : "Election"
   - `slug` : "election"
   - `description` : "Actualités électorales"
   - `status` : "published"
4. Sauvegarder

---

## 🔄 Migration des données

### 1. Migration OBLIGATOIRE : `election_candidates.is_substitute` → `role`

⚠️ **Breaking change** : Cette migration est OBLIGATOIRE avant de déployer le nouveau code.

#### Étape 1 : Vérifier les données existantes

```sql
-- Compter les candidats par type
SELECT is_substitute, COUNT(*) as count
FROM election_candidates
GROUP BY is_substitute;
```

#### Étape 2 : Exécuter la migration

```sql
-- Migrer les données
UPDATE election_candidates
SET role = CASE
  WHEN is_substitute = true THEN 'suppleant'
  WHEN is_substitute = false THEN 'titulaire'
  ELSE 'titulaire'
END;
```

#### Étape 3 : Vérifier la migration

```sql
-- Compter les candidats par rôle
SELECT role, COUNT(*) as count
FROM election_candidates
GROUP BY role;
```

#### Étape 4 : Mettre à jour le code

```typescript
// ❌ ANCIEN CODE - À SUPPRIMER
const isSuppléant = candidate.is_substitute;

// ✅ NOUVEAU CODE
const isSuppléant = candidate.role === 'suppleant';
```

---


## 🧪 Tests post-migration

### 1. Tester la relation M2M (Documents ↔ Elections)

#### Dans Directus :
1. Éditer une élection
2. Accéder à l'onglet/champ "Documents" (relation M2M)
3. Ajouter un ou plusieurs documents à l'élection
4. Sauvegarder
5. Vérifier que la collection de jonction `elections_documents` contient les liens

#### Dans l'application :
1. Accéder à `/elections-senegal/legislation`
2. Sélectionner un type et une année
3. Vérifier que les documents liés s'affichent
4. Accéder au Dashboard `/elections-senegal/dashboard/[type]/[year]`
5. Aller dans l'onglet "Documents"
6. Vérifier que les documents de l'élection actuelle s'affichent

---

### 2. Tester le Guide Électoral

#### Dans Directus :
1. Créer un guide dans `guide_electorale`
2. Remplir : titre, url_youtube, type_election
3. Publier

#### Dans l'application :
1. Accéder à `/elections-senegal/guide-electoral`
2. Vérifier que la vidéo YouTube s'affiche
3. Tester le filtrage par type d'élection

---

### 3. Tester la catégorie "Election"

#### Dans Directus :
1. Vérifier que la catégorie "Election" existe dans `news_category`
2. Créer un article dans `news` et l'associer à la catégorie "Election"
3. Publier

#### Dans l'application :
1. Accéder à `/elections-senegal`
2. Vérifier la section "Actualités Électorales"
3. Vérifier que les articles de catégorie "Election" s'affichent

---

### 4. Tester le nouveau champ `role`

#### Dans Directus :
1. Éditer un candidat
2. Vérifier que le champ `role` existe
3. Vérifier que `is_substitute` n'existe plus
4. Modifier le rôle et sauvegarder

#### Dans l'application :
1. Dashboard électoral → Onglet "Candidats"
2. Vérifier que l'affichage fonctionne
3. Tester les filtres par rôle

---

### 5. Tester les nouveaux champs `elections`

#### Dans Directus :
1. Éditer une élection
2. Remplir les nouveaux champs (dates, taux, description)
3. Sauvegarder

#### Dans l'application :
1. Landing page `/elections-senegal`
2. Vérifier les stats (participation_rate, processed_pv_rate)
3. Dashboard → Vérifier les dates de campagne

---

### 6. Tester la hiérarchie des circonscriptions

#### Dans Directus :
1. Créer une circonscription parente (ex: département)
2. Créer une circonscription enfant
3. Sélectionner le parent dans le champ `parent`
4. Sauvegarder

#### Dans l'application :
1. Dashboard → Élection locale
2. Sélectionner une circonscription
3. Vérifier le filtrage des listes

---

## 🔧 Troubleshooting

### Erreur : "election_id field not found"

**Cause** : Le champ `election_id` n'a pas été ajouté à `documents`.

**Solution** :
1. Vérifier l'import du schéma
2. Ajouter manuellement (voir Méthode 3)
3. Redémarrer Directus

---

### Erreur : "role field not found in election_candidates"

**Cause** : Le nouveau champ `role` n'existe pas.

**Solution** :
1. Vérifier l'import du schéma
2. Ajouter manuellement le champ `role`
3. Migrer les données de `is_substitute`

---

### Les documents ne s'affichent pas

**Vérifications** :
1. La collection de jonction `elections_documents` existe
2. Au moins un lien existe dans `elections_documents` entre une élection et un document
3. Les documents liés ont le statut "published"
4. L'API retourne des données : `GET /api/elections/dashboard/config`
5. Vérifier que les documents sont présents dans la réponse de l'API : `config.elections[0].documents`
6. Permissions Directus (lecture publique sur `elections`, `elections_documents` et `documents`)

---

### Les guides vidéo ne s'affichent pas

**Vérifications** :
1. La collection `guide_electorale` existe
2. Au moins un guide est publié
3. L'URL YouTube est valide
4. L'API retourne des données : `GET /api/elections/dashboard/guide/videos`

---

### Code qui utilise `is_substitute` ne fonctionne plus

**Cause** : Le champ `is_substitute` a été supprimé.

**Solution** :
1. Rechercher tous les usages de `is_substitute` dans le code
2. Remplacer par `role === 'suppleant'`
3. Tester tous les filtres et affichages

**Exemple** :

```bash
# Trouver tous les usages
grep -r "is_substitute" app/
grep -r "is_substitute" components/
grep -r "is_substitute" composables/
```

---

## 📁 Fichiers à mettre à jour

### Types TypeScript

**Fichier** : [types/election.ts](../../../types/election.ts)

**Modifications** :

```typescript
// AVANT
export interface ElectionCandidate {
  // ...
  is_substitute?: boolean; // ❌ À supprimer
}

export interface Election {
  id: number;
  name: string;
  type: string;
  year: number;
  // ...
}

// APRÈS
export interface ElectionCandidate {
  // ...
  role?: 'titulaire' | 'suppleant' | 'autre'; // ✅ Ajouté
}

export interface Election {
  id: number;
  name: string;
  type: string;
  year: number;
  // Nouveaux champs ✅
  documents?: Document[];
  participation_rate?: number;
  processed_pv_rate?: number;
  rounds?: number;
  election_date?: string;
  date_round_2?: string;
  registration_deadline?: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  description?: string;
}

// Nouveau type ✅
export interface Document {
  id: number;
  status: string;
  type: string;
  title: string;
  description?: string;
  file?: string; // UUID
  election_id?: number;
  year?: number;
  // ... autres champs
}

// Nouveau type ✅
export interface GuideElectoral {
  id: number;
  titre: string;
  description?: string;
  url_youtube: string;
  type_election: 'presidentielle' | 'legislative' | 'locale';
  langue?: string;
  sort?: number;
}
```

---

### API Endpoints

**Nouveaux endpoints créés** :

- ✅ `/api/elections/dashboard/guide/videos` - Liste des guides vidéos
- ✅ `/api/elections/dashboard/guide/languages` - Langues disponibles

**Endpoints modifiés** :

- ✅ `/api/elections/dashboard/config` - Retourne les nouveaux champs d'`elections` ET les documents via la relation M2M
  - Inclut maintenant tous les champs des documents liés à chaque élection
  - Filtre automatiquement les documents publiés
  - Tri par date de publication (plus récent en premier)
  - Retourne également `election_ids_with_documents` pour le filtrage dans la page législation

---

### Composants

**Composants utilisant `is_substitute`** :

```bash
# Rechercher et remplacer
grep -r "is_substitute" app/components/elections/
grep -r "is_substitute" app/pages/elections*/
```

**Exemple de modification** :

```vue
<!-- ❌ AVANT -->
<UBadge v-if="candidate.is_substitute" color="amber">Suppléant</UBadge>

<!-- ✅ APRÈS -->
<UBadge v-if="candidate.role === 'suppleant'" color="amber">Suppléant</UBadge>
```

---

## 📊 Tableau comparatif complet

| Fonctionnalité | Ancien Schéma | Nouveau Schéma | Impact |
|----------------|---------------|----------------|--------|
| **Collections** | 14 | 15 | +1 nouvelle |
| **Champs totaux** | 171 | 221 | +50 champs |
| **Lien documents ↔ elections** | ❌ | ✅ Relation M2M `elections_documents` | Centralisation flexible |
| **Guides vidéo** | ❌ | ✅ Collection `guide_electorale` | Pédagogie |
| **Catégorie actualités** | ❌ | ✅ "Election" dans `news_category` | Filtrage actus |
| **Calendrier électoral** | ⚠️ Partiel | ✅ Complet | 9 dates clés |
| **Métriques temps réel** | ❌ | ✅ Participation, PV traités | Suivi en direct |
| **Multi-tours** | ❌ | ✅ Champ `rounds` | Présidentielles |
| **Hiérarchie circonscriptions** | ❌ | ✅ Champ `parent` | Arborescence |
| **Rôles candidats** | Boolean `is_substitute` | Enum `role` | Extensibilité |
| **Relation docs ↔ elections** | ❌ | ✅ M2M via jonction | Flexibilité + Performance |

---

## 🎯 Checklist de déploiement

### Avant le déploiement

- [ ] Backup complet de la base de données production
- [ ] Tester l'import du nouveau schéma en environnement de test
- [ ] Vérifier que `guide_electorale` est créée
- [ ] Vérifier que le champ `election_id` est ajouté à `documents` (existante)
- [ ] Créer la catégorie "Election" dans `news_category`
- [ ] Vérifier toutes les pages élections en test
- [ ] Migrer les données `is_substitute` → `role` en test
- [ ] Supprimer la collection `Documents` (majuscule) si elle existe
- [ ] Mettre à jour les types TypeScript
- [ ] Mettre à jour le code utilisant `is_substitute`
- [ ] Tester les nouveaux endpoints API
- [ ] Vérifier les permissions Directus (lecture publique)
- [ ] Communiquer la maintenance aux utilisateurs (si downtime)

---

### Pendant le déploiement

- [ ] Activer le mode maintenance (optionnel)
- [ ] Importer le nouveau schéma Directus
- [ ] Vérifier les logs Directus pour les erreurs
- [ ] Vérifier que `guide_electorale` est créée
- [ ] Vérifier que `documents.election_id` existe
- [ ] Créer la catégorie "Election" dans `news_category`
- [ ] Migrer les données `election_candidates`
- [ ] Supprimer la collection `Documents` (majuscule) si elle existe
- [ ] Tester les endpoints API critiques
- [ ] Déployer le nouveau code frontend (build + deploy)
- [ ] Vider le cache (CDN, serveur, navigateur)

---

### Après le déploiement

- [ ] Tester toutes les pages élections en production
- [ ] Vérifier la relation `documents ↔ elections`
- [ ] Vérifier les guides électoraux (`guide_electorale`)
- [ ] Vérifier la catégorie "Election" dans les actualités
- [ ] Vérifier les nouveaux champs `elections` (dates, métriques)
- [ ] Vérifier le champ `role` des candidats
- [ ] Créer des données de test (guides, catégorie)
- [ ] Associer des documents existants aux élections via la relation M2M dans Directus
- [ ] Vérifier les performances (temps de chargement)
- [ ] Vérifier Google Analytics (pas d'erreur JS)
- [ ] Désactiver le mode maintenance
- [ ] Communiquer la mise à jour aux utilisateurs

---

## 📚 Ressources

**Schémas** :
- [Schéma ANCIEN (export-elections.json)](../../../docs/elections/dashboard-electoral/export-elections.json)
- [Schéma NOUVEAU (elections-schema.json)](../../../docs/elections/dashboard-electoral/elections-schema.json)

**Documentation** :
- [Modèle de données (elections-model.md)](./elections-model.md)
- [Architecture des pages (elections-pages-architecture.md)](./elections-pages-architecture.md)

**API Directus** :
- [Documentation officielle](https://docs.directus.io/)
- [Schema endpoint](https://docs.directus.io/reference/system/schema.html)

---

## 🆘 Support

En cas de problème pendant la migration :

1. **Rollback** : Restaurer le backup de la base de données
2. **Logs** : Vérifier les logs Directus et serveur
3. **Support** : Contacter l'équipe de développement

**Contacts** :
- Équipe technique : dev@vie-publique.sn (mail configurer si jugé necessaire)
- Documentation : https://github.com/vie-publique-senegal/vie-publique.sn

---

**Auteur** : Vie Publique Sénégal
