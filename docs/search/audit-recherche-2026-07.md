# Audit recherche Typesense + Directus — Juillet 2026

> Date : 12/07/2026 — mis à jour le 13/07/2026
> Statut : ✅ **Migration v2 EN PROD depuis le 13/07/2026** (index `vpdata_v2` via alias `vp-search`,
> 14 604 docs multi-types, accents/synonymes corrigés) — reste : backlog §4
> Concerne : `server/api/search.ts`, `app/composables/useSearchEnhanced.ts`, `scripts/search-reindex.mjs`, index Typesense, workflows n8n
> Remplace : `TODO-search-optimizations.md` (les items non traités y sont repris ici)

---

## 1. Synthèse

L'infrastructure est saine (Typesense 28.0, index `vpdata` à jour, réponses 10–80 ms) et le
tuning v6 (poids dynamiques, `max_score`, champ `priority`) fonctionne. L'audit a révélé :

| # | Constat | Gravité | Statut |
| --- | --- | --- | --- |
| 1 | **Recherche sans accents cassée** (`decret` → 72 résultats vs `décret` → 4 480) — cause : `locale: fr` | 🔴 Critique | ✅ Résolu (v2) |
| 2 | **La clé admin Typesense sert de clé de recherche** dans l'app (aucune clé scoped n'existe) | 🔴 Critique | ✅ Clés scoped (reste rotation admin, J+7) |
| 3 | Couverture limitée à 2 types (documents + actualités) : députés, votes, questions, dossiers, podcasts, personnalités introuvables | 🟠 Important | ✅ Résolu (9 types) |
| 3b | **33 % des documents publiés absents de l'index** : 10 198 publiés dans Directus vs 6 841 indexés (3 359 manquants + 2 orphelins). Cause : les **imports en masse** dans Directus (fév. 2026 : 984 docs ; avril 2026 : 2 215 docs) ne déclenchent pas les triggers n8n | 🔴 Critique | ✅ Résolu (réindex + script réconciliation ; reste le cron) |
| 4 | Payload de réponse 3× trop lourd (`content_text` complet renvoyé pour chaque hit) | 🟠 Important | ✅ Résolu (−64 %) |
| 5 | **Bug : le highlighting Typesense n'est jamais utilisé** (le composable lit `hits[].highlights.title` — format tableau — au lieu de `hits[].highlight.title.snippet`) → fallback regex client systématique | 🟠 Important | ✅ Résolu |
| 6 | Recherche Directus `_icontains` sur `content_html` de ~6 800 documents (LIKE `%…%` non indexable) | 🟠 Important | 🔲 C10 |
| 7 | Aucun synonyme, aucune curation, aucune règle analytics, aucun alias configurés (tout est vide) | 🟡 Moyen | 🟡 Synonymes + alias faits ; analytics = C7, curation = backlog |
| 8 | Collection `news` obsolète (169 docs, figée depuis nov. 2025, plus référencée par le code) | 🟡 Moyen | 🔲 Suppression au J+7 |
| 9 | Code mort (`useSearch.ts`), `useFetch` dans un handler d'événement, message d'erreur Typesense brut renvoyé au client (SEC-9) | 🟡 Moyen | ✅ Résolu |

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

- [x] `TYPESENSE_API_KEY` mis à jour dans **Coolify** avec la clé scoped — 13/07/2026.
- [x] Clé write-only **n8n** créée (`documents:*` sur `vpdata.*` + `vp-search`) et intégrée au
      workflow RT v2 — 13/07/2026.
- [ ] **Rotation de la clé admin** : la clé bootstrap ne se change qu'en redémarrant le service
      Typesense avec un nouveau `--api-key` (env du conteneur dans Coolify). App et n8n sont
      maintenant sur clés scoped → faisable à tout moment (prévu au nettoyage J+7). Choisir une
      clé longue (32+ caractères aléatoires) et mettre à jour `TYPESENSE_ADMIN_API_KEY` du `.env`
      local (utilisée par `scripts/search-reindex.mjs`).

### ✅ C2 — Nouvelle collection `vpdata_v2` : sans `locale: fr` + modèle multi-types, réindexée depuis Directus (EN PROD depuis le 13/07/2026)

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
- [x] **Bascule prod FAITE le 13/07/2026** : Coolify (`TYPESENSE_COLLECTION=vp-search` + clé
      search-only) + workflow n8n RT v2 importé. Vérifié en prod : `decret` → 6 332,
      fiches députés en tête avec bonnes URLs, synonymes actifs, payload 14,2 Ko/10 hits.
      Réconciliation `--prune` rejouée : 14 604 docs, 0 orphelin, 0 erreur.
- [ ] Tester le workflow RT v2 en conditions réelles (republier un item Directus → vérifier
      l'upsert ; dépublier → vérifier la suppression de l'index)
- [ ] Cron/routine de réconciliation (rejouer le script en hebdo, ou après chaque import en masse)
- [ ] J+7 (~20/07/2026) : supprimer `vpdata` v1 et la collection `news` obsolète, faire tourner
      la clé admin Typesense, révoquer le token Directus en clair dans les anciens exports n8n

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

### ✅ C5 — Étendre la couverture : indexer les autres contenus (fait via C2, 13/07/2026)

> Réalisé par la réindexation C2 (le script indexe toutes les collections ci-dessous).
> Cette section reste la **référence du mapping** type/priority/URL.

| Contenu (Directus) | `type` | `priority` | URL cible |
| --- | --- | --- | --- |
| Lois, décrets, JO (`documents`) | `document` | 90 | `/documents/{id}/{slug}` |
| Dossiers (`dossier`) | `dossier` | 80 | `/dossiers/{slug}` |
| Députés (`assembly_deputy`) | `depute` | 70 | `/assemblee-nationale/deputes/{id}/{name}` |
| Questions écrites (`assembly_question`) | `question` | 65 | `/assemblee-nationale/questions/{id}` |
| Votes (`assembly_vote`) | `vote` | 65 | `/assemblee-nationale/votes/{id}` |
| Personnalités (`public_persons`) | `personnalite` | 60 | `/personnalites/{id}/{slug}` |
| Annuaire de l'État (`state_organization_entity`) | `institution` | 60 | `/etat-senegal/annuaire/{slug}` |
| Actualités (`news`) | `news` | 50 | `/actualites/{id}/{slug}` (+ cas particuliers existants) |
| Podcasts (`vp_podcasts`) | `podcast` | 40 | `/podcasts/{id}/{slug}` |

Côté code : étendre le mapping d'URL dans `server/api/search.ts` (switch sur `type`) et les
filtres UI de `recherche.vue` (chips par type, alimentées par la facette `type` déjà active).

- [x] Indexation initiale : faite par le script C2 (9 sources, 14 604 docs) — 13/07/2026
- [x] n8n temps réel pour **news + documents** : workflow « RT v2 » déployé — 13/07/2026
- [ ] (Optionnel) Étendre le webhook n8n aux autres collections (dossier, questions, votes,
      personnalités, annuaire, podcasts) — en attendant, ces contenus sont rafraîchis par la
      **réconciliation** (`--prune`), fréquence de publication faible → non bloquant
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

> **13/07/2026 : le workflow corrigé « Directus to typesense RT v2 » a été généré
> (`vpsn-automation/typesense/Directus to typesense RT v2.json`) et importé/déployé.**
> Il intègre toutes les corrections ci-dessous (branche delete réparée, dépublication gérée,
> cible `vp-search`, mapping v2, clé write scoped).

- [x] Workflow « RT v2 » importé et actif — 13/07/2026
- [ ] Vérifier que l'**ancien** « Directus to typesense RT » est bien **désactivé** (même path
      de webhook → conflit possible s'il est resté actif)
- [ ] **Supprimer les 2 workflows Batch** (Docs/News) — remplacés par `scripts/search-reindex.mjs`
- [ ] **Révoquer le token Directus** en clair dans les anciens exports JSON (repo git) ; ne pas
      committer le JSON v2 tel quel (il contient la clé write)

| Workflow | Verdict | Détail |
| --- | --- | --- |
| `directus-to-typesense Batch - Docs` | ❌ **Supprimer** | `limit: 2000` **sans pagination** → cause directe des 3 359 documents manquants (P0-3). Remplacé par `scripts/search-reindex.mjs`. |
| `directus-to-typesense Batch - News` | ❌ **Supprimer** | Même bug (`limit: 2000`, pas de pagination). Remplacé par le script. |
| `Directus to typesense RT` | ❌ **Désactiver/supprimer** | Remplacé par « RT v2 » (corrections ci-dessous, pour mémoire). |

**Corrections appliquées dans RT v2 (pour mémoire) :**

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

### 🟡 C7 — Analytics de recherche (requêtes populaires + sans résultat)

Typesense self-hosted n'a **pas d'interface type Algolia** (l'UI n'existe que sur Typesense
Cloud) : les analytics atterrissent dans des **collections Typesense normales**
(`vp_queries_popular`, `vp_queries_nohits`), consultables par API ou via le dashboard
communautaire [typesense-dashboard](https://github.com/bfritscher/typesense-dashboard)
(⚠️ à utiliser avec une clé de lecture, jamais la clé admin depuis un navigateur).

Mise en place :

1. **Infra** : env ajoutées au `docker-compose.yml` du service Coolify
   (`vpsn-automation/typesense/docker-compose.yml`) le 13/07/2026 :
   `TYPESENSE_ENABLE_SEARCH_ANALYTICS=true`, `TYPESENSE_ANALYTICS_DIR=/data/analytics`
   (dans le volume → persistant), `TYPESENSE_ANALYTICS_FLUSH_INTERVAL=60` → **reporter dans
   Coolify + redéployer le service** (⚠️ coupe la recherche quelques secondes).
2. **Règles** (après le redémarrage) : `node scripts/search-reindex.mjs --setup-analytics`
   (idempotent ; crée les 2 collections destination + les règles `popular_queries` /
   `nohits_queries` sur la collection cible). ⚠️ Comme les synonymes, les règles pointent la
   collection réelle → re-lancer après chaque nouvelle version d'index.
3. **Consulter** : `GET /collections/vp_queries_popular/documents/search?q=*&query_by=q&sort_by=count:desc`.

Bénéfices : « Recherches populaires » de `/recherche` alimentées par les vraies requêtes
(aujourd'hui codées en dur — « Budget 2024 »… en 2026), détection des trous de contenu et des
synonymes manquants via les requêtes sans résultat.

> 💡 En attendant : GA4 (mesure améliorée « Recherche sur le site », captée via `?q=`) donne
> déjà les termes recherchés → GA4 → Engagement → Événements → `view_search_results`,
> dimension `search_term`. Mais pas les requêtes « sans résultat ».

- [x] Compose : flags analytics ajoutés — 13/07/2026 (reste : reporter dans Coolify + redéployer)
- [ ] Redéployer le service Typesense (Coolify) puis `--setup-analytics`
- [ ] Endpoint `/api/search/popular` (cache SWR ~1 h) + brancher `recherche.vue`
- [ ] (Optionnel) `enable_analytics=false` sur les requêtes du quick search header pour ne
      compter que les recherches de la page `/recherche`

### 🟡 C8 — Facettes riches : sous-type de document + année (données prêtes, UI à faire)

- [x] `category` renseignée pour 100 % de l'index v2 (libellé FR du sous-type : « Journal
      Officiel », « Loi », « Décret », « Rapport d'audit »… — mapping `DOCUMENT_TYPE_LABELS`
      dans le script + workflow RT v2) — 13/07/2026
- [ ] UI : facette **sous-type** (`facet_by=category` quand le filtre « Documents » est actif)
      dans `search.ts` + `recherche.vue`
- [ ] UI : filtre par **année** (`date_published` est facetable/triable :
      `filter_by=date_published:>=…`)

### 🟡 C9 — Champ `summary` (indexé et rempli, pas encore exploité)

- [x] Champ `summary` (300 car., description Directus sinon début du texte nettoyé) indexé et
      rempli pour tout l'index v2 par le script + workflow RT v2 — 13/07/2026
- [ ] `search.ts` : l'ajouter au scoring — `query_by: 'title,summary,content_text,tags'` avec
      poids type `100,40,20,5` (court) / `60,55,50,10` (phrase). ⚠️ Ne le faire que maintenant
      que la prod est sur la v2 (le champ n'existe pas dans la v1 → `query_by` planterait).
- [ ] Affichage : utiliser `document.summary` comme extrait quand il n'y a pas de snippet
      highlight (remplace le fallback vide depuis l'exclusion de `content_text`)

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

## 4. Reste à faire (backlog au 13/07/2026, migration v2 en prod)

### Court terme (cette semaine)

| # | Tâche | Effort | Détail |
| --- | --- | --- | --- |
| 1 | Tester le workflow RT v2 en réel | 10 min | Republier un item Directus → vérifier l'upsert dans `vp-search` ; le dépublier → vérifier sa disparition de l'index |
| 2 | Vérifier ancien RT désactivé + supprimer les 2 Batch | 5 min | n8n (même path de webhook → conflit possible) |
| 3 | Révoquer le token Directus exposé | 10 min | En clair dans les anciens exports JSON commités (`7FnM4F…`) |
| 4 | Cron de réconciliation hebdo | 30 min | `node scripts/search-reindex.mjs --prune` (n8n Schedule, tâche Coolify ou GitHub Action) + le rejouer après chaque import en masse |

### J+7 (~20/07/2026), si aucune anomalie

| # | Tâche | Détail |
| --- | --- | --- |
| 5 | Supprimer les collections `vpdata` (v1) et `news` | `DELETE /collections/...` (l'app et n8n sont sur `vp-search`) |
| 6 | Rotation de la clé admin Typesense | Redémarrer le service avec un nouveau `--api-key` (32+ car.) ; mettre à jour `TYPESENSE_ADMIN_API_KEY` du `.env` local |

### Améliorations suivantes (par ordre de valeur)

| # | Correctif | Impact | Effort |
| --- | --- | --- | --- |
| 7 | **C9** : `summary` dans `query_by` + extrait d'affichage | Pertinence + UX extraits | 1–2 h |
| 8 | **C8** : facette sous-type de document + filtre année | UX filtres (les données sont déjà dans l'index) | ½–1 j |
| 9 | **C10** : recherche de la liste `/documents/public` via Typesense (ou retirer `content_html` du `_icontains`) | Perf Postgres + pertinence | ½ j |
| 10 | **C7** : analytics Typesense (flags serveur + règles) → recherches populaires dynamiques, requêtes sans résultat | Pilotage data, synonymes guidés par l'usage | ½ j |
| 11 | Hygiène doc : bandeau « périmé » sur `search-typesense.md` | — | 10 min |
| 12 | (Optionnel) Webhooks n8n pour les 7 autres collections | Temps réel complet (couvert par le cron en attendant) | 1–2 h |

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
