# Conventions UI / Design — Vie-Publique.sn

> Style cible : **sobre, éditorial, premium** — inspiration Google / Apple / Medium /
> service-public.fr. Une page doit ressembler à une **page de référence publique** claire et
> fiable, **pas** à une landing marketing ni à un dashboard « template IA ».

## Principes

1. **Le contenu prime** : lisibilité, hiérarchie typographique, espace blanc. On enlève avant
   d'ajouter (moins d'icônes, moins de cartes, moins de bordures, moins d'ombres).
2. **Responsive d'abord** : pas de scroll horizontal visible, pas de contenu coupé sur mobile.
3. **SEO & accessibilité** : un seul `<h1>`, titres de section en `<h2>`, ancres, contrastes.

## Couleurs

- Base : **blanc**, **gris clair**, et **bleu VP** = couleur `primary` Nuxt UI (`sky`).
- Accents sémantiques (vert/jaune/rouge) **seulement** s'ils portent un sens (statut, succès,
  alerte). Jamais de palette multicolore décorative.

### ⚠️ Dark mode — palette `gray` du site, surfaces pleines (pas de `/50`)

Le thème dark est défini **globalement** dans `app/assets/css/app.css` (palette « Dim » slate) :
`.dark body` & `.dark .bg-gray-900` = **`#15202B`**, `.bg-gray-800` = **`#1E2732`**, `.bg-gray-700`
= `#22303C`, accent `#1D9BF0`. **C'est la palette voulue — ne pas la remplacer** par une autre
échelle (`neutral`, `zinc`… → presque noir, incohérent). Pour ajuster la teinte du site, éditer ces
valeurs dans `app.css` (un seul endroit).

| Usage | Light | Dark |
| --- | --- | --- |
| Fond de page | `bg-white` (ou `bg-gray-50`) | `dark:bg-gray-900` (= `#15202B`) ou hériter du body (`dark:bg-transparent`) |
| Carte / surface | `bg-white` | `dark:bg-gray-800` (= `#1E2732`) |
| Anneau / bordure | `ring-gray-200` / `border-gray-100` | `dark:ring-gray-700` / `dark:border-gray-700` |
| Texte principal | `text-gray-900` | `dark:text-white` |
| Texte secondaire | `text-gray-500` / `text-gray-600` | `dark:text-gray-300` / `dark:text-gray-400` |
| Accent / lien | `text-sky-600` | `dark:text-sky-400` |

> **Deux pièges à éviter en dark :**
>
> 1. **Pas d'opacité sur les grandes surfaces** — `dark:bg-gray-800/50` / `dark:bg-gray-900/50`
>    donnent un **aspect délavé bleuté**. Utiliser la couleur **pleine** (`dark:bg-gray-800`).
> 2. **Pas d'autre échelle** (`neutral`, `zinc`…) — ça rend « presque noir » et **dénote** à côté
>    des autres cartes du site (qui sont en `gray-800`). Une page doit se fondre avec les autres.

## Composants & patterns

- **Sections** : titre `<h2>` sobre + fine séparation (`border-t`). Icône de section facultative
  et discrète (pas de pastille colorée).
- **Cartes** : si vraiment nécessaires, légères — `ring-1 ring-gray-200 dark:ring-gray-700`,
  pas d'ombres lourdes. Préférer souvent de simples lignes séparées par des hairlines.
- **Tabs / sommaire** : barre fine, liens texte avec soulignement actif — **pas** de gros pills
  partout. Masquer la scrollbar sur mobile (`scrollbar-hide`).
- **Tableaux** : sur mobile, transformer chaque ligne en bloc empilé (ex. « Avant / Après »)
  plutôt qu'un tableau large qui déborde.
- **Largeur de lecture** : `max-w-3xl` pour le contenu éditorial.
- **Tags** : limités (≈ 3–5 visibles), discrets, placés sous le contenu plutôt qu'en avant.

## Matériau « Liquid Glass » (barre de navigation mobile)

> Référence d'implémentation : `app/components/AppBottomNav.vue`. Cible = **matériau optique
> Apple Liquid Glass** (Bottom Tab Bar iOS 26 / Apple Podcasts), **pas** un glassmorphism classique
> ni un fond blanc/gris translucide. Le verre doit **capter les couleurs de l'arrière-plan** et
> **presque disparaître sur fond clair**. Réservé aux **surfaces flottantes** (barre de nav mobile,
> overlays) — **pas** pour les cartes de contenu (qui restent en surfaces pleines, cf. §Dark mode).

**Principes du matériau**

1. **Fond très faible** (le verre laisse vivre le contenu derrière) : light `rgba(255,255,255,0.06–0.08)`,
   dark `rgba(15,23,42,0.13–0.18)`. Sur fond clair, le verre doit **presque s'effacer**.
2. **Backdrop optique** (pas seulement un blur) :
   `backdrop-filter: blur(30–34px) saturate(200%) contrast(110%) brightness(105%)`. La **saturation
   élevée** est ce qui fait « capter » les couleurs derrière — c'est la clé du rendu Apple.
3. **Bordure quasi invisible** : light `rgba(255,255,255,0.20)`, dark `rgba(255,255,255,0.09)`.
   Jamais de bordure franche.
4. **Ombre externe diffuse** (`0 8px 30px rgba(0,0,0,0.1–0.22)`) pour la profondeur — **pas** de glow
   blanc lumineux autour du composant.
5. **Reflet supérieur discret** via `::before` (`linear-gradient` blanc en haut, `opacity ≈ 0.3–0.5`),
   avec une éventuelle couche `::after` `radial-gradient` très légère pour la profondeur. Ne doit
   **jamais blanchir** l'ensemble. Prévoir `position: relative; overflow: hidden; isolation: isolate` sur le
   conteneur et `z-index: -1` sur les pseudo-éléments.

**Hiérarchie d'accent (onglet actif — modèle Apple Podcasts)**

- L'accent est porté par **l'icône et le texte**, **jamais** par un fond coloré :
  - actif light → couleur d'accent VP **`#0C2146`** ; actif dark → bleu clair lisible **`#8AB4F8`**.
  - inactif → icône/texte noir (light) / blanc (dark), sans fond.
- La **capsule active reste du verre**, seulement **légèrement plus dense** (même matériau, jamais
  bleue, jamais grise opaque) : fond `rgba(255,255,255,0.09)` dark / `0.22` light, `backdrop-filter:
  blur(18px) saturate(180%)`, fine bordure interne, léger reflet en haut, `border-radius: 9999px`.
- **Transitions ~250ms** sur la couleur icône/texte (matériau « vivant ») + apparition douce de la
  capsule (`@keyframes` opacité + translation, car la pill est en `v-if`).

**À éviter** : ❌ capsule remplie de bleu · ❌ capsule grise opaque · ❌ fond blanc/gris trop opaque
· ❌ blur faible (< 20px) · ❌ halo/glow blanc visible · ❌ effet Material Design.

**Vérifier** le rendu sur 5 arrière-plans : fond blanc, fond sombre, image/couleur, page article
(texte derrière), page liste (cards derrière) — le verre doit teinter selon le fond, pas rester une
capsule blanche/grise uniforme.

## Pages liste / index (en-tête, fil d'ariane, filtres)

> Gabarit commun à toutes les pages de listing (`/actualites`, `/documents`, `/dossiers`…).
> **Pages de référence** pour copier le pattern : `app/pages/actualites/index.vue` et
> `app/pages/documents/index.vue`. Toute nouvelle liste ou correction doit s'y aligner.

**Ordre des blocs (de haut en bas) :**

1. **Fil d'ariane AVANT le titre**, dans son propre conteneur, **au-dessus** de l'en-tête —
   jamais sous le `<h1>` :

   ```html
   <div class="container mx-auto px-4 pt-2">
     <AppBreadcrumb :items="[{ label: 'Dossiers' }]" />
   </div>
   ```

2. **En-tête** (sticky optionnel : `sticky top-0 z-40 … bg-white/95 backdrop-blur-sm
   dark:bg-gray-900/95`) contenant :
   - **Ligne de titre** : `<h1>` (`text-lg font-bold sm:text-xl`) à gauche + **compteur de
     résultats** discret à droite (`text-xs text-gray-500`, ex. « 12 dossiers »).
   - **Sous-titre** court, **masqué en mobile** (`hidden sm:block`, `text-sm text-gray-500`).
   - **Recherche** puis **filtres** (dans cet ordre), à l'intérieur de l'en-tête.

**Filtres — règles strictes :**

- **Pilotés par les données** : n'afficher QUE les catégories qui ont **réellement du contenu**,
  avec leur **compteur** (`(N)`). **Jamais** de liste statique exhaustive → on évite la **chip
  vide** qui mène à « Aucun résultat ». Récupérer les facettes via un endpoint dédié
  (`/api/<collection>/types`, agrégation Directus `groupBy` + `count`).
- **Valeur de filtre = valeur réellement stockée** (lue depuis l'API), pas la clé de config
  supposée. _(Piège vécu sur `/dossiers` : Directus stockait le label `Législatif` alors que la
  config attendait la clé `legislative` → le filtre `_eq` ne matchait jamais. On garde la valeur
  brute de l'API et on ordonne via la config en reconnaissant clé **et** label.)_
- **Scroll horizontal masqué** : `scrollbar-hide` sur le conteneur scrollable
  (`-mx-4 overflow-x-auto px-4`). ⚠️ `scrollbar-hide` **n'est pas un utilitaire global** →
  ajouter le `<style scoped>` correspondant dans la page (cf. `actualites/index.vue`).
- Chips : pleines en actif (`bg-gray-900 text-white` / `dark:bg-white dark:text-gray-900`),
  contour léger sinon (`ring-1 ring-gray-200 dark:ring-gray-700`). Penser `aria-pressed`.

**Vérifications avant de conclure** (cf. règles SEO §1, §8) :

- `curl -s <url> | grep -o '<h1' | wc -l` → **1**.
- Le fil d'ariane apparaît **avant** le `<h1>` dans le HTML SSR (comparer les offsets).
- Un filtre cliqué doit renvoyer des résultats (pas de chip qui aboutit à « Aucun … »).

## Réutiliser plutôt que recréer

| Besoin | Composant existant |
| --- | --- |
| Afficher un document | `DocumentsDocumentListItem` |
| Fil d'ariane | `AppBreadcrumb` |
| Image CMS (proxy + fallback) | `CmsImage` |
| Pagination | `UPagination` |
| Partage social | `SocialShare` |

## Cas de référence

La page **détail dossier** (`app/pages/dossiers/[slug].vue` + `app/components/Dossier/*`) suit
ces règles : fond `gray` du site (pleine couleur), hero simple (image + titre + résumé + date), sommaire en onglets fins,
sections sans pastilles colorées, comparatif empilé sur mobile, FAQ accordéon minimal, documents
via `DocumentsDocumentListItem`.
