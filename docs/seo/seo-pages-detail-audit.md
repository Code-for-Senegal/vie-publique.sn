# Audit SEO des pages détail (meta & partage social)

> Créé : juin 2026 · **Vérifié sur le HTML SSR de production (curl, user-agent crawler)**
> Portée : meta SEO (`useSeoMeta`/`useHead`), Open Graph et Schema.org des pages détail dynamiques.
> Complète `seo-indexation-rapide.md` (§ E) et `seo-audit.md`.
> **Analyse seule — aucun code modifié par ce document** (hors 2 pages déjà corrigées, voir § 4).

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
| `actualites/[id]/[slug]` | Meta dans `watch(immediate)` → SSR rendait les meta **globales** (vérifié en prod ci-dessus) | Meta déplacées en scope setup, getters réactifs |
| `conseil-des-ministres/[id]/[slug]` | `og:image` = `` `${siteUrl}${cover_image}` `` (ID brut → URL collée cassée) + fallback `.jfif` | `useCmsImageAbsolute()` + fallback `.jpg` |

> Non encore déployées → la prod montre toujours l'ancien comportement pour `actualites`.

---

## 5. Bugs restants, par priorité (révisés après tests prod)

### 🔴 Critique — meta dans un `watch`/`onMounted` → aperçu social entièrement faux

- **`podcasts/[id]/[slug]`** — meta dans un `watch` (même bug qu'`actualites`). **Confirmé en prod** :
  `og:title`/`og:url`/`og:image` = valeurs globales. → Déplacer en scope setup avec getters.
- **`rapport-senegal/[slug]`** — `useHead` dans `onMounted`, données chargées **côté client**
  (import JSON) → SSR vide. ⚠️ Page **legacy redirigée 301** (`seo-audit.md`) → confirmer si encore
  atteignable avant d'investir.

### 🟠 Important — `og:*` partiellement manquants (retombent sur le global)

- **`projets-publics-senegal/[slug]`** — `og:title` OK mais **pas d'`ogUrl`** (→ pointe vers la home),
  pas d'`ogImage` propre, pas de Schema.org. Ajouter `ogUrl`, `ogImage` (fallback), JSON-LD.
- **`budget-senegal/[slug]`** — pas d'`ogImage`/`twitterImage` → image générique. Ajouter au minimum
  `${siteUrl}/images/vpsn-share-budget.png`, idéalement le logo de l'entité via `useCmsImageAbsolute()`.
- **`assemblee-nationale/votes/[id]`** — pas de `useSeoMeta` (donc og:* globaux), JSON-LD figé.
- **`assemblee-nationale/groupes/[id]/[name]`** — **aucune** meta SEO. À implémenter (modèle :
  `commissions/[id]`).

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

### 🔴 Critique
- [ ] `podcasts/[id]/[slug]` — sortir meta du `watch` → scope setup (modèle `actualites` corrigé)
- [ ] `rapport-senegal/[slug]` — confirmer statut 301 ; sinon migrer en fetch SSR + meta setup
- [ ] `assemblee-nationale/groupes/[id]/[name]` — implémenter meta SEO complètes
- [ ] `assemblee-nationale/votes/[id]` — ajouter `useSeoMeta` + JSON-LD réactif

### 🟠 og:* manquants
- [ ] `projets-publics-senegal/[slug]` — `ogUrl` + `ogImage` + Schema.org
- [ ] `budget-senegal/[slug]` — `ogImage`/`twitterImage` (fallback ou logo entité)

### 🟡 Améliorations
- [ ] `documents/[id]/[slug]` — fallback og:image par type + `article:published_time`
- [ ] `journal-officiel-senegal/[slug]` — image statique acceptable si page conservée

### Données CMS (hors code)
- [ ] Remplir le champ `logo` des `institutions` / `medias` pour des aperçus dédiés
