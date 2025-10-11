# Guide de Migration vers le Proxy d'Images

## 🔄 Remplacement des méthodes existantes

### 1. **Remplacer `getImageUrl()`**

#### Avant :
```vue
<script setup>
const getImageUrl = (imageId: string) => {
  return `${config.public.cmsApiUrl}/assets/${imageId}`;
};
</script>

<template>
  <img :src="getImageUrl(article.cover_image)" />
</template>
```

#### Après :
```vue
<script setup>
// Plus besoin de définir getImageUrl, utilisez directement le composable
</script>

<template>
  <img :src="useCmsImage(article.cover_image)" />
</template>
```

### 2. **Remplacer `$directusImageUrl()`**

#### Avant :
```vue
<template>
  <img :src="$directusImageUrl(article.cover_image, '50')" />
</template>
```

#### Après :
```vue
<template>
  <!-- Si vous n'avez pas besoin de transformation -->
  <img :src="useCmsImage(article.cover_image)" />
  
  <!-- Si vous avez besoin de transformation, ajoutez les params -->
  <img :src="useCmsImage(`${article.cover_image}?width=50`)" />
</template>
```

### 3. **URLs directes du CMS**

#### Avant :
```vue
<template>
  <img :src="`https://cms.vie-publique.sn/assets/${imageId}`" />
</template>
```

#### Après :
```vue
<template>
  <img :src="useCmsImage(imageId)" />
</template>
```

### 4. **Dans les computed properties**

#### Avant :
```vue
const image = computed(() => {
  return article.value.cover_image 
    ? `${config.public.cmsApiUrl}/assets/${article.value.cover_image}`
    : defaultImage;
});
```

#### Après :
```vue
const image = computed(() => {
  return article.value.cover_image 
    ? useCmsImage(article.value.cover_image)
    : defaultImage;
});
```

### 5. **Pour les meta tags (URLs absolues)**

#### Avant :
```vue
<meta property="og:image" :content="`${siteUrl}/assets/${image}`" />
```

#### Après :
```vue
<meta property="og:image" :content="useCmsImageAbsolute(image)" />
```

## 📝 Exemples concrets

### Page d'actualité individuelle
```vue
<script setup>
// Supprimez cette fonction
// const getImageUrl = (imageId: string) => {
//   return `${config.public.cmsApiUrl}/assets/${imageId}`;
// };
</script>

<template>
  <!-- Dans le template -->
  <img 
    :src="useCmsImage(article.cover_image)"
    :alt="article.title"
  />
  
  <!-- Pour les meta tags -->
  <meta 
    itemprop="url" 
    :content="useCmsImageAbsolute(article.cover_image)"
  >
</template>
```

### Liste d'actualités
```vue
<template>
  <div v-for="article in articles" :key="article.id">
    <img 
      :src="useCmsImage(article.cover_image)"
      :alt="article.title"
      loading="lazy"
    />
  </div>
</template>
```

## 🎯 Avantages du nouveau système

1. **Sécurité** : L'URL du CMS n'est plus exposée
2. **Performance** : Cache optimisé avec headers appropriés
3. **Simplicité** : Une seule méthode à utiliser partout
4. **Flexibilité** : Facile de changer de CMS sans modifier tout le code

## ⚡ Checklist de migration

- [ ] Rechercher tous les `getImageUrl` et les remplacer par `useCmsImage`
- [ ] Rechercher tous les `$directusImageUrl` et les remplacer
- [ ] Rechercher `cms.vie-publique.sn/assets` et remplacer par le proxy
- [ ] Vérifier les meta tags et utiliser `useCmsImageAbsolute` si nécessaire
- [ ] Tester les images en développement et production

## 🔍 Commandes utiles pour trouver les occurrences

```bash
# Trouver toutes les utilisations de getImageUrl
grep -r "getImageUrl" pages/ components/

# Trouver les URLs directes du CMS
grep -r "cms.vie-publique.sn/assets" pages/ components/

# Trouver les utilisations de $directusImageUrl
grep -r "$directusImageUrl" pages/ components/
```