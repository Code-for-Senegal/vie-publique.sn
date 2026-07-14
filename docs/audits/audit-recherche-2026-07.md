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
- [x] Workflow RT v2 testé en réel sur un document (exécution n8n OK, upsert vers `vp-search`)
      — 13/07/2026. Reste à tester une fois la **dépublication** (status → draft ⇒ le doc doit
      disparaître de l'index) et une **suppression**.
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

**27 règles** au 13/07/2026 (source de vérité : constante `SYNONYMS` de
`scripts/search-reindex.mjs` ; pousser à tout moment — instantané, sans réindexation — via
`node scripts/search-reindex.mjs --sync-synonyms`) :

- **Institutions & sigles** : jo/jors ↔ journal officiel · assemblée nationale ↔ parlement ↔
  hémicycle · pm ↔ premier ministre ↔ primature · président de la république ↔ chef de l'état ·
  député ↔ parlementaire · cese · hcct · ofnac · ige · ansd · cena · dgid · arcop ·
  cedeao/ecowas · uemoa
- **Budget & finances publiques** : budget ↔ loi de finances · lfr · lfi · plf · cgi (code
  général des impôts) · impôts ↔ fiscalité · marchés publics ↔ commande publique
- **Textes & concepts** : constitution ↔ loi fondamentale · code de la route ↔ code routier ·
  dpg · collectivités territoriales ↔ locales · élections locales ↔ municipales ↔ territoriales

Validé en prod (via `vp-search`) : `jors` → 4 736, `plf` → 1 037, `ansd` → 1 253, `arcop` → 917,
`cgi` → 271, `cena` → 148, `ige` → 38, `loi fondamentale` → 1 007.

Écartés volontairement : `an` (mot courant : « par an »), `gouvernement ↔ conseil des
ministres` (trop large, bruit). Règle générale : **précision > rappel** — pas de sigles ambigus
ni de concepts trop larges. À enrichir en continu avec les requêtes sans résultat
(`vp_queries_nohits`, cf. C7).

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
   `nohits_queries`). ⚠️ **Piège vérifié empiriquement** : la règle matche le nom de collection
   TEL QUE REQUÊTÉ — une requête via l'alias `vp-search` n'est PAS comptée par une règle dont
   la source est `vpdata_v2`. Le script déclare donc les DEUX sources (`[cible, alias]`).
   Comme les synonymes, re-lancer après chaque nouvelle version d'index.
3. **Consulter** : `GET /collections/vp_queries_popular/documents/search?q=*&query_by=q&sort_by=count:desc`.

Bénéfices : « Recherches populaires » de `/recherche` alimentées par les vraies requêtes
(aujourd'hui codées en dur — « Budget 2024 »… en 2026), détection des trous de contenu et des
synonymes manquants via les requêtes sans résultat.

> 💡 En attendant : GA4 (mesure améliorée « Recherche sur le site », captée via `?q=`) donne
> déjà les termes recherchés → GA4 → Engagement → Événements → `view_search_results`,
> dimension `search_term`. Mais pas les requêtes « sans résultat ».

- [x] Compose : flags analytics ajoutés + service redéployé — 13/07/2026
- [x] Règles créées (`--setup-analytics`) et **validées en réel** : requêtes de prod capturées
      dans `vp_queries_popular`, requête sans résultat capturée dans `vp_queries_nohits` — 13/07/2026
- [ ] Endpoint `/api/search/popular` (cache SWR ~1 h) + brancher `recherche.vue`
      (⚠️ nécessite une clé de lecture couvrant `vp_queries_*` — la clé search-only de l'app
      est scopée `vpdata.*`/`vp-search`)
- [ ] (Optionnel) `enable_analytics=false` sur les requêtes du quick search header pour ne
      compter que les recherches de la page `/recherche`

### ✅ C8 — Facettes riches : sous-type de document + année (fait le 13/07/2026)

- [x] `category` renseignée pour 100 % de l'index v2 (libellé FR du sous-type : « Journal
      Officiel », « Loi », « Décret », « Rapport d'audit »… — mapping `DOCUMENT_TYPE_LABELS`
      dans le script + workflow RT v2). Le champ Directus source est **`documents.type`**
      (29 valeurs) ; `documents.family` (10 familles larges) n'est volontairement PAS indexé.
- [x] API : `facet_by=type,category`, filtres `categories=` (multi, libellés FR — valeurs à
      espaces via backticks Typesense, backticks/virgules strippés de l'entrée) et `year=`
      (plage epoch sur `date_published`) combinés en `&&` → réponse `categoryCounts`.
- [x] UI `recherche.vue` : quand le filtre « Documents » est actif → sélecteur multi
      « Type de document » (options triées par compteur) + sélecteur « Année » (2026→1960)
      + bouton réinitialiser ; synchronisés dans l'URL (`?categories=…&year=…`) ; vidés quand
      on désélectionne « Documents ».
      Validé : `budget`+`Loi` → 666 ; `Journal Officiel,Loi` → 2 121 ; `année 2024` → 99.

### ✅ C9 — Champ `summary` (fait le 13/07/2026)

- [x] Champ `summary` (300 car., description Directus sinon début du texte nettoyé) indexé et
      rempli pour tout l'index v2 par le script + workflow RT v2
- [x] `search.ts` : intégré au scoring — `query_by: 'title,summary,content_text,tags'`, poids
      `100,40,20,5` (court) / `60,55,50,10` (phrase) / `80,45,30,5` (défaut) + highlight.
      ⚠️ `summary` n'existe que dans la v2 → ne jamais repointer `TYPESENSE_COLLECTION` sur
      l'ancien `vpdata` avec ce code.
- [x] Affichage : extrait en cascade `snippet content_text → snippet summary → summary brut`
      (plus d'extrait vide quand seul le titre matche).
      Validé : « code de la route » garde les Codes en tête ; « JO 7896 » affiche le résumé.

### ✅ C10 — Recherche de la liste documents via Typesense (fait le 13/07/2026)

`server/api/documents/index.get.ts` faisait un `_or` `_icontains` incluant `content_html`
(~10 000 docs, LIKE `%…%` non indexable Postgres, sans pertinence, sensible aux accents).
Implémentation **hybride** (options A + B combinées) :

- **Chemin Typesense** (cas nominal) : quand `search` est présent, Typesense résout les IDs
  classés par pertinence (`filter_by type:=document`, filtre type→`category` via le mapping
  partagé, année → plage `date_published`), puis **hydratation Directus** (`id _in`, mêmes
  champs que la liste) remise dans l'ordre de pertinence. Total = `found` Typesense. Tri :
  pertinence par défaut, `publish_date` croissant respecté.
- **Fallback Directus** conservé pour les combinaisons non indexées (famille, institution
  d'audit, élections, tri par titre) et en cas d'indisponibilité Typesense (dégradation
  propre) — mais **sans `content_html`** dans le `_or` (fin du scan Postgres dans tous les cas).
- Mapping type→libellé extrait dans **`shared/document-type-labels.mjs`** (source de vérité
  unique script + API, import `#shared/` côté nitro — un import relatif `../../../shared` est
  mal résolu au bundle). ⚠️ Copie inline restante dans le node n8n « Transform Document v2 ».

Validé : `decret` = `décret` = 6 166 docs pertinents ; `search`+`type=official_journal` →
1 455 tous JO ; `search`+`year=2024` → 99 ; `family` → fallback OK ; pagination disjointe ;
synonyme `plf` → 906 ; liste sans `search` inchangée (10 198).

Les autres listes (députés : nom/profession, etc.) sont de petits volumes → `_icontains` OK.

### Hygiène (en cours)

- [x] Supprimer `useSearch.ts` (code mort, doublon de `useSearchEnhanced`) — fait le 13/07/2026
- [x] `useFetch` → `$fetch` dans `performSearch` (anti-pattern Nuxt dans un handler) — fait le 13/07/2026
- [x] Message d'erreur générique en prod (`SEC-9`) : le détail Typesense reste dans les logs serveur — fait le 13/07/2026
- [x] Factoriser l'appel Typesense des deux routes dans `server/utils/typesense.ts`
      (`searchTypesense` + `TYPESENSE_QUERY_DEFAULTS`, pattern getCmsClient) — 13/07/2026
- [x] Bandeau « partiellement périmé » sur `search-typesense.md` (pointe vers ce doc) — 13/07/2026
- [x] UX : debounce 350 ms + min 2 caractères sur toutes les recherches (U1+U2, détail dans
      [`audit-ux-recherche-2026-07.md`](./audit-ux-recherche-2026-07.md)) ; sweep de 22 pages
      validé — 13/07/2026
- [ ] Supprimer la collection `news` (⚠️ vérifier d'abord dans n8n qu'aucun workflow n'y écrit encore)

## 4. Reste à faire (backlog au 13/07/2026, migration v2 en prod)

### Court terme (cette semaine)

| # | Tâche | Effort | Détail |
| --- | --- | --- | --- |
| 1 | ~~Tester le workflow RT v2 en réel~~ ✅ upsert document validé (13/07) | 5 min | Reste : tester une dépublication (→ retrait de l'index) et une suppression |
| 2 | Vérifier ancien RT désactivé + supprimer les 2 Batch | 5 min | n8n (même path de webhook → conflit possible) |
| 3 | Révoquer le token Directus exposé | 10 min | En clair dans les anciens exports JSON commités (`7FnM4F…`) |
| 4 | Cron de réconciliation hebdo | 30 min | `node scripts/search-reindex.mjs --prune` (n8n Schedule, tâche Coolify ou GitHub Action) + le rejouer après chaque import en masse |
| 5 | **Étendre le RT v2 aux 7 autres types** | 2–3 h | Le webhook ne couvre que `news` + `documents`. Pour dossier, questions, votes, personnalités, annuaire, podcasts : (a) **Directus** : abonner le webhook/flow à ces collections ; (b) **n8n** : ajouter les sorties au Switch + un couple Get/Transform par collection (mapping = fonctions `map()` de `scripts/search-reindex.mjs`, ids `<type>-<id>`, mêmes règles URL/priority que le tableau C5). En attendant : couverts par la réconciliation `--prune` (fréquence de publication faible → non bloquant). |

### J+7 (~20/07/2026), si aucune anomalie

| # | Tâche | Détail |
| --- | --- | --- |
| 6 | Supprimer les collections `vpdata` (v1) et `news` | `DELETE /collections/...` (l'app et n8n sont sur `vp-search`) |
| 7 | Rotation de la clé admin Typesense | Redémarrer le service avec un nouveau `--api-key` (32+ car.) ; mettre à jour `TYPESENSE_ADMIN_API_KEY` du `.env` local |

### Améliorations suivantes (par ordre de valeur)

| # | Correctif | Impact | Effort |
| --- | --- | --- | --- |
| 8 | ~~**C9** : `summary` dans `query_by` + extrait d'affichage~~ | ✅ Fait le 13/07/2026 | — |
| 9 | ~~**C8** : facette sous-type de document + filtre année~~ | ✅ Fait le 13/07/2026 | — |
| 10 | ~~**C10** : recherche de la liste documents via Typesense~~ | ✅ Fait le 13/07/2026 | — |
| 11 | ~~**C7** : analytics Typesense~~ | ✅ En collecte depuis le 13/07/2026 | — |
| 12 | ~~Hygiène doc : bandeau « périmé » sur `search-typesense.md`~~ | ✅ Fait le 13/07/2026 | — |
| 13 | `/api/search/popular` + « Recherches populaires » dynamiques | UX (attendre quelques jours de données analytics) | 2 h |
| 14 | Curation/overrides sur les requêtes clés (ex. `constitution` → texte consolidé épinglé) | Pertinence éditoriale | 1 h |

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
