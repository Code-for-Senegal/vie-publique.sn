# 📘 State – Annuaire des entités publiques du Sénégal

### (Spécification fonctionnelle & modèle de données)

## 🎯 Objectifs

Le module “Annuaire de l’État” a pour but de :

* Rendre compréhensible **l’architecture administrative** du Sénégal
* Permettre la **navigation hiérarchique** (Présidence → Primature → Ministères → Directions / Agences / EP / Sociétés publiques…)
* Gérer **les remaniements** et changements de noms dans le temps
* Pouvoir relier chaque entité à **des données budgétaires**
* Permettre une **recherche fiable** même si les libellés varient

---

## 🧱 Modèle de données — Collections `state_`

| Collection          | Rôle                  | Description courte                                       |
| ------------------- | --------------------- | -------------------------------------------------------- |
| **state_entity**    | Entités de l'État     | Ministères, agences, directions, EP, sociétés publiques… |
| **state_structure** | Hiérarchie            | Relations **parent → enfant** entre entités              |
| **state_status**    | Périodes d'existence  | Actif / supprimé + dates                                 |
| **state_alias**     | Noms alternatifs      | Anciennes appellations, sigles, variantes OCR            |
| **state_type**      | Typologie des entités | Référentiel categorie : ministry, agency…                |

---

## 📌 Détail des collections

### ✅ 1) `state_entity` – identité durable

| Champ                       | Type                    | Exemple                |
| --------------------------- | ----------------------- | ---------------------- |
| `id`                        | UUID                    | `…`                    |
| `name`                      | string                  | “Ministère des Sports” |
| `type`                      | relation → `state_type` | ministry               |
| `slug`                      | unique                  | ministere-sports       |
| `short_name`                | string                  | Sports                 |
| `website`, `email`, `phone` | optionnels              |                        |

role: fonction d’affichage dans l’arbo (est-ce une institution cliquable ou un conteneur/structure non cliquable ?).

status: draft, published, archived

→ C’est l’entité **quel que soit** le remaniement ou le changement de nom.

---

### ✅ 2) `state_structure` – rattachements hiérarchiques

| Champ           | Type                      | Exemple                    |
| --------------- | ------------------------- | -------------------------- |
| `parent_entity` | relation → `state_entity` | Ministère des Sports       |
| `child_entity`  | relation → `state_entity` | Office National des Sports |

→ Permet l’arborescence et la navigation dans l’organisation administrative.

---

### ✅ 3) `state_status` – existence dans le temps

| Champ        | Exemple              |
| ------------ | -------------------- |
| `entity`     | Ministère du Travail, relation “Plusieurs à un” vers state_entity  |
| `status`     | active, deleted             |
| `start_date` | 2024-04-10           |
| `end_date`   | 2025-09-15           |

→ On filtre l’affichage pour ne montrer que les entités **actives**.
→ Historique consultable (**avant / après remaniement**).

state_status.status — valeurs autorisées (enum)

| Valeur    | Signification                           | Utilisation UI           |
| --------- | --------------------------------------- | ------------------------ |
| `active`  | Entité existante et visible aujourd’hui | Affichée dans l’annuaire |
| `deleted` | Supprimée / remplacée / plus en vigueur | Masquée par défaut       |

Pour chaque entité (state_entity) :

| Action                              | Conséquence dans `state_status`          |
| ----------------------------------- | ---------------------------------------- |
| Nouvelle entité                     | `active + start_date`                    |
| Changement de nom                   | rien ici ✅ → géré dans `state_alias`     |
| Remaniement → changement de tutelle | rien ici ✅ → géré dans `state_structure` |
| Fusion / disparition                | `deleted + end_date`                     |


---

### ✅ 4) `state_alias` – variations de noms


| Champ        | Type                                         | Exemple                                |
| ------------ | -------------------------------------------- | -------------------------------------- |
| `entity`     | **relation : Plusieurs à un → state_entity** | Ministère des Sports                   |
| `alias`      | string                                       | Ministère de la Jeunesse et des Sports |
| `valid_from` | date (optionnel)                             | 2024-04-10                             |
| `valid_to`   | date (optionnel)                             | 2025-09-15                             |
| `note`       | string                                       | Ancien nom officiel                    |


→ Recherche robuste + matching automatique lors d’import de PDF budgétaires.



---

### ✅ 5) `state_type` – catégories des entités

## Collection : state_type
Typologie des entités de l’État

| Champ       | Type          | Obligatoire | Description |
|------------|---------------|-------------|-------------|
| id         | UUID (auto)   | ✅          | Identifiant unique |
| code       | string unique | ✅          | Valeur interne stable, ex: `ministry` |
| label      | string        | ✅          | Nom affiché dans l’UI, ex: `Ministère` |
| description | text         | ❌          | Explication courte (affichage admin) |
| icon       | string (emoji ou design system) | ❌ | Icône de l’UI |
| color      | color (Directus) | ❌ | Badge couleur dans l’UI |

### Contraintes :
- `code` doit être **unique** & **non modifiable** après création
- `label` affiché dans les interfaces
- Toutes les entités (`state_entity`) doivent pointer vers un `state_type`


| Code                 | Label                | Exemple          |
| -------------------- | -------------------- | ---------------- |
| presidency           | Présidence           | Présidence       |
| primature            | Primature            | Primature        |
| ministry             | Ministère            | Ministère Santé  |
| directorate          | Direction / Service  | DG Finances      |
| agency               | Agence / Autorité    | ARTP             |
| etablissement_public | Établissement public | Universités, CHU |
| societe_publique     | Société publique     | SENELEC          |
| other                | Autre organisme      | Conseil, Comité  |

→ Filtrage par catégorie dans l’UI.

---

## ✅ Règles fonctionnelles

| Sujet                | Règle retenue                                                       |
| -------------------- | ------------------------------------------------------------------- |
| Changement de nom    | Modifier `state_entity.name` + ajouter un `state_alias` avec dates  |
| Remaniement          | Mise à jour dans `state_structure` + `state_status`                 |
| Suppression d’entité | `state_status.status = supprimé` + date de fin                      |
| Nouvelle entité      | Nouvelle ligne `state_entity` + rattachement dans `state_structure` |
| Recherche            | Utilise `name` + `state_alias.alias`                                |

→ **Jamais** créer une nouvelle entité juste pour un changement de nom ✅

---

## 🧭 Usages front

| Vue                        | Données utilisées                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arborescence de l’État** | `state_structure` + `state_entity` + `state_status`                                                                                           |
| **Liste par type**         | `state_entity` + `state_type`                                                                                                                 |
| **Fiche entité**           | `state_entity` (header), `state_structure` (parent/enfants), `state_status` (historique), `state_alias` (variations), et **plus tard** budget |

🧠 Lien naturel avec le module Budget :
`budget_line.entity` → `state_entity.id`

---

## ✅ Résumé TL;DR

```
state_entity  ←──────→  state_structure
     │
 state_status
     │
 state_alias
     │
 state_type
```

📌 Un cœur très simple
📌 100% aligné avec le contexte sénégalais
📌 Compatible extension Budget
📌 Automatisation d’import facilitée depuis les PDF

---

** Comment on décide du type ?
Comment on décide du type ?
| Indice                                 | Type                                      |
| -------------------------------------- | ----------------------------------------- |
| Mentionné dans l’**Article 2**         | `etablissement_public` ✅                  |
| Mentionné dans l’**Article 3**         | `societe_publique` ✅                      |
| Listé sous un ministère sans précision | `agency` ou `directorate` selon la nature |
| Placé sous une Direction               | `service`                                 |
| Placé comme bloc interne               | `directorate`                             |


📌 Le nom ne suffit jamais → seule la section du décret compte
