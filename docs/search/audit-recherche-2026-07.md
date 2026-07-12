# Audit recherche Typesense + Directus — Juillet 2026

> Date : 12/07/2026
> Statut : ✅ Audit terminé — correctifs en cours
> Concerne : `server/api/search.ts`, `app/composables/useSearchEnhanced.ts`, index Typesense `vpdata`, endpoints Directus `_icontains`
> Remplace : `TODO-search-optimizations.md` (les items non traités y sont repris ici)

---

## 1. Synthèse

L'infrastructure est saine (Typesense 28.0, index `vpdata` à jour, réponses 10–80 ms) et le
tuning v6 (poids dynamiques, `max_score`, champ `priority`) fonctionne. L'audit a révélé :

| # | Constat | Gravité |
| --- | --- | --- |
| 1 | **Recherche sans accents cassée** (`decret` → 72 résultats vs `décret` → 4 480) — cause : `locale: fr` | 🔴 Critique |
| 2 | **La clé admin Typesense sert de clé de recherche** dans l'app (aucune clé scoped n'existe) | 🔴 Critique |
| 3 | Couverture limitée à 2 types (documents + actualités) : députés, votes, questions, dossiers, podcasts, personnalités introuvables | 🟠 Important |
| 3b | **33 % des documents publiés absents de l'index** : 10 198 publiés dans Directus vs 6 841 indexés (3 359 manquants + 2 orphelins). Cause : les **imports en masse** dans Directus (fév. 2026 : 984 docs ; avril 2026 : 2 215 docs) ne déclenchent pas les triggers n8n | 🔴 Critique |
| 4 | Payload de réponse 3× trop lourd (`content_text` complet renvoyé pour chaque hit) | 🟠 Important |
| 5 | **Bug : le highlighting Typesense n'est jamais utilisé** (le composable lit `hits[].highlights.title` — format tableau — au lieu de `hits[].highlight.title.snippet`) → fallback regex client systématique | 🟠 Important |
| 6 | Recherche Directus `_icontains` sur `content_html` de ~6 800 documents (LIKE `%…%` non indexable) | 🟠 Important |
| 7 | Aucun synonyme, aucune curation, aucune règle analytics, aucun alias configurés (tout est vide) | 🟡 Moyen |
| 8 | Collection `news` obsolète (169 docs, figée depuis nov. 2025, plus référencée par le code) | 🟡 Moyen |
| 9 | Code mort (`useSearch.ts`), `useFetch` dans un handler d'événement, message d'erreur Typesense brut renvoyé au client (SEC-9) | 🟡 Moyen |

## 2. État des lieux (mesuré le 12/07/2026 via l'API admin)

### Serveur

- Typesense **v28.0**, `https://search.vie-publique.sn`, healthy.
- Collection **`vpdata`** : 7 040 docs (6 841 `type:document`, 199 `type:news`), dernier doc
  indexé le 09/07/2026 → **la synchro n8n est à jour**.
- Collection **`news`** : 169 docs, dernière écriture nov. 2025 → obsolète (double écriture
  historique avant la bascule sur `vpdata`).
- `GET /keys` → `[]` : la clé du `.env` est la **clé bootstrap admin** (peut supprimer des
  collections). `/synonyms`, `/overrides`, `/stopwords`, `/aliases`, `/analytics/rules` → tous vides.
- Champ `category` renseigné sur **29 docs seulement** (sur 7 040) → facette inutilisable.
- Schéma `vpdata` : `locale: fr` sur les champs texte, `stem: false`, `token_separators: []`.

### Flux applicatif

```text
AppSearch.vue (header, quick search) ─┐
HomeSearchSection.vue (accueil)       ├─> /recherche (recherche.vue, noindex ✅)
menu.vue                              ┘        │
                                   useSearchEnhanced() → GET /api/search → Typesense vpdata
Listes (documents, députés, votes…) → endpoints /api/* → Directus `_icontains`
Indexation : n8n → Typesense (hors repo)
```

### Preuve du bug accents (P0-1)

Mesures sur l'index de prod (requêtes UTF-8 propres) :

| Requête | Avec accents | Sans accents |
| --- | --- | --- |
| `décret` / `decret` | 4 480 | **72** |
| `assemblée` / `assemblee` | 1 308 | **6** |
| `élection présidentielle` / `election presidentielle` | 35 | **1** |

**Cause vérifiée par test A/B** (2 collections temporaires créées puis supprimées sur le
serveur) : avec `locale: fr`, `decret` ne matche PAS `Décret` (le folding ASCII de Typesense
est désactivé) ; avec la locale par défaut (`""`), il matche. Les résultats résiduels en prod
viennent de la tolérance aux typos, qui consomme son budget sur l'accent.

> ⚠️ Piège de diagnostic (vécu pendant l'audit) : tester les accents depuis Git Bash/PowerShell
> Windows envoie des octets mal encodés et produit des résultats FAUX (parfois inversés).
> Toujours tester via un script Python/Node en UTF-8 explicite.

### Écart Directus ↔ Typesense (P0-3, mesuré le 13/07/2026)

Diff complet des IDs `documents` (published) Directus vs `type:document` Typesense :

| Mesure | Valeur |
| --- | --- |
| Directus `documents` published | 10 198 (+ 2 755 draft, 86 archived) |
| Typesense `type:document` | 6 841 |
| **Manquants dans l'index** | **3 359 (33 %)** |
| Orphelins dans l'index (supprimés/archivés côté Directus) | 2 |

Distribution des manquants par mois de création Directus : **fév. 2026 : 984**, mars 2026 : 143,
**avril 2026 : 2 215** (conventions minières, décrets…), + ~15 épars (dont des conseils des
ministres récents : 29/04/2026, 05/06/2026). Diagnostic : **les imports en masse (API/CSV) ne
déclenchent pas les triggers n8n** (webhooks « item created » non émis par les imports), et il
n'existe aucun job de réconciliation. Les suppressions ne sont pas synchronisées non plus
(2 orphelins). → La copie de l'ancien index est donc exclue : la v2 doit être **réindexée
depuis Directus** (voir C2), avec un **full-sync périodique** en filet de sécurité.

## 3. Plan d'action

### ✅ C1 — Clé API scoped search-only (fait le 13/07/2026)

Créée via l'API admin et installée dans `.env` local :

```bash
curl -X POST "$TS_URL/keys" -H "X-TYPESENSE-API-KEY: $ADMIN_KEY" -d '{
  "description": "nuxt-app search-only (vpdata + alias)",
  "actions": ["documents:search"],
  "collections": ["vpdata.*"]
}'
# → la valeur n'est affichée qu'une seule fois : la reporter dans Coolify (TYPESENSE_API_KEY)
```

**Reste à faire** :

- [ ] Mettre à jour `TYPESENSE_API_KEY` dans **Coolify** (env du service Nuxt) avec la clé scoped.
- [ ] Créer une clé write-only pour **n8n** (`"actions": ["documents:*"], "collections": ["vpdata.*"]`)
      et remplacer la clé admin dans les workflows n8n.
- [ ] **Rotation de la clé admin** : la clé bootstrap ne se change qu'en redémarrant le service
      Typesense avec un nouveau `--api-key` (env du conteneur dans Coolify). À faire APRÈS que
      l'app et n8n utilisent leurs clés scoped. Choisir une clé longue (32+ caractères aléatoires).

### 🟡 C2 — Nouvelle collection `vpdata_v2` : sans `locale: fr` + modèle multi-types, réindexée depuis Directus 🔴 (index PRÊT le 13/07/2026 — reste la bascule)

> **C2 et C5 sont fusionnés** (décision du 13/07/2026) : puisque l'ancien index a 33 % de trous
> (P0-3), on ne copie PAS `vpdata` → on **réindexe tout depuis Directus** (source de vérité),
> et on en profite pour indexer TOUS les types de contenu (députés, questions, votes, dossiers,
> podcasts, personnalités, annuaire de l'État…) dans le même index.

Les réglages `locale` et `token_separators` ne se changent qu'à la création → nouvelle
collection + bascule par **alias** (aucune coupure, retour arrière possible).

> ⚠️ **IDs namespacés obligatoires.** Aujourd'hui `id` Typesense = id Directus brut : avec
> plusieurs collections sources, le député 42 écraserait le document 42. En v2, `id` devient
> `"<type>-<idDirectus>"` (ex. `document-42`, `depute-42`) et on ajoute un champ `source_id`
> (l'id Directus nu) pour construire les URLs. `server/api/search.ts` utilisera `source_id`.

1. Créer la collection v2 (schéma cible complet) :

   ```json
   {
     "name": "vpdata_v2",
     "default_sorting_field": "date_published",
     "token_separators": ["-", "'"],
     "fields": [
       { "name": "source_id", "type": "string", "index": false, "optional": true },
       { "name": "url", "type": "string", "index": false, "optional": true },
       { "name": "title", "type": "string" },
       { "name": "slug", "type": "string", "index": false, "optional": true },
       { "name": "content_text", "type": "string", "optional": true },
       { "name": "summary", "type": "string", "optional": true },
       { "name": "date_published", "type": "int64", "facet": true, "sort": true },
       { "name": "cover_image", "type": "string", "index": false, "optional": true },
       { "name": "tags", "type": "string[]", "facet": true, "optional": true },
       { "name": "category", "type": "string", "facet": true, "optional": true },
       { "name": "type", "type": "string", "facet": true },
       { "name": "priority", "type": "int32", "sort": true, "optional": true }
     ]
   }
   ```

   Changements vs v1 : **plus de `locale: fr`** (réactive le folding ASCII : `decret` = `décret`,
   et l'expansion des synonymes — voir C6), `token_separators` (améliore `l'Assemblée`,
   `Décret n°2004-13` — ⚠️ symboles ASCII uniquement : l'apostrophe typographique `’` est
   normalisée en `'` par le script à l'indexation), **`url` précalculée à l'indexation**
   (fin de la logique de reconstruction d'URL dans `search.ts`, qui ne sert plus que de
   fallback v1), `id` namespacé + `source_id`, `category` = libellé FR du sous-type
   (« Journal Officiel », « Décret », « Député »… → facette C8 gratuite), `content_html`
   supprimé, champ `summary` (extrait affiché + scoring — C9).

2. **Réindexation complète depuis Directus** via `scripts/search-reindex.mjs` (versionné dans
   le repo ; env : `CMS_API_URL`, `CMS_API_KEY`, `TYPESENSE_URL`, `TYPESENSE_ADMIN_API_KEY`).
   Idempotent (upsert par lots de 500) → sert aussi de **job de réconciliation** (cf. P0-3 :
   les imports en masse Directus ne déclenchent pas n8n) : à rejouer après chaque import en
   masse, ou en cron hebdo avec `--prune` (supprime les orphelins absents de Directus).

   ```bash
   node scripts/search-reindex.mjs --create        # collection + synonymes
   node scripts/search-reindex.mjs                 # sync complet (toutes sources)
   node scripts/search-reindex.mjs --prune         # sync + suppression des orphelins
   node scripts/search-reindex.mjs --set-alias     # pointe vp-search sur la cible
   node scripts/search-reindex.mjs --only=documents,news
   ```

3. Créer l'alias et basculer app + n8n dessus (l'alias fonctionne en lecture ET en écriture) :

   ```bash
   curl -X PUT -H "X-TYPESENSE-API-KEY: $ADMIN_KEY" "$TS_URL/aliases/vp-search" \
     -d '{"collection_name": "vpdata_v2"}'
   # App : TYPESENSE_COLLECTION=vp-search (Coolify + .env)
   # n8n : cibler vp-search au lieu de vpdata
   ```

4. **Validation** (les deux formes doivent donner des volumes comparables) :

   ```text
   # attendu : found ~équivalents avec et sans accents
   q=decret / q=décret ; q=assemblee / q=assemblée ; q=election presidentielle / q=élection présidentielle
   # synonymes actifs : q=lfr → ~97 (vs 9 avant)
   # complétude : facette type → document ≈ 10 198 (vs 6 841 dans la v1, cf. P0-3)
   # multi-types : q=<nom d'un député> → sa fiche remonte
   ```

5. Après 1 semaine sans anomalie : supprimer `vpdata` (v1). Toute réindexation future = créer
   `vpdata_v3`, rejouer le script, re-pointer l'alias (blue/green).

**Résultats mesurés le 13/07/2026 (index v2 = 14 604 docs : 10 198 documents, 2 394 annuaire,
1 070 personnalités, 368 news, 336 questions, 166 députés, 51 votes, 18 podcasts, 3 dossiers) :**

| Requête | v1 (`vpdata`) | v2 (`vpdata_v2`) |
| --- | --- | --- |
| `decret` / `décret` | 72 / 4 480 | **6 332 / 6 332** ✅ |
| `assemblee` / `assemblée` | 6 / 1 308 | **3 103 / 3 103** ✅ |
| `election presidentielle` / avec accents | 1 / 35 | **156 / 156** ✅ |
| `lfr` (synonyme) | 9 | **129** ✅ |
| `l'assemblée` (token separator) | 1 583 | **3 088** ✅ |
| `Ousmane Sonko` | (aucune fiche) | fiche député en 1ᵉʳ résultat ✅ |

- [x] Script `scripts/search-reindex.mjs` (multi-collections, upsert par lots, `--prune`) — 13/07/2026
- [x] Créer `vpdata_v2` + réindexation complète depuis Directus (14 604 docs, 0 erreur) — 13/07/2026
- [x] Recréer les 11 synonymes (C6) sur la v2 — actifs et validés — 13/07/2026
- [x] Alias `vp-search` → `vpdata_v2` créé — 13/07/2026
- [x] Code app compatible v1/v2 (`search.ts` : `article.url`, filtres whitelist ; chips dynamiques `recherche.vue`) — 13/07/2026
- [ ] **Bascule prod** : voir « Séquence de bascule » ci-dessous (Coolify + n8n)
- [ ] Cron/routine de réconciliation (rejouer le script en hebdo, ou après chaque import en masse)
- [ ] J+7 : supprimer `vpdata` v1 (et la collection `news` obsolète)

#### Séquence de bascule production (ordre STRICT)

1. **Déployer le code frontend** (commit de ce jour : compatible v1 ET v2). Tant que
   `TYPESENSE_COLLECTION=vpdata`, rien ne change pour les utilisateurs.
2. **Corriger n8n** (voir section n8n ci-dessous) : cibler `vp-search`, ids namespacés,
   nouveaux champs. À partir de là, les nouvelles publications vont dans la v2.
3. **Coolify** (après 1 ET 2) — env du service Nuxt, puis redéploiement :
   - `TYPESENSE_COLLECTION=vp-search`
   - `TYPESENSE_API_KEY=<clé search-only>` (celle du `.env` local)
4. **Rejouer `node scripts/search-reindex.mjs --prune`** juste après la bascule n8n :
   rattrape tout ce qui a été publié entre la réindexation initiale et la bascule.
5. Vérifier en prod (bloc « Vérifications » en fin de document) puis **J+7** : supprimer
   `vpdata` et `news`, faire tourner la clé admin Typesense (redémarrage du service avec
   nouveau `--api-key`).

> Pourquoi cet ordre : le code (1) sait lire les deux formats → aucun risque ; n8n (2) avant
> Coolify (3) évite une fenêtre où les nouvelles publications n'arriveraient que dans la v1
> alors que le site lit la v2 ; le `--prune` (4) nettoie la fenêtre résiduelle.

### ✅ C3 — Alléger le payload de réponse (fait le 13/07/2026)

`content_text` complet était renvoyé pour chaque hit alors que l'UI n'affiche que le snippet.
Mesuré : 28,7 Ko → 10,2 Ko pour 10 hits (−64 %). Fix dans `server/api/search.ts` :
`content_text` retiré de `include_fields`, l'extrait vient du snippet highlight.

### ✅ C4 — Fix du highlighting Typesense (fait le 13/07/2026)

`useSearchEnhanced.ts` lisait `result.highlights?.title?.[0]?.snippet` : `highlights` est un
**tableau** `[{field, snippet}]`, donc `.title` était toujours `undefined` → le highlighting
Typesense (avec contexte autour du match) n'était **jamais** utilisé, remplacé par une regex
client sur la requête entière. Fix : lire le format objet `result.highlight?.title?.snippet` /
`result.highlight?.content_text?.snippet`.

### 🔲 C5 — Étendre la couverture : indexer les autres contenus 🟠 (fusionné dans C2)

> Réalisé via la réindexation C2 (le script indexe toutes les collections ci-dessous).
> Cette section reste la **référence du mapping** type/priority/URL.

Un citoyen qui cherche un député, une question écrite, un vote, un dossier, un podcast ou une
personnalité ne trouve rien. Indexer ces collections Directus dans l'index avec un
`type` dédié et un `priority` gradué — le champ a été conçu pour ça :

| Contenu (Directus) | `type` | `priority` | URL cible |
| --- | --- | --- | --- |
| Lois, décrets, JO (`documents`) | `document` | 90 | `/documents/{id}/{slug}` |
| Dossiers (`dossier`) | `dossier` | 80 | `/dossiers/{slug}` |
| Députés (`assembly_deputy`) | `depute` | 70 | `/assemblee-nationale/deputes/{id}/{name}` |
| Questions écrites (`assembly_question`) | `question` | 65 | `/assemblee-nationale/questions/{id}` |
| Votes (`assembly_vote`) | `vote` | 65 | `/assemblee-nationale/votes/{id}` |
| Personnalités (`public_persons`) | `personnalite` | 60 | `/personnalites/{id}/{slug}` |
| Annuaire de l'État (`state_organization_entity`) | `institution` | 60 | `/etat-senegal/organisation` (⚠️ vérifier s'il existe une fiche détail par entité) |
| Actualités (`news`) | `news` | 50 | `/actualites/{id}/{slug}` (+ cas particuliers existants) |
| Podcasts (`vp_podcasts`) | `podcast` | 40 | `/podcasts/{id}/{slug}` |

Côté code : étendre le mapping d'URL dans `server/api/search.ts` (switch sur `type`) et les
filtres UI de `recherche.vue` (chips par type, alimentées par la facette `type` déjà active).

- [x] Indexation initiale : faite par le script C2 (9 sources, 14 604 docs) — 13/07/2026
- [ ] n8n : triggers temps réel (upsert au publish, delete à l'archive) vers `vp-search` pour
      chaque collection — le script C2 sert de rattrapage pour ce que n8n rate
- [x] `search.ts` : URL précalculée `article.url` (+ fallback v1) et filtres whitelist — 13/07/2026
- [x] `recherche.vue` : chips de filtre dynamiques (affichées si comptage > 0) — 13/07/2026

### ✅ C6 — Synonymes français (actifs sur `vpdata_v2` depuis le 13/07/2026)

> **Découverte importante (prouvée par test A/B sur collections temporaires)** : `locale: fr`
> ne casse pas que le folding des accents, il **désactive aussi l'expansion des synonymes**.
> Les 11 règles existent sur `vpdata` (v1) mais y sont sans effet ; sur `vpdata_v2` (sans
> locale) elles sont **actives et validées** (`lfr` : 9 → 129 résultats). Les synonymes sont
> PAR collection : le script `--create` les recrée automatiquement à chaque nouvelle version.

Les 11 règles (définies dans `scripts/search-reindex.mjs`, source de vérité) :

| id | synonymes |
| --- | --- |
| `jo-journal-officiel` | jo ↔ journal officiel |
| `assemblee-parlement` | assemblée nationale ↔ parlement ↔ hémicycle |
| `budget-loi-finances` | budget ↔ loi de finances |
| `lfr` | lfr ↔ loi de finances rectificative |
| `pm-premier-ministre` | pm ↔ premier ministre |
| `president-chef-etat` | président de la république ↔ chef de l'état |
| `depute-parlementaire` | député ↔ parlementaire |
| `code-route` | code de la route ↔ code routier |
| `dpg` | dpg ↔ déclaration de politique générale |
| `cese` | cese ↔ conseil économique social et environnemental |
| `ofnac` | ofnac ↔ office national de lutte contre la fraude et la corruption |

Écartés volontairement : `an` (mot courant : « par an »), `gouvernement ↔ conseil des
ministres` (trop large, bruit). À enrichir plus tard avec les données analytics (C7).

### 🔧 Workflows n8n — audit du 13/07/2026 (exports : `vpsn-automation/typesense/`)

| Workflow | Verdict | Détail |
| --- | --- | --- |
| `directus-to-typesense Batch - Docs` | ❌ **Supprimer** | `limit: 2000` **sans pagination** → cause directe des 3 359 documents manquants (P0-3). Remplacé par `scripts/search-reindex.mjs`. |
| `directus-to-typesense Batch - News` | ❌ **Supprimer** | Même bug (`limit: 2000`, pas de pagination). Remplacé par le script. |
| `Directus to typesense RT` (webhook temps réel) | ✅ **Garder, mais corriger** | Voir liste ci-dessous. |

**Corrections à faire sur le workflow RT :**

1. **Branche delete cassée (3 bugs)** : le node « Filter Delete Events » teste `$json.event` /
   `$json.collection` au lieu de **`$json.body.event` / `$json.body.collection`** (ne matche
   jamais) ; l'URL DELETE cible la collection **`news`** (l'obsolète !) au lieu de l'index ;
   la clé API est le placeholder `xyz`. Conséquence actuelle : **aucune suppression n'est
   jamais synchronisée** (les 2 orphelins de P0-3).
2. **Unpublish non géré** : passer un item en `draft`/`archived` est un event `update` → le
   workflow le filtre (non published) et ne fait rien → le contenu **reste dans l'index**.
   Ajouter : si update et `status != published` → DELETE dans Typesense.
3. **Cibler `vp-search`** (l'alias) au lieu de `vpdata`, avec le format v2 :
   `id = "document-"+id` / `"news-"+id`, champs `source_id`, `url` (précalculée, même logique
   que le script), `summary`, `category` (libellé FR), apostrophes `’` → `'`.
   Reprendre le mapping des fonctions `map()` de `scripts/search-reindex.mjs`.
4. **Secrets en dur à retirer ET révoquer** : la clé admin Typesense `b3ZvDC…` est en clair
   dans les nodes HTTP, et un **token Directus est en clair dans le node « Get News »**
   (header Authorization en dur, en plus du credential n8n) — ces exports JSON sont dans un
   repo git. → Utiliser les credentials n8n + une **clé Typesense write scoped** dédiée, et
   révoquer le token Directus exposé.
5. (Optionnel, plus tard) Étendre le webhook aux autres collections C5 (dossier,
   assembly_question…) pour du temps réel complet — en attendant, la réconciliation hebdo
   du script couvre ces contenus.

### 🔲 C7 — Analytics de recherche (requêtes populaires + sans résultat)

Prérequis **infra** : redémarrer Typesense avec les flags
`--enable-search-analytics=true --analytics-dir=/data/analytics --analytics-flush-interval=60`
(env Coolify du service). Puis créer les collections de destination + règles
`popular_queries` et `nohits_queries` (voir doc Typesense « Search Analytics »).

Bénéfices : « Recherches populaires » de `/recherche` alimentées par les vraies requêtes
(aujourd'hui codées en dur — « Budget 2024 »… en 2026), détection des trous de contenu et des
synonymes manquants via les requêtes sans résultat.

- [ ] Flags serveur (Coolify) + règles analytics
- [ ] Endpoint `/api/search/popular` (cache SWR) + brancher `recherche.vue`

### 🔲 C8 — Facettes riches : sous-type de document + année

`type` n'a que 2 valeurs et `category` est vide à 99,6 %. Indexer le sous-type réel des
documents (loi, décret, arrêté, JO, rapport…) dans `category` (n8n), et exposer un filtre
par **année** (`date_published` est déjà facetable/triable : `facet_by=date_published` par
tranches, ou filtre `filter_by=date_published:>=…`).

- [ ] n8n : renseigner `category` (sous-type) pour les documents
- [ ] `search.ts` + `recherche.vue` : facette sous-type + filtre année

### 🔲 C9 — Champ `summary`

Indexer un résumé de 200–300 caractères (n8n : description Directus, sinon début du texte
nettoyé). Usage : `query_by: 'title,summary,content_text,tags'` avec poids `80,60,30,5`, et
extrait d'affichage propre (plus besoin du fallback sur `content_text`). Le champ existe déjà
(optionnel) dans le schéma v2.

### 🔲 C10 — Recherche Directus : sortir `content_html` du `_icontains` 🟠

`server/api/documents/index.get.ts` fait un `_or` `_icontains` incluant `content_html`
(~6 800 docs, LIKE `%…%` non indexable) : coûteux pour Postgres, sans pertinence, sensible
aux accents. Deux options :

- **Option A (recommandée)** : la recherche de la liste `/documents/public` interroge Typesense
  (`filter_by=type:=document`) au lieu de Directus — pertinence + accents + perf.
- **Option B (minimale)** : retirer `content_html` du `_or` (garder title/description/audit_institution).

Les autres listes (députés : nom/profession, etc.) sont de petits volumes → `_icontains` OK.

### Hygiène (en cours)

- [x] Supprimer `useSearch.ts` (code mort, doublon de `useSearchEnhanced`) — fait le 13/07/2026
- [x] `useFetch` → `$fetch` dans `performSearch` (anti-pattern Nuxt dans un handler) — fait le 13/07/2026
- [x] Message d'erreur générique en prod (`SEC-9`) : le détail Typesense reste dans les logs serveur — fait le 13/07/2026
- [ ] Supprimer la collection `news` (⚠️ vérifier d'abord dans n8n qu'aucun workflow n'y écrit encore)
- [ ] Rafraîchir `search-typesense.md` (chiffres périmés : 4 860 vs 7 040 ; historique v3/v5/v6 confus)

## 4. Ordre d'exécution recommandé

| Étape | Correctifs | Dépendances |
| --- | --- | --- |
| 1. Quick wins code | C3, C4, hygiène code | — (fait) |
| 2. Sécurité | C1 (Coolify + n8n + rotation admin) | Accès Coolify/n8n |
| 3. Réindex v2 | C2+C5 fusionnés (multi-types depuis Directus, fix accents + trous P0-3) + synonymes C6 | Accès n8n + Coolify |
| 4. Facettes & résumés | C8, C9 | C2 |
| 5. Pilotage | C7 analytics | Flags serveur |
| 6. Directus | C10 | C2 (option A) |

## 5. Vérifications post-déploiement

```bash
# Accents : les deux formes doivent retourner des volumes comparables
curl -s -H "x-typesense-api-key: $SEARCH_KEY" --get "$TS_URL/collections/vp-search/documents/search" \
  --data-urlencode "q=decret" --data-urlencode "query_by=title,content_text,tags" | jq .found

# Clé scoped : la clé de l'app ne doit PAS pouvoir lister les clés (403 attendu)
curl -s -H "x-typesense-api-key: $SEARCH_KEY" "$TS_URL/keys"

# Payload : ~10 Ko pour 10 hits (pas ~29 Ko)
curl -s "https://www.vie-publique.sn/api/search?q=budget&limit=10" | wc -c

# Highlight : le HTML de /recherche doit contenir des <mark> issus des snippets Typesense
```
