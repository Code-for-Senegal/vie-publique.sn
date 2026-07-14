# Système de Recherche Typesense

> ⚠️ **Document partiellement périmé (13/07/2026).** Depuis la migration v2, l'index actif est
> **`vpdata_v2`** (via l'alias **`vp-search`**), 14 604 docs multi-types (documents, actualités,
> députés, questions, votes, dossiers, personnalités, annuaire, podcasts), sans `locale: fr`,
> ids namespacés `<type>-<id>`, champ `url` précalculé. Réindexation/réconciliation :
> `scripts/search-reindex.mjs`. **Référence à jour : [`audit-recherche-2026-07.md`](../../audits/audit-recherche-2026-07.md).**
> Les sections ci-dessous restent valables pour l'algorithme de scoring (poids dynamiques,
> `max_score`, tri par `priority`), mais les chiffres et le schéma décrivent l'ancien index v1.

## Vue d'ensemble

Le système de recherche utilise Typesense (v28.0) comme moteur de recherche full-text pour indexer et rechercher dans les actualités et documents officiels du site Vie-Publique.sn. L'index `vpdata` contient environ 4 860 documents (4 673 documents officiels + 187 actualités).

---

## Algorithme de recherche — Fonctionnement complet

### 1. Réception de la requête

**Fichier** : `server/api/search.ts`
**Endpoint** : `GET /api/search?q={query}&page={page}&limit={limit}&types={types}`

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `q` | string | _(requis)_ | Terme de recherche. Si vide avec `types`, utilise `*` (tout). |
| `page` | int | 1 | Numéro de page |
| `limit` | int | 20 | Résultats par page |
| `types` | string | _(vide)_ | Filtre par type, séparé par virgules : `document`, `actualite` |

### 2. Analyse de la requête

Avant d'envoyer la requête à Typesense, l'algorithme analyse le texte pour adapter sa stratégie :

```
"code de la route" → 4 mots, 2 stop words ("de", "la"), 2 mots significatifs ("code", "route")
```

**Stop words détectés** : `de, du, la, le, les, des, un, une, et, en, au, aux, à, l`

Trois catégories de requêtes :

| Catégorie | Condition | Exemple | Poids (title, content, tags) |
|---|---|---|---|
| **Courte** | ≤ 2 mots ET ≤ 2 mots significatifs | "budget 2024" | `100, 20, 5` |
| **Phrasale** | > 2 mots OU guillemets OU ≥ 3 mots significatifs | "code de la route" | `60, 50, 10` |
| **Par défaut** | Tous les autres cas | | `80, 30, 5` |

**Logique** : Pour une requête courte, le titre est largement prioritaire. Pour une expression/phrase, le contenu monte en importance car le document le plus pertinent a souvent l'expression dans son contenu (ex: un JO contenant la loi sur le code de la route).

### 3. Paramètres Typesense

La requête envoyée à Typesense utilise ces paramètres :

```
query_by:                     title, content_text, tags
query_by_weights:             [dynamique selon la catégorie]
sort_by:                      _text_match:desc, priority:desc, date_published:desc
text_match_type:              max_score
prioritize_exact_match:       true
prioritize_token_position:    false
prioritize_num_matching_fields: false
drop_tokens_threshold:        1 (phrases) / 2 (court)
typo_tokens_threshold:        3 (phrases) / 2 (court)
facet_by:                     type
```

**Détail des choix** :

| Paramètre | Valeur | Pourquoi |
|---|---|---|
| `text_match_type: max_score` | Utilise le **meilleur score réel** parmi tous les champs | `max_weight` privilégiait le champ au poids le plus élevé même si le match y était faible (ex: "la" dans un titre → poids titre élevé → faux positif). |
| `prioritize_token_position: false` | Désactivé | Les stop words français ("la", "de") apparaissent tôt dans presque tous les titres, ce qui biaisait le scoring. |
| `prioritize_num_matching_fields: false` | Désactivé | Les stop words matchent dans tous les champs (titre + contenu + tags), gonflant artificiellement `fields_matched` pour des documents non pertinents. |
| `prioritize_exact_match: true` | Activé | Un résultat contenant "code de la route" en phrase exacte est boosté par rapport à un document contenant ces mots séparément. |

### 4. Tri des résultats

Le tri s'effectue en **3 niveaux**, évalués dans l'ordre :

```
1. _text_match:desc    → Score de pertinence textuelle (prioritaire)
2. priority:desc       → Poids par type de document (départage)
3. date_published:desc → Documents les plus récents en premier (dernier recours)
```

**Champ `priority`** (int32 dans le schéma Typesense) :

| Type de contenu | Valeur `priority` | Nombre de docs |
|---|---|---|
| Documents officiels (JO, lois, décrets) | **90** | 4 673 |
| Actualités (news, conseil des ministres) | **50** | 187 |

**Effet** : À score de pertinence identique, un Journal Officiel contenant "code de la route" remontera avant un communiqué du Conseil des ministres qui le mentionne en passant.

### 5. Filtres par type

Si l'utilisateur sélectionne un filtre :

| Filtre UI | Valeur `types` | Filtre Typesense |
|---|---|---|
| Documents | `document` | `type:=document` |
| Actualités | `actualite` | `type:!=document` (tous sauf documents) |
| Les deux | `document,actualite` | `type:=document \|\| type:!=document` |

Les facettes (`facet_by: type`) sont toujours activées pour afficher le compteur de résultats par type, même quand un filtre est actif.

### 6. Formatage des URLs de résultats

Chaque résultat est associé à une URL selon son type et sa catégorie :

| Type | Catégorie | URL générée |
|---|---|---|
| `document` | _(tous)_ | `/documents/{id}/{slug}` |
| `news` | `conseil-des-ministres` | `/conseil-des-ministres/{id}/{slug}` |
| `news` | `assemblee-nationale` | `/assemblee-nationale/actualites/{id}/{slug}` |
| `news` | _(autre)_ | `/actualites/{id}/{slug}` |

Le slug est soit celui stocké dans l'index, soit généré à partir du titre (lowercase, caractères spéciaux remplacés par des tirets).

### 7. Highlighting

Les termes recherchés sont mis en surbrillance dans le titre et le contenu via des balises `<mark>` :

```
highlight_fields:        title, content_text
highlight_start_tag:     <mark>
highlight_end_tag:       </mark>
highlight_affix_num_tokens: 5  (mots de contexte autour du match)
```

Côté client (`useSearchEnhanced.ts`), si Typesense ne retourne pas de highlight (match dans les tags par exemple), un highlighting manuel est appliqué par regex.

### 8. Réponse API

```json
{
  "data": [
    {
      "document": { "id", "title", "content_text", "type", "category", "date_published", "cover_image", "slug" },
      "highlight": { "content_text": { "snippet": "...texte avec <mark>match</mark>..." } },
      "text_match": 2314894167592927344,
      "text_match_info": { "best_field_score", "best_field_weight", "fields_matched", "tokens_matched" },
      "formattedUrl": "/documents/771/JO-7520-du-27-avril-2022"
    }
  ],
  "total": 112,
  "totalIndexed": 4860,
  "query": "code de la route",
  "page": 1,
  "typeCounts": { "document": 100, "news": 12 }
}
```

### 9. Schéma de l'index Typesense (`vpdata`)

| Champ | Type | Indexé | Facette | Triable | Locale |
|---|---|---|---|---|---|
| `title` | string | oui | non | non | fr |
| `slug` | string | oui | non | non | fr |
| `content_text` | string | oui | non | non | fr |
| `content_html` | string | oui | non | non | fr |
| `date_published` | int64 | oui | oui | oui | — |
| `cover_image` | string | oui | non | non | — |
| `tags` | string[] | oui | oui | non | fr |
| `category` | string | oui | oui | non | fr |
| `type` | string | oui | oui | non | — |
| `priority` | int32 | oui | non | oui | — |

### 10. Diagramme de flux

```
Utilisateur tape "code de la route"
         │
         ▼
  [pages/recherche.vue]
  useSearchEnhanced() → debounce 300ms
         │
         ▼
  GET /api/search?q=code+de+la+route&page=1&limit=10
         │
         ▼
  [server/api/search.ts]
  ├─ Analyse requête : 4 mots, 2 significatifs → phrasale
  ├─ Poids : title=60, content=50, tags=10
  ├─ sort_by : _text_match → priority → date_published
  │
  ▼
  [Typesense API]
  /collections/vpdata/documents/search
  ├─ Scoring text_match (max_score)
  ├─ Tri : pertinence → priority(90/50) → date
  ├─ Facettes par type
  │
  ▼
  [server/api/search.ts]
  ├─ Formatage URLs (/documents/... ou /actualites/...)
  ├─ Extraction des facettes (typeCounts)
  │
  ▼
  [useSearchEnhanced.ts]
  ├─ Highlighting (Typesense ou fallback regex)
  ├─ Mapping compteurs par type
  │
  ▼
  [pages/recherche.vue]
  Affichage : résultats, pagination, filtres, compteurs
```

---

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Configuration Typesense
TYPESENSE_API_KEY=your_typesense_api_key_here
TYPESENSE_URL=https://search.vie-publique.sn
```

### Configuration Nuxt

Les variables sont configurées dans `nuxt.config.ts` :

```typescript
runtimeConfig: {
  // Variables privées (côté serveur uniquement)
  typesenseApiKey: process.env.TYPESENSE_API_KEY,
  typesenseUrl: process.env.TYPESENSE_URL || 'https://search.vie-publique.sn',
  // ...
}
```

## Architecture

### Composants

1. **AppSearch.vue** - Icône de recherche dans le header
2. **pages/recherche.vue** - Page de recherche principale
3. **server/api/search.ts** - API côté serveur pour Typesense
4. **composables/useSearch.ts** - Logique de recherche réutilisable

### Flux de données

1. L'utilisateur clique sur l'icône de recherche dans le header
2. Il est redirigé vers `/recherche`
3. Il tape sa requête dans le champ de recherche
4. La requête est envoyée à `/api/search` avec debounce (300ms)
5. L'API fait une requête vers Typesense
6. Les résultats sont affichés avec pagination

## Fonctionnalités

### Recherche en temps réel

- Debounce de 300ms pour éviter trop de requêtes
- Recherche automatique lors de la saisie
- Indicateur de chargement

### Affichage des résultats

- Titre de l'article
- Extrait avec mise en surbrillance des termes recherchés
- Image de couverture
- Catégorie et date de publication
- Pagination

�� Fonctionnalités
Recherche en temps réel avec debounce
Mise en surbrillance des termes recherchés
Navigation cohérente vers les articles
Pagination des résultats
Interface responsive et moderne
Sécurité : API key protégée côté serveur

- [] Intégrer InstantSearch.js de Typesense
- [] Ajouter filtres par catégories/tags
- [] Highlighting des résultats

2. Votre implémentation actuelle : Bien mais
   basique

Points positifs :

- Structure claire avec composable
- Gestion d'état correcte
- Pagination fonctionnelle
- UX avec debounce

Points à améliorer :

- Pas de highlighting (paramètres manquants)
- Recherche limitée à une seule collection
- Pas de filtres avancés
- Pas de suggestions/autocomplete

InstantSearch.js est une librairie qui fournit des  
 widgets prêts à l'emploi pour créer des
interfaces de recherche avancées :

● Gardez votre approche actuelle mais améliorez-la :

1. Correction immédiate : Ajoutez les paramètres  
   de highlighting
2. Améliorations courtes :

   - Tri par pertinence/date
   - Filtres par catégorie
   - Recherche facettée

3. Migration vers InstantSearch.js seulement si  
   vous voulez :

   - Interface ultra-avancée
   - Analytics détaillés
   - Moins de code custom

### Navigation

- Liens vers les articles avec formatage d'URL cohérent
- Gestion des catégories spéciales (conseil des ministres, assemblée nationale)

## API Typesense

### Endpoint

```
GET /api/search?q={query}&page={page}
```

### Paramètres

- `q` : Terme de recherche
- `page` : Numéro de page (optionnel, défaut: 1)

### Réponse

```json
{
  "data": [
    {
      "document": {
        "id": "string",
        "title": "string",
        "content_text": "string",
        "cover_image": "string",
        "category": {
          "name": "string",
          "slug": "string"
        },
        "date_published": "string"
      },
      "highlights": {
        "content_text": "string avec <mark>balises</mark>"
      }
    }
  ],
  "total": 42,
  "query": "conseil",
  "page": 1
}
```

## Sécurité

- L'API key Typesense est stockée côté serveur uniquement
- Pas d'exposition de l'API key côté client
- Validation des paramètres d'entrée
- Gestion d'erreurs appropriée

## Maintenance

### Ajout de nouveaux types de contenu

1. Indexer le nouveau contenu dans Typesense
2. Adapter la fonction `formatNewsUrl` si nécessaire
3. Mettre à jour les types TypeScript si besoin

### Optimisation des performances

- Utilisation de `useDebounceFn` pour limiter les requêtes
- Pagination côté serveur
- Cache des résultats (à implémenter si nécessaire)

## Dépannage

### Erreurs courantes

1. **Configuration manquante** : Vérifiez les variables d'environnement
2. **API key invalide** : Vérifiez la clé Typesense
3. **Pas de résultats** : Vérifiez l'indexation dans Typesense

### Logs

Les erreurs sont loggées côté serveur dans la console.

## instantsearch

Fonctionnalités implémentées :

1. InstantSearch Integration : Utilise
   typesense-instantsearch-adapter pour une recherche en temps  
   réel
2. Filtre par type : Sidebar avec des cases à cocher pour  
   filtrer entre "Document" et "Actualité"
3. Badges de type : Chaque résultat affiche un badge coloré
   (orange pour documents, bleu pour actualités)
4. Highlighting : Les termes recherchés sont mis en évidence  
   avec un fond jaune
5. Synchronisation URL : Les paramètres de recherche sont
   synchronisés avec l'URL pour partage et navigation
6. Pagination : Navigation entre les pages de résultats
7. Statistiques : Affiche le nombre de résultats et le temps de  
   recherche
8. Design responsive : Layout adaptatif avec sidebar sur
   desktop

Points clés :

- La configuration Typesense utilise les variables
  d'environnement existantes
- Les résultats sont formatés avec les mêmes règles d'URL que  
  la v1
- Support du dark mode
- Les highlights utilisent les balises <mark> avec style
  personnalisé
- Performance optimisée avec lazy loading des images

1. recherche en temps  
   réel
2. Filtre par type : Sidebar avec des cases à cocher pour  
   filtrer entre "Document" et "Actualité"
3. Badges de type : Chaque résultat affiche un badge coloré
   (orange pour documents, bleu pour actualités)
4. Highlighting : Les termes recherchés sont mis en évidence  
   avec un fond jaune
5. Synchronisation URL : Les paramètres de recherche sont
   synchronisés avec l'URL pour partage et navigation
6. Pagination : Navigation entre les pages de résultats
7. Statistiques : Affiche le nombre de résultats et le total indéxés
8. Design responsive : Layout adaptatif

🎯 Nouvelles fonctionnalités :

- Sidebar filtres (desktop) + menu coulissant (mobile)
- Recherches suggérées pour l'état initial
- Statistiques détaillées dans la sidebar
- Interface moderne avec Nuxt UI
- Gestion d'état avancée avec synchronisation URL
- Animations et transitions fluides

## v5

✅ Amélioration UX Mobile Complete !

🎯 Changements apportés :

1. ❌ Suppression de la sidebar mobile - Plus
   de USlideover à ouvrir
2. ✅ Filtres toujours visibles - Directement
   intégrés sous la recherche
3. 🎨 Design amélioré :

   - Grid 2 colonnes pour les filtres
   - Boutons toggle avec transitions
   - Compteur de filtres actifs
   - Statistiques compactes et centrées
   - Icônes et couleurs cohérentes

📱 Avantages sur mobile :

- Accès immédiat aux filtres sans clic
  supplémentaire
- Interface claire avec seulement 2 filtres
  (Documents / Actualités)
- Feedback visuel sur les filtres actifs
- Statistiques intégrées pour le contexte
- Plus compact et optimisé pour les petits
  écrans

🚀 Résultat :

L'interface mobile est maintenant plus directe  
 et intuitive :

- Pas de menu caché
- Filtres accessibles d'un coup d'œil
- Design cohérent avec le reste de
  l'application
- Performance optimale sans composants lourds

## v3 - Avantages de cette nouvelle structure

Plus simple : Interface unifiée sans sidebar
Plus d'espace : Les résultats utilisent toute la largeur disponible
Plus cohérent : Même comportement sur mobile et desktop
Plus moderne : Design épuré et minimaliste
Meilleure UX : Les filtres sont toujours visibles sous la recherche
La page est maintenant beaucoup plus claire et les résultats ont plus d'espace pour s'afficher ! 🚀

## v5

Les améliorations apportées :

1. Poids très différenciés : 100,10,5 au lieu de 10,2,1 - donne une  
   priorité massive aux titres
2. prioritize_exact_match: true : Priorise les correspondances exactes  
   de la phrase recherchée
3. typo_tokens_threshold: 2 : Réduit la tolérance aux fautes pour éviter des résultats trop larges
4. drop_tokens_threshold: 2 : Empêche d'ignorer les mots courts
   importants comme "de" dans "loi de finance"

Maintenant le système s'adapte intelligemment :

- Recherches courtes (1-2 mots comme "loi finance") : Poids
  100,10,5 - priorité maximale aux titres
- Recherches longues (3+ mots ou phrases entre guillemets) : Poids  
  50,20,10 - équilibre entre titre et contenu car l'utilisateur
  cherche probablement une information spécifique dans le texte

## v6 — Pertinence et priorité (22-23/02/2026)

### Bugs corrigés

1. **Fix URL documents** : Les JO/lois redirigaient vers `/actualites/` au lieu de `/documents/`.
   Cause : comparaison `=== 'documents'` (pluriel) vs `type: 'document'` (singulier) dans l'index.
2. **Fix exclude_fields** : Le paramètre `exclude_fields` listait des champs inexistants (`raw_content`, `metadata`), causant un 404 Typesense.
3. **Fix error handling** : `error.status` remplacé par extraction correcte de `error.statusCode` / `error.data`.

### Améliorations du scoring

Problème : pour "code de la route", les actualités (mentionnant "la" ou "de") passaient avant les JO contenant la loi.

- `text_match_type: 'max_score'` — utilise le meilleur score réel, pas le champ au poids le plus élevé
- `prioritize_token_position: false` — désactivé car les stop words français biaisent le scoring
- `prioritize_num_matching_fields: false` — désactivé car les stop words matchent dans tous les champs
- Détection des stop words français pour adapter dynamiquement `query_by_weights`
- Poids dynamiques : `100,20,5` (court) / `60,50,10` (phrase) / `80,30,5` (défaut)

### Champ `priority` (boost par type)

Ajout d'un champ `priority` (int32, sortable) au schéma Typesense pour départager les résultats à score égal :

- Documents officiels (JO, lois, décrets) : **priority = 90** (4673 docs)
- Actualités : **priority = 50** (187 docs)
- Tri : `_text_match:desc,priority:desc,date_published:desc`

Note : Typesense propose `optional_filter_by` comme alternative native (boost sans champ), mais le champ `priority` offre une granularité plus fine pour différencier par sous-type à l'avenir.
