# Design System - Vie Publique Sénégal

> Référence unique pour l'identité visuelle et les conventions de design du projet.
> Dernière mise à jour : Mai 2026

## 1. Couleurs de marque (Brand)

### Palette primaire

| Couleur | Hex | RVB | Usage |
|---|---|---|---|
| Bleu Marine | `#18223B` | 24, 34, 59 | Couleur principale, textes forts, fonds sombres |
| Blanc | `#FFFFFF` | 255, 255, 255 | Fonds clairs, textes sur fond sombre |
| Noir | `#000000` | 0, 0, 0 | Textes, icônes, contrastes forts |
| Jaune Doré | `#E2BA13` | 226, 186, 19 | Accent, CTA, highlights, mise en avant |

### Règles d'utilisation

- **Bleu Marine** : couleur dominante de la marque. Headers, fonds hero, éléments de confiance.
- **Jaune Doré** : couleur d'accent. CTA importants, highlights, titres hero, badges. Utiliser avec parcimonie.
- **Noir + Blanc** : neutres pour le texte et les fonds.
- Les couleurs CMJN sont réservées aux supports imprimés. Les valeurs RVB/Hex pour le numérique.

### Accessibilité

| Combinaison | Ratio | WCAG AA | Usage |
|---|---|---|---|
| Blanc sur Bleu Marine | 12.5:1 | Pass | Texte, boutons |
| Jaune Doré sur Bleu Marine | 6.2:1 | Pass | Titres, accents |
| Noir sur Blanc | 21:1 | Pass | Texte courant |
| Jaune Doré sur Blanc | 2.2:1 | Fail | Grands titres seulement (24px+) |
| Jaune Doré sur Noir | 9.5:1 | Pass | Accents en dark mode |

> Le Jaune Doré sur fond blanc ne passe pas WCAG pour du texte courant. L'utiliser uniquement sur des titres grands (24px+) ou sur fond sombre.

### Tailwind (`tailwind.config.ts`)

```ts
brand: {
  navy: '#18223B',  // text-brand-navy, bg-brand-navy
  gold: '#E2BA13',  // text-brand-gold, bg-brand-gold
}
```

## 2. Palette fonctionnelle (UI)

| Domaine | Couleur Tailwind | Usage |
|---|---|---|
| Primaire / UI | `sky-500` | Boutons, liens, éléments interactifs |
| Documents / JO | `sky` | Pages documents, journal officiel |
| Budget / Recettes | `emerald` | Graphiques budget recettes |
| Budget / Dépenses | `orange` | Alertes budget, dépenses |
| Assemblée | `blue` | Pages parlementaires |
| Conseil des ministres | `amber` | Nominations, communiqués |
| Élections | `violet` | Résultats, données électorales |
| Erreurs / Déficit | `rose` | Alertes, déficits |

### Dark Mode "Dim" (Twitter/X inspired)

| Token | Hex | Usage |
|---|---|---|
| `dark-900` | `#15202B` | Background principal |
| `dark-800` | `#192734` | Surface principale |
| `dark-700` | `#1E2732` | Cartes, surfaces élevées |
| `dark-600` | `#2F3336` | Hover surfaces élevées |
| `dark-500` | `#38444D` | Bordures, séparateurs |
| `dark-200` | `#8899A6` | Texte secondaire |
| `dark-50` | `#E7E9EA` | Texte principal |
| Accent | `#1D9BF0` | Liens, éléments interactifs |

## 3. Typographie

### Police principale

**System UI stack** — polices natives du système d'exploitation.

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

Rendu par OS :
- **iOS / macOS** : San Francisco
- **Android** : Roboto
- **Windows** : Segoe UI

Avantages : aucun téléchargement de font, rendu instantané, cohérence native avec l'OS de l'utilisateur.

Weights utilisés : 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Hiérarchie

| Élément | Mobile | Desktop | Weight | Couleur |
|---|---|---|---|---|
| H1 | `text-2xl` | `text-4xl` | light + medium | `text-gray-900` / `dark:text-white` |
| H2 | `text-lg` | `text-xl` | semibold | `text-gray-900` / `dark:text-white` |
| H3 | `text-base` | `text-lg` | semibold | Couleur du domaine |
| Body | `text-sm` | `text-base` | regular | `text-gray-700` / `dark:text-gray-300` |
| Caption | `text-xs` | `text-sm` | medium | `text-gray-500` / `dark:text-gray-400` |

### Convention titres hero

```html
<h1 class="text-2xl md:text-4xl font-light">
  Texte principal<br />
  <span class="font-medium">Texte secondaire accentué</span>
</h1>
```

## 4. Composants

### Boutons

- **Primaire** : `bg-sky-500 hover:bg-sky-600 text-white` (rounded, shadow)
- **Store badges** : `bg-gray-900 text-white` light / `bg-white text-gray-900` dark
- **Pill/Tag** : `rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium`

### Cartes

```css
bg-white dark:bg-gray-800
ring-1 ring-gray-200 dark:ring-gray-700
overflow-hidden rounded-xl
shadow-sm hover:shadow-md transition
```

### Stat Cards (gradient par domaine)

```css
bg-gradient-to-br from-{color}-50 to-{color}-100
dark:from-{color}-950/40 dark:to-{color}-900/20
rounded-xl p-4
```

### Inputs

```css
bg-white dark:bg-gray-800
ring-1 ring-gray-300 dark:ring-gray-700
focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
```

## 5. Spacing & Layout

| Token | Valeur | Usage |
|---|---|---|
| Container | `px-2 sm:px-6 lg:px-8` | Padding conteneur |
| Section gap | `my-8` | Espacement sections |
| Card padding | `px-2 py-3 sm:py-4 sm:p-6` | Intérieur cartes |
| Grid gap | `gap-2` à `gap-4` | Grilles |

### Breakpoints

| Breakpoint | Tailwind | Usage |
|---|---|---|
| Mobile | default | 1 colonne, nav bottom |
| Tablet | `sm:` | 2 colonnes, breadcrumb complet |
| Desktop | `lg:` | 3-4 colonnes |

## 6. Icônes

**Heroicons** via Nuxt UI (`i-heroicons-*`)

- Documents : `i-heroicons-document-text`
- Budget : `i-heroicons-chart-bar`, `i-heroicons-chart-pie`
- Assemblée : `i-heroicons-building-library`
- Recherche : `i-heroicons-magnifying-glass`
- Navigation : `i-heroicons-chevron-right`, `i-heroicons-arrow-right`
- Accueil : `i-heroicons-home`

## 7. Images & Assets

### Logo

- Principal (raster, share/schema) : `/public/logos/logo-transparent-carre.png`
- SVG (header) : `/public/vie-publique-logo-4.svg`
- PWA : `pwa-192x192.png`, `pwa-512x512.png`, `pwa-1024x1024.png`

### Conventions

- Format préféré : WebP
- Defaults : `/public/default-image.png`, `/public/default-journal-officiel.webp`
- Chargement : `loading="lazy"` sauf above-the-fold

## 8. Config technique

### App Config (`app.config.ts`)

```ts
ui: {
  primary: "sky",   // Couleur UI interactive (boutons, liens)
  gray: "slate",    // Tons gris bleutés dark mode
}
```

> `primary: "sky"` = UI interactive. La marque (navy/gold) = identité visuelle (hero, headers, accents), pas les composants UI courants.

## 9. Principes de design

1. **Mobile-first** : Designer pour mobile d'abord, enrichir pour desktop.
2. **Dark mode natif** : Chaque composant supporte la palette "Dim".
3. **Couleur par domaine** : Chaque section a sa couleur (sky, emerald, amber, violet, rose).
4. **Glass morphism** : Effets de transparence et blur sur éléments flottants.
5. **Skeleton loading** : Squelettes de chargement, pas de spinners.
6. **Apple-inspired** : Nav bottom mobile, transitions douces, surfaces épurées.
