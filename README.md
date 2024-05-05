# vie-publique.sn

Plateforme Web CivicTech dédiée à la centralisation, la visualisation et l'analyse des rapports publiés sur la gestion des finances publiques au Sénégal. 


## Présentation 

* Objectifs : 
    - simplifier l'accès aux rapports des corps de contrôle 
    - vulgariser les infos qu'elles contiennent
    - participer à combattre la corruption

* Fonctionalités
    - centraliser les rapports provenant de ofnac, ige, cours des comptes et armp
    - télécharger les rapports
    - consulter le résumé d'un rapport
    - consulter un résumé  affaires traités et personnes incriminées sur un rapport
    - lister les personnalités publiques épinglées

* ROADMAP

    - V0 MVP
        - feat: liste des personnes épinglées
        - fix: stockage des pdfs, migrer vers un storage externe
        - fix: stockage des data, migrer vers une bdd externe
        - fix: restructuration du schémas données (rapports, personnes épinglées …)
        - optimisations: SEO, configurer les keyword, metadata, sitemap, robots.txt
        - optimisation: performance, SSR, Cache, CDN, Lazy loading…
        - optimisation: UI/UX, charte graphique, navigation 
    - V1
        - feat: liste des scandales financiers ?
        - feat: liste des décrets officiels ?
        - feat: liste des sites internet publics du Sénégal ?

    - V2
        - Hosting: migrer l’hébergement au Sénégal (datacenter orange ? )
        - Analytics : monitoring des évènements utilisateurs (téléchargement, recherche)


## Stack

- [Vue 3](https://vuejs.org)

- [Nuxt 3](https://nuxt.com)
    - [Nuxt UI](https://ui.nuxt.com) pour les composants UI
    - [Nuxt SEO](https://nuxtseo.com) pour optimiser le référencement naturel 
    - [Nuxt Content](https://content.nuxt.com/) pour gérer du contenu dynamique en markdown
    - [nuxt-gtag](https://nuxt.com/modules/gtag) pour le suivi Google Analytics

- [Tailwind css](https://tailwindcss.com/) comme framework css

* Nom de domaine
    - DNS [vie-publique.sn](https://www.vie-publique.sn) acheté via OVH

* Hébergement
    - projet déployé chez [Vercel](https://vercel.com)

## Structure du projet 

```graphql
vie-publique.sn/
├── assets/            # Ressources non compilées comme les styles et les images
├── components/        # Composants Vue réutilisables
├── layouts/           # Modèles de mise en page pour ton application
├── pages/             # Les pages de ton application basées sur les routes
├── plugins/           # Plugins JavaScript que tu souhaites exécuter avant l'instance root Vue
├── static/            # Fichiers statiques servis directement depuis la racine
└── public/            # Dossier publique avec les rapports pdf
```

## Prérequis

- Node.js > v18.0.0

## Creation

Project was created with this command

```bash
pnpm dlx nuxi@latest init nuxt-senegal-reports
```

nexui was added with following command

```bash
pnpm dlx nuxi@latest module add ui
```
others module added with following command

```bash
pnpm dlx nuxi@latest module add content
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

## Environnement de variable fichier .env 

Vous pouvez créer un fichier .env à la racine du projet et y définir la variable d'environnement pour l'ID de Google Analytics ou le DNS

exemple: 
```
GTAG_ID=G-XXXXXX
NUXT_PUBLIC_SITE_URL=https://www.vie-publique.sn
SHOW_PINNED_PEOLPLES=false
PUBLIC_SHOW_SCANDALS=false
```

non obligatoire en environnement de développement

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
