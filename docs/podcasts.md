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

---

## Import YouTube → Directus

Script Node.js (ESM) qui synchronise la playlist YouTube du podcast vers la collection `vp_podcasts` dans Directus, **sans utiliser l'API YouTube**.

**Fichier** : [vpsn-automation / import-podcasts-ytdlp.js](https://github.com/vie-publique-senegal/vpsn-automation/blob/main/import-podcasts-ytdlp.js)


### Prérequis

1. **yt-dlp** installé sur la machine :
   ```bash
   pip install yt-dlp          # Python
   brew install yt-dlp         # macOS
   sudo apt install yt-dlp     # Ubuntu/Debian
   choco install yt-dlp        # Windows (Chocolatey)
   ```

2. **Dépendances npm** :
   ```bash
   npm install @directus/sdk axios dotenv
   ```

3. **Variables d'environnement** dans `.env` :
   ```
   CMS_API_URL=url-cms
   CMS_API_KEY=<token-statique-directus>
   ```

### Usage

```bash
node import-podcasts-ytdlp.js
```

### Comment ça fonctionne

#### 1. Récupération de la playlist

```
yt-dlp --dump-json --flat-playlist "<PLAYLIST_URL>"
```

yt-dlp retourne chaque vidéo de la playlist sous forme d'une ligne JSON (mode `--flat-playlist`). Cela donne l'ID de chaque vidéo sans télécharger la vidéo.

**Playlist ciblée** : `https://www.youtube.com/playlist?list=PLeS2cIIeoLLBY-u5vVCxsCIM6ZHYp7ExM`

#### 2. Récupération des détails de chaque vidéo

Pour chaque vidéo de la playlist, une seconde commande est exécutée :

```
yt-dlp --dump-json "https://www.youtube.com/watch?v=<videoId>"
```

Cela retourne les métadonnées complètes : titre, description, durée, date de publication, miniature, nombre de vues.

La durée est convertie de secondes vers le format `HH:MM:SS` / `MM:SS`. La date est convertie du format `YYYYMMDD` vers `YYYY-MM-DD`.

#### 3. Comparaison avec Directus

Avant tout import, le script charge tous les podcasts existants depuis Directus :

```js
readItems('vp_podcasts', { fields: ['id', 'youtube_video_id', 'view_count'], limit: -1 })
```

Un `Map<youtube_video_id, record>` est construit pour des lookups O(1).

#### 4. Logique de synchronisation

Pour chaque vidéo de la playlist :

| Cas | Action |
|-----|--------|
| Vidéo **absente** de Directus | Import complet (thumbnail + création) |
| Vidéo **présente**, vues **changées** | `PATCH` sur `view_count` uniquement |
| Vidéo **présente**, vues **inchangées** | Ignorée (aucune requête) |

#### 5. Upload de la miniature (nouveaux podcasts seulement)

1. Téléchargement de la miniature YouTube via `axios` (en mémoire → fichier temporaire)
2. Upload vers `POST /files` de Directus (multipart/form-data)
3. L'UUID retourné est stocké dans le champ `cover_image` du podcast
4. Le fichier temporaire est supprimé

Dossier temporaire : `/tmp/podcast-thumbnails` (Linux/macOS) ou `%TEMP%\podcast-thumbnails` (Windows)

#### 6. Création du podcast dans Directus

```js
createItem('vp_podcasts', {
  title, slug, description,
  youtube_video_id, youtube_url,
  duration, date_published,
  cover_image,        // UUID du fichier uploadé
  view_count,
  status: 'published',
  featured: false
})
```

Le `slug` est généré depuis le titre : lowercase, sans accents, caractères non-alphanumériques remplacés par `-`, tronqué à 200 caractères.

Une pause de 500 ms est appliquée entre chaque import pour ne pas surcharger Directus.

### Résumé du flux

```
YouTube Playlist
      │
      ▼
yt-dlp --flat-playlist   →  liste des IDs vidéo
      │
      ▼ (pour chaque vidéo)
yt-dlp --dump-json       →  métadonnées complètes
      │
      ├── Vidéo existante dans Directus ?
      │       OUI → PATCH view_count si différent
      │       NON ↓
      │
      ▼
axios GET thumbnail      →  download miniature
      │
      ▼
Directus POST /files     →  upload thumbnail (UUID)
      │
      ▼
Directus createItem      →  nouveau podcast créé
```

