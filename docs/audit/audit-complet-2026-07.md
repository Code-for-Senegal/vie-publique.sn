# Audit complet du projet — Juillet 2026

> **Date** : 2 juillet 2026
> **Périmètre** : qualité de code, sécurité, performance, PWA, SEO, accessibilité, documentation/tests/CI.
> **Méthode** : audit statique du code source + build (`.output`) + `npm audit`. Les points nécessitant une vérification prod sont signalés.
>
> **Usage** : cocher les cases au fil des corrections. Chaque item du sommaire renvoie à sa section détaillée.

---

## 📋 Sommaire / TODO

### 🔴 Critique

- [ ] [SEC-1 — Webhook Bictorys sans vérification de signature HMAC](#sec-1--webhook-bictorys-sans-vérification-de-signature)
- [x] [SEC-2 — Endpoints `server/api/debug/*` exposés en production](#sec-2--endpoints-de-debug-exposés-en-production) ✅ corrigé 02/07/2026 : dossier `server/api/debug/` supprimé (aucune référence dans le code ; `/api/health` reste pour le healthcheck)
- [ ] [SEC-3 — Protection CSRF inopérante (fichier mal placé)](#sec-3--protection-csrf-inopérante)
- [ ] [SEC-4 — Turnstile jamais vérifié côté serveur + newsletter sans rate limit](#sec-4--turnstile-jamais-vérifié--newsletter-non-protégée)
- [ ] [PERF-1 — Precache PWA de 45,6 MB](#perf-1--precache-pwa-de-456-mb)
- [ ] [QUAL-1 — Couverture de tests ≈ 0,2 % + vitest.config.ts cassé](#qual-1--couverture-de-tests-quasi-nulle)

### 🟠 Important — Performance

- [ ] [PERF-2 — Fonts Google en `@import` bloquant, sans preconnect](#perf-2--fonts-google-en-import-bloquant)
- [ ] [PERF-3 — Firebase dans le bundle d'entrée (~140 KB br sur toutes les pages)](#perf-3--firebase-dans-le-bundle-dentrée)
- [ ] [PERF-4 — Import d3 mort dans AppFooter.vue](#perf-4--import-d3-mort-dans-le-footer)
- [ ] [PERF-5 — pdfjs importé statiquement dans 2 viewers](#perf-5--pdfjs-statique-dans-pdfviewerinlinemodal)
- [ ] [PERF-6 — Images CMS jamais servies en WebP (provider sans `format`)](#perf-6--images-cms-jamais-en-webp)
- [ ] [PERF-7 — Pas de SWR HTML + `no-cache` blanket sur `/api/**`](#perf-7--pas-de-swr-html--no-cache-sur-api)
- [ ] [PERF-8 — Triple stack cartographique (maplibre/deck.gl + leaflet + d3-geo), CSS globaux](#perf-8--triple-stack-cartographique)

### 🟠 Important — Sécurité

- [ ] [SEC-5 — XSS ChatBot : sortie `marked` en `v-html` sans sanitisation](#sec-5--xss-chatbot-marked-sans-sanitisation)
- [ ] [SEC-6 — CSP affaiblie (`unsafe-inline` + `unsafe-eval`)](#sec-6--csp-affaiblie)
- [ ] [SEC-7 — `donate/init-payment` sans rate limit ni plafond + URLs de redirection placeholder](#sec-7--init-payment-non-borné)

### 🟠 Important — Qualité de code

- [ ] [QUAL-2 — ~5 200 lignes de code mort (29 composants + 6 composables)](#qual-2--code-mort-5-200-lignes)
- [ ] [QUAL-3 — `formatDate` redéfini dans 28 fichiers → créer `app/utils/date.ts`](#qual-3--formatdate-dupliqué-dans-28-fichiers)
- [ ] [QUAL-4 — ~424 occurrences de `any`](#qual-4--424-any)
- [ ] [QUAL-5 — 225 `console.*` en prod (dont routes de paiement)](#qual-5--225-console-en-prod) ⏳ partiel 02/07/2026 : 225 → 55 (−75 %) ; restent 10 console dans `donate/*` + règle ESLint `no-console` à ajouter
- [ ] [QUAL-6 — Double arborescence élections (`elections/` vs `elections-senegal/`)](#qual-6--double-arborescence-élections)

### 🟠 Important — SEO

- [ ] [SEO-1 — 4 pages avec JSON-LD réactif sans `key` (duplication à l'hydratation)](#seo-1--json-ld-réactif-sans-key-4-pages) ⏳ partiel 02/07/2026 : questions ✅ (refonte `[id]/[slug]`, `key: 'ld-question'`) ; restent podcasts, médias, conseil-des-ministres
- [ ] [SEO-2 — Contradiction robots.disallow vs sitemap sur `/projets-publics-senegal`](#seo-2--contradiction-robots-vs-sitemap)
- [ ] [SEO-3 — Sitemap incomplet (podcasts, médias, questions, commissions, groupes)](#seo-3--sitemap-incomplet) ⏳ partiel 02/07/2026 : votes ✅ + questions ✅ ajoutés ; restent podcasts (prioritaire), médias, commissions, groupes, carte, recrutement
- [ ] [SEO-4 — 17 pages sans aucun meta + fichier `chat-bot/ [id].vue` avec espace](#seo-4--pages-sans-meta--fichier-avec-espace)
- [ ] [SEO-5 — Restes du TODO SEO : WebPage réémis, marque dans title recherche.vue](#seo-5--restes-du-todo-seo) ⏳ partiel 02/07/2026 : title recherche ✅ (via BING-5), WebPage questions ✅ (refonte) ; restent WebPage `actualites/[id]/[slug]` + cocher §2/§3 dans docs/seo/TODO-seo.md

### 🔎 SEO Bing — audit Bing Webmaster Tools (2 juillet 2026)

- [x] [BING-1 — 🔴 Double hôte www/non-www : redirections 302/307 TEMPORAIRES + 2 sitemaps soumis (25,3K URLs découvertes pour 12,6K réelles)](#bing-1--double-hôte-wwwnon-www--redirections-temporaires) ✅ terminé 02/07/2026 (middleware 301 + Coolify + sitemaps non-www supprimés dans Bing WT) — re-mesurer les URLs découvertes sous 2-4 semaines
- [x] [BING-2 — 617 pages avec 2 balises `<h1>` (haute gravité Bing) = fiches députés](#bing-2--617-pages-avec-2-h1--fiches-députés) ✅ corrigé 02/07/2026 (h1 sticky → `<p>`, vérifié SSR : 1 h1)
- [x] [BING-3 — 7 417 pages « meta description trop courte » (descriptions CMS brutes des documents)](#bing-3--meta-descriptions-trop-courtes-74k-pages) ✅ corrigé 02/07/2026 (desc < 80 chars enrichie + fix « Journal Officiel officiel » ; re-mesurer dans Bing WT sous 2-3 semaines)
- [x] [BING-4 — 5 583 pages « meta descriptions identiques » (conséquence de BING-1 + BING-3)](#bing-4--meta-descriptions-identiques-56k-pages) ✅ vérifié 02/07/2026 : fallback description unique dérivé du titre + enrichissement < 80 chars en place (`documents/[id]/[slug].vue:79-86`) ; re-mesurer dans Bing WT sous 2-3 semaines
- [x] [BING-5 — `/recherche?q=*` indexable (`index, follow`) → Bing crawle des requêtes spam](#bing-5--recherche-indexable--crawl-de-requêtes-spam) ✅ corrigé 02/07/2026 (noindex,follow + hors sitemap + règle SEO §10 CLAUDE.md ; corrige aussi le title SEO-5)
- [ ] [BING-6 — Canonical construit depuis la route (slug erroné/UTM auto-canonisés) : députés, personnalités, actualités, conseil des ministres](#bing-6--canonical-sur-slug-erroné-députés--3-autres-gabarits)
- [ ] [BING-7 — 🔴 archives.sn duplique les documents (même backend) et capte le ranking Bing malgré le canonical vers VP — décision stratégique requise](#bing-7--archivessn-duplique-les-documents-et-capte-le-ranking-bing)

### 🟠 Important — Docs / CI / Hygiène

- [ ] [DOC-1 — `.env.example` incomplet (13 variables manquantes) + lignes CMS inversées](#doc-1--envexample-incomplet)
- [ ] [DOC-2 — 191 MB de PDF versionnés dans `public/`](#doc-2--191-mb-de-pdf-dans-public)
- [ ] [DOC-3 — Scripts npm `version:*` cassés (script supprimé)](#doc-3--scripts-version-cassés)
- [ ] [DOC-4 — Configs de déploiement mortes (docker-compose, vercel.json, nixpacks)](#doc-4--configs-de-déploiement-mortes)
- [ ] [DOC-5 — README obsolète (Node 18, dev-win, badge Sonar)](#doc-5--readme-obsolète)

### 🟡 Mineur

- [ ] [A11Y-1 — Pas de skip link « Aller au contenu »](#a11y-1--pas-de-skip-link)
- [ ] [A11Y-2 — `EtatTreeNode.vue` cliquable sans rôle/clavier](#a11y-2--etattreenode-non-accessible-clavier)
- [ ] [A11Y-3 — UButton icône sans aria-label (3-4 cas)](#a11y-3--boutons-icône-sans-aria-label) ⏳ partiel 02/07/2026 : `documents/public.vue` ✅ (aria-label grille/liste) ; `ElectionMapD3` OK (texte visible) ; reste le bouton x-mark de `elections-senegal/dashboard/[type]/[year].vue`
- [ ] [A11Y-4 — Contrastes `text-gray-400` sur fond clair (~40-80 cas)](#a11y-4--contrastes-text-gray-400)
- [ ] [SEC-8 — Proxies legacy `[...path].ts` : path non encodé + buffering RAM](#sec-8--proxies-legacy-path-non-encodé--buffering-ram)
- [ ] [SEC-9 — Divulgation de messages d'erreur (search, webhooks)](#sec-9--divulgation-de-messages-derreur)
- [ ] [SEC-10 — Dépendances vulnérables (`@grpc/grpc-js` High via firebase-admin)](#sec-10--dépendances-vulnérables)
- [ ] [PERF-9 — Shiki : 18 langages pour le chatbot (chunks 225 KB + WASM 607 KB)](#perf-9--shiki-surdimensionné)
- [ ] [PERF-10 — `councyl-minister.ts` non caché + `limit: -1` sur ~20 endpoints](#perf-10--endpoints-non-cachésnon-bornés)
- [ ] [PERF-11 — Web Vitals désactivé : aucune mesure RUM en prod](#perf-11--pas-de-mesure-rum)
- [ ] [DOC-6 — Dépendances inutilisées/mal classées (`@ai-sdk/vue`, `@types/marked`, `@nuxt/eslint`)](#doc-6--dépendances-à-nettoyer)
- [ ] [DOC-7 — Fichiers orphelins (`nuxt.config.build-optimized.ts`, `design.md` racine)](#doc-7--fichiers-orphelins)
- [ ] [QUAL-7 — Interfaces hors de `types/` + `defineProps` runtime non typés](#qual-7--types-mal-rangés)

---

# Détail des constats

## 🔴 Critique

### SEC-1 — Webhook Bictorys sans vérification de signature

**Fichier** : `server/api/donate/webhook.post.ts:15-23`
La vérification HMAC est **commentée** (TODO). N'importe qui peut POST un faux `charge.success` avec un `customer.email` arbitraire → déclenche `sendDonationConfirmationEmail()` (l. 94-103) : envoi d'un « reçu de don » au nom de l'association à n'importe quelle adresse, et corruption de futurs enregistrements de dons. L'endpoint renvoie toujours 200 (l. 68-73), masquant les abus.

**Fix** : implémenter la vérification HMAC avec `config.bictorysWebhookSecret` (déjà présent en runtimeConfig) **avant tout traitement** ; rejeter en 401 si invalide.
NB : le callback Paydunya re-confirme la transaction auprès de l'API Paydunya (`paydunya/callback.post.ts:30-40`) — correct, ne pas y toucher.

### SEC-2 — Endpoints de debug exposés en production

**Fichiers** : `server/api/debug/env.ts`, `server/api/debug/version.ts`
Aucun garde (`NODE_ENV`, feature flag). `env.ts:24-28` renvoie `process.env.CMS_API_URL_ASSETS` en clair ; `version.ts` expose `gitCommit`, `nodeEnv`, `process.version`, `process.platform`. Le commentaire du fichier dit lui-même « À SUPPRIMER après débogage ! ».

**Fix** : supprimer le dossier `server/api/debug/`, ou le protéger : `if (process.env.NODE_ENV === 'production') throw createError({ statusCode: 404 })`.

### SEC-3 — Protection CSRF inopérante

**Fichier** : `server/api/middleware/csrf.ts`
Le handler est dans `server/api/middleware/` → Nitro l'enregistre comme **route** `/api/middleware/csrf`, pas comme middleware global. Le dossier `server/middleware/` n'existe pas. Résultat : la vérification CSRF ne s'exécute sur **aucune** requête. Tous les POST (newsletter, whistleblowing, invitation podcast, notifications, donate) sont sans CSRF.

**Vérifié empiriquement le 02/07/2026** (serveur dev) : `POST /api/newsletter/subscribe` sans token atteint le handler (400 « Email requis », pas de 403) ; la logique CSRF ne s'exécute que sur l'URL `/api/middleware/csrf` elle-même. Le système maison est en fait à moitié construit : `server/api/csrf-token.ts` + `app/components/CsrfToken.vue` (utilisé uniquement par le ChatBot) — aucun `$fetch` du front n'envoie `x-csrf-token`.

**Fix recommandé (mis à jour 03/07/2026)** : ne PAS déplacer le fichier maison — utiliser la **protection CSRF intégrée de nuxt-security** (déjà installé), qui active le module `nuxt-csurf` (déjà présent dans node_modules). Doc : <https://nuxt-security.vercel.app/documentation/middleware/csrf>

1. `nuxt.config.ts` → `security: { csrf: true }` (token chiffré aes-256, cookie httpOnly).
2. Exempter les POST externes via `routeRules` : `'/api/donate/webhook': { csurf: false }`, idem `paydunya/callback`, `/api/csp-report`.
3. Côté client : remplacer `$fetch` par `useCsrfFetch()`/`$csrfFetch` sur les formulaires (newsletter, signalement, invitation podcast, notifications, chat, donate init) — sinon ils recevront 403.
4. Supprimer les 3 morceaux maison : `server/api/middleware/csrf.ts`, `server/api/csrf-token.ts`, `app/components/CsrfToken.vue`.

⚠️ Nuance de gravité : pas de comptes utilisateurs sur le site → le CSRF classique (action avec la session de la victime) ne s'applique pas ; cette protection est surtout une couche anti-abus. SEC-4 (Turnstile + rate limit) reste plus prioritaire en pratique.

### SEC-4 — Turnstile jamais vérifié + newsletter non protégée

- `NUXT_TURNSTILE_SECRET_KEY` documentée (CLAUDE.md, docker-compose) mais **aucun appel `siteverify` dans `server/`** — grep `turnstile` ne matche que CLAUDE.md. Les formulaires publics n'ont aucune protection anti-bot serveur.
- `server/api/newsletter/subscribe.post.ts:3-6` : email seulement testé « truthy » (pas de regex ni longueur max), **pas de rate limit**, et le **409 explicite** si déjà inscrit (l. 41-45) permet l'énumération d'abonnés.

**Fix** : valider le token Turnstile côté serveur (`challenges.cloudflare.com/turnstile/v0/siteverify`) sur chaque formulaire ; ajouter `checkRateLimit()` (l'util existe : `server/utils/rate-limit.ts`) + `isValidEmail()` (`server/utils/validation.ts`) ; réponse générique sans divulguer l'état d'inscription.

### PERF-1 — Precache PWA de 45,6 MB

**Fichier** : `nuxt.config.ts:787`
`injectManifest.globPatterns: ['**/*.{png,svg,ico,webp}']` matche **toutes** les images de `public/` : 119 entrées précachées = **45,6 MB** (mesuré sur `.output/public/sw.js`). Chaque installation **et chaque mise à jour du SW** (donc chaque déploiement) refait télécharger ce qui a changé — coût data majeur pour des mobiles au Sénégal ; une image en échec peut bloquer l'installation du SW.

**Fix** : `globPatterns: ['pwa-*.png', 'favicon.ico', 'badge-72x72.png', 'logo*.svg']` (≈ < 1,5 MB). Les autres images sont déjà couvertes en runtime par la route `CacheFirst images-cache` de `app/service-worker/sw.ts` (qui est bien conçu — ne pas toucher).
Nettoyage bonus : le bloc `pwa.workbox` (nuxt.config.ts:776-780) est ignoré en mode `injectManifest` → à supprimer ; icônes 512/1024 déclarées deux fois dans le manifest.

### QUAL-1 — Couverture de tests quasi nulle

- **1 seul fichier de test** : `test/unit/composables/usePromesseStatus.test.ts` pour ~95 000 lignes (362 composants, 237 fichiers TS). `test/e2e/` et `test/nuxt/` sont vides. Le CI calcule pourtant une couverture envoyée à SonarCloud.
- **Bug de config** : `vitest.config.ts` cible `components/**`, `composables/**`, `stores/**` à la **racine**, alors que le code est dans `app/` (mode Nuxt 4) → la couverture ne mesure rien.

**Fix** : corriger les chemins (`app/components/**`…), puis prioriser des tests sur la logique pure : `useCollectionState`, calculs de `useBudget`, helpers de formatage, et les endpoints `donate/*`.

---

## 🟠 Important — Performance

> Mesures sur le build : `.output/public/_nuxt` = 17 MB, 290 chunks JS. Plus gros chunks : maplibre 996 KB, WASM shiki 607 KB, deck.gl 569 KB, entrée+Firebase 501 KB (148 KB br), pdfjs 445 KB (113 KB br).

### PERF-2 — Fonts Google en `@import` bloquant

**Fichier** : `app/assets/css/app.css:2`
`@import url('https://fonts.googleapis.com/css2?family=Poppins:...')` dans le CSS bundlé = chaîne critique CSS → fonts.googleapis.com → fonts.gstatic.com, **sans aucun preconnect** (`app.head.link` vide). Impact estimé : −300 à 800 ms de FCP/LCP.

**Fix** : module `@nuxt/fonts` (self-host automatique) ou woff2 dans `public/fonts` + `@font-face`. Réduire à 3 graisses (400/500/700). A minima : preconnect vers fonts.gstatic.com.

### PERF-3 — Firebase dans le bundle d'entrée

**Fichier** : `app/plugins/firebase.client.ts`
Imports **statiques** `firebase/app` + `firebase/messaging` + `initializeApp()` au démarrage dans un plugin global → ~140 KB br chargés sur **100 % des pages**, pour le push que peu d'utilisateurs activent.

**Fix** : imports dynamiques à l'intérieur de `initMessaging`/`getFcmToken`, initialisation seulement quand l'utilisateur interagit avec la feature notifications.

### PERF-4 — Import d3 mort dans le footer

**Fichier** : `app/components/AppFooter.vue:2`
`import { lab } from 'd3'` — jamais utilisé (auto-import IDE accidentel ; seuls des `label:` existent dans le fichier). Le footer étant dans le layout par défaut, d3 entre dans le graphe du bundle commun. **Fix : supprimer la ligne (10 secondes).**

### PERF-5 — pdfjs statique dans PdfViewerInline/Modal

**Fichiers** : `app/components/PdfViewerInline.vue:2`, `app/components/PdfViewerModal.vue:2`
Import statique `import * as pdfjsLib from 'pdfjs-dist'` → ~113 KB br chargés dès l'arrivée sur les pages documents (les plus visitées en SEO), même sans ouvrir le PDF. `PdfViewer.vue:375` fait le bon pattern (`await import('pdfjs-dist')`).

**Fix** : aligner les 2 viewers sur le dynamic import de `PdfViewer.vue`, ou `<LazyPdfViewerInline>` + `v-if`.

### PERF-6 — Images CMS jamais en WebP

**Fichier** : `app/providers/cms-image.ts`
Le provider passe `width/height/quality` à Directus mais **jamais `format`** → images servies dans leur format d'origine (JPEG/PNG). Fort impact LCP.

**Fix** : transmettre `format` dans le provider + `format: 'webp'` (ou `auto`) par défaut dans `CmsImage.vue`. Secondaire : convertir les `<img>` bruts des composants `Home*` (above the fold) en `CmsImage`/`NuxtImg` avec `sizes`.

### PERF-7 — Pas de SWR HTML + `no-cache` sur `/api/**`

**Fichier** : `nuxt.config.ts:177-190`

- Aucune règle `swr`/`isr`/`prerender` de page → chaque hit sur `/`, `/actualites`, `/documents/**` refait un rendu SSR complet.
- `'/api/**': { headers: { 'cache-control': 'no-cache' } }` interdit tout cache navigateur/CDN même pour les GET stables cachés 1h côté Nitro.
- Aucun `staleMaxAge` (SWR Nitro) sur les 93 handlers cachés : à l'expiration, le premier visiteur paie la latence Directus complète.

**Fix** : `routeRules` : `'/': { swr: 300 }`, `'/documents/**': { swr: 600 }`, `'/actualites/**': { swr: 300 }`… ; `staleMaxAge: 86400` sur les handlers 1h ; `s-maxage`/`stale-while-revalidate` ciblés sur les GET publics (garder `no-cache` pour POST/santé).

### PERF-8 — Triple stack cartographique

Trois moteurs coexistent :
1. **maplibre-gl + deck.gl** (`app/components/map/SenegalMap.vue`, `useMapEngine.ts`) — ✅ bien fait, dynamic imports.
2. **leaflet** (`@nuxtjs/leaflet`) — utilisé uniquement par les vieux `Election/ElectionMapComponent*.vue`, mais le module **injecte `leaflet.css` (15 KB) globalement** sur toutes les pages.
3. **d3-geo SVG** (`ElectionMapD3.vue`…).

En plus, `nuxt.config.ts:444` charge `maplibre-gl.css` (70 KB) **globalement** alors que 4-5 pages l'utilisent.

**Fix** : (a) scoper le CSS maplibre dans `SenegalMap.vue` ; (b) migrer les choroplèthes élections vers maplibre ou d3-SVG puis **retirer `@nuxtjs/leaflet`** ; (c) `import * as d3 from 'd3'` → sous-modules (`d3-scale`, `d3-geo`…) ; (d) monter les charts sous le fold via `<Lazy...>` (aucun `<Lazy` dans tout le projet actuellement).

---

## 🟠 Important — Sécurité

### SEC-5 — XSS ChatBot (marked sans sanitisation)

**Fichier** : `app/components/ChatBot.vue:287` (rendu `v-html` l. 77 et 93)
`return marked(processedText)` — marked ne sanitise plus depuis v4. La réponse vient d'une API externe (`server/api/chat.ts`) : une réponse contenant `<img onerror=...>` s'exécuterait.

**Fix** : passer la sortie dans **DOMPurify** avant `v-html`. Les autres `v-html` du site rendent du contenu CMS (rédacteurs de confiance) — acceptable, à garder à l'esprit.

### SEC-6 — CSP affaiblie

**Fichier** : `nuxt.config.ts:45-58`
`script-src` inclut `'unsafe-inline'` **et** `'unsafe-eval'`, plus `script-src-attr: ['unsafe-inline','unsafe-hashes']` → annule en grande partie la protection XSS de la CSP. `img-src` inclut `'https:'` (wildcard).

**Fix** : viser les **nonces** (supportés par nuxt-security) et retirer `unsafe-inline`/`unsafe-eval` ; restreindre `img-src` aux domaines réels. À défaut, documenter la dette.

### SEC-7 — init-payment non borné

**Fichier** : `server/api/donate/init-payment.post.ts:12, 30-31`
`amount` uniquement `> 0` (pas de plafond), pas de rate limit, email non validé. En plus : `successRedirectUrl`/`errorRedirectUrl` codés en dur sur `https://client.co/redirect_url` (**placeholder — bug fonctionnel**).

**Fix** : rate limiting, bornes min/max sur `amount`, validation email, corriger les URLs de redirection.

---

## 🟠 Important — Qualité de code

> Volumétrie : 124 pages, 233 composants, 87 composables, 130 fichiers API, ~95 000 lignes.

### QUAL-2 — Code mort (~5 200 lignes)

**29 composants sur 110 scannés jamais référencés** (~4 690 lignes) : `Election/ElectionResultSvgMap.vue` (697 l.), `ElectionResultDeputiesGrid2.vue` (358), `AppSearch.vue` (345), `DonateButton.vue` (255), `ElectionMapComponent3.vue` (253), `ElectionResultSvgHemicycleHome.vue` (236), `BudgetChartsTable2.vue` (197), `ElectionSenegalMap.vue` (197)…
Séries copiées-collées jamais nettoyées : `ElectionMapComponent1/2/3` morts (le 4 est utilisé), `BudgetChartsTable`+`Table2`, `Budget2ChartsPie`+`Pie2`, `NewsletterForm2`.
**6 composables jamais importés** (~540 l.) : `useAppVersionSimple`, `useElectionBureauxTemoins`, `useElectionD3Hemicycle`, `useElectionMap`, `useResultsText`, `useSearch`.

**Fix** : PR de purge dédiée. ⚠️ Vérifier l'absence d'usage dynamique (`<component :is>`) avant suppression.

### QUAL-3 — formatDate dupliqué dans 28 fichiers

`formatDate`/`formatDateFr`/`formatDateISO` redéfinis dans 28 fichiers (implémentations quasi identiques `toLocaleDateString('fr-FR', …)`). Aucun `app/utils/` n'existe.

**Fix** : créer `app/utils/date.ts` (auto-importé par Nuxt). Élimine aussi une classe de bugs TDZ documentée dans CLAUDE.md (helpers déclarés après les schémas qui les utilisent).

### QUAL-4 — 424 `any`

211 dans `app/` + 213 dans `server/`. Pires offenseurs : `app/composables/useMapLayers.ts` (37), `app/pages/dashboard/economie.vue` (28), `server/api/budget/*.get.ts` (13-14 chacun). Aussi : 4 `@ts-ignore` (tous dans `Election/ElectionMapComponent*.vue`), 9 composants avec `defineProps` runtime non typé.

**Fix** : typer en priorité les réponses Directus de `server/api/budget/*` et `useMapLayers.ts` ; activer `@typescript-eslint/no-explicit-any` en `warn` pour geler la dette.

### QUAL-5 — 225 `console.*` en prod

97 dans `app/`, **128 dans `server/`** — dont des logs dans le happy path : `budget/global.get.ts:31,57`, `__sitemap__/urls.ts` (8), **`donate/webhook.post.ts` (8) et `donate/paydunya/*` (12) — flux de paiement**.

**Fix** : règle ESLint `no-console: ['warn', { allow: ['error', 'warn'] }]` côté app ; logger conditionné à l'env côté serveur, en priorité sur `donate/*`.

### QUAL-6 — Double arborescence élections

`app/pages/elections/` (17 pages, legacy législatives 2024) vs `app/pages/elections-senegal/` (7 pages, nouveau dashboard) avec doublons fonctionnels (`carte-electorale/`, `guide-electoral.vue`, `diaspora/[country].vue` en double). Paires de composables dupliqués vivantes : `useElectionStatsList` vs `elections/dashboard/useElectoralStatsList`, `useElectionProfessions` vs `useElectoralProfessions`. C'est la zone qui concentre le plus de dette (any, @ts-ignore, fichiers > 600 lignes — dont `dashboard/[type]/[year].vue` : 1 008 lignes).

**Fix** : trancher pour un seul arbre, redirections 301 (`routeRules`) vers le survivant, fusionner les composables.

---

## 🟠 Important — SEO

> Conformité vérifiée contre les règles CLAUDE.md / docs/seo. ✅ Déjà conformes à 100 % : `innerHTML` vs `children` (0 reste), breadcrumb unique via AppBreadcrumb, 1 seul h1 par page, useSeoMeta en scope setup, pagination SSR.

### SEO-1 — JSON-LD réactif sans `key` (4 pages)

Schémas **réactifs** (dépendant de données async) sans `key:` → duplication du nœud à l'hydratation (« 2 Articles » au Rich Results, invisible en curl — bug documenté dans CLAUDE.md) :

| Page | Localisation |
|---|---|
| `app/pages/podcasts/[id]/[slug].vue` | l. 181-189 |
| `app/pages/medias/[id]/[slug].vue` | l. 111-120 |
| `app/pages/conseil-des-ministres/[id]/[slug].vue` | l. 149-154 |
| ~~`app/pages/assemblee-nationale/questions/[id].vue`~~ | ✅ corrigé 02/07/2026 — page refondue en `questions/[id]/[slug].vue` avec `key: 'ld-question'` |

**Fix** : ajouter `key: 'ld-...'` unique par script. Vérif post-déploiement au test Rich Results (pas curl).

### SEO-2 — Contradiction robots vs sitemap

`nuxt.config.ts:572-573` met `/projets-publics-senegal/**` en **disallow**, mais le sitemap (`server/api/__sitemap__/urls.ts:158-188`) **pousse ces mêmes URLs** (`/pres`, `/pip`, fiches projets) → erreurs Search Console garanties.

**Fix** : trancher — retirer du disallow OU retirer du sitemap.

### SEO-3 — Sitemap incomplet

Routes dynamiques absentes de `server/api/__sitemap__/urls.ts` :
- `/podcasts/[id]/[slug]` (collection `vp_podcasts`) — **le plus important**
- `/medias/[id]/[slug]`
- `/assemblee-nationale/questions/[id]`
- `/assemblee-nationale/commissions/[id]`, `/groupes/[id]/[name]`
- `/carte/[slug]`, `/a-propos/recrutement/[slug]`
- `elections-senegal/dashboard/[type]]/[id]`

**Fix** : ajouter les blocs sur le modèle des votes.

### SEO-4 — Pages sans meta + fichier avec espace

17 pages sans `useSeoMeta` ni `useHead`, dont indexables : `assemblee-nationale/bureau.vue`, `groupes/index.vue`, `groupes/[id]/[name].vue`, 7 pages `elections/legislatives/*`, `menu.vue`.
⚠️ **`app/pages/chat-bot/ [id].vue` — nom de fichier avec une ESPACE en tête** (bug de route probable, à renommer).

### SEO-5 — Restes du TODO SEO

- Nœud `WebPage` réémis (déjà dans le `@graph` global) : `actualites/[id]/[slug].vue` (l. 262), `questions/[id].vue` (l. 225-228) — à retirer.
- `recherche.vue:4` : title « Recherche Avancée - Vie-Publique.sn » répète la marque (page indexable).
- ~20 pages liste avec BreadcrumbList brut (doublon toléré avec AppBreadcrumb) — purge par opportunité.
- Mettre à jour `docs/seo/TODO-seo.md` : §2 (députés) et §3 (votes) sont **faits**, à cocher.

---

## 🔎 SEO Bing — audit Bing Webmaster Tools (2 juillet 2026)

> **Sources** : Bing Webmaster Tools (propriété `vie-publique.sn/`) + exports CSV du 02/07/2026
> (`4 - analytics/bing-seo-vpsn(export/`) + vérifications live `curl` sur la prod.
>
> **Contexte / symptôme** : le site a été **quasi invisible sur Bing de janvier au 17 juin 2026**
> (0 clic, 0-10 impressions/jour), puis décollage brutal : 23 imp. le 17/06 → 1 162 imp. le 29/06,
> CTR 4-7 %. Les citations IA (Copilot) suivent la même courbe (1 005 citations le 29/06).
> **Le référencement Bing est donc en phase de récupération** — les constats ci-dessous sont les
> freins restants ; la cause probable de l'invisibilité passée est la duplication cross-domaine
> avec archives.sn (voir BING-7). Bing rapporte 14,2K erreurs
> sur 13,6K pages : 1,2K haute gravité (h1 multiples), 13K gravité moyenne (meta descriptions).
> Backlinks dominés par `archives.sn` (8 805 liens sur ~9,2K).

### BING-1 — Double hôte www/non-www + redirections TEMPORAIRES

**Le problème n°1, et il est côté infra (Coolify/proxy), pas dans le repo.** Vérifié live :

```text
http://vie-publique.sn/   → 302 → https://vie-publique.sn/
https://vie-publique.sn/  → 307 → https://www.vie-publique.sn/   (« Temporary Redirect »)
http://www.vie-publique.sn/ → 302 → https://www.vie-publique.sn/
https://www.vie-publique.sn/ → 200 (hôte canonique réel : www)
```

Conséquences mesurées dans Bing WT :

- **2 sitemaps soumis** (`www.vie-publique.sn/sitemap.xml` ET `vie-publique.sn/sitemap.xml`), 12,6K URLs chacun → **25,3K URLs découvertes pour ~12,6K pages réelles** : tout le site existe en double aux yeux de Bing.
- Une redirection **302/307 est temporaire** : Bing garde l'URL source dans l'index au lieu de transférer les signaux vers la cible. `http://vie-publique.sn` apparaît d'ailleurs **encore indexé** dans Site Explorer (200, 9 backlinks).
- Dilution des signaux (backlinks `archives.sn` pointant sur un hôte, contenu servi sur l'autre) et contribution directe à BING-4 (« meta descriptions identiques » = les mêmes pages vues sur 2 hôtes).

**Fix** (cause identifiée : le réglage Coolify « Direction: `Redirect to www.` » génère une redirection Traefik **temporaire**, non paramétrable en 301 depuis l'UI — le DNS OVH `www CNAME → apex` est correct, rien à changer côté DNS) :

1. ✅ **Code (fait le 02/07/2026)** : middleware Nitro `server/middleware/host-redirect.ts` → **301** `vie-publique.sn/* → https://www.vie-publique.sn/*` (même middleware ajouté dans le repo archives.sn). Mécanisme complet (DNS OVH / Coolify / middleware) documenté dans `docs/guidelines/dns-redirections-domaines.md`.
2. ✅ **Coolify (fait le 02/07/2026, vérifié en prod : 301 actifs sur les 2 domaines, path+query préservés)** : app *vie-publique.sn (prod)* → Configuration → General → **Direction : « Allow www & non-www »** (au lieu de « `Redirect to www.` ») → Save → redéployer. Tant que la Direction reste sur « `Redirect to www.` », Traefik répond 307 avant que la requête n'atteigne l'app et le middleware est inerte. Garder les 2 domaines dans « Domains » (nécessaire pour les certificats TLS des 2 hôtes). Idem sur l'app *archives.sn (master)*.
3. ✅ **Bing WT (fait le 02/07/2026)** : supprimer le sitemap `https://vie-publique.sn/sitemap.xml` (ne garder que le www). Idem côté archives.sn (sitemap non-www).
4. Résidu accepté : le 1er saut `http→https` reste en 302 (redirection d'entrypoint Traefik gérée globalement par Coolify) — impact mineur, le saut suivant vers www est désormais 301.
5. Les canonicals, `og:url` et le sitemap émettent déjà tous `https://www.vie-publique.sn` ✅ — rien d'autre à changer dans le code Nuxt.
6. **Vérif post-déploiement** : `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" "https://vie-publique.sn/"` → attendu `301 -> https://www.vie-publique.sn/`.

### BING-2 — 617 pages avec 2 `<h1>` = fiches députés

**Haute gravité Bing** : 1 237 erreurs sur 617 pages = exactement **2 `<h1>` par page** — le piège documenté dans CLAUDE.md (règle SEO §8 : barre sticky mobile + en-tête desktop). Vérifié live sur `assemblee-nationale/deputes/7/ousmane-sonko` : 2 `<h1>` dans le HTML SSR. Les autres gabarits détail (documents, actualités, votes, conseil des ministres) sont à 1 `<h1>` ✅ — 617 ≈ le volume des fiches députés (toutes législatures).

| `<h1>` | Fichier | Rôle |
| --- | --- | --- |
| 1 (à garder) | `app/components/Assembly/AssemblyProfileHeader.vue:32` | Titre principal du profil |
| 2 (à passer en `<p>`) | `app/pages/assemblee-nationale/deputes/[id]/[name].vue:27` | Barre sticky mobile |

**Fix** : changer le `<h1>` de la barre sticky en `<p>` (classes conservées). Vérif : `curl -s <url> | grep -o "<h1" | wc -l` → 1.

### BING-3 — Meta descriptions trop courtes (7,4K pages)

84 % du sitemap = pages `/documents/**` (10 630 URLs). Quand le document a une `description` CMS, elle est utilisée **brute** (`app/pages/documents/[id]/[slug].vue:68-70`) — or beaucoup sont minimales : « Décrets N° 2021-469 2021-497 » (28 caractères), « Décret n° 2024-1981 et Décret n° 2024-1982 »… Le fallback descriptif unique (l. 71-75) ne s'applique qu'aux documents **sans** description.

**Fix** : dans `pageDescription`, si la description CMS fait **moins de ~80 caractères**, la compléter avec le suffixe du fallback (`« ${desc} — ${typeLabel} officiel de la République du Sénégal (${date}). À consulter et télécharger sur Vie-Publique.sn. »`) au lieu de la retourner brute. Bonus : corriger le doublon « Journal Officiel **officiel** de la République » quand `typeLabel` = « Journal Officiel ».
NB : une partie des chiffres Bing date d'avant le fix fallback du 27/06 (commit `effa5dd0` et précédents) — re-mesurer dans Bing WT après 2-3 semaines.

### BING-4 — Meta descriptions identiques (5,6K pages)

Largement une **conséquence** de BING-1 (chaque page existe sur 2 hôtes → description « identique » sur 2 URLs) et de BING-3 (anciennes descriptions génériques « Document - Document officiel… » crawlées avant le fix du 27/06). **Pas d'action code propre** : traiter BING-1 + BING-3, puis re-vérifier ce compteur dans Bing WT avant d'investiguer davantage.

### BING-5 — `/recherche?q=*` indexable → crawl de requêtes spam

Site Explorer montre que Bing crawle massivement des URLs `/recherche?q=…` **spam/aléatoires** (`?q=netmirror`, `?q=jogos+da+copa+amanhã`, `?q=www.bztmrlpt.co`, `?q=zxs18+987`…) qui répondent **200** avec `<meta name="robots" content="index, follow">` et sans canonical nettoyé — `app/pages/recherche.vue` n'a ni `noindex` ni gestion robots, et `/recherche` n'est pas dans le sitemap… mais 1 URL `/recherche` y figure. Risque : gaspillage de crawl budget + pattern « doorway spam » (des sites spam génèrent des backlinks vers des pages de recherche interne).

**Fix** : ajouter dans `recherche.vue` : `useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })` (pattern noindex déjà utilisé ailleurs). **Ne PAS** mettre `/recherche` en `robots.disallow` (Bing doit pouvoir crawler pour voir le noindex). Retirer `/recherche` du sitemap.

### BING-6 — Canonical sur slug erroné (députés + 3 autres gabarits)

`/assemblee-nationale/deputes/12/abdou-mbow` sert la fiche de **Maimouna Bousso** (l'id prime, le slug est ignoré) et le canonical **reflète le slug erroné** au lieu du slug réel → chaque variante d'URL s'auto-canonise = duplicats indexables.

**Périmètre réel (vérifié dans le code, 02/07/2026)** — le canonical est construit depuis la route au lieu des données sur **4 gabarits** :

| Page | Source du canonical | Gravité |
| --- | --- | --- |
| ~~`deputes/[id]/[name].vue:173`~~ | ~~`route.fullPath`~~ | ✅ **corrigé 02/07/2026** (slug dérivé de `first_name`/`last_name`, même logique qu'AssemblyDeputyCard) — c'était le pire cas : `route.fullPath` incluait même la query string (`?utm_source=…` auto-canonisé) |
| `personnalites/[id]/[slug].vue:55` | `route.params.slug` | slug erroné écho — reste à faire |
| `actualites/[id]/[slug].vue:53` | `route.params.slug` | slug erroné écho — reste à faire |
| `conseil-des-ministres/[id]/[slug].vue:33` | `route.params.slug` | slug erroné écho — reste à faire |

✅ La nouvelle page `questions/[id]/[slug].vue` (refonte en cours) applique déjà le bon pattern (`question.value?.slug`, vérifié 02/07/2026).

✅ Bons patterns existants (canonical depuis les **données**) : `documents/[id]/[slug].vue` (`document.value.slug`) et `votes/[id]/[slug].vue` (`vote.value?.slug`) — modèles à répliquer. ⚠️ La refonte questions en cours doit appliquer ce pattern d'emblée.

**Gravité réelle : moyenne-basse mais pas théorique.** Le déclencheur naturel : un titre modifié dans le CMS change le slug → l'ancienne URL indexée continue de répondre 200 en s'auto-canonisant = 2 copies indexées qui se cannibalisent. Plus les variantes UTM sur les députés (partages sociaux). Ce n'est PAS la cause du problème Bing actuel (c'était BING-1/7) — fix d'hygiène à faible coût, pas urgent.

**Fix** : sur les 4 pages, construire `url` à partir du **slug dérivé des données** (entité slugifiée), pas de `route.params`/`route.fullPath` — modèle : `documents/[id]/[slug].vue`.

### BING-7 — archives.sn duplique les documents et capte le ranking Bing

> **Sources** : exports Bing WT `4 - analytics/bing-seo-archives-export/` (02/07/2026) + vérifications live.
> **Contexte** : archives.sn est un second frontend (repo séparé) branché sur le **même backend CMS** ;
> les ~7 600 documents existent en double : `archives.sn/docs/<type>/<slug>` ↔ `vie-publique.sn/documents/<id>/<slug>`.
> Décision déjà prise (pour Google) : canonical cross-domaine archives → VP. **VP est le site prioritaire.**

**Constat mesuré** :

- **archives.sn sur-performe VP sur Bing** : 4,7K clics / 51,6K impressions sur ~3 mois (≈ 50-70 clics/jour stables depuis avril), là où VP était à ~0 jusqu'au 17 juin. Il capte les requêtes documentaires cibles de VP : « code du travail sénégalais pdf » (1,1K imp.), « constitution du sénégal pdf » (684), « code de la famille sénégal pdf » (508), « journal officiel senegal » (466)…
- **Le canonical cross-domaine est bien émis** (vérifié live : `<link rel="canonical" href="https://www.vie-publique.sn/documents/13856/…">` sur les pages `/docs/**`) **mais Bing l'ignore** — comportement connu : le canonical n'est qu'un *hint*, et archives.sn envoie des **signaux contradictoires** qui le discréditent :
  1. son **sitemap soumis liste les 7 598 URLs `/docs/**`** (« indexe-moi ») alors qu'elles canonisent vers VP (« indexe l'autre ») ;
  2. les **titres divergent** du contenu VP (suffixe « | Archives.sn | Archives publiques du Sénégal ») → contenu perçu comme non identique ;
  3. pas de meta robots noindex, `index, follow` explicite ;
  4. mêmes défauts d'hôte que VP (BING-1) : redirections **302 temporaires** http→https et non-www→www, 2 sitemaps (www + non-www) dans Bing.
- **Hypothèse forte sur l'invisibilité passée de VP** : les documents = 84 % du sitemap VP. Bing, face au duplicate cross-domaine, a élu archives.sn (découvert sept.-déc. 2025, cliqué tôt) comme version canonique de fait → les 10,6K pages documents de VP dédupliquées/supprimées de l'index pendant que archives rankait. La récupération VP depuis le 17 juin reste fragile tant que la duplication persiste.
- Effet secondaire : les 8 805 « backlinks » d'archives.sn vers VP (1er domaine référent de VP) sont surtout ces canonicals/liens — ils se consolideraient en cas de 301.

**Décision stratégique (l'option A est recommandée si VP est bien la priorité absolue)** :

- **Option A — 301 des documents (transfert maximal, fiable sur Bing)** : rediriger en **301** chaque `archives.sn/docs/<type>/<slug>` vers sa fiche VP. Contrairement au canonical, le 301 est une directive que Bing suit ; ranking, clics et backlinks d'archives se transfèrent à VP (flottement de quelques semaines). archives.sn cesse d'exister comme site consultable (ou ne garde que sa home).
- **Option B — garder archives consultable mais crédibiliser le canonical** : retirer les 7 598 `/docs/**` du sitemap d'archives (n'y laisser que la home), aligner les `<title>` sur ceux de VP (retirer le suffixe de marque), et idéalement passer `/docs/**` en `noindex, follow`. Archives perd progressivement ses positions **sans garantie de transfert** vers VP (noindex ne transfère rien — Bing redécouvrira les pages VP via sitemap/liens).
- **Option C — statu quo assumé** : archives reste un canal de trafic secondaire. Risque : cannibalisation durable — VP ne récupérera jamais ses meilleures requêtes documentaires sur Bing.

**Dans tous les cas** (même si A/B différées) : corriger sur archives.sn les redirections 302 → **301/308** et supprimer le sitemap non-www dans Bing WT (miroir de BING-1) ; activer **IndexNow** sur VP (signalé « non adopté » par Bing, et le module sitemap Nuxt le supporte) pour accélérer la ré-indexation des pages VP récupérées.

⚠️ Les fixes BING-7 côté archives.sn se font dans le **repo/infra d'archives.sn**, pas dans ce repo.

---

## 🟠 Important — Docs / CI / Hygiène

### DOC-1 — .env.example incomplet

13 variables utilisées dans le code mais absentes : `CHATBOT_API_URL`, `CHATBOT_API_KEY`, `SUNU_ELECTION_API_URL`, `SUNU_ELECTION_API_KEY`, `NUXT_FIREBASE_SERVICE_ACCOUNT_JSON`, 8× `NUXT_PUBLIC_FIREBASE_*`, `BICTORYS_PUBLIC_KEY`.
En plus : **lignes 11-12 inversées** (`CMS_API_URL=xxx` / `CMS_API_KEY=https://hostname.com`). Inverse : `NUXT_TURNSTILE_SECRET_KEY` documentée mais **aucun code ne l'utilise** (cf. SEC-4).

### DOC-2 — 191 MB de PDF dans public/

`public/` = **191,4 MB, 335 fichiers versionnés**. Top : `public/pdf/immigration-clandestine/CILEC-Rapport-2022.pdf` (45,6 MB), `CILEC-decret-2020-790.pdf` (22,7 MB), `public/pdf/justice/decret-2020-1524...` (12,8 MB) + 7 PDF de 3-8 MB.

**Fix** : migrer vers le CMS/Directus (avec redirections 301 pour les URLs indexées — cf. routeRules « anciens PDF » déjà en place comme modèle).

### DOC-3 — Scripts version:* cassés

`package.json` garde `version:patch|minor|major` → `scripts/update-version.js`, **supprimé** au commit c4800c88 (« clean script infra »). Aucun CHANGELOG. Versions incohérentes : package.json 2.0.1 vs `sonar.projectVersion=1.8.6`.

### DOC-4 — Configs de déploiement mortes

Pipeline réel : `.github/workflows/_ci-cd.yml` → build `Dockerfile.optimized` → ghcr.io → webhook **Coolify** (+ `docker-compose.production.yml` plausible côté serveur).
Mortes/contradictoires :
- `docker-compose.yml` → référence un `Dockerfile` **inexistant**
- `docker-compose.dev.yml` → référence `Dockerfile.dev` **inexistant**
- `nixpacks.toml` → contredit le pipeline Docker (l'un des deux est mort)
- `vercel.json` → aucune autre trace Vercel ; sa CSP diverge de nuxt-security

### DOC-5 — README obsolète

- « Node.js v18 or higher » vs `engines.node >=22` (CI en Node 24)
- Documente `npm run dev-win` qui n'existe plus (section « Cross-Platform Development » morte)
- Badge SonarCloud → `malicktech_vie-publique.sn` vs `sonar-project.properties` → `vpsn_vie-publique.sn`
- CONTRIBUTING.md dit « main branch » alors que le flux est `develop`

---

## 🟡 Mineur

### A11Y-1 — Pas de skip link

Aucun lien « Aller au contenu » dans `app/layouts/default.vue`. **Fix** : `<a href="#main" class="sr-only focus:not-sr-only">Aller au contenu</a>` + `<main id="main">`.

### A11Y-2 — EtatTreeNode non accessible clavier

`app/components/etat/EtatTreeNode.vue:3` : `<div class="node-content" @click="toggle">` sans `role`, `tabindex` ni gestion clavier. **Fix** : `role="button" tabindex="0" @keydown.enter="toggle" @keydown.space.prevent="toggle"`.

### A11Y-3 — Boutons icône sans aria-label

3-4 `UButton` icône seule sans texte ni aria-label : `elections-senegal/dashboard/[type]/[year].vue:947`, `documents/public.vue:392`, `Election/ElectionMapD3.vue:5`. Bons points par ailleurs : alt quasi 100 % (via CmsImage), `lang` défini partout.

### A11Y-4 — Contrastes text-gray-400

~40-80 usages de `text-gray-400` sur fond clair (ratio ~3:1 < 4.5:1 requis) : textes d'aide, sous-titres, icônes porteuses d'info. Ex. `app/index.vue:286`, `carte/[slug].vue:70`. **Fix** : `text-gray-600` sur fond clair, garder `dark:text-gray-400`.

### SEC-8 — Proxies legacy : path non encodé + buffering RAM

`server/api/medias/[...path].ts` et `server/api/docs/[...path].ts` : `path` (catch-all) et `quality` concaténés **sans encodage** à l'URL CMS (injection de query params, traversée `../` sur l'hôte CMS — SSRF limité, hôte fixe) ; `$fetch.raw(..., 'arrayBuffer')` = buffering complet des gros PDF en RAM au lieu de streamer.
**Fix** : `encodeURIComponent(quality)`, rejeter `..` dans path, whitelister les extensions ; streamer via `proxyRequest`/`sendProxy` (h3). Les routes modernes `/cms/**` (routeRules proxy) sont correctes.

### SEC-9 — Divulgation de messages d'erreur

`server/api/search.ts:208-211` renvoie le message d'erreur Typesense au client ; `donate/webhook` et `paydunya/callback` renvoient `error.message`. **Fix** : messages génériques, détails en logs.
Aussi : `rate-limit.ts:29` se fie au premier élément de `x-forwarded-for` (spoofable hors proxy de confiance).

### SEC-10 — Dépendances vulnérables

`npm audit --omit=dev` : `@grpc/grpc-js` (High, via firebase-admin), `@babel/*` (High, transitif build), `@ai-sdk/*`. **Fix** : `npm audit fix` non-force ; supprimer `@ai-sdk/vue` règle une partie (cf. DOC-6).

### PERF-9 — Shiki surdimensionné

`nuxt.config.ts:805-831` : 18 langages de highlight pour le chatbot → chunk shiki 225 KB + WASM oniguruma inliné en base64 dans un chunk de 607 KB. **Fix** : réduire à 4-5 langages (ts, js, json, bash, html).

### PERF-10 — Endpoints non cachés/non bornés

- `server/api/councyl-minister.ts` : GET Directus **non caché** (`defineEventHandler` sans limite) → passer en `defineCachedEventHandler`.
- `limit: -1` sur ~20 endpoints (`budget/global`, `elections/dashboard/*`, `carte/*`) → payloads SSR non bornés ; projeter des champs minimaux, agréger côté serveur.
- `fields: ['*']` : `carte/index.get.ts:13`, `carte/result.get.ts:14`, `state/entities/[slug].get.ts:28`.

### PERF-11 — Pas de mesure RUM

`@nuxtjs/web-vitals` désactivé (FIXME Nuxt 4) → aucune mesure terrain en prod. **Fix** : envoi manuel web-vitals → GA4, ou réactiver quand compatible.

### DOC-6 — Dépendances à nettoyer

- `@ai-sdk/vue` : **aucun import** dans le projet → supprimer.
- `@types/marked@5` : obsolète (marked v15 embarque ses types) → supprimer.
- `@nuxt/eslint` : → devDependencies.
- `execa` (devDeps) : orphelin depuis la suppression de `scripts/`.

### DOC-7 — Fichiers orphelins

- `nuxt.config.build-optimized.ts` : référencé nulle part — expérimentation jamais fusionnée. Porter éventuellement `manualChunks` dans le config principal, puis supprimer.
- `design.md` (racine) vs `docs/design.md` : deux docs design chevauchants ; CLAUDE.md ne référence que `docs/design.md` → fusionner.

### QUAL-7 — Types mal rangés

157 fichiers définissent des `interface` hors de `types/` (ex. `useBudget.ts` : 7 interfaces exportées ; aucun `types/budget.ts` n'existe). 9 composants avec `defineProps` runtime au lieu du générique TS (`Budget2TableMinistry.vue`, `BudgetChartsTable.vue`, `error.vue`…).

---

## ✅ Points forts à préserver

- **93/93 endpoints GET** en `defineCachedEventHandler`, maxAge cohérents
- Dynamic imports maplibre/deck.gl (`useMapEngine`) — le bon modèle à généraliser
- Stratégies runtime du service worker (`app/service-worker/sw.ts`) : fallback déploiement, SWR images CMS
- Pagination serveur via `useCmsCollection`/`useCollectionState` — conforme partout
- Aucun secret commité, `.gitignore` correct, firebase-admin chargé depuis l'env
- `podcasts/invitation-request` et `notifications/subscribe` : rate limit + validation + sanitisation (le modèle à répliquer sur newsletter/donate)
- SEO : migration `innerHTML`, breadcrumb unique, h1 unique, scope setup — chantiers CLAUDE.md aboutis
- Compression br/gz activée, sourcemaps désactivés, headers de sécurité prod corrects (HSTS, frame-ancestors, nosniff)
