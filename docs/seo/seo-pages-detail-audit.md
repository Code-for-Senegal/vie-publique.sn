# Audit SEO des pages détail (meta & partage social)

> Créé : juin 2026 · **Vérifié sur le HTML SSR de production (curl, user-agent crawler)**
> Portée : meta SEO (`useSeoMeta`/`useHead`), Open Graph et Schema.org des pages détail dynamiques.
> Complète `seo-indexation-rapide.md` (§ E) et `seo-audit.md`.
> **Analyse seule — aucun code modifié par ce document** (hors 2 pages déjà corrigées, voir § 4).

---

## 0. ⚠️ Méthodologie de diagnostic SEO — À LIRE AVANT TOUTE ANALYSE

**Leçon apprise (juin 2026)** : un premier audit basé uniquement sur la lecture du code a produit
**plusieurs faux diagnostics**. Toujours suivre ces règles avant de conclure qu'une page a un bug SEO.

### Règle 0 — Vérifier le HTML SSR de PROD avant de conclure
Ne jamais déduire un bug de partage/indexation à partir du seul code. Le module `@nuxtjs/seo`
transforme la sortie. Toujours confirmer avec :
```bash
curl -sL -A "facebookexternalhit/1.1" "https://www.vie-publique.sn/<page>" \
  | grep -iE 'og:|twitter:|canonical|robots'
```

### Règle 1 — `@nuxtjs/seo` ABSOLUTISE les `og:image` relatives
`useCmsImage(id)` renvoie `/cms/<id>` (relatif), mais le HTML servi contient
`https://www.vie-publique.sn/cms/<id>`. → **Une `og:image` relative `/cms/...` n'est PAS un bug.**

### Règle 2 — `@nuxtjs/seo` fournit des FALLBACKS globaux
Quand une page ne définit pas `og:image`, `robots`, `canonical` ou `og:site_name`, le module met une
valeur globale. → **« la page ne définit pas X » ≠ « X est absent du HTML »**. Une page sans `ogImage`
propre affiche quand même l'image générique `share-linkedin.png`.

### Règle 3 — Il n'existe que 2 causes réelles de partage social CASSÉ
1. **Meta dans un `watch`/`onMounted`** (pas en scope setup) → SSR rend `og:title`+`og:url`+`og:image`
   **globaux** (aperçu = page d'accueil). C'est le SEUL cas où tout est faux.
2. **Concat absolue malformée** `` `${siteUrl}${idBrut}` `` → `https://…<id>` (pas de slash) → le module
   ne corrige pas (déjà « absolu ») → image cassée.
   - ✅ `` `${siteUrl}${useCmsImage(id)}` `` → `https://…/cms/<id>` (slash présent) = OK
   - ✅ `useCmsImage(id)` seul = OK (absolutisé par le module)
   - ❌ `` `${siteUrl}${id}` `` = cassé

### Règle 4 — Avant de « corriger l'indexation » d'une page, vérifier 2 choses
- **`routeRules` (redirects 301)** dans `nuxt.config.ts` : si la page est redirigée, elle ne rend rien
  → ne pas la « corriger » (ex. `rapport-senegal/**` → `/documents/rapports-audit`).
- **`robots.disallow`** dans `nuxt.config.ts` : si la page y est listée, elle est **volontairement non
  indexée** → ne pas ajouter `index,follow` sans décision produit (ex. `/projets-publics-senegal/**`).

### Règle 5 — Distinguer « bug » vs « amélioration »
- **Bug** = aperçu faux/cassé (cause 1 ou 2 ci-dessus).
- **Amélioration** = aperçu fonctionne mais image générique au lieu d'une image dédiée, ou `og:url`
  manquant qui retombe sur la home. Réel, mais à prioriser après les bugs.

---

## 1. Comment c'est testé

On récupère le HTML **réellement servi par le serveur** (ce que voit un crawler), pas le DOM après JS :

```bash
curl -sL -A "facebookexternalhit/1.1" "https://www.vie-publique.sn/<page>" \
  | grep -iE 'og:|twitter:|canonical|robots'
```

C'est la seule vérité qui compte pour le partage social et Googlebot.

---

## 2. Comprendre le comportement réel (important — corrige des idées reçues)

Le module **`@nuxtjs/seo` fait deux choses automatiquement** :

1. **Il absolutise les `og:image` relatives** : `useCmsImage(id)` renvoie `/cms/<id>` (relatif), mais le
   HTML servi contient `https://www.vie-publique.sn/cms/<id>` (absolu). → **Une `og:image` relative
   `/cms/...` n'est donc PAS un bug.** (Idée reçue corrigée par les tests prod.)
2. **Il fournit des valeurs globales par défaut** (`og:image`, `og:site_name`, `robots`, `canonical`)
   quand la page ne les définit pas. → Une page sans `ogImage` propre affichera quand même l'image
   générique `share-linkedin.png`, et une page sans `robots` héritera du `robots` global.

### Conséquence : il n'y a vraiment que 2 façons de casser le partage social

| Cause | Effet | Exemple |
|---|---|---|
| **Meta dans un `watch`/`onMounted`** (pas en scope setup) | Le SSR rend les meta **globales** : `og:title`, `og:url` ET `og:image` pointent vers la home → aperçu totalement faux | `actualites` (corrigé), `podcasts`, `rapport-senegal` |
| **Concat absolue malformée** `` `${siteUrl}${idBrut}` `` | Donne `https://www.vie-publique.snABCD` (déjà « absolu » → non corrigé par le module) → image cassée | `conseil-des-ministres` (corrigé) |

> ⚠️ Ne PAS confondre :
> - `` `${siteUrl}${useCmsImage(id)}` `` → `https://…/cms/<id>` ✅ (slash présent)
> - `` `${siteUrl}${id}` `` → `https://…<id>` ❌ (pas de slash → URL collée)
> - `useCmsImage(id)` seul → `/cms/<id>` ✅ (le module l'absolutise)

---

## 3. Résultats vérifiés en production (juin 2026)

`og:img` : `cms` = image spécifique (cover/logo via /cms) · `fallback` = image par défaut de la page ·
`GLOBAL` = image générique du site (la page n'a rien défini) · `cassée` = URL invalide.

| Page testée | Meta location | og:title | og:url | og:image | Verdict |
|---|---|---|---|---|---|
| `documents/13837/…sonko…` | setup | ✅ spécifique | ✅ | ✅ cms (cover présent) | ✅ *(desc faible « Document » ; pas de fallback si pas de cover)* |
| `personnalites/2486/abdoul-ahad-ndiaye` | setup | ✅ | ✅ | ✅ cms (absolutisé) | ✅ **(pas un bug)** |
| `assemblee-nationale/deputes/2317/amadou-ba` | setup | ✅ | ✅ | ✅ cms | ✅ |
| `etat-senegal/institutions/presidence-de-la-republique` | setup | ✅ | ✅ | ✅ fallback `nomination-3.png` | ✅ **(pas un bug)** |
| `medias/256/groupe-africa-medias-link…` | setup | ✅ | ✅ | ✅ fallback `share-media.JPG` | ✅ |
| `budget-senegal/presidence-de-la-republique` | setup | ✅ | ✅ | ⚠️ GLOBAL `share-linkedin.png` | ⚠️ image générique (pas d'`ogImage` propre) |
| `projets-publics-senegal/construction-autoroute…` | setup partiel | ✅ | ❌ GLOBAL (home) | ⚠️ GLOBAL | ⚠️ `ogUrl` + `ogImage` manquants |
| `actualites/409/gouvernement…lo` | **watch** | ❌ GLOBAL | ❌ GLOBAL (home) | ❌ GLOBAL | ❌ **corrigé en local** |
| `podcasts/18/ordre-mondial…boniface` | **watch** | ❌ GLOBAL | ❌ GLOBAL (home) | ❌ GLOBAL | ❌ confirmé |

**Non testés en prod** (à confirmer, mais lecture du code) :
`conseil-des-ministres/[id]/[slug]` (corrigé), `etat-senegal/[slug]` (utilise `useCmsImageAbsolute` ✅),
`assemblee-nationale/commissions/[id]` (setup ✅), `questions/[id]` (setup ✅),
`assemblee-nationale/actualites/[id]/[slug]` (setup ✅), `journal-officiel-senegal/[slug]`
(setup, image statique), `votes/[id]` (pas de `useSeoMeta`), `groupes/[id]/[name]` (aucune meta),
`rapport-senegal/[slug]` (`onMounted`, client-only — legacy 301).

---

## 4. Pages déjà corrigées (juin 2026, en local)

| Page | Bug réel | Correctif |
|---|---|---|
| `actualites/[id]/[slug]` | Meta dans `watch(immediate)` → SSR rendait les meta **globales** (vérifié en prod) | Meta déplacées en scope setup, getters réactifs |
| `conseil-des-ministres/[id]/[slug]` | `og:image` = `` `${siteUrl}${cover_image}` `` (ID brut → URL collée cassée) + fallback `.jfif` | `useCmsImageAbsolute()` + fallback `.jpg` |
| `podcasts/[id]/[slug]` | Meta dans `watch(immediate)` → SSR rendait les meta **globales** (vérifié en prod) | Meta déplacées en scope setup, getters réactifs |
| `budget-senegal/[slug]` | Pas d'`ogImage`/`twitterImage` → image générique globale | `ogImage`/`twitterImage` = `vpsn-share-budget.png` (statique, pas de logo en base) |

> Non encore déployées → la prod montre toujours l'ancien comportement tant que ce n'est pas déployé.

### Pages SANS action requise (vérifié)

| Page | Raison |
|---|---|
| `rapport-senegal/[slug]` | Redirigée **301** vers `/documents/rapports-audit` (`nuxt.config.ts` routeRules) → ne rend rien |
| `projets-publics-senegal/[slug]` | Dans `robots.disallow` (`nuxt.config.ts`) → **volontairement non indexée**. `og:url`/`ogImage` manquants mais ne pas « corriger » sans décision produit. ⚠️ Incohérence à trancher : la page est aussi dans le **sitemap** (`__sitemap__/urls.ts`) tout en étant disallow. |

---

## 5. Bugs restants, par priorité (révisés après tests prod)

### 🔴 Critique — pages sans structure SEO propre (à implémenter)

- **`assemblee-nationale/groupes/[id]/[name]`** — **aucune** meta SEO (ni `useSeoMeta`, ni `useHead`,
  ni Schema.org). À implémenter (modèle : `commissions/[id]`). *(non vérifié en prod, à confirmer)*
- **`assemblee-nationale/votes/[id]`** — pas de `useSeoMeta` (og:* tombent sur le global), JSON-LD
  figé (pas `computed`). À compléter. *(non vérifié en prod, à confirmer)*

> ✅ `podcasts` et `budget` étaient ici → **corrigés** (voir § 4).
> ⚠️ `projets-publics-senegal` et `rapport-senegal` → **pas d'action** (voir § 4 : disallow / 301).

### 🟡 À améliorer (fonctionne, mais perfectible)

- **`documents/[id]/[slug]`** — og:image OK **quand `cover_image` existe** ; la majorité des documents
  officiels n'en ont pas → prévoir un **fallback par type** (budget/JO/rapport). `og:description`
  tombe sur « Document » quand vide. Ajouter aussi `article:published_time` (cf. `seo-indexation-rapide.md` § D.1).
- **`institutions` / `medias`** — fonctionnent ✅ mais affichent l'**image fallback** car le `logo`
  est souvent vide en base ; pas un bug code, plutôt un sujet de données CMS si on veut une image dédiée.
- **`journal-officiel-senegal/[slug]`** — `og:image` statique identique pour tous les JO (acceptable
  si la page est conservée ; sinon candidate à la redirection, cf. `seo-strategy.md` Phase 1).

---

## 6. Pattern de référence (page conforme)

`personnalites/[id]/[slug]`, `deputes/[id]/[name]`, `etat-senegal/[slug]` et `actualites` (corrigé)
sont les modèles propres :

```ts
// 1. computed/getters réactifs en scope setup — image absolue + fallback supporté
const image = computed(() =>
  entity.value?.logo ? useCmsImageAbsolute(entity.value.logo) : `${siteUrl}/images/fallback.jpg`,
);

// 2. useSeoMeta en scope setup, getters réactifs (JAMAIS dans un watch/onMounted)
useSeoMeta({
  title: () => title.value,
  ogTitle: () => title.value,
  description: () => description.value,
  ogDescription: () => description.value,
  ogImage: () => image.value,
  ogUrl: () => url.value,           // ⚠️ ne pas oublier : sinon retombe sur la home
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => description.value,
  twitterImage: () => image.value,
});

// 3. useHead : canonical (le module le génère aussi, mais explicite = mieux)
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
});
```

---

## 7. Outils de test du partage social

Pour que **toi** puisses re-tester après déploiement (et vider les caches sociaux) :

| Outil | Usage | URL |
|---|---|---|
| Facebook Sharing Debugger | FB **et WhatsApp** (même cache) + bouton « Scrape Again » | developers.facebook.com/tools/debug/ |
| LinkedIn Post Inspector | Aperçu LinkedIn + re-scrape | linkedin.com/post-inspector/ |
| opengraph.xyz | Aperçu multi-plateformes rapide | opengraph.xyz |
| metatags.io | Aperçu + édition meta | metatags.io |
| `curl` + grep | HTML SSR brut (ce qui est fait ici) | en ligne de commande |

> Après tout correctif : **re-scraper** (FB Debugger → Scrape Again, LinkedIn Inspector), sinon
> l'ancien aperçu (sans image / global) reste en cache plusieurs jours.

---

## 8. Checklist d'intervention (prochaine session)

### ✅ Fait (juin 2026)
- [x] `actualites/[id]/[slug]` — meta sorties du `watch` → scope setup
- [x] `conseil-des-ministres/[id]/[slug]` — `useCmsImageAbsolute` + fallback `.jpg`
- [x] `podcasts/[id]/[slug]` — meta sorties du `watch` → scope setup
- [x] `budget-senegal/[slug]` — `ogImage`/`twitterImage` = `vpsn-share-budget.png`

### 🔴 Critique (restant)
- [ ] `assemblee-nationale/groupes/[id]/[name]` — implémenter meta SEO complètes
- [ ] `assemblee-nationale/votes/[id]` — ajouter `useSeoMeta` + JSON-LD réactif

### ❓ Décision produit (ne pas corriger sans validation)
- [ ] `projets-publics-senegal/[slug]` — trancher : indexer (retirer du `robots.disallow` + compléter
  SEO) ou non (retirer du sitemap pour lever l'incohérence)

### 🟡 Améliorations
- [ ] `documents/[id]/[slug]` — fallback og:image par type + `article:published_time`
- [ ] `journal-officiel-senegal/[slug]` — image statique acceptable si page conservée

### Données CMS (hors code)
- [ ] Remplir le champ `logo` des `institutions` / `medias` pour des aperçus dédiés
