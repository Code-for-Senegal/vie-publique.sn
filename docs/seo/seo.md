# Audit SEO & Plan d'action — Vie-Publique.sn

> Dernière mise à jour : 27 février 2026
> Période analysée : 29 nov. 2025 – 26 fév. 2026 (90 jours)
> Sources : Google Analytics 4, Google Search Console, audit du code source

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Métriques clés (état des lieux)](#2-métriques-clés)
3. [Analyse Google Search Console](#3-analyse-google-search-console)
4. [Analyse Google Analytics](#4-analyse-google-analytics)
5. [Audit technique du code](#5-audit-technique-du-code)
6. [Problèmes critiques identifiés](#6-problèmes-critiques)
7. [Plan d'action priorisé](#7-plan-daction-priorisé)
8. [Optimisation pour les LLM (GEO)](#8-optimisation-pour-les-llm-geo)
9. [KPI et suivi](#9-kpi-et-suivi)

---

## 1. Résumé exécutif

### Points forts
- SSR activé (Nuxt 3) — bon pour le crawl
- 973 pages indexées, 463 fils d'Ariane valides, 0 erreur
- 100% HTTPS (1 460 URLs)
- Sitemap soumis et lu (5 958 URLs)
- Schema.org (Organization, WebSite, BreadcrumbList, NewsMediaOrganization) sur la homepage
- Article schema sur les pages documents
- Canonicals présentes sur la majorité des pages de listing
- Open Graph + Twitter Cards configurés globalement
- PWA bien configurée

### Points à améliorer (impact fort)
- **7 490 pages non indexées** dont 5 251 exclues par noindex (documents/JO)
- **58 pages en double** sans URL canonique (pages /docs/ PDF)
- **165 erreurs 404** et **18 soft 404**
- **468 pages explorées mais non indexées** — signal de qualité à traiter
- CTR très faible sur les pages à fort volume d'impressions
- Canonical manquante sur `/documents/[id]/[slug]`
- Typo dans la description OG globale ("SOnko")
- Pas de fichier `llms.txt` pour la visibilité LLM
- Keywords meta excessifs (89 mots-clés dans `useSiteMetadata.ts`)

---

## 2. Métriques clés

### Search Console (90 jours)

| Métrique | Valeur |
|---|---|
| Clics organiques | 3 224 |
| Impressions | 102 865 |
| CTR moyen | 3,13% |
| Position moyenne | 7,49 |
| Pages indexées | 973 |
| Pages non indexées | 7 490 |
| Liens externes | 2 919 |
| Liens internes | 22 229 |

### Requêtes top (Search Console)

| Requête | Clics | Impressions | CTR | Position |
|---|---|---|---|---|
| vie publique sn | 918 | 1 204 | 76,25% | 1,59 |
| vie publique senegal | 111 | 168 | 66,07% | 1,66 |
| vie publique | 71 | 243 | 29,22% | 4,28 |
| nominations conseil des ministres sénégal aujourd'hui | 37 | 480 | 7,71% | 3,88 |
| communiqué conseil des ministres aujourd'hui | 26 | 1 032 | 2,52% | 4,29 |
| conseil des ministres aujourd'hui | 23 | 530 | 4,34% | 5,04 |
| mabouba diagne | 22 | 486 | 4,53% | 3,62 |

### Pages de destination top (trafic organique)

| Page | Clics | Impressions | CTR | Position |
|---|---|---|---|---|
| / | 548 (17%) | 3 110 | 17,62% | 8,60 |
| /actualites/ | 194 (6%) | 325 | 59,69% | 1,51 |
| /etat-senegal | 155 (4,8%) | 385 | 40,26% | 5,01 |
| /assemblee-nationale/votes/34 | 140 (4,3%) | 369 | 37,94% | 3,59 |
| /conseil-des-ministres/175/... | 135 (4,2%) | 725 | 18,62% | 4,59 |
| **/nomination-senegal** | **129 (4%)** | **8 948** | **1,44%** | **6,92** |
| /pdf/budget/2025-... | 129 (4%) | 6 922 | 1,86% | 7,18 |
| /justice/magistrature | 121 (3,8%) | 2 632 | 4,6% | 5,80 |
| **/conseil-des-ministres** | **115 (3,6%)** | **15 446** | **0,74%** | **7,65** |
| /publications/actualites | 107 (3,3%) | 796 | 13,44% | 3,51 |

### Analytics (90 jours)

| Métrique | Valeur |
|---|---|
| Utilisateurs actifs | 3 463 |
| Nouveaux utilisateurs | 2 909 (84%) |
| Sessions engagées | 3 626 |
| Taux d'engagement | 58,09% |
| Durée engagement moy. | 3 min 09 s |

### Répartition géographique

| Pays | Utilisateurs | % |
|---|---|---|
| Sénégal | 2 501 | 72,2% |
| France | 419 | 12,1% |
| États-Unis | 188 | 5,4% |
| Canada | 56 | 1,6% |
| Royaume-Uni | 31 | 0,9% |

### Répartition appareils

| Catégorie | % |
|---|---|
| Mobile | 61,9% |
| Desktop | 37,3% |
| Tablette | 0,8% |

---

## 3. Analyse Google Search Console

### 3.1 Indexation — Problèmes détaillés

| Raison de non-indexation | Pages | Priorité | Action |
|---|---|---|---|
| Exclue par balise "noindex" | 5 251 | Moyenne | Audit des pages noindex — certaines pages /documents/ devraient être indexées |
| Explorée, non indexée | 468 | Haute | Améliorer le contenu/maillage interne de ces pages |
| Introuvable (404) | 165 | Haute | Créer des redirections 301 |
| Bloquée par robots.txt | 85 | Moyenne | Vérifier que ces blocages sont voulus |
| Autre page avec canonique correcte | 65 | Basse | Normal (canonicals fonctionnent) |
| Page avec redirection | 61 | Basse | Normal |
| Page en double sans canonical | 58 | Haute | Ajouter des canonicals sur les pages /docs/ |
| Soft 404 | 18 | Haute | Retourner un vrai 404 ou enrichir le contenu |
| Erreur serveur (5xx) | 6 | Critique | Investiguer et corriger |
| Page en double (Google a choisi) | 10 | Moyenne | Vérifier les canonicals |

### 3.2 Opportunités CTR

Les pages avec **beaucoup d'impressions mais un CTR faible** sont les meilleures opportunités :

1. **/conseil-des-ministres** — 15 446 impressions, 0,74% CTR, position 7,65
   - Optimiser le title et la meta description pour être plus accrocheur
   - Viser une meilleure position (< 5)

2. **/nomination-senegal** — 8 948 impressions, 1,44% CTR, position 6,92
   - Title actuel probablement trop générique
   - Ajouter des dates/chiffres dans le title

3. **/pdf/budget/2025-projet-loi-de-finance-initiale.pdf** — 6 922 impressions, 1,86% CTR
   - Ce PDF est redirigé vers /documents/budget mais l'ancienne URL reçoit encore des impressions
   - S'assurer que la redirection 301 est bien en place

4. **"communiqué conseil des ministres aujourd'hui"** — 1 032 impressions, 2,52% CTR
   - Créer une page dédiée aux communiqués les plus récents
   - Utiliser des dates fraîches dans les titles

### 3.3 Liens

- **2 919 liens externes** — archives.sn domine (2 394) + bonnegouvernanceafrique.com (274)
- **22 229 liens internes** — bonne structure, homepage (16 932) et budget-senegal (4 375) bien maillés
- Opportunité : diversifier les backlinks (médias, universités, institutions)

---

## 4. Analyse Google Analytics

### 4.1 Audience

- **84% de nouveaux utilisateurs** — très peu de fidélisation
  - Action : push notifications (déjà en place), newsletter, contenu récurrent
- **72% depuis le Sénégal** — audience cible bien atteinte
- **12% depuis la France** — diaspora sénégalaise, bon signal
- **Engagement France supérieur** : 6 min 10 s vs 3 min 07 s pour le Sénégal

### 4.2 Mobile-first

- **62% mobile** — le site doit être irréprochable sur mobile
- Les résolutions les plus fréquentes : 1280x720, 390x844, 1920x1080
- Navigateurs : Chrome dominant, Safari second (iOS)
- Actions : tester les Core Web Vitals sur mobile, optimiser LCP

### 4.3 Engagement par page

- `/conseil-des-ministres/175/...` : 92,11% taux engagement, 3 min 26 s — excellent
- `/nomination-senegal` : 47,67% engagement, 1 min 06 s — moyen (les users cherchent une info précise)
- `/actualites/` : 0% engagement, 0 s — problème de tracking ou page intermédiaire

---

## 5. Audit technique du code

### 5.1 Ce qui est bien fait

| Élément | Status | Fichier |
|---|---|---|
| SSR activé | OK | `nuxt.config.ts` (ssr: true) |
| Module @nuxtjs/seo | OK | Inclut sitemap, robots, schema.org |
| Sitemap dynamique | OK | `server/api/__sitemap__/urls.ts` |
| Schema.org Organization | OK | `nuxt.config.ts` schemaOrg |
| JSON-LD homepage | OK | `app/pages/index.vue` (4 schémas) |
| Open Graph global | OK | `nuxt.config.ts` app.head.meta |
| Twitter Cards | OK | summary_large_image |
| Canonical sur listings | OK | ~33 pages avec canonical |
| useSeoMeta sur les pages | OK | ~40 pages utilisent useSeoMeta |
| Redirections 301 | OK | routeRules + runtimeConfig.public.redirects |
| HTTPS forcé | OK | HSTS activé en production |
| Instant page (prefetch) | OK | Script instant.page chargé |
| Breadcrumbs schema.org | OK | 463 valides selon GSC |

### 5.2 Problèmes identifiés dans le code

#### P1 — CRITIQUE : Canonical manquante sur /documents/[id]/[slug]

```
Fichier : app/pages/documents/[id]/[slug].vue
```

La page de détail des documents (la plus volumineuse du site) n'a **aucune balise canonical** dans `useHead()`. Cela explique les 58 "pages en double sans URL canonique" dans Search Console.

#### P2 — HAUTE : Typo dans la meta description globale

```
Fichier : nuxt.config.ts, ligne 402-403
Contenu : "Ousmane SOnko" au lieu de "Ousmane Sonko"
```

Cette description est servie sur toutes les pages qui n'ont pas de meta description spécifique.

#### P3 — HAUTE : Keywords meta excessifs

```
Fichier : app/composables/useSiteMetadata.ts
```

89 mots-clés listés. Google ignore la balise `keywords` depuis 2009, mais une liste aussi longue peut être vue comme du spam par d'autres moteurs. Réduire à 10-15 termes pertinents ou supprimer.

#### P4 — MOYENNE : Pages /documents/ avec noindex non voulu

Les pages `/documents/[id]/[slug]` (pages de détail de documents officiels) sont parmi les plus précieuses du site. Vérifier qu'elles ne sont pas accidentellement en noindex via un middleware ou un header serveur. GSC montre 5 251 pages noindex — la majorité semble être des pages /documents/ et /docs/.

#### P5 — MOYENNE : Structure URL avec ID

Les URLs contiennent un ID numérique : `/documents/4613/jo-3792-du-01-janvier-1966`. L'ID n'a aucune valeur SEO. Idéalement, utiliser uniquement le slug : `/documents/jo-3792-du-01-janvier-1966`. Si la migration est trop lourde, garder mais ajouter les canonicals.

#### P6 — BASSE : SchemaOrg type incorrect sur homepage

`index.vue` utilise `GovernmentOrganization` pour le type d'organisation, mais Vie-Publique.sn n'est PAS une organisation gouvernementale — c'est un site citoyen. Utiliser `NewsMediaOrganization` ou `Organization` à la place.

#### P7 — BASSE : og:image avec URL relative sur Twitter

```
nuxt.config.ts, ligne 457 : { name: 'twitter:image', content: '/images/share-linkedin.png' }
```

L'URL est relative alors que l'og:image (ligne 420) est absolue. Les crawlers Twitter/X ont besoin d'URLs absolues.

---

## 6. Problèmes critiques

### 6.1 Les 165 erreurs 404

Ces pages recevaient du trafic ou des crawls et retournent maintenant une 404. Chaque 404 est du "crawl budget" gaspillé et potentiellement des backlinks perdus.

**Action** : Exporter la liste depuis GSC, identifier les patterns, créer des redirections 301 dans `nuxt.config.ts` routeRules.

### 6.2 Les 468 pages "explorées mais non indexées"

Google a exploré ces pages mais a choisi de ne pas les indexer. Causes possibles :
- Contenu trop mince (thin content)
- Contenu dupliqué perçu
- Faible maillage interne

**Action** : Enrichir le contenu de ces pages, ajouter du maillage interne, soumettre à l'indexation.

### 6.3 Les 6 erreurs serveur (5xx)

**Action** : Investiguer les logs serveur, corriger les endpoints défaillants.

### 6.4 Les 18 soft 404

Pages qui retournent un 200 mais semblent être des pages d'erreur. Google les traite comme des 404.

**Action** : Identifier ces pages et soit enrichir leur contenu, soit retourner un vrai 404.

---

## 7. Plan d'action priorisé

### Sprint 1 — Corrections critiques (1-2 semaines)

#### 1.1 Ajouter canonical sur /documents/[id]/[slug]

```
Fichier : app/pages/documents/[id]/[slug].vue
```

Ajouter dans `useHead()` :
```ts
useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/documents/${document.value?.id}/${document.value?.slug}` }],
  // ... reste du head
});
```

Impact attendu : résoudre les 58 doublons sans canonical.

#### 1.2 Corriger la typo "SOnko" → "Sonko"

```
Fichier : nuxt.config.ts, ligne 402
```

#### 1.3 Corriger twitter:image en URL absolue

```
Fichier : nuxt.config.ts, ligne 457
Remplacer : '/images/share-linkedin.png'
Par : 'https://www.vie-publique.sn/images/share-linkedin.png'
```

#### 1.4 Investiguer les erreurs 5xx

Vérifier les 6 URLs en erreur serveur dans GSC et corriger.

### Sprint 2 — Optimisation CTR (2-3 semaines)

#### 2.1 Optimiser les titles/descriptions des pages à fort potentiel

**Page /conseil-des-ministres** (15 446 impressions, 0,74% CTR) :
- Title actuel : générique
- Title proposé : `Conseil des ministres du Sénégal — Communiqués et décisions [date]`
- Description : `Retrouvez les derniers communiqués du conseil des ministres, les nominations et décisions du gouvernement du Sénégal. Mis à jour chaque semaine.`

**Page /nomination-senegal** (8 948 impressions, 1,44% CTR) :
- Title proposé : `Nominations au Sénégal — Ministres, DG, ambassadeurs [2026]`
- Description : `Liste complète des nominations par le conseil des ministres du Sénégal : ministres, directeurs généraux, PCA, ambassadeurs. Mis à jour en temps réel.`

**Requête "communiqué conseil des ministres aujourd'hui"** (1 032 impressions) :
- S'assurer que la page /conseil-des-ministres affiche le dernier communiqué en premier
- Ajouter une date visible dans la balise title (dynamiquement)

#### 2.2 Ajouter des dates dynamiques dans les titles

Pour les pages qui changent souvent (conseil-des-ministres, nominations), inclure le mois/année dans le title :
```ts
const title = `Conseil des ministres du Sénégal — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
```

#### 2.3 Réduire les keywords meta

```
Fichier : app/composables/useSiteMetadata.ts
```

Réduire de 89 à 15 mots-clés maximum, ou supprimer entièrement (Google les ignore).

### Sprint 3 — Indexation & contenu (3-4 semaines)

#### 3.1 Traiter les 165 erreurs 404

1. Exporter la liste depuis GSC (Indexation > Pages > Introuvable 404)
2. Catégoriser les URLs (anciennes routes, contenus supprimés, etc.)
3. Créer des redirections 301 dans `nuxt.config.ts` routeRules
4. Pour les contenus définitivement supprimés, laisser en 404/410

#### 3.2 Traiter les 18 soft 404

1. Identifier les pages concernées
2. Si contenu vide : retourner un vrai 404
3. Si contenu valide : enrichir pour que Google le reconnaisse

#### 3.3 Traiter les 468 pages "explorées non indexées"

1. Identifier les pages concernées (probablement des pages de documents avec peu de contenu)
2. Enrichir le contenu (description, résumé, mots-clés contextuels)
3. Améliorer le maillage interne vers ces pages
4. Soumettre à l'indexation via Search Console

#### 3.4 Auditer les 5 251 pages noindex

Vérifier que le noindex est bien intentionnel pour chaque catégorie :
- `/documents/[id]/[slug]` : ces pages devraient être indexées (contenu unique)
- `/docs/[uuid]/[slug].pdf` : proxy CMS, le noindex peut être justifié pour les PDF bruts
- `/chatbot`, `/barometre-politique`, `/dashboard/corruption` : noindex voulu (OK)

### Sprint 4 — Données structurées & LLM (4-6 semaines)

#### 4.1 Ajouter des données structurées manquantes

| Page | Schema à ajouter |
|---|---|
| /conseil-des-ministres/[id]/[slug] | `GovernmentService` + `Article` |
| /actualites/[id]/[slug] | `NewsArticle` (au lieu de Article) |
| /assemblee-nationale/deputes/[id]/[name] | `Person` avec `memberOf: GovernmentOrganization` |
| /budget-senegal | `Dataset` pour les données budgétaires |
| /justice/magistrature | `GovernmentService` |
| /elections-senegal | `Event` pour les prochaines élections |
| /podcasts/[id]/[slug] | `PodcastEpisode` |

#### 4.2 Corriger le type Organization sur la homepage

Remplacer `GovernmentOrganization` par `NewsMediaOrganization` ou `Organization` dans `index.vue` :
```ts
const websiteOrgSchema = {
  '@type': 'Organization', // Pas GovernmentOrganization
  name: 'Vie Publique Sénégal',
  // ...
};
```

#### 4.3 Ajouter le FAQPage schema

Sur les pages qui contiennent des questions fréquentes (budget, assemblée) :
```ts
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quel est le budget du Sénégal en 2026 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '...'
      }
    }
  ]
};
```

### Sprint 5 — Performance & maillage (continu)

#### 5.1 Améliorer le maillage interne

- Ajouter des liens contextuels entre les pages de contenu similaire
- Sur chaque page de document, ajouter "Documents similaires"
- Sur les pages conseil-des-ministres, linker vers les nominations associées
- Ajouter un fil d'Ariane visible sur toutes les pages (pas seulement schema.org)

#### 5.2 Core Web Vitals

- Monitorer LCP, FID/INP, CLS via Search Console et Analytics
- Optimiser les images (format WebP, lazy loading)
- Vérifier que `<NuxtImage>` est utilisé partout au lieu de `<img>`

#### 5.3 Sitemap

Le sitemap contient 5 958 URLs mais seules 973 sont indexées. Vérifier que :
- Les URLs du sitemap ne sont pas en noindex
- Les URLs du sitemap ne retournent pas de 404
- Le sitemap est à jour et correspond au contenu réel

---

## 8. Optimisation pour les LLM (GEO)

### Qu'est-ce que le GEO ?

Le GEO (Generative Engine Optimization) est l'optimisation pour les moteurs de recherche génératifs (ChatGPT, Claude, Gemini, Perplexity). Ces moteurs utilisent le contenu des sites pour générer des réponses.

### 8.1 Créer un fichier llms.txt

Créer `public/llms.txt` pour aider les LLM à comprendre le site :

```
# Vie Publique Sénégal

> Plateforme citoyenne d'accès à l'information publique au Sénégal

Vie-Publique.sn est un site citoyen indépendant qui facilite l'accès à l'information publique au Sénégal. Il propose des données officielles sur le gouvernement, l'Assemblée nationale, le budget, la justice, et les documents publics.

## Sections principales

- [Actualités](https://www.vie-publique.sn/actualites) : Communiqués, annonces et articles d'actualité politique
- [Conseil des ministres](https://www.vie-publique.sn/conseil-des-ministres) : Communiqués et décisions du conseil des ministres
- [Assemblée nationale](https://www.vie-publique.sn/assemblee-nationale) : Députés, votes, commissions, questions au gouvernement
- [Budget du Sénégal](https://www.vie-publique.sn/budget-senegal) : Analyse et visualisation du budget national
- [Documents officiels](https://www.vie-publique.sn/documents) : Journal officiel, codes, rapports d'audit (OFNAC, Cour des comptes, IGE, ARMP, CENTIF)
- [Nominations](https://www.vie-publique.sn/nomination-senegal) : Nominations par le conseil des ministres
- [Justice](https://www.vie-publique.sn/justice/magistrature) : Nominations dans la magistrature
- [Élections](https://www.vie-publique.sn/elections-senegal) : Données électorales et carte électorale
- [Podcasts](https://www.vie-publique.sn/podcasts) : Podcasts sur la vie publique

## Données clés

- Président : Bassirou Diomaye FAYE
- Premier ministre : Ousmane SONKO
- Langue : Français
- Pays : Sénégal
- Type : Site citoyen indépendant (non gouvernemental)
```

### 8.2 Créer un fichier llms-full.txt

Version détaillée avec structure complète du site, liste des APIs, et schémas de données.

### 8.3 Optimiser le contenu pour les LLM

- **Structurer les réponses** : les LLM préfèrent les contenus bien structurés (listes, tableaux, H2/H3)
- **Phrases de synthèse** : commencer chaque page par un résumé clair de 1-2 phrases
- **Données factuelles** : les LLM citent les sources qui fournissent des données précises et datées
- **Mise à jour fréquente** : les LLM favorisent les sources régulièrement mises à jour
- **Citations et sources** : mentionner les sources officielles (JO, décrets, lois) renforce la crédibilité

### 8.4 Référencer le site sur les annuaires LLM

- Soumettre le site à [llmstxt.directory](https://llmstxt.directory)
- S'assurer que le robots.txt autorise les crawlers LLM (GPTBot, ClaudeBot, etc.)

### 8.5 Vérifier les crawlers LLM dans robots.txt

Ajouter dans la configuration robots de `nuxt.config.ts` :

```ts
// Autoriser explicitement les crawlers LLM
// Ne PAS bloquer : GPTBot, ClaudeBot, PerplexityBot, GoogleOther
```

---

## 9. KPI et suivi

### Objectifs à 3 mois (mai 2026)

| KPI | Actuel | Objectif |
|---|---|---|
| Clics organiques / 90 jours | 3 224 | 5 000 (+55%) |
| CTR moyen | 3,13% | 5% |
| Position moyenne | 7,49 | < 6 |
| Pages indexées | 973 | 2 000 |
| Erreurs 404 | 165 | < 20 |
| Soft 404 | 18 | 0 |
| Erreurs 5xx | 6 | 0 |
| Pages en double sans canonical | 58 | 0 |

### Objectifs à 6 mois (août 2026)

| KPI | Objectif |
|---|---|
| Clics organiques / 90 jours | 8 000 |
| Utilisateurs mensuels | 5 000 |
| Pages indexées | 3 000+ |
| CTR /conseil-des-ministres | > 5% |
| CTR /nomination-senegal | > 5% |
| Backlinks | > 5 000 |

### Suivi régulier

- **Hebdomadaire** : vérifier les erreurs GSC (404, 5xx)
- **Mensuel** : audit CTR des pages à fort volume, état d'indexation
- **Trimestriel** : audit complet SEO, revue des objectifs

---

## Annexes

### A. Pages avec noindex intentionnel (code)

| Page | Raison |
|---|---|
| /barometre-politique/* | Feature en cours de développement |
| /chatbot, /chat-bot | Feature expérimentale |
| /dashboard/corruption/* | Feature en beta |
| /don/success, /don/cancel | Pages transactionnelles |
| /elections/legislatives/resultats/global | Données partielles |
| /elections/legislatives/resultats/proces-verbal | Données partielles |
| /elections/legislatives/[id] | Pages détail anciennes |
| /etat-senegal/organisation | En construction |
| /a-propos/barometre-politique | Page de description feature non active |

### B. Redirections existantes (code)

Configurées dans `nuxt.config.ts` :
- `/budget/**` → `/budget-senegal` (301)
- `/publications/**` → `/actualites` (301)
- `/about/privacy` → `/a-propos/confidentialite`
- `/about/barometre` → `/a-propos/barometre-politique`
- `/reports/*` → `/rapport-senegal/*`
- `/portraits/*` → `/personnalites/*`
- `/code-senegal` → `/documents/codes`
- Nombreuses redirections de PDF vers `/documents/*`

### C. Configuration robots.txt actuelle

Paths bloqués (dans `nuxt.config.ts`) :
- `/journal-officiel-senegal/v2`, `/v3`
- `/budget-senegal/old`
- `/financial-scandals`
- `/publications/enquetes`, `/publications/institutions`, `/publications/recrutement`
- `/barometre-politique`
- `/elections/legislatives/resultats/global`
- `/quiz`, `/chatbot`, `/chat-bot`
- `/gouvernement-senegal`
- `/etat-senegal/annuaire`, `/etat-senegal/organisation`
- `/a-propos/barometre-politique`, `/a-propos/charte-dons`
- `/don/*`
- `/dashboard/corruption/**`

### D. Fichiers SEO clés du projet

| Fichier | Rôle |
|---|---|
| `nuxt.config.ts` | Config SEO globale (robots, sitemap, schema.org, OG, redirections) |
| `app/composables/useSiteMetadata.ts` | Métadonnées par défaut du site |
| `server/api/__sitemap__/urls.ts` | Génération dynamique du sitemap |
| `app/pages/index.vue` | SEO homepage (JSON-LD, useSeoMeta) |
| `app/pages/*/index.vue` | SEO par section (useSeoMeta + canonical) |
| `app/pages/*/[id]/[slug].vue` | SEO pages de détail (dynamique) |
