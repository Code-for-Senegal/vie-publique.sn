# 🎯 Prompt pour Claude Code - Implémentation Frontend Annuaire de l'État


backend est **Directus** (headless CMS) et contient une base de données structurée de **toutes les entités publiques du Sénégal** (ministères, agences, directions, sociétés nationales, etc.).

Les données proviennent des décrets de répartition des services de l'État (ex: Décret 2024-940 du 05 avril 2024) et sont importées automatiquement dans Directus.

## Modèle de données Directus

### Collections principales :

1. **`state_entity`** : Entités publiques (ministères, agences, directions...)
   - Champs clés : `id`, `name`, `slug`, `public_slug`, `has_public_page`, `type`, `business_key`, `last_decree_reference`

2. **`state_structure`** : Relations hiérarchiques parent-enfant
   - Champs : `parent_entity`, `child_entity`, `date_valid_from`, `date_valid_to`, `decree_reference`

3. **`state_status`** : Statuts des entités (actif/supprimé)
   - Champs : `entity`, `status`, `start_date`, `end_date`, `decree_reference`

4. **`state_alias`** : Anciens noms et sigles
   - Champs : `entity`, `alias`, `date_valid_from`, `date_valid_to`, `note`

5. **`state_type`** : Types d'entités (ministry, agency, directorate...)
   - Champs : `code`, `label`, `icon`, `color`

### Règles importantes :

- **`has_public_page`** : Si `true`, l'entité a une fiche publique accessible via `public_slug`
- **`public_slug`** : Unique, utilisé dans les URLs (ex: `ministere-justice`)
- **`date_valid_to`** : Si `null`, la relation est active. Sinon, c'est de l'historique.
- **`decree_reference`** : Permet de filtrer l'annuaire par version de décret
- **Types avec fiche publique** : `presidency`, `primature`, `ministry`, `agency`, `public_institution`, `state_owned_enterprise`, `other`
- **Types sans fiche** : `directorate`, `service` (structures internes)

### Structure hiérarchique :

```
Présidence de la République (racine)
├── Cabinet du Président
│   ├── IGE, OFNAC (agences)
│   └── Directions...
└── ...

Primature (racine)
├── Structures rattachées
└── ...

Ministère 1 (racine)
├── DAGE
├── Directions
└── Agences rattachées

Ministère 2 (racine)
...
```

**Important** : Les ministères n'ont PAS de parent (ils sont des racines au même niveau que Présidence/Primature).

## Documentation API disponible

Lis attentivement le fichier **`state-api.md`** qui contient :
- Toutes les requêtes Directus nécessaires
- Exemples de réponses JSON
- Cas d'usage pour chaque vue
- Note sur le filtrage des entités actives/supprimées

## Ce que je veux que tu implémentes

### 1️⃣ **Page d'accueil de l'annuaire** (`/etat-senegal/annuaire`)

**Design** :
- Un header avec le titre "Annuaire de l'État du Sénégal"
- **2 onglets (Tabs)** :
  - 📋 **Vue Liste** (par défaut)
  - 🌳 **Vue Arborescence**

#### Tab "Vue Liste"

**Filtres par type** (pills/badges cliquables avec compteurs) :
- 🏛️ **Ministères** (25)
- 🏢 **Agences** (42)
- 🏭 **Établissements Publics** (15)
- 🏦 **Sociétés Nationales** (8)

**Barre de recherche** :
- Placeholder : "Rechercher une entité par nom ou sigle..."
- Recherche instantanée (debounce 300ms)
- Recherche dans `name` ET `aliases`

**Liste paginée** :
- 20 entités par page
- Affichage sous forme de cartes ou tableau
- Pour chaque entité :
  - **Nom** (cliquable si `has_public_page = true`)
  - **Type** (badge de couleur selon `type.color`)
  - **Parent** (si l'entité n'est PAS un ministère/présidence/primature)
    - Format : "Rattaché à : [Nom du parent]"
    - Afficher le parent direct (ex: "Ministère de la Justice")
- Pagination avec compteur : "24 résultats sur 125"
- Tri alphabétique par défaut

**Comportement des filtres** :
- Clic sur "Ministères" → Affiche uniquement les ministères
- Clic sur "Agences" → Affiche toutes les agences avec leur parent (ex: "Rattaché à : Ministère X")
- Clic sur "Établissements Publics" → Idem
- Clic sur "Sociétés Nationales" → Idem

**Routes** :
- `/etat-senegal/annuaire` (défaut = tous)
- `/etat-senegal/annuaire?type=ministry` (filtré ministères)
- `/etat-senegal/annuaire?type=agency` (filtré agences)
- `/etat-senegal/annuaire?type=public_institution`
- `/etat-senegal/annuaire?type=state_owned_enterprise`

#### Tab "Vue Arborescence"

**Affichage initial** : Groupes repliés

```
🏛️ Institutions (2) [expandable]
🏢 Ministères (25) [expandable]
```

**Quand on expand "Institutions"** :
```
🏛️ Institutions (2) [collapse]
  📂 Présidence de la République [expandable + cliquable]
  📂 Primature [expandable + cliquable]
```

**Quand on expand "Ministères"** :
```
🏢 Ministères (25) [collapse]
  📂 Ministère de l'Intégration Africaine [expandable + cliquable]
  📂 Ministère des Forces Armées [expandable + cliquable]
  📂 Ministère de la Justice [expandable + cliquable]
  ...
```

**Quand on expand un nœud (ex: Ministère de la Justice)** :
```
  📂 Ministère de la Justice [collapse]
    📁 DAGE [non cliquable]
    📂 Direction des Affaires Civiles [expandable si enfants]
    📂 ARTP (agence) [cliquable]
    ...
```

**Fonctionnalités** :
- **Lazy loading** : Charger les enfants uniquement quand on expand
- **Cliquabilité** :
  - Si `has_public_page = true` → Lien vers `/etat-senegal/annuaire/{public_slug}`
  - Si `has_public_page = false` → Pas de lien, juste expand/collapse
- **Icônes dynamiques** selon le type :
  - 🏛️ Présidence/Primature
  - 🏢 Ministère
  - 📂 Agence (cliquable)
  - 📁 Direction/Service (non cliquable)
- **Compteur d'enfants** : Afficher "(12)" à côté du nom si entité a des enfants
- **Boutons** :
  - "Tout déplier" / "Tout replier"
  - Barre de recherche pour filtrer l'arbre

---

### 2️⃣ **Page Détail d'une entité** (`/etat-senegal/annuaire/:public_slug`)

**URL** : Utiliser uniquement le `public_slug` (pas besoin d'ID)
- Exemple : `/etat-senegal/annuaire/ministere-justice`
- Raison : Le `public_slug` est unique et SEO-friendly

**Design** :

- **Breadcrumb** : Annuaire > [Type] > [Nom]

- **Section 1 : Informations générales**
  - Nom complet (H1)
  - Type (badge de couleur)
  - Sigle/Acronyme (si alias actuel)
  - Dernier décret de référence (petit texte gris)

- **Section 2 : Rattachement actuel**
  - Titre : "Rattachement"
  - Parent actif (lien si `has_public_page`)
  - Format : "Rattaché à : [Ministère X]" ou "Institution de premier niveau" si pas de parent
  - Date de rattachement : "Depuis le 05/04/2024 (Décret 2024-940)"

- **Section 3 : Historique des rattachements** (si plusieurs)
  - Titre : "Historique des rattachements"
  - Timeline verticale avec dates et parents
  - Format :
    ```
    ● 05/04/2024 - Aujourd'hui : Ministère de la Justice (Décret 2024-940)
    ● 10/04/2023 - 04/04/2024 : Primature (Décret 2023-456)
    ```
  - Liens vers les parents si `has_public_page`

- **Section 4 : Anciens noms** (state_alias)
  - Titre : "Anciens noms et sigles"
  - Liste des alias avec dates et note
  - Format :
    ```
    • Ministère de la Culture (du 01/01/2020 au 04/04/2024)
      Note : Ancien nom officiel (avant décret 2024-940)
    ```

- **Section 5 : Sous-structures** (enfants)
  - Titre : "Structures rattachées" + compteur (ex: "12 structures")
  - Liste groupée par type :
    - Agences (3)
    - Directions (8)
    - Services (1)
  - Liens si `has_public_page = true`

- **Boutons d'action** :
  - Retour à la liste
  - Voir dans l'arborescence

**Fonctionnalités** :
- Utiliser la requête de la section 3.1 du `API-FRONTEND.md`
- Afficher "Aucun historique" si une seule relation parent
- Afficher "Aucun ancien nom" si pas d'alias
- Afficher "Aucune structure rattachée" si pas d'enfants
- Gérer le cas où l'entité n'existe pas (404)

---

## Spécifications techniques

### Stack technique à utiliser :
- **Framework** : [Indique ton framework : React, Vue, Next.js, Nuxt, etc.]
- **Styling** : [Indique : Tailwind CSS, Material UI, Ant Design, etc.]
- **Routing** : [React Router, Vue Router, Next.js App Router, etc.]
- **State management** : [Si nécessaire : Zustand, Pinia, Redux, etc.]
- **HTTP client** : Axios ou Fetch API

### Configuration Directus :
```typescript
const DIRECTUS_URL = 'https://cms.vie-publique.sn';
// Pour les requêtes publiques, pas besoin de token
// Pour les requêtes admin, utiliser : Authorization: Bearer <TOKEN>
```

### Structure des URLs :
```
/etat-senegal/annuaire                    → Page principale (tabs: liste | arbre)
/etat-senegal/annuaire?type=ministry      → Liste filtrée par type
/etat-senegal/annuaire/:public_slug       → Page détail
```

### Composants réutilisables à créer :
1. **EntityCard** : Carte pour afficher une entité dans la liste
2. **EntityLink** : Lien conditionnel selon `has_public_page`
3. **TypeBadge** : Badge de couleur selon `type.color` et `type.label`
4. **TreeNode** : Nœud de l'arbre hiérarchique (récursif)
5. **TreeGroup** : Groupe dans l'arbre (Institutions, Ministères)
6. **Timeline** : Timeline pour l'historique des rattachements
7. **Breadcrumb** : Fil d'Ariane
8. **SearchBar** : Barre de recherche avec debounce

### Gestion des états :
- **Loading** : Skeleton ou spinner pendant le chargement
- **Empty** : Message si aucun résultat (ex: "Aucune entité trouvée")
- **Error** : Message d'erreur avec bouton retry
- **404** : Page not found pour entités inexistantes

### Responsive :
- Mobile first
- Navigation adaptative (menu hamburger sur mobile)
- Tabs horizontaux sur desktop, empilés sur mobile
- Arbre avec indentation réduite sur mobile

### Accessibilité :
- Utiliser des balises sémantiques (`<nav>`, `<article>`, `<section>`)
- Alt text sur les icônes
- Aria labels sur les boutons expand/collapse
- Support clavier pour la navigation dans l'arbre (Tab, Enter, flèches)

### Performance :
- Lazy loading des enfants dans l'arbre
- Pagination des listes (20 par page)
- Debounce sur la recherche (300ms)
- Cache des requêtes Directus (React Query ou SWR recommandé)
- Virtualisation si liste > 100 items

---

## Livrables attendus

1. **Tous les composants nécessaires** avec leur logique
2. **Les pages/routes** correspondantes
3. **Les hooks/services** pour appeler l'API Directus
4. **Les types TypeScript** (si applicable) pour les entités
5. **Un README** avec les instructions d'installation et de lancement

---

## Instructions supplémentaires

- **Commence par la vue Liste** (plus simple) avant l'arbre
- **Utilise les exemples du fichier `API-FRONTEND.md`** pour construire les requêtes
- **Respecte les règles de `has_public_page`** : c'est crucial pour UX
- **Gère l'historique** : c'est une fonctionnalité clé du système multi-décrets
- **Design moderne et épuré** : inspiré de sites gouvernementaux modernes (service-public.fr, gov.uk)
- **Ajoute des commentaires** dans le code pour expliquer les requêtes API
- **Interface fluide et intuitive** : privilégie la simplicité et la clarté

---

## Références

- **API Documentation** : Voir le fichier `API-FRONTEND.md`
- **Modèle de données** : Voir le fichier `readme-state.md`
- **Directus API Docs** : https://docs.directus.io/reference/query.html


