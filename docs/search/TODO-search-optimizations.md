# TODO - Optimisations Recherche Typesense

> ⚠️ **Document remplacé par [`audit-recherche-2026-07.md`](./audit-recherche-2026-07.md)**
> (audit complet du 12/07/2026 : bug accents `locale: fr`, clés scoped, alias, couverture,
> analytics). Les items non traités ci-dessous y sont repris et priorisés.

> Date : 22/02/2026 (mis à jour le 23/02/2026)
> Statut : Archivé — voir audit-recherche-2026-07.md
> Concerne : `server/api/search.ts`, index Typesense `vpdata`, `composables/useSearchEnhanced.ts`

---

## Corrections appliquées (v6)

### ✅ Fix URL des documents

**Fichier** : `server/api/search.ts`
**Problème** : Les documents (JO, lois) généraient une URL `/actualites/{id}/{slug}` au lieu de `/documents/{id}/{slug}`.
**Cause** : La condition vérifiait `documentType === 'documents'` (pluriel) alors que l'index Typesense stocke `type: "document"` (singulier).
**Fix** : `if (documentType === 'document' || documentType === 'documents')`

### ✅ Fix exclude_fields avec champs inexistants

**Fichier** : `server/api/search.ts`
**Problème** : L'API retournait un 404 car `exclude_fields` listait des champs inexistants dans le schéma (`raw_content`, `metadata`).
**Fix** : `exclude_fields: 'content_html'` — ne lister que les champs réellement présents.

### ✅ Amélioration du logging d'erreur Typesense

**Fichier** : `server/api/search.ts`
**Problème** : Le catch masquait l'erreur réelle de Typesense (`error.status` au lieu de `error.statusCode`).
**Fix** : Type `error: any`, extraction de `statusCode` et `typesenseMessage` depuis `error.data` ou `error.response`.

### ✅ Amélioration du scoring de pertinence

**Fichier** : `server/api/search.ts`
**Problème** : Pour une recherche comme "code de la route", les actualités passaient avant un Journal Officiel contenant la loi sur le code de la route.

**Analyse du problème** : Les stop words français ("de", "la") matchaient dans les titres de tous les documents, ce qui
gonflait artificiellement le score des actualités via `text_match_type: max_weight` (le poids du champ titre étant
le plus élevé, un match de "la" dans le titre suffisait) et `prioritize_num_matching_fields` (les stop words
matchaient dans plusieurs champs).

**Paramètres finaux** :

| Paramètre | Valeur | Explication |
|---|---|---|
| `query_by_weights` | `100,20,5` (court) / `60,50,10` (phrase) / `80,30,5` (défaut) | Dynamique selon la complexité. Pour les phrases, le contenu pèse presque autant que le titre. |
| `text_match_type` | `max_score` | Utilise le **meilleur score réel** parmi les champs, pas le champ au poids le plus élevé. Évite que "la" dans un titre booste artificiellement. |
| `prioritize_exact_match` | `true` | Priorise les correspondances exactes de la phrase recherchée. |
| `prioritize_token_position` | `false` | Désactivé car les stop words matchent tôt dans les titres et biaisent le scoring. |
| `prioritize_num_matching_fields` | `false` | Désactivé car les stop words matchent dans tous les champs et gonflent `fields_matched`. |
| `drop_tokens_threshold` | `1` (phrases) / `2` (court) | Plus strict pour les phrases : garde tous les mots de la requête. |
| Détection stop words | Filtre "de", "la", "du", etc. | Évalue la complexité réelle de la requête (mots significatifs) pour choisir la bonne stratégie de poids. |

### ✅ Champ `priority` — Boost par type de document

**Date** : 23/02/2026
**Problème** : À score de pertinence égal, les actualités (plus récentes) remontaient avant les documents officiels à cause du tri secondaire `date_published:desc`.

**Actions réalisées** :

1. **Ajout du champ au schéma Typesense** :
   ```bash
   curl -X PATCH "https://search.vie-publique.sn/collections/vpdata" \
     -H "X-TYPESENSE-API-KEY: ${API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"fields": [{"name": "priority", "type": "int32", "sort": true, "optional": true}]}'
   ```

2. **Mise à jour en masse des documents existants** :
   ```bash
   # Documents officiels → priority = 90 (4673 documents mis à jour)
   curl -X PATCH "https://search.vie-publique.sn/collections/vpdata/documents?filter_by=type:=document&action=update" \
     -H "X-TYPESENSE-API-KEY: ${API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"priority": 90}'

   # Actualités → priority = 50 (187 documents mis à jour)
   curl -X PATCH "https://search.vie-publique.sn/collections/vpdata/documents?filter_by=type:=news&action=update" \
     -H "X-TYPESENSE-API-KEY: ${API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"priority": 50}'
   ```

3. **Tri mis à jour dans `server/api/search.ts`** :
   ```typescript
   sort_by: '_text_match:desc,priority:desc,date_published:desc'
   ```

**Résultat** : À pertinence égale, les documents officiels (JO, lois, décrets) remontent avant les actualités.

**Alternative native Typesense** : `optional_filter_by=type:=document` permet un boost sans champ supplémentaire,
mais le champ `priority` offre une granularité fine (possibilité de différencier lois=100, JO=90, décrets=85, etc.).

---

## Optimisations côté Index Typesense (à faire)

### 1. 🔲 Activer le stemming français

**Impact** : Élevé
**Effort** : Faible (modification du schéma + réindexation)

Le stemming permet de regrouper les variantes d'un même mot : "routier" → "route", "législatif" → "législ".

**Champs concernés** : `title`, `content_text`

```json
{
  "name": "title",
  "type": "string",
  "locale": "fr",
  "stem": true
}
```

**Action** : Mettre à jour le schéma de la collection `vpdata` et réindexer.

> ⚠️ Nécessite une réindexation complète. Tester dans un environnement de staging d'abord.

---

### 2. 🔲 Ajouter un champ `summary` / `description`

**Impact** : Moyen-Élevé
**Effort** : Moyen (modification de l'indexation CMS + schéma)

Actuellement, la recherche porte sur `title` (court) et `content_text` (très long, souvent du HTML nettoyé). Un champ intermédiaire `summary` (200-300 caractères) permettrait un scoring plus fin.

```
query_by: 'title,summary,content_text,tags'
query_by_weights: '80,60,30,5'
```

**Avantage** : Le résumé est plus dense en mots-clés pertinents que le contenu complet. Un JO dont le résumé mentionne "Code de la Route" sera fortement boosté.

---

### 3. ✅ ~~Ajouter un champ `priority` / `boost` par type de document~~ (FAIT)

> Implémenté le 23/02/2026 — voir section "Corrections appliquées" ci-dessus.
>
> Valeurs actuelles : `document` = 90, `news` = 50.
> Pour affiner par sous-type (lois=100, JO=90, décrets=85...), mettre à jour via l'API Typesense.

---

### 4. 🔲 Configurer les `token_separators`

**Impact** : Faible-Moyen
**Effort** : Très faible

Actuellement `token_separators: []` (vide). Ajouter des séparateurs pour mieux tokenizer les contenus français :

```json
{
  "token_separators": ["'", "'", "-"]
}
```

**Exemple** : "l'Assemblée" sera tokenisé en ["l", "Assemblée"] ce qui améliore la recherche sur "Assemblée" seul.

---

### 5. 🔲 Ajouter des synonymes

**Impact** : Moyen
**Effort** : Faible

Configurer des synonymes dans Typesense pour améliorer le rappel :

```bash
# API Typesense - Ajouter des synonymes
curl -X PUT "https://search.vie-publique.sn/collections/vpdata/synonyms/route-synonyms" \
  -H "X-TYPESENSE-API-KEY: ${API_KEY}" \
  -d '{
    "synonyms": ["code de la route", "code routier", "circulation routière"]
  }'
```

Synonymes utiles :
- "assemblée nationale" ↔ "parlement"
- "journal officiel" ↔ "JO"
- "loi de finances" ↔ "budget"
- "conseil des ministres" ↔ "gouvernement"

---

## Optimisations côté Application (à faire)

### 6. 🔲 Ajouter le `text_match_score` dans les résultats pour debug

**Impact** : Debug uniquement
**Effort** : Très faible

Utile en développement pour comprendre pourquoi un résultat est classé avant un autre :

```typescript
// server/api/search.ts - en mode dev uniquement
if (process.env.NODE_ENV === 'development') {
  searchParams.include_fields += ',text_match_score';
}
```

---

### 7. 🔲 Implémenter la recherche par phrase exacte

**Impact** : Moyen
**Effort** : Faible

Quand l'utilisateur met des guillemets (`"code de la route"`), forcer une recherche exacte :

```typescript
// Si la requête contient des guillemets, on garde tels quels
// Typesense supporte nativement les guillemets pour la recherche exacte
// Mais s'assurer que drop_tokens_threshold = 0 dans ce cas
if (searchTerm.includes('"')) {
  searchParams.drop_tokens_threshold = 0;
  searchParams.num_typos = 0;
}
```

---

### 8. 🔲 Améliorer le compteur de facettes pour "actualite"

**Fichier** : `composables/useSearchEnhanced.ts` (ligne ~107)

```typescript
// Actuellement : mappe "news" vers "actualite" mais l'index contient peut-être autre chose
resultCountsByType.value = {
  document: data.value.typeCounts?.document || 0,
  actualite: data.value.typeCounts?.news || 0, // ← Vérifier la valeur exacte dans l'index
};
```

**Action** : Vérifier dans Typesense quelles sont les valeurs exactes du champ `type` et adapter le mapping.

---

## Schéma d'index recommandé (cible)

```json
{
  "name": "vpdata",
  "default_sorting_field": "date_published",
  "enable_nested_fields": false,
  "token_separators": ["'", "'", "-"],
  "fields": [
    { "name": "title", "type": "string", "locale": "fr", "stem": true },
    { "name": "slug", "type": "string", "locale": "fr", "index": false },
    { "name": "summary", "type": "string", "locale": "fr", "stem": true, "optional": true },
    { "name": "content_text", "type": "string", "locale": "fr", "stem": true },
    { "name": "content_html", "type": "string", "index": false, "optional": true },
    { "name": "date_published", "type": "int64", "facet": true, "sort": true },
    { "name": "cover_image", "type": "string", "index": false, "optional": true },
    { "name": "tags", "type": "string[]", "facet": true, "locale": "fr", "optional": true },
    { "name": "category", "type": "string", "facet": true, "locale": "fr", "optional": true },
    { "name": "type", "type": "string", "facet": true },
    { "name": "priority", "type": "int32", "sort": true, "optional": true }
  ]
}
```

**Changements par rapport à l'actuel** :
- `stem: true` sur `title`, `content_text`
- Nouveau champ `summary`
- Nouveau champ `priority`
- `token_separators` configurés
- `slug` et `cover_image` non indexés (stockage seul → gain perf)
- `content_html` non indexé (redondant avec `content_text`)

---

## Priorités recommandées

| # | Tâche | Impact | Effort | Priorité | Statut |
|---|---|---|---|---|---|
| 3 | Champ `priority` par type | Moyen | Faible | 🔴 Haute | ✅ Fait |
| 1 | Stemming français | Élevé | Faible | 🔴 Haute | 🔲 À faire |
| 4 | Token separators | Moyen | Très faible | 🟡 Moyenne | 🔲 À faire |
| 5 | Synonymes | Moyen | Faible | 🟡 Moyenne | 🔲 À faire |
| 2 | Champ `summary` | Élevé | Moyen | 🟡 Moyenne | 🔲 À faire |
| 7 | Recherche phrase exacte | Moyen | Faible | 🟡 Moyenne | 🔲 À faire |
| 8 | Fix compteur facettes | Faible | Très faible | 🟢 Basse | 🔲 À faire |
| 6 | Debug score en dev | Debug | Très faible | 🟢 Basse | 🔲 À faire |
