# Guide des Skeleton Loaders

## 🎯 Principe

**TOUJOURS** utiliser des **skeleton loaders** au lieu de messages "Chargement..." pour améliorer l'UX.

### ❌ À ÉVITER
```vue
<div v-if="loading" class="py-8 text-center">
  <p>Chargement des données...</p>
</div>
```

### ✅ À FAIRE
```vue
<template v-if="loading">
  <UCard v-for="i in 5" :key="`skeleton-${i}`" class="custom-shadow">
    <div class="flex gap-2 animate-pulse">
      <!-- Skeleton adapté à la structure réelle -->
    </div>
  </UCard>
</template>
```

---

## 📋 RÈGLE D'OR

> **Le skeleton loader doit ressembler à la structure réelle de la carte/élément chargé**

---

## 🧩 Exemples par type de carte

### 1. Carte avec photo circulaire + texte (Nominations, Députés)

**Structure réelle** :
```vue
<UCard>
  <div class="flex gap-2">
    <img class="h-16 w-16 rounded-full" />
    <div>
      <h2>Nom</h2>
      <p>Rôle</p>
      <p>Organisation</p>
      <p>Date</p>
    </div>
  </div>
</UCard>
```

**Skeleton loader** :
```vue
<template v-if="loading">
  <UCard
    v-for="i in 5"
    :key="`skeleton-${i}`"
    class="custom-shadow"
  >
    <div class="flex flex-row gap-2 animate-pulse">
      <!-- Photo circulaire -->
      <div
        class="h-16 w-16 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 md:h-20 md:w-20"
      ></div>
      <!-- Texte -->
      <div class="flex-grow space-y-2">
        <div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div class="h-3 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
        <div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-600"></div>
        <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-600"></div>
      </div>
    </div>
  </UCard>
</template>
```

**Utilisé dans** :
- [pages/nomination-senegal/index.vue](../../app/pages/nomination-senegal/index.vue) (ligne 342-363)
- `pages/assemblee-nationale/deputes.vue` (à adapter)

---

### 2. Carte document (PDF/fichiers)

**Structure réelle** :
```vue
<UCard>
  <div class="flex gap-2">
    <div class="h-24 w-16"><!-- Icône PDF --></div>
    <div>
      <h3>Titre document</h3>
      <p>Type</p>
      <p>Date</p>
      <p>Taille</p>
    </div>
  </div>
</UCard>
```

**Skeleton loader** :
```vue
<template v-if="loading">
  <UCard
    v-for="i in 5"
    :key="`skeleton-${i}`"
    class="custom-shadow"
  >
    <div class="flex gap-2 animate-pulse">
      <!-- Icône document rectangulaire -->
      <div class="h-24 w-16 flex-shrink-0 rounded bg-gray-300 dark:bg-gray-700"></div>
      <!-- Texte -->
      <div class="flex-grow space-y-2">
        <div class="h-5 w-4/5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div class="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-600"></div>
        <div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-600"></div>
        <div class="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-600"></div>
      </div>
    </div>
  </UCard>
</template>
```

**Utilisé dans** :
- `pages/documents/public.vue`
- `pages/documents/journal-officiel.vue`

---

### 3. Carte actualité (image + titre + description)

**Structure réelle** :
```vue
<UCard>
  <img class="h-48 w-full object-cover" />
  <h3>Titre</h3>
  <p>Description courte</p>
  <p>Date</p>
</UCard>
```

**Skeleton loader** :
```vue
<template v-if="loading">
  <UCard
    v-for="i in 6"
    :key="`skeleton-${i}`"
    class="custom-shadow"
  >
    <div class="animate-pulse">
      <!-- Image -->
      <div class="h-48 w-full rounded-t bg-gray-300 dark:bg-gray-700"></div>
      <!-- Contenu -->
      <div class="space-y-2 p-4">
        <div class="h-5 w-4/5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
        <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600"></div>
        <div class="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-600"></div>
      </div>
    </div>
  </UCard>
</template>
```

**Utilisé dans** :
- `pages/actualites/index.vue`

---

### 4. Liste simple (texte seulement)

**Structure réelle** :
```vue
<ul>
  <li v-for="item in items">
    <h4>Titre</h4>
    <p>Détail</p>
  </li>
</ul>
```

**Skeleton loader** :
```vue
<template v-if="loading">
  <ul class="space-y-3">
    <li
      v-for="i in 8"
      :key="`skeleton-${i}`"
      class="animate-pulse"
    >
      <div class="h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
      <div class="mt-1 h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
    </li>
  </ul>
</template>
```

---

### 5. Tableau

**Structure réelle** :
```vue
<table>
  <tbody>
    <tr v-for="row in data">
      <td>Colonne 1</td>
      <td>Colonne 2</td>
      <td>Colonne 3</td>
    </tr>
  </tbody>
</table>
```

**Skeleton loader** :
```vue
<template v-if="loading">
  <tbody>
    <tr v-for="i in 10" :key="`skeleton-${i}`" class="animate-pulse">
      <td>
        <div class="h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
      </td>
      <td>
        <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
      </td>
      <td>
        <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600"></div>
      </td>
    </tr>
  </tbody>
</template>
```

---

## 🎨 Classes Tailwind essentielles

### Animation
```css
animate-pulse  /* Animation de pulsation (Tailwind built-in) */
```

### Couleurs skeleton
```css
/* Mode clair */
bg-gray-300  /* Élément principal (titre, gros bloc) */
bg-gray-200  /* Éléments secondaires (sous-texte) */

/* Mode sombre */
dark:bg-gray-700  /* Élément principal */
dark:bg-gray-600  /* Éléments secondaires */
```

### Dimensions courantes
```css
h-3   /* Petit texte (12px) */
h-4   /* Texte moyen (16px) */
h-5   /* Titre petit (20px) */
h-6   /* Titre moyen (24px) */

w-1/4  w-1/3  w-1/2  w-2/3  w-3/4  w-full  /* Largeurs variées */
```

### Formes
```css
rounded         /* Légèrement arrondi */
rounded-full    /* Cercle (photos) */
rounded-t       /* Arrondi haut (images) */
```

---

## 📏 Bonnes pratiques

### 1. **Nombre de skeletons**
```vue
<!-- ✅ BON : Affiche 5 skeletons (1 écran environ) -->
<template v-if="loading">
  <UCard v-for="i in 5" :key="`skeleton-${i}`">...</UCard>
</template>

<!-- ❌ MAUVAIS : Trop de skeletons (lag) -->
<template v-if="loading">
  <UCard v-for="i in 50" :key="`skeleton-${i}`">...</UCard>
</template>
```

**Règle** : Afficher 5-10 skeletons max (ce qui tient dans 1 viewport)

---

### 2. **Respecter la structure réelle**
```vue
<!-- ✅ BON : Même structure que la carte réelle -->
<div class="flex gap-2">
  <div class="h-16 w-16 rounded-full"></div>  <!-- Photo -->
  <div class="space-y-2">                     <!-- Texte -->
    <div class="h-4 w-3/4"></div>
    <div class="h-3 w-full"></div>
  </div>
</div>

<!-- ❌ MAUVAIS : Structure différente -->
<div class="grid">
  <div class="h-10 w-10"></div>
  <div class="h-2 w-1/2"></div>
</div>
```

---

### 3. **Variété des largeurs**
```vue
<!-- ✅ BON : Largeurs variées (naturel) -->
<div class="h-4 w-3/4"></div>
<div class="h-3 w-full"></div>
<div class="h-3 w-1/2"></div>
<div class="h-3 w-2/3"></div>

<!-- ❌ MAUVAIS : Toutes les mêmes largeurs (artificiel) -->
<div class="h-4 w-full"></div>
<div class="h-4 w-full"></div>
<div class="h-4 w-full"></div>
```

---

### 4. **Dark mode**
```vue
<!-- ✅ BON : Support dark mode -->
<div class="bg-gray-300 dark:bg-gray-700"></div>

<!-- ❌ MAUVAIS : Pas de dark mode -->
<div class="bg-gray-300"></div>
```

---

### 5. **Accessibilité**
```vue
<!-- ✅ BON : Attribut aria pour les lecteurs d'écran -->
<div v-if="loading" role="status" aria-label="Chargement en cours">
  <UCard v-for="i in 5" :key="`skeleton-${i}`">
    <!-- Skeleton -->
  </UCard>
</div>

<!-- ❌ MAUVAIS : Pas d'indication pour lecteurs d'écran -->
<div v-if="loading">
  <UCard v-for="i in 5" :key="`skeleton-${i}`">...</UCard>
</div>
```

---

## 🔧 Template réutilisable

Crée un composant générique :

```vue
<!-- components/SkeletonCard.vue -->
<template>
  <UCard class="custom-shadow">
    <div class="flex flex-row gap-2 animate-pulse">
      <!-- Photo circulaire (optionnel) -->
      <div
        v-if="withPhoto"
        class="h-16 w-16 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 md:h-20 md:w-20"
      ></div>
      <!-- Texte -->
      <div class="flex-grow space-y-2">
        <div
          v-for="(line, idx) in lines"
          :key="idx"
          :class="[
            'rounded bg-gray-300 dark:bg-gray-700',
            line.height,
            line.width,
            idx > 0 && 'bg-gray-200 dark:bg-gray-600',
          ]"
        ></div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  withPhoto?: boolean
  lines?: Array<{ height: string; width: string }>
}>()

// Valeurs par défaut
const lines = defineProps().lines || [
  { height: 'h-4', width: 'w-3/4' },
  { height: 'h-3', width: 'w-full' },
  { height: 'h-3', width: 'w-1/2' },
  { height: 'h-3', width: 'w-2/3' },
]
</script>
```

**Utilisation** :
```vue
<template v-if="loading">
  <SkeletonCard
    v-for="i in 5"
    :key="`skeleton-${i}`"
    :with-photo="true"
  />
</template>
```

---

## 📚 Ressources

- [Nuxt UI Skeleton](https://ui.nuxt.com/components/skeleton) (composant natif)
- [Tailwind Animation](https://tailwindcss.com/docs/animation#pulse)
- [UX Skeleton Screens](https://www.smashingmagazine.com/2020/04/skeleton-screens-react/)

---

## ✅ Checklist migration

Lors de la migration d'une page :

- [ ] Identifier la structure réelle des cartes
- [ ] Créer un skeleton loader identique
- [ ] Tester en mode clair ET sombre
- [ ] Vérifier l'accessibilité (aria-label)
- [ ] Limiter à 5-10 skeletons
- [ ] Supprimer les messages "Chargement..."

---

## 🎯 Pages à migrer (TODO)

- [ ] `pages/documents/public.vue`
- [ ] `pages/documents/journal-officiel.vue`
- [ ] `pages/actualites/index.vue`
- [ ] `pages/assemblee-nationale/deputes.vue`
- [ ] `pages/budget-senegal/index.vue`
- [x] `pages/nomination-senegal/index.vue` ✅

---

**Dernière mise à jour** : 2025-01-12
