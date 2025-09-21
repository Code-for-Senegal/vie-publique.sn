# Système de Proxy d'Images CMS

## 📋 Vue d'ensemble

Le système de proxy d'images permet de servir les images du CMS sans exposer l'URL backend directement au client. Cela améliore la sécurité, les performances et la flexibilité du système.

## 🔧 Architecture

### Configuration Nuxt (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  nitro: {
    // Proxy en développement
    devProxy: process.env.CMS_API_URL ? {
      '/api/cms-images': {
        target: `${process.env.CMS_API_URL}/assets`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cms-images/, '')
      }
    } : {}
  },
  
  // Routes proxy pour la production
  routeRules: {
    '/api/cms-images/**': { 
      proxy: { 
        to: 'https://cms.vie-publique.sn/assets/**',
        headers: {
          'accept': 'image/*',
          'cache-control': 'max-age=31536000'
        }
      }
    }
  },

  image: {
    providers: {
      cms: {
        provider: '~/providers/cms-image.ts',
        options: {
          baseURL: '/api/cms-images'
        }
      }
    },
    domains: ['localhost', 'vie-publique.sn'],
    alias: {
      cms: '/api/cms-images'
    }
  }
})
```

### Route API Serveur (`server/api/cms-images/[...path].ts`)

```typescript
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') || ''
  const quality = getQuery(event).quality as string | undefined
  
  // Configuration dynamique de l'URL CMS
  let targetUrl = ''
  if (process.env.CMS_API_URL_ASSETS) {
    targetUrl = `${process.env.CMS_API_URL_ASSETS}/${path}`
  } else if (process.env.CMS_API_URL) {
    targetUrl = `${process.env.CMS_API_URL}/assets/${path}`
  }
  
  // Support des transformations Directus
  if (quality) {
    targetUrl += `?quality=${quality}`
  }
  
  // Proxy avec cache optimisé
  const response = await $fetch.raw(targetUrl)
  setHeaders(event, {
    'Cache-Control': 'public, max-age=31536000, immutable'
  })
  
  return response._data
})
```

## 🎯 Utilisation

### 1. Composable `useCmsImage()`

```typescript
// Sans transformation
const imageUrl = useCmsImage('image-id-123')
// Résultat: /api/cms-images/image-id-123

// Avec qualité
const imageUrl = useCmsImage('image-id-123', 70)
// Résultat: /api/cms-images/image-id-123?quality=70

// URL absolue (pour meta tags)
const absoluteUrl = useCmsImageAbsolute('image-id-123', 80)
// Résultat: https://vie-publique.sn/api/cms-images/image-id-123?quality=80
```

### 2. Composant `CmsImage` (Recommandé)

```vue
<template>
  <!-- Usage basique -->
  <CmsImage 
    :src="article.cover_image"
    :alt="article.title"
    class="w-full object-cover"
  />

  <!-- Avec qualité personnalisée -->
  <CmsImage 
    :src="article.cover_image"
    :alt="article.title"
    :quality="70"
    class="h-48 w-full object-cover"
  />

  <!-- Avec fallback personnalisé -->
  <CmsImage 
    :src="article.cover_image"
    :alt="article.title"
    :fallback="'/custom-placeholder.jpg'"
    class="w-full object-cover"
  />

  <!-- Désactiver le proxy (pour URLs externes) -->
  <CmsImage 
    :src="externalImageUrl"
    :use-proxy="false"
    class="w-full object-cover"
  />
</template>
```

#### Props du composant `CmsImage`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `src` | `string \| null` | - | ID ou chemin de l'image |
| `alt` | `string` | `'Image'` | Texte alternatif |
| `quality` | `number` | - | Qualité image (1-100) |
| `fallback` | `string` | `'/default-image-2.gif'` | Image de fallback |
| `useProxy` | `boolean` | `true` | Utiliser le proxy CMS |
| `class` | `string` | - | Classes CSS |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Mode de chargement |
| `width`, `height` | `number \| string` | - | Dimensions |
| `sizes` | `string` | - | Attribut sizes responsive |

### 3. NuxtImg avec provider

```vue
<NuxtImg 
  provider="cms"
  :src="article.cover_image"
  :quality="70"
  class="w-full object-cover"
/>
```

### 4. Image HTML normale

```vue
<img 
  :src="useCmsImage(article.cover_image, 60)"
  :alt="article.title"
  class="w-full object-cover"
/>
```

## 🔄 Migration depuis l'ancien système

### Remplacer `getImageUrl()`

```vue
<!-- AVANT -->
<img :src="getImageUrl(article.cover_image)" />

<!-- APRÈS -->
<CmsImage :src="article.cover_image" />
```

### Remplacer `$directusImageUrl()`

```vue
<!-- AVANT -->
<img :src="$directusImageUrl(article.cover_image, '50')" />

<!-- APRÈS -->
<CmsImage :src="article.cover_image" :quality="50" />
```

### Remplacer les URLs directes

```vue
<!-- AVANT -->
<img :src="`${config.public.cmsApiUrl}/assets/${imageId}`" />

<!-- APRÈS -->
<CmsImage :src="imageId" />
```

## 🎨 Recommandations de qualité

| Usage | Qualité | Description |
|-------|---------|-------------|
| **20-40** | Miniatures | Très petites images, listes compactes |
| **50-60** | Cartes | Images moyennes dans des cartes |
| **70-80** | Contenu | Images de contenu standard |
| **85-95** | Hero/Principal | Images principales haute qualité |

## 🚀 Avantages

### ✅ Sécurité
- URL du CMS cachée aux clients
- Headers de sécurité automatiques
- Pas d'accès direct au backend

### ⚡ Performance
- Cache navigateur 1 an (`max-age=31536000`)
- Headers optimisés (`immutable`)
- Compression automatique

### 🔧 Flexibilité
- Configuration par environnement
- Support des transformations Directus
- Fallback automatique en cas d'erreur

### 🎯 Simplicité
- Composant unifié `CmsImage`
- Migration facile depuis l'ancien système
- Compatible avec NuxtImg et `<img>` standard

## 🔧 Configuration environnement

```env
# Option 1: URL spécifique assets
CMS_API_URL_ASSETS=https://cms.vie-publique.sn/assets

# Option 2: URL base + /assets automatique  
CMS_API_URL=https://cms.vie-publique.sn

# Nuxt public (pour les composables côté client)
CMS_API_URL=https://cms.vie-publique.sn
```

## 📝 Notes importantes

1. **Migration progressive** : L'ancien système continue de fonctionner
2. **Cache optimal** : Images mises en cache 1 an côté navigateur
3. **Erreurs gérées** : Fallback automatique vers image par défaut
4. **SEO friendly** : Support complet des meta tags avec URLs absolues
5. **Responsive** : Compatible avec tous les attributs NuxtImg

## 🛠️ Dépannage

### Erreur 404 IPX_FILE_NOT_FOUND
❌ **Problème** : Utilisation de `NuxtImg` avec `useCmsImage()`
```vue
<NuxtImg :src="useCmsImage(image)" />
```

✅ **Solution** : Utiliser le composant `CmsImage` ou `provider="cms"`
```vue
<CmsImage :src="image" />
<!-- ou -->
<NuxtImg provider="cms" :src="image" />
```

### Image ne se charge pas
1. Vérifier les variables d'environnement `CMS_API_URL*`
2. Vérifier que l'image existe dans Directus
3. Contrôler les logs serveur pour les erreurs de proxy