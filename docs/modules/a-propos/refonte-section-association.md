# Refonte de la section « À propos » → mini-site de l'association

> **Statut** : 📋 Planifié — cocher les cases au fil de l'eau.
> **Créé le** : 2026-07-05
> **Objectif** : transformer `/a-propos` en une section vivante dédiée à l'association Vie Publique
> (actualités de l'asso, projets/programmes, partenaires, rapports annuels, textes, nous rejoindre),
> pilotée depuis Directus (collections `vp_`), à destination des **partenaires, bailleurs et
> citoyens** qui veulent se renseigner sur l'association. Culture de transparence, com maîtrisée.

---

## 1. Décision stratégique : UN SEUL SITE (pas de viepubliquesenegal.com)

Question posée : faut-il un site dédié à l'association (ex. viepubliquesenegal.com) ?
**Décision : NON — tout vit sur `vie-publique.sn/a-propos/*`.**

| Critère | Justification |
| --- | --- |
| **SEO** | vie-publique.sn a déjà l'autorité de domaine ; un nouveau domaine partirait de zéro et diluerait les backlinks. Le contenu asso renforce l'E-E-A-T de TOUT le site (éditeur identifiable et transparent = signal de ranking). |
| **Confiance** | « Qui finance ce site ? » doit se répondre en 1 clic depuis n'importe quelle page, sur le même domaine. La transparence est crédible quand elle est adossée au produit. |
| **Coût** | Un 2ᵉ site = double maintenance (Nuxt, CMS, hébergement, SEO). Directus + préfixe `vp_` existent déjà pour ça. |
| **Audience** | Les partenaires/bailleurs arrivent PAR le site ; pas besoin d'une audience propre. |

**Garde-fou éditorial** : le site est un service d'info neutre, l'asso a une voix propre.
La séparation est **éditoriale, pas technique** :

- Identité de section claire (« L'association Vie Publique ») sur toutes les pages `/a-propos/*`.
- Ne JAMAIS mélanger `/actualites` (info publique du site) et `/a-propos/actualites` (vie de l'asso).
- Si le domaine viepubliquesenegal.com est acheté : simple **redirection 301 → `https://www.vie-publique.sn/a-propos`** (utile pour supports print/pitch decks). Rien d'autre.

---

## 2. État des lieux (audit 2026-07-05)

### Pages existantes (9)

| Page | Données | SEO | Problèmes |
| --- | --- | --- | --- |
| `qui-sommes-nous` | Contributeurs via `/api/contributors` (`vp_team`), reste hardcodé | Complet (Org + AboutPage + Breadcrumb JSON-LD) | Doublon BreadcrumbList (cf. §6) |
| `gouvernance` | Docs via `/api/vp-documents` (`vp_documents`), reste hardcodé | **Minimal** : pas de JSON-LD, description pauvre | SEO à compléter |
| `financement-independance` | **Partenaires hardcodés** (array local) | Complet (Org + FAQ + Breadcrumb) | Doit consommer `vp_partners` |
| `charte-dons` | 100 % hardcodé | Complet | En `Disallow` robots.txt (à reconsidérer) |
| `confidentialite` | 100 % hardcodé | Complet | — |
| `barometre-politique` | 100 % hardcodé | noindex (volontaire, projet en dev) | — |
| `travailler-avec-nous` | 100 % hardcodé | Complet | À fusionner dans « Nous rejoindre » |
| `recrutement/index` | **Offres hardcodées** (2, toutes expirées) | Pas de JSON-LD, **pas de breadcrumb** | Mauvais signal (vitrine d'offres mortes) |
| `recrutement/[slug]` | Offres hardcodées | Pas de `JobPosting` JSON-LD | Pas d'éligibilité Google for Jobs |

### Manques structurels

- **`/a-propos` = 404** : pas de page hub ; le breadcrumb de toutes les sous-pages pointe vers
  `qui-sommes-nous` en guise de parent.
- **Footer** : seuls 3 liens exposés (qui-sommes-nous, confidentialité, financement). Gouvernance,
  recrutement, charte des dons sont invisibles en navigation.
- **APIs orphelines** (travail déjà fait, jamais consommé par une page) :
  - `server/api/partners/index.get.ts` → `vp_partners` (id, name, logo, website, slug, status)
  - `server/api/social-stats/index.get.ts` → `vp_social_stats` (name, followers, display, order, link)
- **`llms.txt`** : la section À propos est absente de `buildLlmsSections()` — alors que « qui est
  derrière vie-publique.sn ? » est une question type posée aux IA (enjeu GEO/réputation).
- **Doublons JSON-LD** : les pages émettent un `BreadcrumbSchema` en plus de celui d'`<AppBreadcrumb>`
  → 2 nœuds `BreadcrumbList` (toléré par Google mais à nettoyer — règle CLAUDE.md §7).

---

## 3. Architecture cible

```text
/a-propos                        ← HUB (nouvelle page) : mission en 3 lignes, dernières
                                    actus asso, projets phares, chiffres clés (vp_social_stats),
                                    derniers rapports, CTA « Nous rejoindre » / « Soutenir »
├── qui-sommes-nous              ← existant (histoire, mission, équipe vp_team)
├── actualites/                  ← NOUVEAU — vie de l'asso : événements, annonces,
│   └── [slug]                     CR de webinaires/événements physiques, conventions signées,
│                                   appels à projets remportés, partenariats, AG…
├── projets/                     ← NOUVEAU — 1 page riche par projet/programme :
│   └── [slug]                     résumé, photos, graphiques, PDFs (rapports), partenaires liés.
│                                   Inclut les projets externes : archives.sn, kaddu.org (external_url)
├── partenaires                  ← NOUVEAU — grille logos + fiche courte (vp_partners, API déjà prête)
├── rapports                     ← NOUVEAU — rapports annuels narratifs + financiers, par année
├── textes                       ← NOUVEAU — statuts, règlement intérieur, chartes internes
│                                   (ou onglet de /gouvernance si peu de contenu au départ)
├── gouvernance                  ← existant (AG, CA, Bureau, docs vp_documents)
├── financement-independance     ← existant (partenaires → migrer sur vp_partners)
├── nous-rejoindre               ← NOUVEAU — adhésion, bénévolat, recrutement.
│                                   Absorbe travailler-avec-nous + recrutement/*
├── charte-dons                  ← existant
├── confidentialite              ← existant
└── barometre-politique          ← existant (noindex tant qu'en dev)
```

### Principes UX

1. **Le hub est la page qu'on envoie à un bailleur** : elle répond en un écran à « qui, quoi,
   avec qui, financé comment, quoi de neuf, comment nous rejoindre ».
2. **Maillage interne systématique** = crédibilité + SEO : chaque projet ↔ ses partenaires ↔ ses
   actus ↔ ses rapports PDF. Chaque rapport annuel lié depuis gouvernance ET financement.
3. **État vide positif** sur nous-rejoindre : « Pas d'offre en ce moment — candidature spontanée /
   devenir bénévole / adhérer » (jamais une liste d'offres expirées en vitrine).
4. **Design** : suivre `docs/guidelines/design.md` (sobre, éditorial, `max-w-3xl`, dark mode palette Dim).
5. **Réutiliser** : `AppBreadcrumb`, `CmsImage`, `useCollectionState`/`useCmsCollection` pour les
   listes paginées, `DocumentsDocumentListItem` pour les listes de PDFs.

---

## 4. Modèle Directus (convention `vp_` = contenu de l'association)

> Champs en anglais `snake_case`, statut = `status` (`draft`/`published`/`archived`),
> cf. conventions CLAUDE.md. ⚠️ Pour chaque M2M : penser à donner le droit **Read** au rôle du
> token CMS sur la **table de jonction** (piège documenté — champ qui disparaît silencieusement).

### 4.1 `vp_news` — actualités de l'association (NOUVELLE)

| Champ | Type | Note |
| --- | --- | --- |
| `title` | string | |
| `slug` | string (unique) | tirets, sans accents, minuscules |
| `type` | select | `event` / `announcement` / `partnership` / `report_back` (CR) / `general_assembly` / `press` |
| `cover_image` | file | |
| `publish_date` | date | |
| `event_date` | date (nullable) | si l'actu concerne un événement daté |
| `summary` | text | pour cartes + meta description |
| `content` | rich text (WYSIWYG) | |
| `gallery` | files M2M | photos d'événement |
| `related_projects` | M2M → `vp_projects` | jonction `vp_news_vp_projects` |
| `related_partners` | M2M → `vp_partners` | jonction `vp_news_vp_partners` |
| `attachments` | M2M → `vp_documents` | CR PDF, convention signée… |
| `status`, `seo_title`, `seo_description` | | |

### 4.2 `vp_projects` — projets & programmes (NOUVELLE)

| Champ | Type | Note |
| --- | --- | --- |
| `name` | string | |
| `slug` | string (unique) | |
| `summary` | text | |
| `content` | rich text | résumé long, contexte, résultats |
| `project_status` | select | `ongoing` / `completed` / `upcoming` |
| `start_date` / `end_date` | date | |
| `cover_image` | file | |
| `gallery` | files M2M | photos |
| `external_url` | string (nullable) | pour archives.sn, kaddu.org… |
| `key_results` | json (Repeater) | chiffres clés : `{ label, value }` |
| `partners` | M2M → `vp_partners` | jonction `vp_projects_vp_partners` |
| `documents` | M2M → `vp_documents` | rapports PDF du projet |
| `status`, `sort`, `seo_title`, `seo_description` | | |

### 4.3 `vp_documents` — ÉTENDRE (existante : id, status, date_updated, title, slug, file)

| Champ à AJOUTER | Type | Note |
| --- | --- | --- |
| `category` | select | `governance` / `annual_report` / `financial_report` / `bylaws` (textes) / `other` |
| `year` | integer (nullable) | pour grouper les rapports par année |
| `description` | text (nullable) | résumé court affichable |

→ Une seule collection pour TOUS les PDFs de l'asso ; les pages filtrent par `category`.

### 4.4 `vp_jobs` — offres de recrutement (NOUVELLE, migration du hardcodé)

| Champ | Type | Note |
| --- | --- | --- |
| `title`, `slug` | | |
| `job_status` | select | `open` / `closed` / `filled` |
| `contract_type` | select | CDI / CDD / stage / bénévolat / prestation |
| `location`, `salary` | string | |
| `deadline` | date | |
| `description` | text | |
| `content` | rich text | remplace le Record `sections` hardcodé |
| `apply_url` ou `apply_email` | string | |
| `status` | | |

### 4.5 Existantes à brancher (aucune modif de schéma)

- `vp_partners` → page `/a-propos/partenaires` + section partenaires de `financement-independance`.
  Champs à envisager en plus si besoin : `partner_type` (bailleur/technique/média), `description`, `period`.
- `vp_team` → déjà consommée par qui-sommes-nous (`ProjectContributors`).
- `vp_social_stats` → chiffres de communauté sur le hub (preuve sociale).

---

## 5. Plan d'implémentation (à cocher au fil de l'eau)

> Chaque phase est livrable indépendamment. Ordre pensé pour un impact visible immédiat
> puis l'enrichissement CMS progressif.

### Phase 1 — Hub `/a-propos` + navigation _(pur front, 0 dépendance CMS)_

- [ ] Créer `app/pages/a-propos/index.vue` (hub) : mission courte, cartes vers les sous-sections,
      chiffres clés via `/api/social-stats` (API existante), CTA Soutenir / Nous rejoindre
- [ ] SEO hub : `useSeoMeta` + JSON-LD brut `AboutPage` (pattern `innerHTML` + `key`, CLAUDE.md §6)
- [ ] `AppBreadcrumb` : faire pointer le parent « À propos » de TOUTES les sous-pages vers
      `/a-propos` (au lieu de `/a-propos/qui-sommes-nous`)
- [ ] Footer (`app/components/AppFooter.vue`) : colonne « L'association » — hub, actus (quand livré),
      projets (quand livré), rapports (quand livré), nous rejoindre, gouvernance
- [ ] `llms.txt` : ajouter une rubrique « L'association » dans `buildLlmsSections()`
      (`server/utils/llms.ts`) : hub, qui-sommes-nous, financement-independance, gouvernance
- [ ] Vérif SSR : `curl -s https://www.vie-publique.sn/a-propos | grep -o "<h1" | wc -l` → 1 ;
      1 seul `BreadcrumbList` (cf. commande §6)

### Phase 2 — Actualités de l'asso (`vp_news`) _(c'est ce qui fait « vivre » la section)_

- [ ] Directus : créer la collection `vp_news` (§4.1) + jonctions M2M + **droits Read du rôle token
      sur les jonctions** `vp_news_vp_projects`, `vp_news_vp_partners`, `vp_news_vp_documents`
- [ ] Types : `types/vp-news.ts`
- [ ] API : `server/api/vp-news/index.get.ts` (liste paginée `limit`/`offset`, filtre `type`) +
      `server/api/vp-news/[slug].get.ts` (helper `flattenM2M`, modèle `server/api/dossiers/[slug].get.ts`)
- [ ] Dégradation propre : échec CMS = fallback/omission, jamais de 500 global (modèle `server/utils/llms.ts`)
- [ ] Page liste `app/pages/a-propos/actualites/index.vue` : `useCollectionState` + `useCmsCollection`
      (state depuis `route.query` en SYNCHRONE au setup — jamais `onMounted`, CLAUDE.md pagination)
- [ ] Page détail `app/pages/a-propos/actualites/[slug].vue` : contenu riche, galerie, actus liées,
      pièces jointes
- [ ] SEO détail : `useSeoMeta` avec `cleanCmsText`/`truncateText` (JAMAIS `.slice` brut sur du texte
      CMS — CLAUDE.md §11), JSON-LD brut `NewsArticle` (`innerHTML` + `key`), ordre anti-TDZ
      (helpers AVANT computed AVANT useSeoMeta/useHead)
- [ ] Hub : section « Dernières actualités de l'association » (3 dernières)
- [ ] Footer + `llms.txt` : ajouter `/a-propos/actualites`
- [ ] Sitemap : vérifier l'inclusion des URLs `/a-propos/actualites/*` dans `/api/__sitemap__/urls`
- [ ] Saisir 2-3 premières actus réelles dans Directus (webinaires techniques passés, partenariats…)
- [ ] Vérif pagination SSR : IDs de `?page=1` et `?page=2` disjoints (commande CLAUDE.md)

### Phase 3 — Projets & programmes (`vp_projects`)

- [ ] Directus : créer `vp_projects` (§4.2) + jonctions + droits Read sur jonctions
- [ ] Types : `types/vp-project.ts`
- [ ] API : `server/api/vp-projects/index.get.ts` + `[slug].get.ts` (expansion partenaires + documents)
- [ ] Page liste `app/pages/a-propos/projets/index.vue` : groupée par `project_status`
      (en cours / terminés), cartes avec cover + résumé
- [ ] Page détail `app/pages/a-propos/projets/[slug].vue` : contenu riche, `key_results`, galerie,
      partenaires (logos), documents PDF (`DocumentsDocumentListItem`), lien externe si `external_url`
- [ ] Créer les fiches : vie-publique.sn (le site lui-même comme projet), archives.sn, kaddu.org,
      baromètre politique, podcasts/webinaires…
- [ ] SEO : JSON-LD `Article` ou `Project`-like par fiche, og:image via `useCmsImageAbsolute()`
- [ ] Hub : section « Nos projets » (cartes des projets phares)
- [ ] Footer + `llms.txt` + sitemap

### Phase 4 — Partenaires, rapports & textes

- [ ] Page `app/pages/a-propos/partenaires.vue` : consomme `/api/partners` (**API existante orpheline**),
      grille de logos + liens sites
- [ ] `financement-independance.vue` : remplacer l'array hardcodé `partnersProjects` par les données
      `vp_partners` (ajouter les champs manquants dans Directus si besoin : `partner_type`, `period`,
      `finances` / `does_not_finance`)
- [ ] Directus : étendre `vp_documents` avec `category` + `year` + `description` (§4.3) ;
      catégoriser les documents existants
- [ ] API : ajouter le filtre `category` à `server/api/vp-documents/index.get.ts`
      (⚠️ bumper le `name` du `defineCachedEventHandler` — cache Nitro)
- [ ] Page `app/pages/a-propos/rapports.vue` : rapports annuels (narratifs + financiers) groupés
      par année, avec descriptions ; JSON-LD `Report` par item
- [ ] Page `app/pages/a-propos/textes.vue` (ou section dans gouvernance) : statuts, règlement
      intérieur (`category = bylaws`)
- [ ] `gouvernance.vue` : lier vers /rapports et /textes ; compléter le SEO (description riche,
      OG, JSON-LD)
- [ ] Uploader les premiers rapports (annuel narratif + financier) et textes dans Directus

### Phase 5 — Nous rejoindre (fusion travailler-avec-nous + recrutement)

- [ ] Directus : créer `vp_jobs` (§4.4), migrer les 2 offres hardcodées
- [ ] API : `server/api/vp-jobs/index.get.ts` + `[slug].get.ts`
- [ ] Page `app/pages/a-propos/nous-rejoindre.vue` : adhésion (avec docs `category=bylaws` liés),
      bénévolat/contribution, partenariats (contenu de travailler-avec-nous), offres ouvertes
      (état vide positif si aucune)
- [ ] Détail offre : `app/pages/a-propos/nous-rejoindre/[slug].vue` (ou garder l'URL
      `/a-propos/recrutement/[slug]`) avec JSON-LD **`JobPosting`** (éligibilité Google for Jobs)
- [ ] Redirections 301 (`routeRules` nuxt.config.ts) : `/a-propos/travailler-avec-nous` et
      `/a-propos/recrutement` → `/a-propos/nous-rejoindre` (slug détail conservé ou redirigé)
- [ ] Mettre à jour footer, hub, breadcrumbs, `llms.txt`, sitemap

### Phase 6 — Hygiène SEO transverse (peut se faire en continu)

- [ ] Retirer les `BreadcrumbSchema` JSON-LD des pages a-propos (doublon avec `<AppBreadcrumb>` —
      CLAUDE.md §7) : qui-sommes-nous, charte-dons, confidentialite, financement-independance,
      travailler-avec-nous, barometre-politique
- [ ] Reconsidérer le `Disallow` robots.txt sur `/a-propos/charte-dons` (contenu de confiance →
      candidat à l'indexation)
- [ ] Vérifier qu'aucune page n'a 2 `<h1>` (barre mobile vs desktop)
- [ ] Vérifier les titres : pas de marque dupliquée (le `titleTemplate` ajoute déjà `| Vie-Publique.sn`)
- [ ] Passer les descriptions construites depuis du contenu CMS par `cleanCmsText`/`truncateText`
- [ ] Test Rich Results sur hub, 1 actu, 1 projet, 1 offre (vérifier le DOM rendu, pas seulement curl)
- [ ] 301 sur viepubliquesenegal.com → `https://www.vie-publique.sn/a-propos` (si domaine acheté ;
      cf. `docs/guidelines/dns-redirections-domaines.md`)

---

## 6. Commandes de vérification

```bash
# 1 seul H1 par page
curl -s https://www.vie-publique.sn/a-propos | grep -o "<h1" | wc -l          # attendu : 1

# 1 seul BreadcrumbList (N ListItem = nb de niveaux, pas 2×N)
curl -s <url> | grep -oE '"@type":"(BreadcrumbList|ListItem)"' | sort | uniq -c

# JSON-LD rendu en CONTENU de <script>, pas en attribut children
curl -s <url> | grep -oE '<script type="application/ld\+json">'

# Meta OG en SSR prod (jamais conclure depuis le code seul)
curl -sL -A "facebookexternalhit/1.1" <url> | grep -iE 'og:|twitter:|canonical|robots'

# Pagination SSR : pages 1 et 2 disjointes
curl -sL "<url>?page=1" | grep -oE '/a-propos/actualites/[a-z0-9-]+' | sort -u
curl -sL "<url>?page=2" | grep -oE '/a-propos/actualites/[a-z0-9-]+' | sort -u
```

---

## 7. Références internes

- Conventions Directus & pièges M2M/permissions : `CLAUDE.md` (§ Conventions de nommage Directus)
- Règles SEO/JSON-LD/pagination : `CLAUDE.md` (§ SEO & Open Graph, § Listes paginées)
- Design : `docs/guidelines/design.md`
- llms.txt : `docs/seo/llms-txt.md`
- URLs : `docs/guidelines/url-structure-analysis.md`
- Modèles de code : `server/api/dossiers/[slug].get.ts` (flattenM2M),
  `app/pages/documents/[id]/[slug].vue` (JSON-LD brut), `app/composables/useCollectionState.ts` (listes)
