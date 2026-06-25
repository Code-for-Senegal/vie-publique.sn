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

### Conventions de nommage Directus (IMPORTANT — à suivre pour toute nouvelle feature)

> Avant de créer une collection Directus, identifier à quelle **famille** appartient le contenu,
> puis appliquer la convention correspondante. **Toujours vérifier les noms réels existants**
> (`grep -rE "read(Items|Item)\(" server/`) plutôt que supposer — certains noms surprennent
> (ex. les podcasts sont dans `vp_podcasts`, pas `podcasts`).

**Champs** : toujours en **anglais**, `snake_case` (`title`, `slug`, `cover_image`, `publish_date`,
`seo_title`, `seo_description`, `full_name`, `date_updated`…). Statut de publication = champ `status`
avec valeurs `draft` / `published` / `archived`.

**Collections** — 3 familles :

| Famille | Convention | Exemples | Quand l'utiliser |
| --- | --- | --- | --- |
| **Contenu public principal** | pluriel nu, sans préfixe | `documents`, `news`, `media`, `elections`, `dossiers` | Contenu public de 1er rang destiné aux citoyens. Le nom calque souvent l'URL publique (ex. `/dossiers` → `dossiers`, `/carte` → `carte`). |
| **Module métier** | `<domaine>_<entité>` (singulier) | `assembly_deputy`, `budget_line`, `state_organization_entity`, `election_coalition`, `public_project`, `public_persons` | Données structurées d'un domaine fonctionnel (assemblée, budget, état, élections, projets). Les tables liées gardent le préfixe du domaine. |
| **Contenu propre à l'association** | préfixe `vp_` | `vp_podcasts`, `vp_documents`, `vp_team`, `vp_partners`, `vp_social_stats`, `vp_feature_flags` | Contenu/ressources **de l'association Vie Publique** (page « À propos » : leurs documents, leur équipe, partenaires…) + config applicative. **Ne PAS confondre** avec le contenu public du site. |

> ⚠️ Le préfixe `vp_` = « contenu de l'association », **pas** « contenu éditorial du site ».
> Une page de référence publique (ex. Dossiers) va dans la famille **sans préfixe**.

**Relations Many-to-Many** : un champ M2M par type de contenu lié. Directus crée la table de
jonction `<collectionA>_<collectionB>` et les clés étrangères `<collection>_id`. Côté serveur,
on lit la FK de la **cible** (ex. `documents_id`, `news_id`, `vp_podcasts_id`) — voir
`server/api/dossiers/[slug].get.ts` (`flattenM2M`) comme référence.

**Blocs riches répétables** (FAQ, chronologie, comparatif…) : interface **« Repeater »**
(section Selection ; anciennement « List ») → crée un champ `json` avec un formulaire propre
pour les rédacteurs (pas de JSON brut à saisir).

### Development Workflow

1. **Branch Strategy**: Work on `develop` branch, create PRs to `develop`
2. **Commit Convention**: Use Conventional Commits (feat:, fix:, docs:, etc.)
3. **Before Committing**: Always run `npm run lint:fix` and `npm run format`
4. **Type Safety**: Ensure all new code has proper TypeScript types

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
