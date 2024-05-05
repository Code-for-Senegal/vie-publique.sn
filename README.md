# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Stack

- [Vue 3](https://vuejs.org)

- [Nuxt 3](https://nuxt.com)
    - [Nuxt UI](https://ui.nuxt.com) pour les composants UI
    - [Nuxt SEO](https://nuxtseo.com) pour optimiser le référencement naturel 
    - [Nuxt Content](https://content.nuxt.com/) pour gérer du contenu dynamique en markdown
    - [nuxt-gtag](https://nuxt.com/modules/gtag) pour le suivi Google Analytics

- [Tailwind css](https://tailwindcss.com/) comme framework css

* Nom de domaine
    - DNS vie-publique.sn acheté via OVH

* Hébergement
    - projet déployé chez [Vercel](https://vercel.com)

## Prerequisites

- Node.js > v18.0.0

## structure du projet 

```graphql
nuxt-senegal-reports/
├── assets/            # Ressources non compilées comme les styles et les images
├── components/        # Composants Vue réutilisables
├── layouts/           # Modèles de mise en page pour ton application
├── pages/             # Les pages de ton application basées sur les routes
├── plugins/           # Plugins JavaScript que tu souhaites exécuter avant l'instance root Vue
├── static/            # Fichiers statiques servis directement depuis la racine
└── store/             # État global (Vuex Store)
```

## Creation

Project was created with this command

```bash
pnpm dlx nuxi@latest init nuxt-senegal-reports
```

nexui was added with following command

```bash
pnpm dlx nuxi@latest module add ui
```
others module

```bash
pnpm dlx nuxi@latest module add content
pnpm dlx nuxi@latest module add sitemap
pnpm dlx nuxi@latest module add seo

```

## Setup

Make sure to install the dependencies:

```bash

# npm
cd nuxt-senegal-reports
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Environnement variable .env file

tu peux créer un fichier .env à la racine de ton projet et y définir la variable d'environnement pour l'ID de Google Analytics ou le dns

exemple: 
```
GTAG_ID=G-XXXXXX
NUXT_PUBLIC_SITE_URL=https://www.vie-publique.sn
SHOW_PINNED_PEOLPLES=false
```

non obligatoire en environnement de développement

## Development Server with Docker

Start the development server on `http://localhost:3000`:

```bash
docker-compose up
docker compose -f docker-compose.dev.yml up --build

```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
