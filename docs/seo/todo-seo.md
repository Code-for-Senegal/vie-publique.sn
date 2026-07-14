# TODO SEO — chantiers restants

> Tâches identifiées pendant l'audit SEO (juin 2026) et **différées volontairement**.
> Règles de référence : `CLAUDE.md` § SEO (1–9) + `docs/seo/seo-pages-detail-audit.md`.

## 1. Dédup des breadcrumbs (différé : « on attend »)

Le `@graph` global de `@nuxtjs/seo` émet **déjà** un `BreadcrumbList` (+ WebSite/WebPage/
Organization) auto-dérivé de la route. Plusieurs pages réémettent un breadcrumb → **doublon**
(inoffensif mais inutile).

**À faire** : retirer, sur les pages détail, le `breadcrumbSchema` par page (et les
`webPageSchema`) injectés via `useHead` — ne garder que le **nœud d'entité** (Article, NewsArticle,
Person, FAQPage…). Pages concernées (non exhaustif) : `actualites/[id]`, `conseil-des-ministres/[id]`,
`personnalites/[id]`, `documents/[id]`, `etat-senegal/[slug]`…
(les dossiers et `assemblee-nationale/questions` — liste + détail — sont déjà faits).

> Cf. CLAUDE.md § SEO règle 7.

## 2. `assemblee-nationale/deputes/[id]` — BreadcrumbList malformé (8 items)

La page utilise `useSchemaOrg([ defineBreadcrumb(...), definePerson(...) ])`. Le `defineBreadcrumb`
**fusionne** avec le breadcrumb auto du `@graph` → **un seul `BreadcrumbList` à 8 items** (chaque
niveau dupliqué) au lieu de 4.

**À faire** : retirer le `defineBreadcrumb(...)` (garder `definePerson`) → le breadcrumb auto du
`@graph` redonne 4 items propres. **Fix d'1 ligne.**

## 3. `assemblee-nationale/votes/[id]` — pas de titre SEO

La page n'a pas de `useSeoMeta` (titre/description) → elle hérite du titre global générique.

**À faire** : ajouter `useSeoMeta` (title = objet du vote, description) en scope setup avec getters
réactifs, + éventuellement un nœud JSON-LD adapté. (Vérifier aussi `useSeoMeta` sur les autres pages
`votes/*` si manquant.)

## 4. GEO / autorité externe — entité + backlinks (juil. 2026)

Renforcer le poids de Vie-Publique.sn dans les réponses des moteurs et des LLM
(ChatGPT, Perplexity, Claude, AI Overviews). Démarche détaillée :
`docs/modules/a-propos/wikipedia-wikidata.md`.

- [ ] **Wikidata** : créer l'item (immédiat, gros levier entité) + reporter le QID dans le
      `sameAs` du schema Organization
- [ ] **Wikipédia** : constituer d'abord le dossier de sources presse (≥ 2 sources centrées
      espacées de 2 ans) — publier trop tôt = suppression ; brouillon + relecture Projet:Sénégal
- [ ] **Backlinks / annuaires** : data.gouv.sn (réutilisations), Civic Tech Field Guide
      (civictech.guide), réseau Code for All, Participedia ; relations presse (Seneweb,
      Dakaractu, RFI/BBC Afrique — angle civic tech / transparence budgétaire)
- [ ] **Crawlers IA** : vérifier que robots.txt n'exclut pas GPTBot, ClaudeBot, PerplexityBot,
      Google-Extended ; suivre l'indexation Bing (ChatGPT search)
- [x] **Licence CC BY 4.0** (juil. 2026) : déclarée dans le llms.txt ET sur
      `/a-propos/qui-sommes-nous` (§ « Licence et réutilisation des contenus ») — contenu
      éditorial CC BY 4.0, documents officiels = domaine public, code = GPL v3
- [ ] **API publique documentée** (lecture seule, quelques collections) : différenciateur GEO
      majeur pour les agents IA ; en attendant, le llms.txt renvoie vers `contact@vie-publique.sn`
- [ ] **Faits d'audience datés** dans `server/utils/llms.ts` (60 000 visites/mois, juil. 2026) :
      à rafraîchir périodiquement (les abonnés cumulés sont dynamiques via `vp_social_stats`)
- [x] Date de fondation tranchée : **2024** — llms.txt harmonisé (juil. 2026)

---

## Déjà fait (pour mémoire)

- **Questions écrites** (juil. 2026) : migration `/questions/:id` → `/questions/:id/:slug`
  (slug CMS + fallback serveur, redirection 301 via `[id]/index.vue`), sitemap (fiches),
  h1 = sujet de la question (barre mobile → `<p>`), JSON-LD `Question` avec `key`
  (retrait `WebPage` + breadcrumb doublon), title sans suffixe manuel, caches bumpés v2
  (`assembly-questions`, `assembly-question-detail`, `assembly-latest-questions`,
  `assembly-deputy-questions`). Modèle : migration votes (commit `84e618d`).
- JSON-LD `children` → `innerHTML` sur ~36 pages (sinon script vide en @unhead v2).
- 500 SSR `/actualites/[id]` (`useCmsImageAbsolute` dans un getter) → `useCmsImage` + `siteUrl`.
- **Un seul `<h1>`** sur toutes les pages (barres d'en-tête mobile → `<p>`).
- Titres sans marque dupliquée (documents, dossiers, personnalités).
- JSON-LD Article : `datePublished` ISO+tz, `author.url`, `publisher.logo`.
