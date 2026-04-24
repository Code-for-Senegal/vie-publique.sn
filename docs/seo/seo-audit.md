# Audit SEO — Vie-Publique.sn

> Dernière mise à jour : avril 2026
> Données GSC/GA : période nov. 2025 – fév. 2026 (90 jours)
> Sources : Google Analytics 4, Google Search Console, audit du code source

---

## Récapitulatif

### Bonnes pratiques en place

| # | Élément | Status | Fichier / Détail |
|---|---------|--------|------------------|
| 1 | SSR activé | OK | `nuxt.config.ts` (ssr: true) |
| 2 | Module @nuxtjs/seo | OK | sitemap, robots, schema.org intégrés |
| 3 | Sitemap dynamique | OK | `server/api/__sitemap__/urls.ts` — documents, actualités, députés, projets |
| 4 | Schema.org Organization (site) | OK | `nuxt.config.ts` schemaOrg (type: Organization) |
| 5 | JSON-LD homepage | OK | `app/pages/index.vue` — 4 schemas (Organization, WebSite, etc.) |
| 6 | Schema.org documents | OK | `app/pages/documents/[id]/[slug].vue` — Article + BreadcrumbList |
| 7 | Open Graph global | OK | `nuxt.config.ts` app.head.meta |
| 8 | Twitter Cards URL absolue | OK | `nuxt.config.ts` — corrigé (était relative) |
| 9 | Canonical pages documents | OK | `app/pages/documents/[id]/[slug].vue` lignes 143-150 |
| 10 | Canonical pages catégories | OK | `app/pages/documents/[category].vue` ligne 179 |
| 11 | Canonical hub /documents | OK | `app/pages/documents/index.vue` ligne 24 |
| 12 | useSeoMeta dynamique | OK | ~40 pages |
| 13 | Redirections 301 | OK | `nuxt.config.ts` routeRules — 31 règles |
| 14 | HTTPS + HSTS | OK | Production |
| 15 | Instant page (prefetch) | OK | instant.page script |
| 16 | Breadcrumbs schema.org | OK | 463 valides selon GSC, 0 erreur |
| 17 | Keywords meta | OK | Réduit à 14 termes (`useSiteMetadata.ts`) — était 89 |
| 18 | Description globale OG | OK | Typo "SOnko" corrigée |
| 19 | llms.txt | OK | `public/llms.txt` créé |
| 20 | PWA | OK | Service worker configuré |
| 21 | 5 catégories documents | OK | CATEGORY_CONFIG : journal-officiel, rapports-audit, strategies, codes, budget |

### Reste à faire

| # | Problème | Priorité | Action | Réf. |
|---|----------|----------|--------|------|
| 1 | 5 251 pages en noindex (88% invisible) | HAUTE | Auditer via GSC, retirer noindex des /documents/ valides | [P2](#p2--haute--5-251-pages-en-noindex) |
| 2 | 468 pages explorées non indexées | HAUTE | Enrichir contenu, maillage interne | [P3](#p3--haute--468-pages-explorées-mais-non-indexées) |
| 3 | 165 erreurs 404 | HAUTE | Redirections 301 via routeRules | [P4](#p4--haute--165-erreurs-404) |
| 4 | 18 soft 404 | HAUTE | Vrai 404 ou enrichir contenu | [P5](#p5--haute--18-soft-404) |
| 5 | 58 pages en double sans canonical | MOYENNE | Identifier via GSC (probablement /docs/ PDF) | [P6](#p6--moyenne--58-pages-en-double-sans-canonical) |
| 6 | 6 erreurs serveur 5xx | BASSE | Investiguer logs serveur | [P7](#p7--basse--6-erreurs-serveur-5xx) |
| 7 | CTR /conseil-des-ministres : 0,74% | HAUTE | Optimiser title/description avec date dynamique | [Section 4](#4-opportunités-ctr) |
| 8 | CTR /nomination-senegal : 1,44% | HAUTE | Optimiser title avec année + postes | [Section 4](#4-opportunités-ctr) |
| 9 | llms-full.txt | BASSE | Créer version détaillée | [Section 5](#5-optimisation-pour-les-llm-geo) |
| 10 | 17+ catégories documents manquantes | STRATÉGIE | Ajouter au CATEGORY_CONFIG | Voir `seo-strategy.md` |
| 11 | Pages archives /annee/ | STRATÉGIE | Créer documents/annee/[year].vue | Voir `seo-strategy.md` |
| 12 | Pages institutions | STRATÉGIE | Créer institutions/[slug].vue | Voir `seo-strategy.md` |
| 13 | Maillage interne contextuel | STRATÉGIE | Badges liens + documents liés | Voir `seo-strategy.md` |
| 14 | Schema.org conditionnels (Legislation, Report...) | STRATÉGIE | Sur documents selon type | Voir `seo-strategy.md` |

---

## 1. Métriques clés

### Search Console (90 jours — nov. 2025 – fév. 2026)

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

### Requêtes top

| Requête | Clics | Impressions | CTR | Position |
|---|---|---|---|---|
| vie publique sn | 918 | 1 204 | 76,25% | 1,59 |
| vie publique senegal | 111 | 168 | 66,07% | 1,66 |
| nominations conseil des ministres sénégal aujourd'hui | 37 | 480 | 7,71% | 3,88 |
| communiqué conseil des ministres aujourd'hui | 26 | 1 032 | 2,52% | 4,29 |
| conseil des ministres aujourd'hui | 23 | 530 | 4,34% | 5,04 |

### Pages de destination top

| Page | Clics | Impressions | CTR | Position |
|---|---|---|---|---|
| / | 548 (17%) | 3 110 | 17,62% | 8,60 |
| /actualites/ | 194 (6%) | 325 | 59,69% | 1,51 |
| /etat-senegal | 155 (4,8%) | 385 | 40,26% | 5,01 |
| **/nomination-senegal** | **129 (4%)** | **8 948** | **1,44%** | **6,92** |
| **/conseil-des-ministres** | **115 (3,6%)** | **15 446** | **0,74%** | **7,65** |

### Analytics (90 jours)

| Métrique | Valeur |
|---|---|
| Utilisateurs actifs | 3 463 |
| Nouveaux utilisateurs | 2 909 (84%) |
| Taux d'engagement | 58,09% |
| Durée engagement moy. | 3 min 09 s |

**Audience** : 72% Sénégal, 12% France, 5% USA — 62% mobile

---

## 2. Implémentation technique actuelle

### Pages catégories documents (CATEGORY_CONFIG)

| Catégorie | Type Directus | Filtres |
|-----------|---------------|---------|
| `journal-officiel` | `official_journal` | year |
| `rapports-audit` | `audit_report` | audit_institution |
| `strategies` | `strategy` | — |
| `codes` | `code` | — |
| `budget` | `budget` | — |

→ Voir `seo-strategy.md` pour les 17+ catégories à ajouter.

### Sitemap — Sources dynamiques

| Source | Path | Priority |
|--------|------|----------|
| Documents CMS | `/documents/{id}/{slug}` | 0.7 |
| Actualités CMS | `/actualites/{id}/{slug}` | 0.8 |
| Conseil des ministres CMS | `/conseil-des-ministres/{id}/{slug}` | 0.9 |
| Députés CMS | `/assemblee-nationale/deputes/{id}/{slug}` | 0.6 |
| Projets publics CMS | `/projets-publics-senegal/{slug}` | 0.7 |
| Pages statiques | Auto-découverte Nuxt | — |

---

## 3. Problèmes restants à corriger

### P2 — HAUTE : 5 251 pages en noindex

**Problème** : 88% du contenu est invisible pour Google. La majorité semble être des pages `/documents/` et `/docs/`.

**Action requise** :

- Vérifier via GSC quelles URLs exactes sont noindex
- Les pages `/documents/[id]/[slug]` devraient être indexées (contenu unique)
- Les pages `/docs/[uuid]/[slug].pdf` (proxy PDF CMS) peuvent rester noindex

### P3 — HAUTE : 468 pages explorées mais non indexées

**Problème** : Google a exploré ces pages mais a choisi de ne pas les indexer. Causes probables : thin content, contenu dupliqué perçu, faible maillage.

**Action** : Identifier via GSC, enrichir le contenu, améliorer le maillage interne.

### P4 — HAUTE : 165 erreurs 404

**Action** : Exporter la liste depuis GSC, créer des redirections 301 dans `nuxt.config.ts` routeRules.

### P5 — HAUTE : 18 soft 404

**Action** : Identifier les pages, enrichir le contenu ou retourner un vrai 404.

### P6 — MOYENNE : 58 pages en double sans canonical

**Problème** : Pages `/docs/` PDF probablement. La canonical sur `/documents/[id]/[slug]` est déjà en place.

**Action** : Vérifier via GSC quelles sont ces 58 pages exactement.

### P7 — BASSE : 6 erreurs serveur 5xx

**Action** : Investiguer les logs serveur, corriger les endpoints défaillants.

---

## 4. Opportunités CTR

Les pages avec beaucoup d'impressions mais un CTR faible :

### /conseil-des-ministres — 15 446 impressions, 0,74% CTR

**Title proposé** : `Conseil des ministres du Sénégal — Communiqués et décisions [mois année]`
**Description** : `Retrouvez les derniers communiqués du conseil des ministres, les nominations et décisions du gouvernement du Sénégal. Mis à jour chaque semaine.`
**Action** : Ajouter une date dynamique dans le title.

```ts
const title = `Conseil des ministres du Sénégal — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
```

### /nomination-senegal — 8 948 impressions, 1,44% CTR

**Title proposé** : `Nominations au Sénégal — Ministres, DG, ambassadeurs [2026]`
**Description** : `Liste complète des nominations par le conseil des ministres du Sénégal : ministres, directeurs généraux, PCA, ambassadeurs.`

### /pdf/budget/2025-projet-loi-de-finance-initiale.pdf — 6 922 impressions

**Action** : S'assurer que la redirection 301 vers `/documents/budget` est effective.

### Requête "communiqué conseil des ministres aujourd'hui" — 1 032 impressions

**Action** : S'assurer que la page /conseil-des-ministres affiche le dernier communiqué en premier + date fraîche dans le title.

---

## 5. Optimisation pour les LLM (GEO)

### Fait

- `public/llms.txt` créé avec sections principales et données clés
- robots.txt n'a pas de blocage explicite des crawlers LLM

### À faire

- [ ] Créer `public/llms-full.txt` — version détaillée avec structure complète, APIs, schémas
- [ ] Soumettre le site à [llmstxt.directory](https://llmstxt.directory)
- [ ] Structurer les contenus pour les LLM : résumés clairs en début de page, données factuelles datées
- [ ] Vérifier que les crawlers LLM (GPTBot, ClaudeBot, PerplexityBot) ne sont pas bloqués

---

## 6. KPI et suivi

### Objectifs à 3 mois (mai 2026)

| KPI | Valeur fév. 2026 | Objectif |
|---|---|---|
| Clics organiques / 90j | 3 224 | 5 000 (+55%) |
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
| Clics organiques / 90j | 8 000 |
| Utilisateurs mensuels | 5 000 |
| Pages indexées | 3 000+ |
| CTR /conseil-des-ministres | > 5% |
| CTR /nomination-senegal | > 5% |
| Backlinks | > 5 000 |

### Suivi régulier

- **Hebdomadaire** : erreurs GSC (404, 5xx)
- **Mensuel** : audit CTR pages à fort volume, état d'indexation
- **Trimestriel** : audit complet SEO, revue des objectifs

---

## 7. Annexes

### A. Pages avec noindex intentionnel

| Page | Raison |
|---|---|
| /barometre-politique/* | Feature en développement |
| /chatbot, /chat-bot | Feature expérimentale |
| /dashboard/corruption/* | Feature en beta |
| /don/success, /don/cancel | Pages transactionnelles |
| /elections/legislatives/resultats/global | Données partielles |
| /elections/legislatives/resultats/proces-verbal | Données partielles |
| /elections/legislatives/[id] | Pages détail anciennes |
| /etat-senegal/organisation | En construction |
| /a-propos/barometre-politique | Feature non active |

### B. Redirections existantes (31 règles dans routeRules)

| Pattern | Destination | Type |
|---------|-------------|------|
| `/budget/**` | `/budget-senegal` | 301 |
| `/publications/**` | `/actualites` | 301 |
| `/about/privacy` | `/a-propos/confidentialite` | 301 |
| `/about/barometre` | `/a-propos/barometre-politique` | 301 |
| `/about/us` | `/a-propos/qui-sommes-nous` | 301 |
| `/reports/**` | `/documents/rapports-audit` | 301 |
| `/rapport-senegal/**` | `/documents/rapports-audit` | 301 |
| `/code-senegal/**` | `/documents/codes` | 301 |
| `/budget-etat-senegal` | `/budget-senegal` | 301 |
| `/portraits/*` | `/personnalites/*` | 301 |
| 12+ URLs PDF legacy | `/documents/*` | 301 |

### C. Robots.txt — Paths bloqués

```
/journal-officiel-senegal/v2, /v3
/budget-senegal/old
/financial-scandals
/publications/enquetes, /institutions, /recrutement
/barometre-politique
/elections/legislatives/resultats/global
/quiz, /chatbot, /chat-bot
/gouvernement-senegal
/etat-senegal/annuaire, /organisation
/a-propos/barometre-politique, /charte-dons
/don/bictorys, /paydunya, /success
/dashboard/**
/projets-publics-senegal/**
```

### D. Fichiers SEO clés

| Fichier | Rôle |
|---|---|
| `nuxt.config.ts` | Config globale : robots, sitemap, schema.org, OG, redirections |
| `app/composables/useSiteMetadata.ts` | Métadonnées par défaut (14 keywords, description, images) |
| `server/api/__sitemap__/urls.ts` | Sitemap dynamique (documents, actualités, députés, projets) |
| `app/pages/index.vue` | Homepage : 4 JSON-LD schemas |
| `app/pages/documents/[category].vue` | 5 catégories : CATEGORY_CONFIG + CollectionPage schema |
| `app/pages/documents/[id]/[slug].vue` | Détail document : canonical + Article + BreadcrumbList |
| `public/llms.txt` | Fichier pour crawlers LLM |

### E. Problèmes résolus (historique)

| Problème | Détail |
|----------|--------|
| Canonical manquante sur /documents/[id]/[slug] | Ajoutée dans useHead() lignes 143-150 |
| Typo "SOnko" dans description OG globale | Corrigée, description réécrite sans mention de noms |
| Keywords meta excessifs (89) | Réduit à 14 dans useSiteMetadata.ts |
| twitter:image URL relative | Changée en URL absolue dans nuxt.config.ts |
| Schema.org Organization homepage | organizationSchema utilise `Organization` (ligne 28) |
| Pas de fichier llms.txt | Créé dans public/llms.txt |
