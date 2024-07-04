# vie-publique.sn

Plateforme Web CivicTech dédiée à la centralisation, la visualisation et l'analyse des rapports publiés sur la gestion des finances publiques au Sénégal.

- Production - URL publique :
  https://www.vie-publique.sn

- Recette - Url Preview :
  https://senegal-rapports.netlify.app

> ⚠️ **AVERTISSEMENT IMPORTANT**  
> Projet initié dans l'urgence pour répondre à [l'indisponiblité du site de la cours des comptes le 01/05/2024](https://twitter.com/malick_yacine/status/1785472745150742983). Les data (metadata sur les rapports et les pdf) on été incluses directement dans le repo git. Cela explique la taille conséquente du repo (200mo). Ce point sera corrigé très rapidement en séparant les data du code.

# Sommaire

1. [Présentation](#présentation)
2. [ROADMAP](#roadmap)
3. [Stack](#stack)
4. [Structure du projet](#structure-du-projet)
5. [Prérequis](#prérequis)
6. [Creation](#creation)
7. [Setup](#setup)
8. [Development Server](#development-server)
9. [Utiliser les Dev Containers](#utiliser-les-dev-containers)
10. [Environnement de variable fichier .env](#environnement-de-variable-fichier-env)
11. [Production](#production)

## Présentation

- Objectifs :

  - simplifier l'accès aux rapports des corps de contrôle
  - vulgariser les infos qu'elles contiennent
  - participer à combattre la corruption

- Fonctionalités

  - centraliser les rapports provenant de ofnac, ige, cours des comptes et armp
  - télécharger les rapports
  - consulter le résumé d'un rapport
  - consulter un résumé affaires traités et personnes incriminées sur un rapport
  - lister les personnalités publiques épinglées

- ROADMAP

  - V0 MVP
    - feat: liste des personnes épinglées
    - feat: intégrer un suivi des dossier évoqués dans les rapports
    - fix: stockage des pdfs, migrer vers un storage externe
    - fix: stockage des data, migrer vers une bdd externe
    - fix: restructuration du schémas données (rapports, personnes épinglées …)
    - optimisations: SEO, configurer les keyword, metadata, sitemap, robots.txt
    - optimisation: performance, SSR, Cache, CDN, Lazy loading, infinite scroll & pagination…
    - optimisation: UI/UX, charte graphique, navigation
    - code: analyse de la qualité de code avec [sonarcloud](https://www.sonarsource.com/) gratuit pour les projets open source
  - V1

    - feat: liste des scandales financiers ?
    - feat: répertorier l'ensemble des actes administratifs et ministériels de la république du Sénégal. liste des décrets officiels ?
    - feat: liste des sites internet publics du Sénégal ?
    - feat: newletters

  - V2
    - Espace administration: pour se connecter et gérer les rapports (upload, mis à jour, résumé ...)
    - Espace blog: pour publier des articles sur l'évolution des rapport d'enquêtes
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

- Package Manager: npm
- Bundler: Vite

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
pnpm dlx nuxi@latest module add web-vitals
pnpm dlx nuxi@latest module add image

```

To add dynamics url on sitemap.xml

```bash
pnpm dlx nuxi@latest module add sitemap
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

accès au viewer tailwind `http://localhost:3000/\_tailwind`

## Utiliser les Dev Containers

Vous pouvez utiliser Docker avec l'extension Dev Containers

En savoir plus : https://code.visualstudio.com/docs/devcontainers/containers

## Environnement de variable fichier .env

Vous pouvez créer un fichier .env à la racine du projet et y définir la variable d'environnement pour l'ID de Google Analytics ou le DNS

exemple:

```
GTAG_ID=G-XXXXXX
NUXT_PUBLIC_SITE_URL=https://www.vie-publique.sn
PUBLIC_SHOW_PINNED_PEOLPLES=false
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

## useful links

https://nuxt.com/modules

https://heroicons.com/
