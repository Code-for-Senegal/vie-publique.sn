# Feature Podcasts

## Description

Page dédiée aux podcasts Vie Publique Sénégal : Lives, Spaces et interviews en replay.

## Pages

| Route | Description |
|-------|-------------|
| `/podcasts` | Liste de tous les podcasts avec pagination |
| `/podcasts/[id]/[slug]` | Page détail d'un podcast avec lecteur YouTube intégré |

## Architecture

```
app/
├── pages/podcasts/
│   ├── index.vue              # Liste des podcasts
│   └── [id]/[slug].vue        # Détail podcast
├── components/Podcast/
│   ├── PodcastCard.vue        # Card podcast (grille + scroll)
│   ├── PodcastScrollRow.vue   # Carousel horizontal
│   └── PodcastPlayerModal.vue # Modal lecteur YouTube
├── composables/podcasts/
│   └── usePodcasts.ts         # Composable fetch & état
server/api/podcasts/
├── index.get.ts               # GET /api/podcasts (liste)
└── [id].get.ts                # GET /api/podcasts/:id (détail)
```

## API

### GET /api/podcasts

Liste paginée des podcasts.

**Query params** :
- `page` : numéro de page (défaut: 1)
- `limit` : items par page (défaut: 12)
- `sortBy` : tri (défaut: `-date_published`)
- `search` : recherche texte
- `featured` : `true` pour podcasts à la une

**Réponse** :
```json
{
  "data": [{ "id", "title", "slug", "youtube_video_id", ... }],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### GET /api/podcasts/:id

Détail d'un podcast.

## Composable usePodcasts

```typescript
// Liste avec pagination
const { podcasts, loading, currentPage, totalPages } = usePodcasts();

// Podcasts featured
const { featuredPodcasts } = usePodcasts({ featured: true });

// Détail par ID
const { podcast, loading } = usePodcasts({ id: '123' });
```

## Images

Les images des cards utilisent une logique de fallback :

1. **cover_image** du CMS (si disponible)
2. **Miniature YouTube** extraite depuis `youtube_video_id`
3. **Image par défaut** `/default-image-2.gif`

```typescript
// PodcastCard.vue
const coverImageUrl = computed(() => {
  if (!props.podcast.cover_image) {
    return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }
  return useCmsImage(props.podcast.cover_image);
});
```

## Collection CMS

Table Directus : `vp_podcasts`

| Champ | Type | Description |
|-------|------|-------------|
| id | int | ID unique |
| title | string | Titre du podcast |
| slug | string | URL-friendly |
| description | text | Description HTML |
| youtube_video_id | string | ID vidéo YouTube |
| youtube_url | string | URL complète YouTube |
| duration | string | Durée (ex: "1:30:06") |
| date_published | datetime | Date publication |
| cover_image | uuid | Image cover (optionnel) |
| tags | json | Tags ["débat", "interview"] |
| featured | boolean | À la une |
| view_count | int | Nombre de vues |
| status | string | published/draft |

## SEO

- Schema.org : `CollectionPage`, `VideoObject`, `BreadcrumbList`
- Meta tags OpenGraph et Twitter Cards
- Breadcrumb navigation
- URLs canoniques
