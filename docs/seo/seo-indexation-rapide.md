# Indexation rapide & fraîcheur — Vie-Publique.sn

> Créé : juin 2026
> Objectif : faire apparaître les pages **documents** et **actualités** dans Google **rapidement** après publication (résultats « récents »).
> Complète `seo-audit.md` (état d'indexation global) et `seo-strategy.md` (SEO programmatique de volume).

---

## 1. Le problème

Une page fraîchement publiée (ex. `/documents/13834/rapport-trimestriel-execution-budget-31-mars-2026`)
n'apparaît **pas** dans Google le jour même, alors que des pages Facebook et des sites d'actu
(PressAfrik, SikaFinance) apparaissent en « il y a 1 heure ».

### Ce n'est PAS un problème de blocage

Vérifié dans le code — tout est en place pour l'indexation :

- ✅ SSR actif, pages HTML réelles (pas des PDF servis directement)
- ✅ `/documents/**` et `/actualites/**` **non bloqués** dans `robots.txt` (`nuxt.config.ts`)
- ✅ Documents et actualités **présents dans le sitemap** (`server/api/__sitemap__/urls.ts`)
- ✅ Canonical, Schema.org `Article`/`NewsArticle`, OG/Twitter présents

> ⚠️ Mythe à corriger : l'absence de `<meta robots="index,follow">` **n'empêche pas** l'indexation.
> Google indexe par défaut tout ce qui n'est pas en `noindex`. C'est une amélioration de cohérence,
> pas la cause racine.

### La vraie cause : vitesse de crawl + autorité de domaine

| Acteur | Pourquoi il apparaît vite |
|--------|---------------------------|
| Sites d'actu (PressAfrik…) | Inscrits dans **Google News** → crawl quasi temps réel |
| Facebook / Threads | Autorité de domaine énorme → crawl en continu |
| vie-publique.sn | Domaine jeune → Google crawle les pages profondes tous les **plusieurs jours/semaines** |

**Conclusion** : même avec un SEO parfait, une page neuve met du temps à être crawlée
**naturellement**. Pour accélérer, il faut **notifier activement** les moteurs et **renforcer
les signaux de fraîcheur**.

---

## 2. Plan d'action (par ordre d'impact)

| # | Action | Effort | Impact | Type |
|---|--------|--------|--------|------|
| A | GSC — « Demander une indexation » sur pages clés | Manuel | Fort (court terme) | Externe |
| B | IndexNow — ping auto à chaque publication | Moyen | Fort (Bing/Yandex immédiat) | Code + CMS |
| C | Google News (Publisher Center) + sitemap news | Moyen | Fort (actualités) | Externe + Code |
| D | Correctifs code fraîcheur (meta, priorité, cache) | Faible | Moyen | Code |

---

## A. Google Search Console (action manuelle — déjà utilisateur GSC)

À faire à chaque publication importante :

1. **Inspection d'URL** → coller l'URL complète → **« Demander une indexation »**.
   C'est le moyen le plus rapide de forcer le crawl d'une page précise (souvent indexée en heures/jours).
2. Vérifier que le **sitemap** est soumis : `https://www.vie-publique.sn/sitemap.xml`.
3. Surveiller **Indexation › Pages** : voir ce qui est « Exploré, non indexé » ou « Détecté, non indexé »
   (cf. `seo-audit.md` P2/P3 — 5 251 noindex + 468 explorées non indexées).

> Limite : quota ~10 demandes manuelles/jour. Pour le volume → IndexNow (B).

---

## B. IndexNow — notification automatique des moteurs

[IndexNow](https://www.indexnow.org/) notifie instantanément **Bing, Yandex, Seznam, Naver**
(et de plus en plus de moteurs) à chaque publication/màj. Gratuit, simple.
Google ne consomme pas IndexNow officiellement, mais l'effet sur Bing est immédiat et améliore
la couverture multi-moteurs.

### B.1 Générer et héberger la clé

1. Choisir une clé (chaîne hex de 8-128 caractères, ex. un UUID sans tirets).
2. La déposer dans un fichier statique accessible publiquement :
   - `public/<KEY>.txt` contenant **uniquement** la clé en texte brut.
   - → accessible à `https://www.vie-publique.sn/<KEY>.txt`
3. Stocker la clé en variable d'env : `NUXT_INDEXNOW_KEY` (+ `.env.example`).

### B.2 Endpoint Nitro de ping (à créer)

`server/api/seo/indexnow.post.ts` — reçoit une ou plusieurs URLs (protégé par un secret partagé
avec le CMS) et relaie à IndexNow :

```ts
// server/api/seo/indexnow.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<{ secret: string; urls: string[] }>(event);

  // Protection : secret partagé avec le webhook CMS
  if (body?.secret !== config.indexnowWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  const urls = (body.urls || []).filter(Boolean);
  if (!urls.length) return { ok: false, reason: 'no urls' };

  const host = 'www.vie-publique.sn';
  const key = config.indexnowKey; // NUXT_INDEXNOW_KEY

  const res = await $fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    body: {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: urls,
    },
  });
  return { ok: true, count: urls.length, res };
});
```

À ajouter dans `nuxt.config.ts` → `runtimeConfig` :

```ts
runtimeConfig: {
  indexnowKey: process.env.NUXT_INDEXNOW_KEY,
  indexnowWebhookSecret: process.env.NUXT_INDEXNOW_WEBHOOK_SECRET,
  // ...
}
```

### B.3 Déclencheur côté CMS (Directus Flow)

Créer un **Flow Directus** :

- **Trigger** : Event Hook → `items.create` et `items.update` sur les collections `documents` et `news`,
  filtre `status == published`.
- **Operation** : Webhook / Request URL → `POST https://www.vie-publique.sn/api/seo/indexnow`
  avec body `{ "secret": "<NUXT_INDEXNOW_WEBHOOK_SECRET>", "urls": ["https://www.vie-publique.sn/documents/{{id}}/{{slug}}"] }`.

> Alternative sans endpoint Nitro : faire appeler **directement** `https://api.indexnow.org/indexnow`
> par le Flow Directus. L'endpoint Nitro reste préférable (clé centralisée, logique d'URL côté app,
> pas de secret IndexNow exposé dans le CMS).

---

## C. Google News — apparaître dans « Actualités » / « À la une »

C'est ce qui fait apparaître PressAfrik & co. en temps réel. Concerne surtout
`actualites/` et `conseil-des-ministres/`.

### C.1 Inscription

1. Créer/valider la propriété dans **Google Publisher Center** (https://publishercenter.google.com).
2. Y déclarer le site et les sections (Actualités, Conseil des ministres).
3. Respecter les règles éditoriales Google News (auteur, dates claires, contenu original).

### C.2 Balises Google News dans le sitemap — **FAIT** (juin 2026)

Implémenté dans `server/api/__sitemap__/urls.ts` (boucle `news`) : les articles publiés
**il y a moins de 48 h** reçoivent une balise `<news:news>` + `changefreq: 'hourly'`.
Au-delà de 48 h, Google ignore la balise → on ne la pose que sur les articles frais.

```ts
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;
const nowMs = Date.now();
// ...dans la boucle news :
const publishedMs = item.date_published ? new Date(item.date_published).getTime() : 0;
const isRecent = publishedMs > 0 && nowMs - publishedMs < NEWS_WINDOW_MS;
urls.push({
  loc: path,
  ...(lastmod && { lastmod }),
  changefreq: isRecent ? 'hourly' : 'weekly',
  priority,
  ...(isRecent && item.title
    ? {
        news: {
          publication: { name: 'Vie Publique Sénégal', language: 'fr' },
          publication_date: toISODate(item.date_published),
          title: item.title,
        },
      }
    : {}),
});
```

> ⚠️ Le champ `title` a dû être **ajouté** aux `fields` du `readItems('news', …)` (il manquait).
> Vérifié en SSR : `@nuxtjs/sitemap` déclare bien `xmlns:news` et rend `<news:news>` /
> `<news:publication_date>` dès qu'un article est dans la fenêtre. Couvre **actualités ET
> conseil-des-ministres** (même collection `news`).
>
> _Optionnel (non fait)_ : exposer un **sitemap news distinct** (option `sitemaps` multiple de
> `@nuxtjs/seo`) plutôt que d'inliner dans le sitemap principal — à référencer dans Publisher Center.

### C.3 Schema `NewsArticle` + crédibilité éditeur — **FAIT** (juin 2026, conseil-des-ministres)

`app/pages/conseil-des-ministres/[id]/[slug].vue` : le JSON-LD est passé de
`GovernmentAnnouncement` (type **ignoré** par Google pour les actus) à **`NewsArticle`**
(type exploité pour « Top Stories » / résultats Article).

**⚠️ Règle de crédibilité (E-E-A-T) appliquée** : Vie Publique **republie et structure** le
communiqué officiel — elle **n'EST PAS** l'État. Donc :

- `author` / `publisher` = **`Organization` « Vie Publique Sénégal »** (logo = PNG public stable
  `/logos/logo-transparent-carre.png`, pas le SVG `app/assets` à URL hashée),
  **plus jamais** `GovernmentOrganization` (se déclarer organe de l'État sur un domaine privé =
  incohérence d'identité, risque E-E-A-T).
- La source officielle est **citée**, pas usurpée : `about` = `GovernmentOrganization`
  (le **sujet**), + `citation` = « Communiqué officiel du Conseil des ministres… ».
- `name` = le **nom de marque** (« Vie Publique Sénégal »), `url` = le domaine — jamais l'inverse.
- Microdata du template aligné (article `NewsArticle`, publisher `Organization`).

> **À répliquer** sur `app/pages/actualites/[id]/[slug].vue` (même collection `news`, plus gros
> volume d'actus) : vérifier son type de schéma + son `publisher`. Prochaine étape évidente.

---

## D. Correctifs code « fraîcheur » (rapides, sans risque)

### D.1 Page document — aligner sur la page actualités

`app/pages/documents/[id]/[slug].vue` — le `useHead()` (lignes ~141-161) n'a **pas** de bloc `meta`.
La page actualités (`app/pages/actualites/[id]/[slug].vue` lignes 234-261) a tout ce qu'il faut.
Ajouter un `meta:` au `useHead` des documents :

```ts
meta: [
  { name: 'robots', content: 'index, follow, max-image-preview:large' },
  {
    property: 'article:published_time',
    content: document.value?.publish_date || '',
  },
  {
    property: 'article:modified_time',
    content: document.value?.date_updated || document.value?.publish_date || '',
  },
  { property: 'article:author', content: 'République du Sénégal' },
],
```

- `article:published_time` / `modified_time` → signal de fraîcheur fort (absent aujourd'hui des documents).
- `max-image-preview:large` → active les grandes vignettes dans les résultats (meilleur CTR).

> Vérifier que `date_updated` est exposé par `GET /api/documents/[id]` (sinon l'ajouter au mapping
> dans `server/api/documents/[id].get.ts`).

### D.2 Sitemap — priorité et fraîcheur des documents

`server/api/__sitemap__/urls.ts` (boucle documents, lignes ~29-37) :

```ts
// avant : priority 0.7, changefreq 'monthly'
urls.push({
  loc: `/documents/${doc.id}/${doc.slug}`,
  ...(lastmod && { lastmod }),
  changefreq: 'weekly', // au lieu de 'monthly'
  priority: 0.8,        // au lieu de 0.7
});
```

Optionnel : booster les documents publiés < 7 jours à `priority: 0.9` + `changefreq: 'daily'`.

### D.3 Cache du sitemap (décision à prendre)

`server/api/__sitemap__/urls.ts` utilise `defineSitemapEventHandler` **sans cache** → requête Directus
à chaque hit. Deux objectifs en tension :

- **Fraîcheur** : pas de cache = nouvelle URL visible immédiatement dans le sitemap.
- **Perf** : cache = sitemap rapide, moins de charge Directus.

Compromis recommandé : cache **court (~10 min)** — négligeable pour l'indexation (Google ne relit pas
le sitemap toutes les minutes) et protège Directus. À implémenter via les options de cache du module
sitemap (`@nuxtjs/seo`) plutôt que de casser `defineSitemapEventHandler`.

> ⚠️ L'utilisateur a indiqué vouloir **peut-être ne pas** activer le cache → à trancher en session.
> Si non caché : laisser tel quel, c'est le meilleur pour la fraîcheur.

---

## E. Partage réseaux sociaux (Open Graph) — CORRIGÉ juin 2026

**Symptôme** : en partageant une URL sur WhatsApp / LinkedIn / Facebook, l'image de couverture
ne s'affichait pas.

### Deux bugs distincts identifiés et corrigés

**Bug 1 — Page actualités : meta non rendues côté serveur**
`app/pages/actualites/[id]/[slug].vue` appelait `useSeoMeta()` / `useHead()` **à l'intérieur d'un
`watch([article, route], …, { immediate: true })`**. Pendant le SSR, le watch immédiat s'exécute une
fois au setup alors que `article` est encore `null` → le garde `if (article.value)` échoue → **aucune
meta posée** → le crawler recevait les meta **globales** (titre « l'information publique au Sénégal »
+ image générique). Les watchers ne se redéclenchent pas pendant le rendu serveur.
→ **Fix** : meta sorties du watch, définies dans le scope setup avec des **getters réactifs**
(`() => …`), comme la page conseil-des-ministres.

**Bug 2 — Page conseil-des-ministres : URL d'image malformée**
Le `image` computed faisait `` `${siteUrl}${cover_image}` ``. Or l'API
(`server/api/news/[id].get.ts`) renvoie `cover_image` comme **ID d'asset Directus brut**, pas une URL.
Résultat : `https://www.vie-publique.snABCD-1234` (URL cassée). De plus le fallback était un `.jfif`,
format mal supporté par les crawlers sociaux.
→ **Fix** : construire `${siteUrl}/cms/<id>` via la fonction pure `useCmsImage()` + `siteUrl` (setup),
avec un fallback en `.jpg` (`public/images/share-conseil-des-ministres-nomination-full.jpg`).
**⚠️ Ne pas** appeler `useCmsImageAbsolute()` dans le getter (→ 500 SSR, voir la règle ci-dessous).

### Règles Open Graph à retenir

- Les balises OG doivent être dans le **HTML SSR** (les crawlers n'exécutent pas le JS) → toujours
  définir le SEO **en scope setup avec getters**, jamais dans un `watch`/`onMounted`.
- L'`og:image` doit être une **URL absolue** accessible publiquement, format **jpg/png** (éviter
  `.jfif` et `.webp` — WhatsApp ne rend pas fiablement le WebP).
- Transformer un ID d'asset CMS en URL absolue, jamais par concaténation brute d'ID.
  **⚠️ MAIS : ne pas appeler `useCmsImageAbsolute()` dans un getter `useHead`/`useSeoMeta`** (ni dans
  un `computed` lu uniquement par un getter) : il appelle `useSiteMetadata`/`useRuntimeConfig`,
  évalués **hors scope setup** → erreur « composable called outside setup » → **500 SSR** (cas vécu :
  `/actualites/[id]`, `/dossiers/[slug]`). **Pattern sûr** : fonction **pure** `useCmsImage(id)`
  (`/cms/<id>`) + `siteUrl` capturé en setup → `` `${siteUrl}${useCmsImage(id)}` ``. Cf. CLAUDE.md §SEO 6.

### ⚠️ Re-scraper les caches sociaux après tout changement OG

Les plateformes cachent l'aperçu (souvent plusieurs jours). Après déploiement, forcer le re-scrape :

- **Facebook / WhatsApp** : [Sharing Debugger](https://developers.facebook.com/tools/debug/) →
  coller l'URL → « Scrape Again ». (WhatsApp utilise le cache Facebook.)
- **LinkedIn** : [Post Inspector](https://www.linkedin.com/post-inspector/) → coller l'URL.
- **Twitter/X** : Card Validator (ou simplement re-partager).

> Tant que le cache n'est pas vidé, l'ancien aperçu (sans image) continue de s'afficher même après
> le fix.

### À vérifier (même classe de bug potentielle)

- [ ] `app/pages/documents/[id]/[slug].vue` — vérifier que `pageImageUrl` (og:image) passe bien par
  `useCmsImageAbsolute()` et non une concaténation `${siteUrl}${id}`.

---

## 3. Checklist de reprise (prochaine session)

### Code (cette repo)
- [ ] **D.1** — Ajouter `meta` (robots + article:published_time/modified_time) sur `documents/[id]/[slug].vue`
- [ ] **D.1bis** — Vérifier/exposer `date_updated` dans `server/api/documents/[id].get.ts`
- [ ] **D.2** — Sitemap documents : `priority 0.8` + `changefreq 'weekly'` (+ boost < 7j optionnel)
- [ ] **D.3** — Décider du cache sitemap (~10 min) ou laisser sans cache
- [ ] **B.2** — Créer `server/api/seo/indexnow.post.ts` + `runtimeConfig` (clé + secret)
- [ ] **B.1** — Déposer `public/<KEY>.txt` + ajouter `NUXT_INDEXNOW_KEY` / `NUXT_INDEXNOW_WEBHOOK_SECRET` à `.env.example`
- [x] **C.2** — Extension `news` (< 48 h) ajoutée au sitemap (actualités + conseil-des-ministres) — **FAIT**
- [x] **C.3** — `NewsArticle` + `publisher`/`author` = Organization Vie Publique + source citée sur `conseil-des-ministres/[id]/[slug]` — **FAIT**
- [ ] **C.3bis** — Répliquer `NewsArticle` + publisher Vie Publique sur `actualites/[id]/[slug].vue`

### Externe (Directus / Google — hors repo)
- [ ] **B.3** — Créer le Flow Directus (publish documents/news → POST /api/seo/indexnow)
- [ ] **C.1** — Inscrire le site à Google Publisher Center (Google News)
- [ ] **A** — Process : « Demander une indexation » GSC sur chaque grosse publication

---

## 4. Fichiers concernés

| Fichier | Rôle dans ce plan |
|---------|-------------------|
| `app/pages/documents/[id]/[slug].vue` | D.1 — meta fraîcheur (modèle = page actualités) |
| `app/pages/actualites/[id]/[slug].vue` | Référence (déjà correct, lignes 234-261) |
| `server/api/documents/[id].get.ts` | D.1bis — exposer `date_updated` |
| `server/api/__sitemap__/urls.ts` | D.2, D.3, C.2 — priorité/fraîcheur + sitemap news |
| `server/api/seo/indexnow.post.ts` | B.2 — **à créer** |
| `public/<KEY>.txt` | B.1 — **à créer** (clé IndexNow) |
| `nuxt.config.ts` | B.2 — `runtimeConfig` (clé + secret) |
| `.env.example` | B — documenter les nouvelles variables |
