# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vie Publique Sénégal - A Nuxt 3 web application providing transparent access to public information in Senegal, including national assembly data, budget visualizations, and election information.

## Essential Commands

```bash
# Development
npm run dev                    # Start development server at http://localhost:3000

# Building
npm run build                  # Build for production
npm run generate               # Generate static site
npm run preview                # Preview production build locally

# Code Quality
npm run lint                   # Check code with ESLint
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier

# Testing
cd test/locust && locust       # Run load tests (Python required)
```

## Architecture Overview

### Core Stack

- **Framework**: Nuxt 3 with Vue 3, server-side rendering
- **UI**: Nuxt UI + Tailwind CSS
- **State**: Pinia stores in `/stores/`
- **Type Safety**: TypeScript with types in `/types/`

### Key Architectural Decisions

1. **Feature-Based Component Organization**: Components are grouped by domain (Assembly, Budget, Election) rather than by type, making feature development more cohesive.

2. **Composables for Data Logic**: All data fetching and business logic is abstracted into composables (`/composables/`), keeping components focused on presentation.

3. **Server API Routes**: Backend functionality lives in `/server/api/` with endpoints for:
   - Assembly data (`/api/assembly/*`)
   - Budget information (`/api/budget/*`)
   - Election data (`/api/elections/*`)
   - **CMS Asset Proxy** (`/medias/*`, `/documents/*`) - SEO-friendly proxy to CMS
   - External service proxies (Twitter, data.gouv.sn)

4. **Type Definitions**: Centralized in `/types/` with separate files for each domain (assembly.ts, budget.ts, election.ts).

### Environment Configuration

Required environment variables (see .env.example):

- `NUXT_PUBLIC_SITE_URL`: Production URL for SEO
- `CMS_API_URL`: CMS backend URL (without trailing slash)
- `CMS_API_URL_ASSETS`: Direct CMS assets URL (without trailing slash)
- `NUXT_TURNSTILE_SECRET_KEY`: Cloudflare Turnstile for security

**⚠️ IMPORTANT**: All URLs must be WITHOUT trailing slash to avoid double-slash issues in the CMS proxy system.

**Hôte canonique** : `https://www.vie-publique.sn` (AVEC www). La redirection 301 apex→www est faite par `server/middleware/host-redirect.ts` (PAS par Coolify — sa Direction doit rester sur « Allow www & non-www ») ; mécanisme complet documenté dans `docs/guidelines/dns-redirections-domaines.md`.

### Conventions de nommage Directus (IMPORTANT — à suivre pour toute nouvelle feature)

> Avant de créer une collection Directus, identifier à quelle **famille** appartient le contenu,
> puis appliquer la convention correspondante. **Toujours vérifier les noms réels existants**
> (`grep -rE "read(Items|Item)\(" server/`) plutôt que supposer — certains noms surprennent
> (ex. les podcasts sont dans `vp_podcasts`, pas `podcasts`).

**Champs** : toujours en **anglais**, `snake_case` (`title`, `slug`, `cover_image`, `publish_date`,
`seo_title`, `seo_description`, `full_name`, `date_updated`…). Statut de publication = champ `status`
avec valeurs `draft` / `published` / `archived`.

**Collections** — 3 familles :

| Famille                            | Convention                       | Exemples                                                                                                                | Quand l'utiliser                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Contenu public principal**       | pluriel nu, sans préfixe         | `documents`, `news`, `media`, `elections`, `dossiers`                                                                   | Contenu public de 1er rang destiné aux citoyens. Le nom calque souvent l'URL publique (ex. `/dossiers` → `dossiers`, `/carte` → `carte`).                                                        |
| **Module métier**                  | `<domaine>_<entité>` (singulier) | `assembly_deputy`, `budget_line`, `state_organization_entity`, `election_coalition`, `public_project`, `public_persons` | Données structurées d'un domaine fonctionnel (assemblée, budget, état, élections, projets). Les tables liées gardent le préfixe du domaine.                                                      |
| **Contenu propre à l'association** | préfixe `vp_`                    | `vp_podcasts`, `vp_documents`, `vp_team`, `vp_partners`, `vp_social_stats`, `vp_feature_flags`                          | Contenu/ressources **de l'association Vie Publique** (page « À propos » : leurs documents, leur équipe, partenaires…) + config applicative. **Ne PAS confondre** avec le contenu public du site. |

> ⚠️ Le préfixe `vp_` = « contenu de l'association », **pas** « contenu éditorial du site ».
> Une page de référence publique (ex. Dossiers) va dans la famille **sans préfixe**.

**Relations Many-to-Many** : un champ M2M par type de contenu lié. Directus crée la table de
jonction `<collectionA>_<collectionB>` et les clés étrangères `<collection>_id`. Côté serveur,
on lit la FK de la **cible** (ex. `documents_id`, `news_id`, `vp_podcasts_id`) via l'expansion
imbriquée `champ.<cible>_id.<sousChamp>` puis on aplatit (`row => row.<cible>_id`, en filtrant
`status === 'published'`). Références : `server/api/dossiers/[slug].get.ts` (helper `flattenM2M`)
et `server/api/assembly/votes/[id].get.ts`.

> ⚠️ **Piège permission (fait perdre du temps).** L'expansion imbriquée
> `champ.<cible>_id.*` **ne remonte RIEN et le champ disparaît silencieusement** (pas d'erreur,
> juste `undefined`) si le **rôle du token CMS n'a pas le droit `Read` sur la table de JONCTION**
> `<collectionA>_<collectionB>`. Ce n'est PAS un bug de code. Directus n'accorde pas ce droit
> automatiquement aux nouvelles jonctions. **Diagnostic** : si `champ.*` renvoie bien les lignes
> de jonction (`{ id, <src>_id, <cible>_id }`) mais que `champ.<cible>_id.*` fait disparaître le
> champ → **droit manquant sur la jonction**. **Fix** : Directus → Settings → Roles → _(rôle du
> token)_ → cocher **Read** sur la collection de jonction. Corollaire : ne PAS conclure trop vite
> à un mauvais nom de FK ni basculer sur un contournement 2-requêtes — **vérifier d'abord le droit
> de lecture sur la jonction** (et purger le cache : un résultat vide reste caché tant que le
> `name` du `defineCachedEventHandler` n'est pas bumpé).

**Blocs riches répétables** (FAQ, chronologie, comparatif…) : interface **« Repeater »**
(section Selection ; anciennement « List ») → crée un champ `json` avec un formulaire propre
pour les rédacteurs (pas de JSON brut à saisir).

### Cache Nitro & CMS en dev local (pièges — fait perdre du temps)

- **Le cache SWR Nitro persiste sur disque dans `.nuxt/cache/nitro/` ENTRE les redémarrages du
  serveur dev.** Avec `maxAge: 0` + SWR, un endpoint peut répondre 200 avec des données **périmées
  d'une session précédente** alors que le CMS est injoignable ou que le code a changé. Pour tester
  une valeur fraîche : supprimer `.nuxt/cache/nitro/handlers/<name>` (et `functions/<name>` pour
  `defineCachedFunction`), ou bumper le `name`.
- **Diagnostic** : certains endpoints CMS répondent 200 et d'autres 500 `fetch failed` → comparer
  cache présent vs absent AVANT de chercher un bug de code.
- Les requêtes Directus peuvent échouer en dev local avec `unable to get local issuer certificate`
  (proxy/VPN Windows interceptant le TLS). **Ce n'est pas un bug de code** (OK en prod). Test
  local uniquement : relancer avec `$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'` (jamais en prod).
- Tout nouveau handler consommant le CMS doit **dégrader proprement** : requêtes isolées
  (échec = donnée omise ou fallback daté), jamais un 500 global (modèle : `server/utils/llms.ts`).

### Monitoring d'erreurs (Sentry)

> Détail complet : `docs/monitoring/sentry.md`. Actif seulement si `NUXT_PUBLIC_SENTRY_DSN` est défini.

- Périmètre : **erreurs uniquement** (pas de tracing ni replay — décision, pas un oubli).
- **Dans tout bloc `catch` serveur qui dégrade proprement**, appeler
  `reportServerError(error, scope, context?)` (`server/utils/report-error.ts`, auto-importé) :
  la dégradation reste propre pour l'utilisateur, l'erreur devient visible en monitoring.
  Jamais de `error.message` dans la réponse HTTP (SEC-9) — message générique + `reportServerError`.
- Côté client, rien à faire (capture auto) ; les erreurs de chunks post-déploiement et le bruit
  réseau sont déjà exclus dans `sentry.client.config.ts` — ne pas les « réparer ».
- `sentry.server.config.ts` lit `process.env` (PAS `useRuntimeConfig()`, indisponible à ce stade).

### Development Workflow

1. **Branch Strategy**: Work on `develop` branch, create PRs to `develop`
2. **Commit Convention**: Use Conventional Commits (feat:, fix:, docs:, etc.)
3. **Before Committing**: Always run `npm run lint:fix` and `npm run format`
4. **Type Safety**: Ensure all new code has proper TypeScript types
5. **Changelog** : toute nouvelle fonctionnalité **structurante et visible utilisateur** (nouveau
   module, nouvelle page publique, nouveau canal type RSS/notifications) → ajouter une puce dans
   la section du mois en cours de `CHANGELOG.md` (créer la section si besoin), formulée pour un
   lecteur non-dev. Rester **gros grain** : pas une ligne par commit (le détail est dans git),
   pas de `fix`/`refactor`/`docs` internes ni de micro-améliorations UI/SEO.

### Critical Patterns

1. **API Data Fetching**:

   ```typescript
   // Use composables for data fetching
   const { data, pending, error } = await useAsyncData('key', () => $fetch('/api/endpoint'));
   ```

2. **Component Props**: Always define with TypeScript:

   ```typescript
   interface Props {
     data: AssemblyMember[];
     loading?: boolean;
   }
   const props = defineProps<Props>();
   ```

3. **SEO Optimization**: Use `useSeoMeta()` and `useHead()` in pages
4. **Error Handling**: Wrap API calls in try-catch, use `showError()` for user feedback

### SEO & Open Graph — règles de diagnostic (IMPORTANT)

> Référence complète : `docs/seo/seo-pages-detail-audit.md` (§0 Méthodologie), `docs/seo/seo-indexation-rapide.md`, `docs/seo/seo-audit.md`. **Lire ces docs avant tout audit/modif SEO.**

Le projet utilise `@nuxtjs/seo`. Un audit basé uniquement sur le code produit de **faux diagnostics**. Règles :

1. **Vérifier le HTML SSR de PROD avant de conclure** : `curl -sL -A "facebookexternalhit/1.1" <url> | grep -iE 'og:|twitter:|canonical|robots'`. Ne jamais déduire un bug du seul code.
2. `@nuxtjs/seo` **absolutise** les `og:image` relatives : `useCmsImage(id)` (`/cms/<id>`) devient absolu dans le HTML → une og:image relative `/cms/...` **n'est PAS un bug**.
3. `@nuxtjs/seo` fournit des **fallbacks globaux** (og:image, robots, canonical, og:site_name) → « la page ne définit pas X » ≠ « X absent du HTML ».
4. **2 seules causes réelles de partage social cassé** : (a) meta dans un `watch`/`onMounted` au lieu du scope setup → SSR rend les meta GLOBALES ; (b) concat malformée `` `${siteUrl}${idBrut}` `` (sans slash). Toujours définir `useSeoMeta`/`useHead` **en scope setup avec getters réactifs**, et utiliser `useCmsImageAbsolute()` pour les images CMS.
5. Avant de « corriger l'indexation » d'une page : vérifier `routeRules` (redirects 301) et `robots.disallow` dans `nuxt.config.ts`.
6. **Schema.org : utiliser le JSON-LD brut (pattern majoritaire du projet, modèle = `documents/[id]/[slug].vue`), PAS `useSchemaOrg`.** Définir chaque schéma comme un objet `computed` simple (`{ '@context': 'https://schema.org', '@type': 'Article', … }`) en scope setup, puis l'injecter via `useHead({ script: [{ type: 'application/ld+json', innerHTML: computed(() => JSON.stringify(monSchema.value)) }] })`. **⚠️ Utiliser `innerHTML`, PAS `children`** : avec `@unhead/vue` v2 (le projet est en v2), `children` est rendu comme **attribut HTML** (`<script … children="{…}">`) et le JSON-LD n'est **pas lu par Google**. _(Beaucoup de pages historiques utilisent encore `children` → JSON-LD page cassé ; à migrer vers `innerHTML`. Vérifier le rendu : `curl -s <url> | grep -oE '<script type="application/ld\+json">'` doit montrer le `{…}` en contenu, pas en attribut.)_ Construire les URLs d'image **absolues** avec la fonction pure `useCmsImage()` + le `siteUrl` capturé en setup (`` `${siteUrl}${useCmsImage(id)}` ``), jamais `useCmsImageAbsolute()` à l'intérieur du schéma. _(Les 6 pages historiques en `useSchemaOrg`/`defineArticle` sont l'exception ; si on doit y toucher, ne jamais appeler de composable Nuxt — `useRuntimeConfig`/`useSiteMetadata`/`useCmsImageAbsolute` — dans un getter, car nuxt-schema-org les résout hors scope setup → 500 SSR. Pour une nouvelle page, préférer le JSON-LD brut.)_

   **⚠️ TOUJOURS mettre un `key` unique sur chaque entrée `script` JSON-LD** :
   `useHead({ script: [{ key: 'ld-article', type: 'application/ld+json', innerHTML: … }, { key: 'ld-breadcrumb', … }] })`.
   **Sans `key`**, avec un `script: () => [...]` réactif (schéma dépendant de données chargées en async via `useAsyncData`), `@unhead` **AJOUTE** un 2ᵉ `<script>` à l'hydratation client au lieu de **remplacer** → **nœud JSON-LD dupliqué dans le DOM rendu** (ex. **« 2 Articles » au test Rich Results**). ⚠️ Piège : **invisible en SSR** (`curl` ne montre qu'1 nœud) car le doublon est ajouté **côté client** — le test Rich Results, lui, exécute le JS et voit les 2. Donc pour ce bug précis, vérifier le **DOM rendu** (test Rich Results / DevTools), pas seulement le HTML `curl`. _(Corrigé sur `documents/[id]/[slug]`, `actualites/[id]/[slug]`, `dossiers/[slug]`, `assemblee-nationale/actualites/[id]/[slug]`.)_

   **⚠️ ORDRE des déclarations en `<script setup>` (anti-TDZ « Cannot access 'x' before initialization »).** Tout ce qu'un getter `useSeoMeta`/`useHead` ou un `computed` de schéma référence doit être **déclaré AVANT**. Ordre obligatoire : (1) `props`/`useRoute`/data-fetch → (2) **fonctions helper** (`formatDate`, `formatDateISO`, `getYoutubeVideoId`…) → (3) `computed`/schemas → (4) **`useSeoMeta`/`useHead` EN DERNIER**. Piège : une fonction `const formatDateISO = …` déclarée **après** un schéma qui l'appelle compile sans erreur mais **plante à l'hydratation client** : `@unhead` évalue les getters pendant le setup, avant l'init de la fonction → **500 en accès direct** (SSR renvoie 200 → `curl` ne le voit PAS ; reproduire en **collant l'URL** dans le navigateur, idéalement nav privée). La règle ESLint `@typescript-eslint/no-use-before-define` (`variables: true`, en `warn`) signale ces cas — **ne pas ignorer un warning sur un helper utilisé dans un computed/getter**. _(Corrigé sur `documents/[id]/[slug]`, `actualites/[id]/[slug]`, `podcasts/[id]/[slug]`, `assemblee-nationale/questions/[id]`.)_

7. **Ne pas dupliquer les nœuds déjà émis par le `@graph` global.** `@nuxtjs/seo` / `nuxt-schema-org` émet déjà, dans un `<script>` `@graph`, les nœuds **WebSite, WebPage, Organization, ImageObject et un `BreadcrumbList` auto-dérivé de la route** (vérifié valide). En page, n'émettre que le **nœud d'entité propre à la page** (`Article`, `NewsArticle`, `Person`, `FAQPage`, `CollectionPage`, `GovernmentOrganization`…). **Ne PAS** réémettre `WebPage`/`Organization`/`BreadcrumbList` en page :
   - **⚠️ Le `BreadcrumbList` du `@graph` est émis par le composant `<AppBreadcrumb>`** (`app/components/AppBreadcrumb.vue` appelle `useSchemaOrg([defineBreadcrumb(...)])` à partir de ses `items`). **C'est la source UNIQUE du breadcrumb.** Donc sur **toute page qui utilise `<AppBreadcrumb>`** (quasi toutes les pages détail), **ne JAMAIS** ajouter un autre breadcrumb : ni un `defineBreadcrumb` page, ni un `BreadcrumbList` en JSON-LD brut — le composant s'en charge.
   - un **2ᵉ `defineBreadcrumb`** dans la page **fusionne** avec celui d'AppBreadcrumb dans le **même** nœud `@graph` → **un seul `BreadcrumbList` malformé à items dupliqués** (ex. `assemblee-nationale/deputes/[id]` : **8 items au lieu de 4**, chaque niveau en double). **Corrigé** (retrait du `defineBreadcrumb` page) sur `deputes/[id]/[name]`, `commissions/[id]`, `budget-senegal/[slug]`.
   - un **`BreadcrumbList` en JSON-LD brut** dans la page = 2 nœuds séparés (page + AppBreadcrumb) = doublon **toléré** par Google mais inutile → à retirer par opportunité (laisser AppBreadcrumb seul). Pages encore concernées : `documents/[id]/[slug]`, `personnalites/[id]/[slug]`, `actualites/[id]/[slug]`, `etat-senegal/[slug]`…
     _Vérifier : `curl -s <url> | grep -oE '"@type":"(BreadcrumbList|ListItem)"' | sort | uniq -c` → attendu **1 BreadcrumbList** et **N ListItem** (N = nb de niveaux, pas 2×N). Le nœud `Person` n'apparaît PAS au test Rich Results (type sans affichage enrichi) — c'est **normal**, pas un bug._
8. **Un seul `<h1>` par page.** Piège récurrent : les pages détail ont **deux en-têtes** (barre sticky **mobile** + en-tête **desktop**) qui affichent le même titre. Si les deux sont `<h1>` → **2 H1** (les deux sont dans le DOM, juste masqués en CSS selon le viewport). **Règle : un seul `<h1>` = le titre principal du contenu ; la barre de nav mobile et les titres de cartes/sections sont en `<p>` ou `<h2>`.** Vérifier : `curl -s <url> | grep -o "<h1" | wc -l` doit donner **1**.
9. **Titre de page : ne PAS répéter la marque.** Le `titleTemplate` global (`@nuxtjs/seo`) ajoute déjà `| Vie-Publique.sn`. En page, mettre **juste le titre** (+ éventuel descripteur utile : « Nom - Poste »), **sans** « - Vie Publique Sénégal » ni « | … Vie Publique Sénégal » (sinon marque dupliquée + titre trop long). Un **qualificatif de section** sans la marque (« | Actualités Sénégal ») reste acceptable.
10. **Recherche interne : JAMAIS indexable.** Toute page de résultats de recherche (`/recherche` ou future variante) doit porter `{ name: 'robots', content: 'noindex, follow' }` et être exclue du sitemap (`sitemap.exclude` dans `nuxt.config.ts`). Raisons : espace d'URLs `?q=` infini qui brûle le crawl budget, **vecteur de spam** (des fermes de liens pointent vers `/recherche?q=<spam>` pour faire indexer leurs mots-clés sur notre domaine — constaté sur Bing en 2026-07), contenu pauvre/dupliqué pénalisé (« search results in search results »). **⚠️ PAS de `Disallow` robots.txt** sur ces pages : le crawler doit pouvoir les crawler pour voir le noindex, et `follow` laisse circuler le jus vers les fiches. Ce qui doit ranker à la place : les pages de listing éditoriales à URL stable (`/documents/public`, `/dossiers`…).
11. **Texte CMS injecté dans les meta / JSON-LD : TOUJOURS passer par `useCleanText`.** Pour toute valeur `useSeoMeta` (description…) ou champ JSON-LD (`text`, `articleBody`, `description`, FAQ `answer`…) construite à partir de contenu rédigé au CMS, utiliser `cleanCmsText()` (strip HTML + décode les entités + `.normalize('NFKC')` + collapse blancs) et, pour couper, `truncateText()` — **jamais** `.slice`/`.substring` bruts. Raison : du texte collé depuis les réseaux contient souvent du **pseudo-gras Unicode** (`𝐎𝐛𝐣𝐞𝐭…`, plan astral U+1D400+ = paires de surrogates UTF-16) ; Google tronque les longues valeurs structurées et coupe **au milieu d'une paire** → surrogate orphelin → GSC **« Truncated Unicode character »** (structured data invalide, page inéligible aux rich results). `NFKC` replie ces caractères en ASCII (`𝐎𝐛𝐣𝐞𝐭 → Objet`) → plus aucun surrogate ; `truncateText` coupe au **code point** (jamais au milieu d'une paire). ⚠️ Ne PAS réimplémenter un `stripHtml` local (`html.replace(/<[^>]*>/g,'')`) : il laisse les entités brutes (`&eacute;`) ET les caractères astraux. Le composable `useCleanText` ([app/composables/useCleanText.ts](app/composables/useCleanText.ts)) est auto-importé. _(Bug rencontré 2026-07 sur `assemblee-nationale/questions/[id]` ; corrigé + rollout préventif sur `votes/[id]`, `dossiers/[slug]`, `actualites/[id]`, `assemblee-nationale/actualites/[id]`, `conseil-des-ministres/[id]`, `podcasts/[id]`.)_ Le fix ne nettoie que la sortie SEO — le **contenu affiché** (`v-html`) garde le pseudo-gras : à corriger côté Directus si besoin d'accessibilité.

### Conventions d'URL (SEO)

> Détail complet : `docs/guidelines/url-structure-analysis.md`.

- Mots séparés par des **tirets** (`-`), pas d'underscores.
- URL **courte mais descriptive**, calée sur les termes de recherche FR courants.
- **Pas d'accents** ni de caractères spéciaux/encodés ; minuscules.
- Slug stable une fois indexé ; si changement, prévoir une **redirection 301** (`routeRules`).

### llms.txt (GEO — crawlers IA)

> Détail complet : `docs/seo/llms-txt.md`.

`/llms.txt` et `/llms-full.txt` sont des **routes Nitro dynamiques** (`server/routes/llms*.txt.get.ts`,
markdown construit dans `server/utils/llms.ts` depuis Directus). Règles : (1) **ne JAMAIS recréer
`public/llms.txt`** — un asset statique masquerait silencieusement la route ; (2) nouvelle rubrique
majeure du site → l'ajouter dans `buildLlmsSections()`, sauf si elle est en `Disallow` robots ;
(3) changement de Président/PM → mettre à jour les fallbacks datés dans `server/utils/llms.ts`
(le CMS prime, le fallback ne sert qu'en panne).

### Flux RSS

> Détail complet : `docs/rss/flux-rss.md` (architecture, choix de design, ajout d'un flux, vérification).

5 flux servis par des **routes Nitro dynamiques** (`server/routes/**/rss.xml.get.ts`, builder
partagé `server/utils/rss.ts`) : `/rss.xml` (global), `/actualites/rss.xml`,
`/conseil-des-ministres/rss.xml`, `/documents/rss.xml`, `/documents/journal-officiel-senegal/rss.xml`.
Règles : (1) **ne JAMAIS créer `public/rss.xml`** (masquerait la route, même piège que llms.txt) ;
(2) les items documents sont datés par **`date_created`** (ajout au site — backfill), pas
`publish_date` ; (3) descriptions nettoyées via `cleanCmsText` (**`shared/clean-text.ts`**, dont
`app/composables/useCleanText.ts` n'est qu'un ré-export) ; (4) route en échec → **throw** (jamais
un flux vide en 200 : il serait mis en cache) ; (5) nouveau flux → suivre la doc et déclarer
l'autodiscovery sur la page de listing correspondante.

### UI & Design conventions (IMPORTANT)

> Référence complète : `docs/design.md`. **Lire avant de créer une nouvelle page/section.**

Style cible : **sobre, éditorial, premium** (Google / Apple / Medium / service-public.fr) —
priorité au contenu, à la lisibilité, au responsive et au SEO. **Pas** de look « template IA /
dashboard ».

1. **Dark mode — palette « Dim » slate du site (NE PAS changer), surfaces SOLIDES.** Le thème dark
   est défini **globalement** dans `app/assets/css/app.css` : `.dark body` & `.dark .bg-gray-900` =
   **`#15202B`**, `.bg-gray-800` = **`#1E2732`** (cartes), `.bg-gray-700` = `#22303C`, accent
   `#1D9BF0`. C'est la palette voulue — **ne pas la remplacer** par une autre échelle (`neutral`,
   `zinc`… → rend presque noir et casse la cohérence).
   - **Fond de page** : `dark:bg-gray-900` (= `#15202B`) ou hériter du body (`dark:bg-transparent`).
   - **Cartes/surfaces** : `dark:bg-gray-800` (= `#1E2732`, standard `UCard`), anneaux
     `dark:ring-gray-700`, texte `dark:text-white` / `dark:text-gray-300/400`.
   - **Pas d'opacité `/50`** sur les grandes surfaces (`dark:bg-gray-800/50`) → aspect délavé bleuté ;
     utiliser la couleur pleine.
2. **Sobriété** : éviter l'excès d'icônes colorées, de cartes, de bordures et d'ombres. Préférer
   l'espace blanc et de fines séparations (`border-t border-gray-100 dark:border-gray-700`).
3. **Couleurs** : surtout blanc / gris clair / **bleu VP (`sky`, couleur primary)**. Touches
   vert/jaune/rouge seulement si porteuses de sens (statut). Pas de palette flashy par défaut.
4. **Icônes de section** optionnelles et discrètes (pas de pastilles colorées). Le titre suffit.
5. **Largeur de lecture** éditoriale : `max-w-3xl` pour le contenu texte.
6. **Mobile** : pas de scroll horizontal visible (`scrollbar-hide`), pas de contenu coupé ;
   transformer les tableaux larges en blocs empilés.
7. **Réutiliser les composants existants** plutôt que recréer : documents →
   `DocumentsDocumentListItem` ; fil d'ariane → `AppBreadcrumb` ; images CMS → `CmsImage`.

### Listes paginées / filtrées & SSR (IMPORTANT — éviter le bug de pagination)

> Contexte : une liste paginée doit rendre le BON contenu **côté serveur**. Un état lu trop
> tard (après le rendu serveur) casse la pagination ET le SEO. Règle apprise sur la page
> `/assemblee-nationale/questions` (cf. `useCollectionState.ts`).

1. **Initialiser l'état UI (page, recherche, tri, filtre) à partir de `route.query` DE FAÇON
   SYNCHRONE dans le `setup`** — JAMAIS dans `onMounted`. `onMounted` ne s'exécute pas pendant
   le SSR : l'état resterait à sa valeur par défaut (`page=1`), le serveur rendrait toujours la
   page 1 quel que soit `?page=N`, puis l'affichage « sauterait » après hydratation.

   ```typescript
   // ✅ BON — lu au setup, valable SSR + client
   const route = useRoute();
   const currentPage = ref(parseInt(route.query.page as string) || 1);

   // ❌ MAUVAIS — onMounted = client uniquement → SSR ignore ?page
   const currentPage = ref(1);
   onMounted(() => {
     if (route.query.page) currentPage.value = +route.query.page;
   });
   ```

2. **Réutiliser `useCollectionState` + `useCmsCollection`** pour toute nouvelle liste (documents,
   news, votes, dossiers… 15 collections les utilisent déjà). Ne pas réimplémenter la pagination
   à la main. La pagination est **serveur** (`limit`/`offset` via l'API), pas un `slice` client.

3. **Pages hors-limites** : prévoir le recalage `?page=999` → dernière page valide une fois les
   données chargées (voir le `watch([totalPages, loading])` dans `useDocuments.ts`), sinon l'UI
   affiche « Aucun résultat » à tort.

4. **Toujours vérifier en SSR avant de conclure** (cf. règle SEO §1) : comparer le HTML serveur
   de deux pages doit donner des items **disjoints**.

   ```bash
   # les deux ensembles d'IDs doivent être différents (0 commun)
   curl -sL "<url>?page=1" | grep -oE '/prefix/[0-9]+' | sort -u
   curl -sL "<url>?page=2" | grep -oE '/prefix/[0-9]+' | sort -u
   ```

   ⚠️ S'assurer de cibler le bon motif de lien d'item : une page « hub » (ex. `/documents` =
   catégories) n'est PAS la liste paginée (ex. `/documents/public`).

### Performance Considerations

- PWA enabled with service worker
- Image optimization through Nuxt Image
- Lazy loading for heavy components (charts, maps)
- Static generation where possible (`npm run generate`)

### Security Features

- CSP headers configured via nuxt-security
- Rate limiting in production
- Input validation on all API endpoints
- Turnstile integration for form protection

### port de démarrage

démarre toujours le projet sur le port 3000

pour killer les autres projet sur windows

identifie le process avec netstats

et ensuite :
powershell -Command "Stop-Process -Id 28032 ││ -Force"
