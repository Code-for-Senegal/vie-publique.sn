# Audit UX des points de recherche — Juillet 2026

> Date : 13/07/2026
> Complément UX de [`audit-recherche-2026-07.md`](./audit-recherche-2026-07.md) (audit moteur).
> Question de départ : cohérence entre le champ de l'accueil, le header, la page `/recherche`,
> la liste documents (hybride Typesense) et les listes Directus.

---

## 1. Inventaire des points de recherche

### A. Recherche globale (backend Typesense, index `vp-search`)

| Où | Composant | Déclenchement | Comportement |
| --- | --- | --- | --- |
| Header (toutes pages) | `AppSearch.vue` | à la frappe, debounce **200 ms** | Suggestions (5 titres) en dropdown ; Entrée → `/recherche?q=` |
| Accueil | `HomeSearchSection.vue` | **Entrée ou clic uniquement** | Pas de suggestions ; redirige vers `/recherche?q=` |
| `/recherche` | `recherche.vue` + `useSearchEnhanced` | à la frappe, debounce **300 ms** (+ bouton) | Résultats complets, filtres types + sous-type/année, URL synchronisée |

### B. Listes avec recherche API (pattern `useCollectionState` → `useCmsCollection`)

| Où | Backend | Déclenchement | Volume |
| --- | --- | --- | --- |
| Listes documents (`/documents/[category]`, `/documents/annee/[year]`…) | **Typesense hybride** (C10) + fallback Directus | à la frappe, **⚠️ SANS debounce** (1 requête par caractère) | 10 198 |
| Députés (`/assemblee-nationale/deputes`) | Directus `_icontains` (nom, profession) | à la frappe, **⚠️ SANS debounce** | 166 |
| Médias, autres listes sur ce pattern | Directus `_icontains` | idem | variable |
| Annuaire État (`StateEntityFilters.vue`) | Directus | à la frappe, debounce **300 ms** ✅ (géré localement dans le composant) | 2 394 |

> ⚠️ **Constat technique clé** : dans `useCollectionState`, le `useDebounceFn` ne concerne que
> `updateURL`. Le `searchQuery` est passé réactif à `useCmsCollection` dont le `useFetch`
> refetch **immédiatement à chaque frappe**. Taper « budget » = 6 requêtes API (et 6 entrées
> de cache SWR serveur pour des préfixes inutiles).

### C. Filtres client (données déjà chargées — aucun appel réseau)

Glossaire budget, ministères/institutions budget, ministères état, annuaire des sites publics,
cartes électorales, tableaux élections, magistrature… → filtrage instantané d'un tableau local.
**Rien à changer** : c'est le bon pattern pour ces volumes.

---

## 2. Analyse UX

### Le « mélange » Typesense/Directus est-il un problème ?

**Non pour l'utilisateur** : le backend utilisé est invisible (tout passe par `/api/*`, clés
côté serveur). Ce qui se voit, c'est la **qualité différente des résultats** :

- Recherche globale + listes documents : accents tolérés, synonymes, tri par pertinence ✅
- Listes Directus (`_icontains`) : sous-chaîne exacte, sensible aux accents (selon collation),
  pas de pertinence. Sur les **noms propres** c'est gênant : chercher « Ba » dans les députés
  ne matche pas « Bâ », « Ndiaye » ne matche pas « N'Diaye ».

Le vrai enjeu de cohérence n'est donc pas l'architecture mais **(a) le déclenchement** et
**(b) la tolérance de la saisie**, différents d'une page à l'autre.

### Incohérences relevées

1. **Déclenchement disparate** : frappe+200 ms (header), frappe+300 ms (/recherche), frappe
   sans debounce (listes), Entrée uniquement (accueil).
2. **Pas de debounce sur les listes** (bug de charge + résultats qui « sautent » pendant la
   frappe + risque de réponses désordonnées).
3. **Pas de longueur minimale** : 1 caractère suffit à requêter partout (« l » → requête
   complète Typesense/Directus).
4. **Accueil muet** : seul point d'entrée sans aucun retour avant validation (acceptable
   — sobriété — mais incohérent avec le header qui suggère).
5. Recherche absente de certaines listes riches (questions écrites, votes) — la recherche
   globale les couvre désormais (filtres par type), à défaut d'un champ local.

---

## 3. Réponse à « sur documents : à la frappe ou au clic ? »

**À la frappe (search-as-you-type), comme la page `/recherche`** — c'est d'ailleurs déjà le
comportement actuel, et le standard attendu pour un champ qui **filtre une liste** (l'utilisateur
affine, il ne « soumet » pas). Typesense répond en 10–50 ms, il est fait pour ça.

Mais à trois conditions (qui manquent aujourd'hui) :

1. **Debounce ~350 ms** avant l'appel API ;
2. **Minimum 2 caractères** (sinon on requête sur « l », « d »…) ;
3. Indicateur de chargement discret + résultats stables (pas d'effacement pendant la frappe).

Un bouton « Rechercher » n'aurait de sens que pour une action coûteuse ou une navigation
(cas de l'accueil, qui navigue vers `/recherche` → le bouton y est justifié).

---

## 4. Préconisations

### Règle par type de contenu

| Type de contenu | Backend recommandé | Déclenchement |
| --- | --- | --- |
| Corpus plein-texte volumineux (documents, actualités, recherche globale) | **Typesense** | Frappe + debounce 300–350 ms, min 2 car. |
| Listes de fiches à noms propres (députés, personnalités, annuaire) | Directus OK à court terme ; **Typesense `filter_by type:=X` recommandé** (accents sur les noms : « Bâ », « N'Diaye ») | Frappe + debounce 300–350 ms |
| Petites listes chargées entièrement (glossaires, cartes, tableaux) | **Filtrage client** (existant) | Frappe, instantané, sans debounce |
| Entrée de navigation (accueil, header) | Typesense via `/api/search` | Header : suggestions live ; Accueil : Entrée/clic → `/recherche` |

### Plan d'action UX (priorisé)

| # | Action | Impact | Effort |
| --- | --- | --- | --- |
| U1 | **Debounce 350 ms + min 2 caractères dans `useCollectionState`** (le `searchQuery` exposé aux inputs reste immédiat pour l'affichage ; c'est la valeur passée à `useCmsCollection` qui est débouncée). Corrige d'un coup TOUTES les listes (documents, députés, médias…) | 🔴 Charge serveur + stabilité UX | 1–2 h |
| U2 | Harmoniser `/recherche` et header sur les mêmes seuils (300–350 ms, min 2 car.) | Cohérence | 30 min |
| U3 | Listes députés/personnalités/annuaire → recherche via Typesense (`type:=depute` etc., même pattern hybride que C10) pour la tolérance accents sur les noms | Rappel sur noms propres | ½ j |
| U4 | Accueil : brancher les suggestions live du header (même composant/API) — optionnel, à A/B tester ; la sobriété actuelle se défend | Engagement | 2 h |
| U5 | « Recherches populaires » dynamiques (analytics C7) sur `/recherche` + modal mobile header | Pertinence des suggestions | 2 h (attend les données) |
| U6 | `enable_analytics=false` sur les requêtes du header/quick search pour ne compter que les recherches abouties de `/recherche` | Qualité des stats | 15 min |

### Ce qu'on ne recommande PAS

- Un bouton « Rechercher » obligatoire sur les listes (friction inutile, régression).
- Basculer les filtres client (glossaires, cartes) sur API (dégraderait l'instantanéité).
- Unifier de force l'accueil sur le dropdown du header : deux intentions différentes
  (navigation posée vs recherche rapide), les deux peuvent coexister si les seuils sont alignés.
