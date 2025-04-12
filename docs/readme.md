# Structure du projet Victimes de Manifestations au Sénégal

## Architecture technique

Cette application est développée avec les technologies suivantes :

- **Nuxt.js v3** - Framework Vue.js avec rendu côté serveur
- **TypeScript** - Pour le typage statique
- **Tailwind CSS** - Pour le styling
- **Nuxt Content** - Pour gérer le contenu statique (pages à propos, etc.)
- **Pinia** - Pour la gestion d'état
- **Leaflet** - Pour les cartes interactives
- **Vue-i18n** - Pour l'internationalisation (français par défaut)

## Structure des dossiers

```
victimes-senegal/
├── assets/                 # Ressources statiques (images, fonts, etc.)
├── components/             # Composants Vue réutilisables
│   ├── layout/            # Composants de mise en page (Header, Footer, etc.)
│   ├── ui/                # Composants d'interface utilisateur
│   └── victims/           # Composants spécifiques aux victimes
├── composables/            # Fonctions réutilisables avec la composition API
├── content/                # Contenu statique pour Nuxt Content
├── layouts/                # Layouts de l'application
├── middleware/             # Middleware Nuxt
├── pages/                  # Pages de l'application
├── plugins/                # Plugins Nuxt
├── public/                 # Fichiers publics
├── server/                 # API et middleware côté serveur
├── stores/                 # Stores Pinia
├── types/                  # Types TypeScript
├── utils/                  # Fonctions utilitaires
├── .env                    # Variables d'environnement (non versionné)
├── .env.example            # Exemple de variables d'environnement
├── nuxt.config.ts          # Configuration Nuxt
└── tailwind.config.js      # Configuration Tailwind CSS
```

## Types de données

```typescript
// types/victim.ts
export interface Victim {
  id: string;
  prenom_nom: string;
  status: "draft" | "published";
  region: string;
  departement: string;
  commune: string;
  cause_mort: string;
  presentation: string; // HTML content
  localisation: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  date_mort: string; // YYYY-MM-DD
  age: number | null;
  profession: string | null;
}

// types/news.ts
export interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  tags: string[];
}

// types/manifestation.ts
export interface Manifestation {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image?: string;
}
```

## Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```
NUXT_PUBLIC_API_URL=https://cms.vie-publique.sn/items
NUXT_API_TOKEN=xxxx
```

Assurez-vous également de créer un fichier `.env.example` avec la même structure mais sans les valeurs sensibles :

```
NUXT_PUBLIC_API_URL=
NUXT_API_TOKEN=
```

## Configuration de Nuxt

Le fichier `nuxt.config.ts` contient toute la configuration nécessaire pour l'application.
