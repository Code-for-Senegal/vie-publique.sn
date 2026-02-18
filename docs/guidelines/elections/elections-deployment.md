# 🚀 Migration du Schéma Électoral – Guide de Déploiement

> Guide complet pour migrer du schéma existant vers le nouveau schéma électoral générique

### Ajouter les champs manquants

**Dans `election_constituencies`** :

- `nationale_type` | Dropdown | Types nationaux (Text: `Département`; value: `departement` et Text: `Commune`; value: `commune`)
- `parent` | M2O → election_constituencies (self reference)

Dans `election_constitiencies` comme a un nouveau champs `nationale_type` il faut mettre les données existantes en `nationale_type`=`departement`

**Dans `election_candidates`** :

- `documents` M2O → documents (programme du candidat - pour les élection présidentielles)

**Dans `carte`** :


- `election` M2O → elections
- `constituencie` M20 → election_constituencies
- `winning_list` M20 → election_electoral_lists

**Dans `election_map_national`** :

- `election` M2O → elections

**Dans `election_map_diaspora`** :

- `election` M2O → elections
**Dans `elections`** :

| Champ | Type | Interface |
|-------|------|-----------|
| `documents` | Alias | list-m2m (→ documents via elections_documents) |
| `participation_rate` | Float | input |
| `processed_pv_rate` | Float | input |
| `rounds` | Integer | input |
| `election_date` | Date | datetime |
| `election_date_round_2` | Date | datetime |
| `registration_deadline` | Timestamp | datetime |
| `campaign_start_date` | Date | datetime |
| `campaign_end_date` | Date | datetime |
| `description` | Text | textarea |

---

### Créer la relation M2M entre `elections` et `documents`

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

### Collection `elections_documents` 🔗 ⭐ NOUVELLE (Junction M2M)

**Fonction** : Table de jonction pour la relation Many-to-Many entre `elections` et `documents`

**Champs** :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer (PK) | Identifiant unique |
| `elections_id` | integer (FK → elections) | Référence vers l'élection |
| `documents_id` | integer (FK → documents) | Référence vers le document |

**Impact** :
- ✅ Permet d'associer plusieurs documents à une élection
- ✅ Un document peut être lié à plusieurs élections
- ✅ Collection cachée dans Directus (`hidden: true`)

---

### Catégorie à créer dans `news_category`

Créer une nouvelle catégorie **"Election"** dans la collection `news_category`.

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

### Ajouter le type de document `election`

Dans la collection `documents` créer un nouveau type **Text**: `election`; **Value**: `election`

### Créer la collection `election_electoral_guide`

1. Créer une nouvelle collection **"election_electoral_guide"**
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

**Auteur** : Vie Publique Sénégal
