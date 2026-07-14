# Dossiers — SEO

> À lire avec les règles SEO globales du projet : `docs/seo/seo-pages-detail-audit.md`,
> `docs/seo/seo-indexation-rapide.md`. Rappel : **toujours vérifier le HTML SSR de prod**
> (`curl -A "facebookexternalhit/1.1"`) avant de conclure à un bug — `@nuxtjs/seo`
> absolutise les og:image relatives et fournit des fallbacks globaux.

## Objectif

Faire de chaque `/dossiers/<slug>` **la** page de référence du sujet (position 1 Google).

## Ce qui est implémenté

### Page détail (`app/pages/dossiers/[slug].vue`)

Toutes les meta sont définies **en scope setup avec des getters réactifs** (jamais dans un
`watch`/`onMounted`) → rendues côté serveur pour les crawlers.

- **`<title>`** : `seo_title` sinon `« <titre> | Dossier Vie Publique Sénégal »`
- **meta description** : `seo_description` sinon `summary` (tronqué à 160)
- **canonical** : `https://www.vie-publique.sn/dossiers/<slug>` (URL propre, minuscules)
- **Open Graph** : `og:type=article`, `og:title`, `og:description`, `og:url`,
  `og:image` (absolue via `useCmsImageAbsolute(cover_image)`), `og:image:alt`, `og:site_name`
- **Twitter** : `summary_large_image` + title/description/image
- **`article:published_time` / `article:modified_time`** (basés sur `publish_date` / `date_updated`)
- **robots** : `index, follow, max-image-preview:large`
- **JSON-LD** :
  - `Article` (headline, image 1200×630, dates, author/publisher, `about` GovernmentOrganization, keywords)
  - `BreadcrumbList` (Accueil → Dossiers → titre)
  - `FAQPage` (uniquement si le bloc `faq` est renseigné) → éligible aux rich results FAQ

### Page liste (`app/pages/dossiers/index.vue`)

- title / description / canonical / OG / Twitter
- JSON-LD `CollectionPage` + `BreadcrumbList`

### Sitemap (`server/api/__sitemap__/urls.ts`)

- Tous les dossiers **publiés** ajoutés en `/dossiers/<slug>`,
  `priority: 0.9`, `changefreq: weekly`, `lastmod` = `date_updated` (ou `publish_date`).
- Les brouillons sont exclus (filtre `status = published`).

## Contraintes de slug (respecter à la saisie)

minuscules · sans accents · sans espaces · pas de caractères encodés · pas de double tiret.
Voir `directus-schema.md` § 4. Un slug propre = un canonical propre.

## Indexation rapide d'un nouveau dossier

1. Publier le dossier (`status = published`).
2. Vérifier le HTML SSR :
   ```bash
   curl -sL -A "facebookexternalhit/1.1" https://www.vie-publique.sn/dossiers/<slug> \
     | grep -iE 'og:|twitter:|canonical|robots'
   ```
3. Vérifier la présence dans `https://www.vie-publique.sn/sitemap.xml`.
4. Soumettre l'URL dans **Google Search Console** (Inspection d'URL → Demander l'indexation).
5. Tester les rich results : <https://search.google.com/test/rich-results> (Article + FAQ).
6. Valider l'aperçu social : partage LinkedIn/Facebook/Twitter (debuggers respectifs).

## Bonnes pratiques éditoriales pour le rang n°1

- `title` clair et orienté requête (« Code du travail Sénégal 2026 : ce qui change »).
- `summary` = réponse synthétique à l'intention de recherche (≤ 200 car.).
- Remplir la **FAQ** avec les vraies questions des utilisateurs → rich results + featured snippets.
- Lier un maximum de contenus internes pertinents (maillage interne fort).
- Garder le dossier **à jour** (`date_updated` récent = signal de fraîcheur).
- Renseigner des `tags` cohérents et réutilisés entre dossiers proches.

## Pièges à éviter (rappel des 2 vraies causes de partage cassé)

1. Meta définies dans un `watch`/`onMounted` → SSR rend les meta globales. ✅ Ici tout est en scope setup.
2. Concat absolue malformée `` `${siteUrl}${idBrut}` `` (sans slash). ✅ Ici on passe par `useCmsImageAbsolute()`.
