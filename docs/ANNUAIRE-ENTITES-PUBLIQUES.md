# Annuaire des Entités Publiques du Sénégal

## 📋 Vue d'ensemble

Cette fonctionnalité fournit un **annuaire complet et structuré de toutes les entités publiques du Sénégal** (ministères, agences, directions, sociétés nationales, etc.).

Les données proviennent directement des **décrets officiels de répartition des services de l'État** et sont gérées dans Directus CMS.

## 🎯 Fonctionnalités

### Pages utilisateur

1. **Page d'accueil de l'annuaire** (`/etat-senegal/annuaire`)
   - Statistiques globales (nombre total d'entités, ministères, agences, directions)
   - 2 modes d'affichage via onglets :
     - **Vue Liste** : Grille de cartes avec filtres (recherche, type, statut) et pagination
     - **Vue Arbre** : Visualisation hiérarchique complète avec expand/collapse

2. **Page de détail d'une entité** (`/etat-senegal/annuaire/[slug]`)
   - Fil d'Ariane contextuel
   - Informations complètes (nom, description, mission, statut)
   - Direction (responsable)
   - Coordonnées (adresse, téléphone, email, site web)
   - Références légales (décret, date)
   - Entités rattachées (groupées par type)
   - Historique des événements

## 🏗️ Architecture

### Structure des fichiers

```
types/
  └── state-entity.ts                    # Types TypeScript

server/api/state/
  ├── entities/
  │   ├── index.get.ts                   # Liste paginée avec filtres
  │   └── [slug].get.ts                  # Détail d'une entité
  ├── tree.get.ts                        # Arbre hiérarchique complet
  └── stats.get.ts                       # Statistiques globales

app/composables/
  ├── useStateEntities.ts                # Liste + filtres + pagination
  ├── useStateEntityDetail.ts            # Détail d'une entité
  ├── useStateTree.ts                    # Arbre hiérarchique
  └── useStateStats.ts                   # Statistiques

app/components/State/
  ├── EntityTypeBadge.vue                # Badge de type d'entité
  ├── EntityStatusBadge.vue              # Badge de statut
  ├── EntityCard.vue                     # Carte d'entité (liste)
  ├── TreeNode.vue                       # Noeud d'arbre (récursif)
  └── EntityFilters.vue                  # Filtres de recherche

app/pages/etat-senegal/annuaire/
  ├── index.vue                          # Page principale (liste + arbre)
  └── [slug].vue                         # Page de détail
```

## 📊 Modèle de données Directus

### Collection `state_entities`

| Champ              | Type     | Description                              |
|--------------------|----------|------------------------------------------|
| `id`               | int      | Identifiant unique                       |
| `public_slug`      | string   | Slug pour URL (unique)                   |
| `name`             | string   | Nom complet de l'entité                  |
| `short_name`       | string   | Nom court (optionnel)                    |
| `acronym`          | string   | Sigle (ex: ANSD, ARTP)                   |
| `type`             | enum     | Type d'entité (voir ci-dessous)          |
| `status`           | enum     | Statut (active, inactive, dissolved...)  |
| `description`      | text     | Description générale                     |
| `mission`          | text     | Mission officielle                       |
| `parent_entity`    | m2o      | Entité parente (relation hiérarchique)   |
| `address`          | string   | Adresse physique                         |
| `phone`            | string   | Téléphone                                |
| `email`            | string   | Email de contact                         |
| `website`          | string   | Site web                                 |
| `director_name`    | string   | Nom du responsable                       |
| `director_title`   | string   | Titre du responsable                     |
| `created_at`       | date     | Date de création de l'entité             |
| `dissolved_at`     | date     | Date de dissolution (si applicable)      |
| `legal_reference`  | string   | Référence légale                         |
| `decree_number`    | string   | Numéro du décret                         |
| `decree_date`      | date     | Date du décret                           |

### Types d'entités (`type`)

- `ministere` : Ministère
- `secretariat_etat` : Secrétariat d'État
- `direction` : Direction
- `agence` : Agence
- `autorite` : Autorité
- `societe_nationale` : Société Nationale
- `etablissement` : Établissement
- `commission` : Commission
- `conseil` : Conseil
- `autre` : Autre

### Statuts (`status`)

- `active` : Active
- `inactive` : Inactive
- `dissolved` : Dissoute
- `merged` : Fusionnée
- `renamed` : Renommée

### Collection `state_entity_events` (historique)

| Champ              | Type     | Description                              |
|--------------------|----------|------------------------------------------|
| `id`               | int      | Identifiant unique                       |
| `entity_id`        | m2o      | Entité concernée                         |
| `event_type`       | enum     | Type d'événement                         |
| `event_date`       | date     | Date de l'événement                      |
| `description`      | text     | Description de l'événement               |
| `legal_reference`  | string   | Référence légale                         |
| `decree_number`    | string   | Numéro du décret                         |
| `old_name`         | string   | Ancien nom (si renommée)                 |
| `new_name`         | string   | Nouveau nom (si renommée)                |
| `old_parent`       | m2o      | Ancien parent (si déplacement)           |
| `new_parent`       | m2o      | Nouveau parent (si déplacement)          |

## 🔌 API Endpoints

### GET `/api/state/entities`

Liste paginée des entités avec filtres.

**Query params:**
- `search` : Recherche textuelle (nom, acronyme, short_name)
- `type` : Filtrer par type d'entité
- `status` : Filtrer par statut (défaut: `active`)
- `parent_id` : Filtrer par entité parente
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de résultats par page (défaut: 20)
- `sort` : Tri (défaut: `name`)

**Réponse:**
```json
{
  "data": [...],
  "meta": {
    "total_count": 500,
    "filter_count": 50,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### GET `/api/state/entities/:slug`

Détail d'une entité avec historique, enfants et fil d'Ariane.

**Réponse:**
```json
{
  "entity": {...},
  "children": [...],
  "history": [...],
  "breadcrumb": [...]
}
```

### GET `/api/state/tree`

Arbre hiérarchique complet (toutes les entités actives).

**Réponse:**
```json
[
  {
    "id": 1,
    "name": "Ministère...",
    "children": [...],
    "level": 0
  }
]
```

### GET `/api/state/stats`

Statistiques globales.

**Réponse:**
```json
{
  "total": 500,
  "by_type": {...},
  "by_status": {...},
  "active_ministries": 30,
  "total_agencies": 120,
  "total_directions": 250
}
```

## 🎨 Composants

### `<StateEntityTypeBadge :type="..." />`

Badge coloré pour afficher le type d'entité.

### `<StateEntityStatusBadge :status="..." />`

Badge coloré pour afficher le statut.

### `<StateEntityCard :entity="..." :show-parent="true" />`

Carte cliquable d'entité (pour la vue liste).

### `<StateTreeNode :node="..." :is-expanded="..." @toggle="..." />`

Noeud d'arbre récursif (pour la vue hiérarchique).

### `<StateEntityFilters ... />`

Barre de filtres (recherche, type, statut).

## 🚀 Utilisation des composables

### Liste avec filtres et pagination

```vue
<script setup>
const { entities, meta, filters, setSearch, setType, setPage } = useStateEntities()
</script>
```

### Détail d'une entité

```vue
<script setup>
const slug = ref('ministere-sante')
const { entity, children, history, breadcrumb } = useStateEntityDetail(slug)
</script>
```

### Arbre hiérarchique

```vue
<script setup>
const { tree, toggleNode, isExpanded, expandAll, collapseAll } = useStateTree()
</script>
```

### Statistiques

```vue
<script setup>
const { stats } = useStateStats()
</script>
```

## ✅ Pattern respecté

Cette implémentation suit **strictement** le pattern documenté dans [docs/guideline-api.md](./guideline-api.md) :

1. ✅ **Routes API server-side** avec `defineCachedEventHandler`
2. ✅ **Composables métier** pour encapsuler la logique
3. ✅ **Pages SSR-friendly** (pas de `onMounted` pour les données)
4. ✅ **Sync URL ↔ filtres** pour SEO et bookmarking
5. ✅ **Types TypeScript** pour la sécurité
6. ✅ **Composants réutilisables** pour la maintenabilité

## 🔄 Import des données

Les données sont importées automatiquement depuis les décrets officiels dans Directus.

**Sources principales:**
- Décret 2024-940 du 05 avril 2024 (répartition des services)
- Décrets de nomination et de restructuration
- Sites officiels des ministères

## 📱 Responsive et UX

- Design adaptatif (mobile, tablette, desktop)
- Recherche avec debounce (500ms)
- Pagination SEO-friendly
- Navigation au clavier dans l'arbre
- États de chargement et erreurs
- Breadcrumb contextuel
- Liens internes optimisés

## 🔍 SEO

- Meta tags dynamiques par entité
- URLs propres avec slugs (`/etat-senegal/annuaire/ansd`)
- Sitemap automatique (si configuré)
- SSR complet
- Structured data (à ajouter si nécessaire)

## 🚦 Performance

- Cache API : 1 heure (Cloudflare ou Nuxt)
- Pagination côté serveur
- Lazy loading des composants lourds
- Tree optimisé (expand/collapse côté client)

## 📝 TODO / Améliorations futures

- [ ] Export CSV/PDF de la liste
- [ ] Carte interactive des adresses
- [ ] Comparaison entre décrets (diff historique)
- [ ] Notifications sur changements d'entités
- [ ] API publique documentée (OpenAPI/Swagger)
- [ ] Widget "Trouver mon service public"
- [ ] Intégration avec les données de budget par ministère
