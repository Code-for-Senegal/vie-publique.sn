# Guide de Migration vers le Proxy d'Images

## 🎯 Principe Fondamental

**Les APIs serveur retournent uniquement des IDs, jamais des URLs complètes.**

Les composables côté client (`useCmsImage`, `useCmsFile`) transforment ces IDs en URLs proxy (`/medias/`, `/docs/`) qui sont ensuite redirigées par Nitro vers le CMS.

**Architecture :**
```
API Directus → API Serveur Nuxt (retourne ID) → Composable Client (transforme en /medias/ID) → Proxy Nitro → CMS
```

---

## ⚠️ CRITIQUE : Migration des APIs Serveur

### ❌ Avant (INCORRECT - expose l'URL Docker interne au navigateur)

```typescript
// server/api/news/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const newsData = await directus.request(readItems("news"));

  const transformedNews = newsData.map((article) => ({
    id: article.id,
    title: article.title,
    // ❌ Construction d'URL complète côté serveur
    cover_image: `${config.cmsApiUrl}/assets/${article.cover_image}`,
  }));

  return { data: transformedNews };
});
```

**Problème** :
- Pendant le SSR dans Docker, `config.cmsApiUrl` = `http://directus:8055`
- Le HTML envoyé au navigateur contient `<img src="https://directus:8055/assets/abc-123">`
- Le navigateur ne peut pas résoudre le nom DNS `directus` (nom de service Docker interne)
- **Erreur** : `ERR_NAME_NOT_RESOLVED`

### ✅ Après (CORRECT - retourne uniquement l'ID)

```typescript
// server/api/news/index.get.ts
export default defineEventHandler(async (event) => {
  const newsData = await directus.request(readItems("news"));

  const transformedNews = newsData.map((article) => ({
    id: article.id,
    title: article.title,
    // ✅ ID uniquement - le composable client transformera en URL proxy
    cover_image: article.cover_image,
  }));

  return { data: transformedNews };
});
```

**Résultat** :
- L'API retourne `{ cover_image: "abc-123-def-456" }`
- Le composable `useCmsImage("abc-123-def-456")` retourne `/medias/abc-123-def-456`
- Le navigateur charge `/medias/abc-123-def-456`
- Le proxy Nitro redirige vers `https://cms.vie-publique.sn/assets/abc-123-def-456`

---

## 🔄 Migration des Pages et Composants Vue

### 1. **Remplacer les constructions d'URLs directes**

#### ❌ Avant :
```vue
<script setup>
const config = useRuntimeConfig();

const pdfUrl = computed(() => {
  if (!article.value?.document?.file) return "";
  return `${config.public.cmsApiUrl}/assets/${article.value.document.file}`;
});

const imageUrl = computed(() => {
  return article.value.cover_image
    ? `${config.public.cmsApiUrl}/assets/${article.value.cover_image}`
    : defaultImage;
});
</script>

<template>
  <img :src="imageUrl" />
  <a :href="pdfUrl">Télécharger</a>
</template>
```

#### ✅ Après :
```vue
<script setup>
const pdfUrl = computed(() => {
  if (!article.value?.document?.file) return "";
  return useCmsFile(article.value.document.file);
});

const imageUrl = computed(() => {
  return article.value.cover_image
    ? useCmsImage(article.value.cover_image)
    : defaultImage;
});
</script>

<template>
  <img :src="imageUrl" />
  <a :href="pdfUrl">Télécharger</a>
</template>
```

### 2. **Remplacer dans les objets de données statiques**

#### ❌ Avant :
```typescript
const config = useRuntimeConfig();

const coalitions = [
  {
    name: "PASTEF",
    head_of_list: {
      photo_url: `${config.public.cmsApiUrl}/assets/4e1c3427-ae2d-4090-a5fb-8460f7ef8ac3`,
      full_name: "OUSMANE SONKO",
    },
  },
];
```

#### ✅ Après :
```typescript
const coalitions = [
  {
    name: "PASTEF",
    head_of_list: {
      photo_url: useCmsImage('4e1c3427-ae2d-4090-a5fb-8460f7ef8ac3'),
      full_name: "OUSMANE SONKO",
    },
  },
];
```

### 3. **Remplacer `$directusImageUrl()` (plugin deprecated)**

#### ❌ Avant :
```vue
<template>
  <img :src="$directusImageUrl(article.cover_image, '50')" />
</template>
```

#### ✅ Après :
```vue
<template>
  <img :src="useCmsImage(article.cover_image, 50)" />
</template>
```

### 4. **Pour les meta tags (URLs absolues)**

#### ❌ Avant :
```vue
const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  distribution: {
    "@type": "DataDownload",
    contentUrl: `${config.public.cmsApiUrl}/assets/e703d8f8-d175-4950-a909-92d567782b47/medias-2025.pdf`,
  },
};
```

#### ✅ Après :
```vue
const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  distribution: {
    "@type": "DataDownload",
    contentUrl: useCmsFileAbsolute('e703d8f8-d175-4950-a909-92d567782b47/medias-2025.pdf'),
  },
};
```

---

## 📋 Checklist de Migration Complète

### Serveur (APIs dans `/server/api/`)
- [ ] Chercher toutes les occurrences de `${config.cmsApiUrl}/assets/`
- [ ] Remplacer par retour d'ID uniquement
- [ ] Vérifier : `grep -r "config.cmsApiUrl}/assets/" server/api/`

**Fichiers modifiés dans ce projet :**
- ✅ `server/api/news/index.get.ts`
- ✅ `server/api/news/[id].get.ts`
- ✅ `server/api/documents/index.get.ts`
- ✅ `server/api/documents/[id].get.ts`
- ✅ `server/api/medias/index.get.ts`
- ✅ `server/api/medias/[id].get.ts`
- ✅ `server/api/nominations/index.get.ts`
- ✅ `server/api/nominations/[id].get.ts`
- ✅ `server/api/partners/index.get.ts`
- ✅ `server/api/assembly/**/*.ts` (7 fichiers)

### Client (Pages et composants dans `/app/`)
- [ ] Chercher `${config.public.cmsApiUrl}/assets/`
- [ ] Remplacer par `useCmsImage()` ou `useCmsFile()`
- [ ] Vérifier : `grep -r "config.public.cmsApiUrl" app/`

**Fichiers modifiés dans ce projet :**
- ✅ `app/pages/actualites/[id]/[slug].vue`
- ✅ `app/pages/medias/index.vue`
- ✅ `app/pages/elections/legislatives/resultats/index.vue`

### Composables
- [ ] Supprimer les dépendances à `config.public.cmsApiUrl`
- ✅ `app/composables/useCmsImage.ts` - Simplifié
- ✅ `app/composables/useCmsFile.ts` - Simplifié

---

## 🔧 Configuration Docker

### Docker Compose (Production)

```yaml
viepublique:
  environment:
    # ✅ Serveur uniquement (réseau Docker interne)
    CMS_API_URL: 'http://directus:8055'

    # ❌ NE PAS ajouter de variable publique
    # NUXT_PUBLIC_CMS_API_URL: 'https://cms.vie-publique.sn'  # Non nécessaire !
```

**Explication** :
- `CMS_API_URL` : Utilisé par les APIs serveur pour appeler Directus en interne
- Pas de variable publique = Aucune URL du CMS exposée au client
- Les composables transforment les IDs en URLs proxy sans avoir besoin de connaître l'URL du CMS

---

## 🎯 Avantages de cette Architecture

### 🔒 Sécurité
- **Aucune URL du CMS exposée** au navigateur
- **Pas de variable publique** contenant l'URL backend
- **Protection contre les attaques directes** sur le CMS

### ⚡ Performance
- **Cache navigateur optimisé** : `max-age=31536000` pour images, `86400` pour documents
- **URLs proxy unifiées** : Toutes les ressources sur le même domaine (pas de CORS)
- **Compression automatique** via Nitro

### 🌍 SEO
- **URLs descriptives** : `/medias/photo.jpg` au lieu de `/api/cms-images/uuid`
- **Partage social amélioré** : URLs plus engageantes
- **Indexation optimisée** : Moteurs de recherche préfèrent les URLs sémantiques

### 🔧 Maintenabilité
- **Un seul point de configuration** : `CMS_API_URL` côté serveur
- **Migration CMS simplifiée** : Changer uniquement la config serveur
- **Code unifié** : Tous les assets gérés par les mêmes composables

---

## 🔍 Commandes de Vérification

### Trouver les constructions d'URLs restantes

```bash
# APIs serveur
grep -r "config.cmsApiUrl}/assets/" server/api/

# Pages et composants
grep -r "config.public.cmsApiUrl" app/

# Vérifier qu'il n'y a plus d'URLs directes
grep -r "cms.vie-publique.sn/assets" app/ server/

# Trouver les utilisations du plugin deprecated
grep -r "$directusImageUrl" app/
```

### Résultat attendu après migration
```bash
✅ Aucune construction d'URL trouvée dans les APIs
✅ Plus aucune référence à config.public.cmsApiUrl
```

---

## 📝 Exemples Complets

### Exemple 1 : Page d'actualité

```vue
<script setup>
const { id } = useRoute().params;
const { data } = await useFetch(`/api/news/${id}`);
const article = computed(() => data.value?.data);

// ✅ Les composables transforment les IDs en URLs proxy
const imageUrl = computed(() => {
  return article.value?.cover_image
    ? useCmsImageAbsolute(article.value.cover_image)
    : defaultImage;
});

const pdfUrl = computed(() => {
  if (!article.value?.document?.file) return "";
  return useCmsFile(article.value.document.file);
});

// SEO Meta Tags avec URLs absolues
useSeoMeta({
  ogImage: imageUrl.value,
});
</script>

<template>
  <article>
    <img :src="useCmsImage(article.cover_image)" :alt="article.title" />
    <h1>{{ article.title }}</h1>
    <div v-html="article.content"></div>
    <a v-if="pdfUrl" :href="pdfUrl" target="_blank">Télécharger le PDF</a>
  </article>
</template>
```

### Exemple 2 : Liste avec images

```vue
<script setup>
const { data } = await useFetch('/api/news', {
  query: { limit: 10 }
});
const articles = computed(() => data.value?.data || []);
</script>

<template>
  <div v-for="article in articles" :key="article.id">
    <img
      :src="useCmsImage(article.cover_image, 60)"
      :alt="article.title"
      loading="lazy"
    />
    <h2>{{ article.title }}</h2>
  </div>
</template>
```

---

## ✅ Migration Terminée

Après avoir suivi ce guide :
- ✅ **15 fichiers API serveur** modifiés
- ✅ **3 pages Vue** corrigées
- ✅ **2 composables** simplifiés
- ✅ **0 URL du CMS exposée** au client
- ✅ **Architecture sécurisée** et performante
