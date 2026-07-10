# Système de Proxy de Médias et Documents CMS

## Vue d'ensemble

Le système de proxy sert les images et documents du CMS avec des URLs SEO-friendly sans exposer l'URL backend au client. Cela améliore la sécurité, les performances, le SEO et la flexibilité.

## URLs SEO-Optimisées

### Structure des URLs

- **Médias (images, vidéos)** : `/cms/[id-ou-nom-fichier]`
- **Documents (PDFs, docs)** : `/docs/[id-ou-nom-fichier]`

**Note** : Les routes `/medias` et `/documents` sont réservées aux **pages Nuxt**, pas aux assets CMS.

## Architecture

### Configuration Nuxt (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  nitro: {
    // Proxy en développement
    devProxy: process.env.CMS_API_URL ? {
      '/cms': {
        target: `${process.env.CMS_API_URL}/assets`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms/, '')
      },
      '/docs': {
        target: `${process.env.CMS_API_URL}/assets`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/docs/, '')
      }
    } : {}
  },

  // Routes proxy pour la production (URL résolue au build depuis CMS_API_URL)
  routeRules: {
    '/cms/**': {
      proxy: `${process.env.CMS_API_URL || 'https://cms.vie-publique.sn'}/assets/**`,
      headers: { 'cache-control': 'max-age=31536000, immutable' }
    },
    '/docs/**': {
      proxy: `${process.env.CMS_API_URL || 'https://cms.vie-publique.sn'}/assets/**`,
      headers: { 'cache-control': 'max-age=86400' }
    }
  },

  image: {
    domains: ['localhost', 'vie-publique.sn', 'www.vie-publique.sn'],
    alias: { cms: '/cms' }
  }
})
```

### Variable d'environnement

Une seule variable suffit :

```env
# URL de base Directus — sans trailing slash
CMS_API_URL=https://cms.vie-publique.sn
```

> `CMS_API_URL_ASSETS` a été supprimé : il était toujours égal à `CMS_API_URL + "/assets"`.
> Les proxies dérivent l'URL assets automatiquement.

### Routes API Serveur

#### Médias (`server/api/medias/[...path].ts`) — LEGACY

#### Documents (`server/api/docs/[...path].ts`)

Ces routes existent pour compatibilité. Les nouveaux assets passent directement par les proxys Nitro `/cms/` et `/docs/`.

```typescript
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') || ''
  const quality = getQuery(event).quality as string | undefined

  const config = useRuntimeConfig()
  const cmsBase = config.cmsApiUrl || 'https://cms.vie-publique.sn'
  let targetUrl = `${cmsBase}/assets/${path}`

  if (quality) {
    targetUrl += `?quality=${quality}`
  }

  const response = await $fetch.raw(targetUrl, { responseType: 'arrayBuffer' })
  setHeaders(event, { 'Cache-Control': 'public, max-age=31536000, immutable' })
  return response._data
})
```

## Utilisation

### 1. `useCmsImage()` — URLs d'images

```typescript
// Sans transformation
const imageUrl = useCmsImage('image-id-123')
// → /cms/image-id-123

// Avec qualité
const imageUrl = useCmsImage('image-id-123', 70)
// → /cms/image-id-123?quality=70

// URL absolue (meta tags)
const absoluteUrl = useCmsImageAbsolute('image-id-123', 80)
// → https://www.vie-publique.sn/cms/image-id-123?quality=80
```

### 2. `useCmsFile()` — URLs de documents

```typescript
const pdfUrl = useCmsFile('rapport-2024.pdf')
// → /docs/rapport-2024.pdf

openCmsFile('rapport.pdf', 'Rapport Budget 2024')  // nouvel onglet
downloadCmsFile('document.pdf', 'Mon Document.pdf') // téléchargement
```

### 3. Composant `CmsImage` (recommandé)

```vue
<CmsImage :src="article.cover_image" :alt="article.title" />
<CmsImage :src="article.cover_image" :quality="70" class="h-48 w-full object-cover" />
<CmsImage :src="article.cover_image" :fallback="'/custom-placeholder.jpg'" />
<CmsImage :src="externalImageUrl" :use-proxy="false" />  <!-- URL externe -->
```

#### Props

| Prop             | Type               | Défaut                  | Description               |
| ---------------- | ------------------ | ----------------------- | ------------------------- |
| `src`            | `string \| null`   | —                       | ID ou chemin de l'image   |
| `alt`            | `string`           | `'Image'`               | Texte alternatif          |
| `quality`        | `number`           | —                       | Qualité image (1-100)     |
| `fallback`       | `string`           | `'/default-image-2.gif'`| Image de fallback         |
| `useProxy`       | `boolean`          | `true`                  | Utiliser le proxy CMS     |
| `loading`        | `'lazy' \| 'eager'`| `'lazy'`                | Mode de chargement        |
| `width`, `height`| `number \| string` | —                       | Dimensions                |
| `sizes`          | `string`           | —                       | Attribut sizes responsive |

### 4. `NuxtImg` avec provider

```vue
<NuxtImg provider="cms" :src="article.cover_image" :quality="70" />
```

### 5. `<img>` HTML

```vue
<img :src="useCmsImage(article.cover_image, 60)" :alt="article.title" />
```

## Migration depuis l'ancien système

```vue
<!-- AVANT -->
<img :src="getImageUrl(article.cover_image)" />
<img :src="$directusImageUrl(article.cover_image, '50')" />
<img :src="`${config.public.cmsApiUrl}/assets/${imageId}`" />

<!-- APRÈS -->
<CmsImage :src="article.cover_image" />
<CmsImage :src="article.cover_image" :quality="50" />
<CmsImage :src="imageId" />
```

```typescript
// AVANT
const pdfUrl = computed(() => `${config.public.cmsApiUrl}/assets/${document.value.file}`)

// APRÈS
const pdfUrl = computed(() => useCmsFile(document.value.file))
```

## Recommandations de qualité

| Qualité | Usage                        |
| ------- | ---------------------------- |
| 20–40   | Miniatures, listes compactes |
| 50–60   | Cartes                       |
| 70–80   | Contenu standard             |
| 85–95   | Hero / image principale      |

## Convention d'URL — règle absolue

Toutes les URLs **sans trailing slash** :

```env
✅ CMS_API_URL=https://cms.vie-publique.sn
❌ CMS_API_URL=https://cms.vie-publique.sn/
```

## Réseau interne Docker (production)

En production sur Coolify, le front et Directus sont sur la même VM. Pour éviter les allers-retours réseau inutiles, pointer `CMS_API_URL` vers le nom de container Docker interne :

```env
CMS_API_URL=http://directus-f4w0848gg4wskwgks48o4sgs:8055
```

Prérequis : activer **"Connect To Predefined Network"** sur les deux services dans Coolify. Le changement nécessite un **redéploiement complet** (routeRules est résolu au build).

## Dépannage

### Erreur 404 IPX_FILE_NOT_FOUND

```vue
<!-- ❌ -->
<NuxtImg :src="useCmsImage(image)" />
<!-- ✅ -->
<CmsImage :src="image" />
```

### Image ne se charge pas

1. Vérifier `CMS_API_URL` dans les variables d'environnement
2. Vérifier que le fichier existe dans Directus
3. Consulter les logs serveur Nitro
