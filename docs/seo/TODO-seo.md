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
`personnalites/[id]`, `documents/[id]`, `etat-senegal/[slug]`, `assemblee-nationale/questions/[id]`…
(les dossiers sont déjà faits).

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

---

## Déjà fait (pour mémoire)
- JSON-LD `children` → `innerHTML` sur ~36 pages (sinon script vide en @unhead v2).
- 500 SSR `/actualites/[id]` (`useCmsImageAbsolute` dans un getter) → `useCmsImage` + `siteUrl`.
- **Un seul `<h1>`** sur toutes les pages (barres d'en-tête mobile → `<p>`).
- Titres sans marque dupliquée (documents, dossiers, personnalités).
- JSON-LD Article : `datePublished` ISO+tz, `author.url`, `publisher.logo`.
