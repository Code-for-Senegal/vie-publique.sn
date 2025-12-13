# 🌐 API Directus pour le Frontend - Annuaire de l'État

Ce document détaille toutes les requêtes API Directus nécessaires pour implémenter les vues frontend de l'annuaire des entités publiques du Sénégal.

## 📋 Table des matières

1. [Vue Liste filtrée par type](#1-vue-liste-filtrée-par-type)
2. [Vue Arbre hiérarchique](#2-vue-arbre-hiérarchique)
3. [Page détail d'une entité](#3-page-détail-dune-entité)
4. [Filtrage par décret](#4-filtrage-par-décret)
5. [Recherche d'entités](#5-recherche-dentités)

---

## 1. Vue Liste filtrée par type

### 1.1 Liste des ministères actifs

**Endpoint** : `GET /items/state_entity`

```http
GET /items/state_entity?filter[type][code][_eq]=ministry
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,slug,public_slug,type.label,type.code
                       &sort=name
                       &limit=-1
```

**⚠️ Note** : Les champs `icon` et `color` n'existent PAS dans `state_type`. Les icônes et couleurs doivent être gérées côté frontend via un mapping statique dans les composants.

**Réponse** :
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Ministère de la Justice",
      "slug": "ministere-justice",
      "public_slug": "ministere-justice",
      "type": {
        "label": "Ministère",
        "code": "ministry"
      }
    },
    {
      "id": "uuid-2",
      "name": "Ministère de la Santé",
      "slug": "ministere-sante",
      "public_slug": "ministere-sante",
      "type": {
        "label": "Ministère",
        "code": "ministry"
      }
    }
  ]
}
```

### 1.2 Liste des agences actives

```http
GET /items/state_entity?filter[type][code][_eq]=agency
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,slug,public_slug,type.label,type.code
                       &sort=name
                       &limit=-1
```

### 1.3 Liste des établissements publics

```http
GET /items/state_entity?filter[type][code][_eq]=public_institution
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,slug,public_slug,type.label,type.code
                       &sort=name
                       &limit=-1
```

### 1.4 Liste des sociétés nationales

```http
GET /items/state_entity?filter[type][code][_eq]=state_owned_enterprise
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,slug,public_slug,type.label,type.code
                       &sort=name
                       &limit=-1
```

### 1.5 Liste générique avec compteur par type

**Endpoint** : `GET /items/state_entity`

```http
GET /items/state_entity?filter[has_public_page][_eq]=true
                       &fields=id,name,slug,public_slug,type.label,type.code
                       &groupBy=type
                       &aggregate[count]=*
                       &sort=type.code
```

---

## 2. Vue Arbre hiérarchique

### 2.1 Récupérer les racines (Présidence, Primature)

```http
GET /items/state_entity?filter[type][code][_in]=presidency,primature
                       &fields=id,name,slug,public_slug,type.code,type.label,has_public_page
                       &sort=type.code
```

**Réponse** :
```json
{
  "data": [
    {
      "id": "uuid-presidence",
      "name": "Présidence de la République",
      "slug": "presidence-de-la-republique",
      "public_slug": "presidence-de-la-republique",
      "has_public_page": true,
      "type": {
        "code": "presidency",
        "label": "Présidence"
      }
    },
    {
      "id": "uuid-primature",
      "name": "Primature",
      "slug": "primature",
      "public_slug": "primature",
      "has_public_page": true,
      "type": {
        "code": "primature",
        "label": "Primature"
      }
    }
  ]
}
```

### 2.2 Récupérer les enfants d'un nœud (ex: enfants de la Primature)

```http
GET /items/state_structure?filter[parent_entity][_eq]=uuid-primature
                          &filter[date_valid_to][_null]=true
                          &fields=id,
                                  child_entity.id,
                                  child_entity.name,
                                  child_entity.slug,
                                  child_entity.public_slug,
                                  child_entity.has_public_page,
                                  child_entity.type.code,
                                  child_entity.type.label
                          &sort=child_entity.name
                          &limit=-1
```

**Réponse** :
```json
{
  "data": [
    {
      "id": "structure-1",
      "child_entity": {
        "id": "uuid-ministere-justice",
        "name": "Ministère de la Justice",
        "slug": "ministere-justice",
        "public_slug": "ministere-justice",
        "has_public_page": true,
        "type": {
          "code": "ministry",
          "label": "Ministère"
        }
      }
    },
    {
      "id": "structure-2",
      "child_entity": {
        "id": "uuid-artp",
        "name": "ARTP",
        "slug": "artp",
        "public_slug": "artp",
        "has_public_page": true,
        "type": {
          "code": "agency",
          "label": "Agence"
        }
      }
    }
  ]
}
```

### 2.3 Récupérer l'arbre complet (optimisé, 1 requête)

**⚠️ Attention** : Pour de grandes structures, préférer le chargement à la demande (2.2)

```http
GET /items/state_entity?filter[type][code][_in]=presidency,primature,ministry,agency
                       &fields=id,name,slug,public_slug,type.code,has_public_page,
                               children.id,
                               children.child_entity.id,
                               children.child_entity.name,
                               children.child_entity.slug,
                               children.child_entity.public_slug,
                               children.child_entity.has_public_page,
                               children.child_entity.type.code
                       &deep[children][_filter][date_valid_to][_null]=true
                       &sort=type.code,name
```

---

## 3. Page détail d'une entité

### 3.1 Informations complètes par public_slug

```http
GET /items/state_entity?filter[public_slug][_eq]=ministere-justice
                       &fields=id,
                               name,
                               slug,
                               public_slug,
                               business_key,
                               last_decree_reference,
                               type.label,
                               type.code,
                               aliases.id,
                               aliases.alias,
                               aliases.date_valid_from,
                               aliases.date_valid_to,
                               aliases.note,
                               parents.id,
                               parents.parent_entity.id,
                               parents.parent_entity.name,
                               parents.parent_entity.public_slug,
                               parents.date_valid_from,
                               parents.date_valid_to,
                               parents.decree_reference,
                               children.id,
                               children.child_entity.id,
                               children.child_entity.name,
                               children.child_entity.public_slug,
                               children.child_entity.has_public_page,
                               children.child_entity.type.label,
                               children.date_valid_from,
                               children.date_valid_to,
                               statuses.id,
                               statuses.status,
                               statuses.start_date,
                               statuses.end_date,
                               statuses.decree_reference
                       &deep[parents][_filter][date_valid_to][_null]=true
                       &deep[children][_filter][date_valid_to][_null]=true
                       &limit=1
```

**Réponse** :
```json
{
  "data": [
    {
      "id": "uuid-ministere-justice",
      "name": "Ministère de la Justice",
      "slug": "ministere-justice",
      "public_slug": "ministere-justice",
      "business_key": "ministere-de-la-justice:ministry",
      "last_decree_reference": "2024-940",
      "type": {
        "label": "Ministère",
        "code": "ministry"
      },
      "aliases": [
        {
          "id": "alias-1",
          "alias": "Ministère de la Justice et des Droits de l'Homme",
          "date_valid_from": null,
          "date_valid_to": "2024-04-04",
          "note": "Ancien nom officiel (avant décret 2024-940)"
        }
      ],
      "parents": [
        {
          "id": "structure-1",
          "parent_entity": {
            "id": "uuid-primature",
            "name": "Primature",
            "public_slug": "primature"
          },
          "date_valid_from": "2024-04-05",
          "date_valid_to": null,
          "decree_reference": "2024-940"
        }
      ],
      "children": [
        {
          "id": "structure-2",
          "child_entity": {
            "id": "uuid-dage",
            "name": "Direction de l'Administration Générale et de l'Equipement",
            "public_slug": null,
            "has_public_page": false,
            "type": {
              "label": "Direction"
            }
          },
          "date_valid_from": "2024-04-05",
          "date_valid_to": null
        }
      ],
      "statuses": [
        {
          "id": "status-1",
          "status": "active",
          "start_date": "2024-04-05",
          "end_date": null,
          "decree_reference": "2024-940"
        }
      ]
    }
  ]
}
```

### 3.2 Historique complet des rattachements

```http
GET /items/state_structure?filter[child_entity][_eq]=uuid-artp
                          &fields=id,
                                  parent_entity.id,
                                  parent_entity.name,
                                  parent_entity.public_slug,
                                  date_valid_from,
                                  date_valid_to,
                                  decree_reference
                          &sort=-date_valid_from
```

**Réponse** (si ARTP a changé de parent) :
```json
{
  "data": [
    {
      "id": "structure-new",
      "parent_entity": {
        "id": "uuid-primature",
        "name": "Primature",
        "public_slug": "primature"
      },
      "date_valid_from": "2025-04-05",
      "date_valid_to": null,
      "decree_reference": "2025-123"
    },
    {
      "id": "structure-old",
      "parent_entity": {
        "id": "uuid-ministere-telecom",
        "name": "Ministère des Télécommunications",
        "public_slug": "ministere-telecommunications"
      },
      "date_valid_from": "2024-04-05",
      "date_valid_to": "2025-04-04",
      "decree_reference": "2024-940"
    }
  ]
}
```

---

## 4. Filtrage par décret

### 4.1 Voir l'état au décret 2024-940

```http
GET /items/state_entity?filter[last_decree_reference][_eq]=2024-940
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,public_slug,type.label,type.code,
                               parents.parent_entity.name,
                               parents.parent_entity.public_slug
                       &deep[parents][_filter][decree_reference][_eq]=2024-940
                       &sort=type.code,name
                       &limit=-1
```

### 4.2 Entités créées dans un décret spécifique

Pour trouver les entités créées dans un décret donné, on utilise `state_status` :

```http
GET /items/state_status?filter[decree_reference][_eq]=2025-123
                       &filter[start_date][_nnull]=true
                       &fields=entity.id,
                               entity.name,
                               entity.public_slug,
                               entity.type.label,
                               start_date
                       &sort=entity.name
```

### 4.3 Entités supprimées dans un décret spécifique

```http
GET /items/state_status?filter[status][_eq]=deleted
                       &filter[decree_reference][_eq]=2025-123
                       &fields=entity.id,
                               entity.name,
                               entity.public_slug,
                               entity.type.label,
                               end_date,
                               decree_reference
                       &sort=entity.name
```

---

## 5. Recherche d'entités

### 5.1 Recherche par nom (insensible à la casse)

```http
GET /items/state_entity?filter[name][_contains]=justice
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,public_slug,type.label
                       &limit=20
```

### 5.2 Recherche par nom OU alias

```http
GET /items/state_entity?filter[_or][0][name][_contains]=ARTP
                       &filter[_or][1][aliases][alias][_contains]=ARTP
                       &filter[has_public_page][_eq]=true
                       &fields=id,name,public_slug,type.label,aliases.alias
                       &limit=20
```

---

## ⚠️ Note importante : Filtrage des entités actives/supprimées

**Il n'existe pas de champ `statuses` dans `state_entity`** car la relation est inversée :
- `state_status.entity` pointe vers `state_entity`
- Mais `state_entity` n'a pas de champ inverse automatique

### Comment gérer les entités supprimées ?

**Option 1 : Ne pas filtrer par défaut (recommandé)**
```http
# Afficher toutes les entités
GET /items/state_entity?filter[type][code][_eq]=ministry
```
- Plus simple et plus rapide
- Les entités supprimées ont généralement un `state_status` avec `status=deleted`
- Afficher l'info de suppression uniquement sur la page détail

**Option 2 : Requête en 2 étapes**
```http
# 1. Récupérer les IDs des entités supprimées
GET /items/state_status?filter[status][_eq]=deleted&fields=entity

# 2. Exclure ces IDs dans la vue liste
GET /items/state_entity?filter[id][_nin]=uuid1,uuid2,uuid3...
```

**Option 3 : Afficher l'info sur la page détail**
```http
# Sur la page détail, charger les statuses
GET /items/state_status?filter[entity][_eq]=uuid-entity&sort=-start_date
```

### Recommandation
Pour les vues **liste** et **arbre**, n'appliquez **aucun filtre sur les statuses**.
Pour la **page détail**, chargez les statuses et affichez un badge si l'entité est supprimée.

---

## 📊 Récapitulatif des champs clés

| Champ | Utilisation | Exemple |
|-------|-------------|---------|
| `public_slug` | **URL de la fiche** | `/entites/ministere-justice` |
| `has_public_page` | **Afficher lien cliquable ?** | `true` = lien, `false` = pas de lien |
| `date_valid_to` | **Relation active ?** | `null` = actif, date = historique |
| `decree_reference` | **Filtrer par décret** | `"2024-940"`, `"2025-123"` |
| `business_key` | **Identifiant stable** | `"artp"`, `"ministere-justice:ministry"` |
| `status` | **Entité active ?** | `"active"`, `"deleted"` |

---

## 🎨 Exemples d'affichage frontend

### Vue Liste

```jsx
// Récupérer les ministères
const response = await fetch(
  `${DIRECTUS_URL}/items/state_entity?filter[type][code][_eq]=ministry&filter[has_public_page][_eq]=true&fields=id,name,public_slug,type.label`
);
const { data: ministries } = await response.json();

// Afficher
ministries.map(ministry => (
  <Link to={`/entites/${ministry.public_slug}`}>
    {ministry.name}
  </Link>
));
```

### Vue Arbre

```jsx
// Récupérer les enfants d'un nœud
const response = await fetch(
  `${DIRECTUS_URL}/items/state_structure?filter[parent_entity][_eq]=${parentId}&filter[date_valid_to][_null]=true&fields=child_entity.id,child_entity.name,child_entity.public_slug,child_entity.has_public_page`
);
const { data: children } = await response.json();

// Afficher
children.map(relation => {
  const child = relation.child_entity;
  return child.has_public_page ? (
    <Link to={`/entites/${child.public_slug}`}>{child.name}</Link>
  ) : (
    <span>{child.name}</span>
  );
});
```

### Page Détail

```jsx
// Récupérer l'entité par public_slug
const response = await fetch(
  `${DIRECTUS_URL}/items/state_entity?filter[public_slug][_eq]=${slug}&fields=id,name,type.label,parents.parent_entity.name,parents.parent_entity.public_slug,parents.date_valid_from,parents.date_valid_to`
);
const { data } = await response.json();
const entity = data[0];

// Afficher historique des rattachements
entity.parents.map(relation => (
  <div>
    <span>{relation.date_valid_from} → {relation.date_valid_to || "Aujourd'hui"}</span>
    <Link to={`/entites/${relation.parent_entity.public_slug}`}>
      {relation.parent_entity.name}
    </Link>
  </div>
));
```

---

## 🔗 URLs recommandées pour le frontend

| Route | Affichage |
|-------|-----------|
| `/annuaire` | Page d'accueil avec filtres par type |
| `/annuaire/liste/ministeres` | Liste des ministères |
| `/annuaire/liste/agences` | Liste des agences |
| `/annuaire/arbre` | Vue arborescence interactive |
| `/entites/:public_slug` | Page détail d'une entité |
| `/annuaire/decret/:reference` | Annuaire filtré par décret |

---

**Toutes ces requêtes sont testées et fonctionnelles avec la structure Directus actuelle !** ✅
