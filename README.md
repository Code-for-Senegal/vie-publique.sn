# vie-publique.sn

## Sommaire

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

Plateforme Web CivicTech dédiée à la centralisation, la visualisation et l'analyse des rapports publiés sur la gestion des finances publiques au Sénégal.

> ⚠️ **AVERTISSEMENT IMPORTANT**  
> Projet initié dans l'urgence pour répondre à [l'indisponiblité du site de la cours des comptes le 01/05/2024](https://twitter.com/malick_yacine/status/1785472745150742983). Les data (metadata sur les rapports et les pdf) on été incluses directement dans le repo git. Cela explique la taille conséquente du repo (200mo). Ce point sera corrigé très rapidement en séparant les data du code.

## Roadmap

https://github.com/Code-for-Senegal/vie-publique.sn/wiki/ROADMAP

## Stack

- [Vue 3](https://vuejs.org)

- [Nuxt 3](https://nuxt.com)

  - [Nuxt UI](https://ui.nuxt.com) pour les composants UI
  - [Nuxt SEO](https://nuxtseo.com) pour optimiser le référencement naturel
  - [Nuxt Content](https://content.nuxt.com/) pour gérer du contenu dynamique en markdown
  - [nuxt-gtag](https://nuxt.com/modules/gtag) pour le suivi Google Analytics

- [Tailwind css](https://tailwindcss.com/) pour le framework css

- [Brevo (ex Sendinblue)](https://www.brevo.com/fr/) pour la newsletter

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

pnpm install @tailwindcss/typography
```

To add dynamics url on sitemap.xml

```bash
pnpm dlx nuxi@latest module add sitemap
```

## Setup

Make sure to install the dependencies:

```bash

# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

1. **Environnement de variable fichier .env**

Créer un fichier `.env` en copiant le fichier `.env.example` à la racine du projet et y définir la variable d'environnement pour l'ID de Google Analytics ou le DNS

exemple:

```
GTAG_ID=G-XXXXXX
NUXT_PUBLIC_SITE_URL=https://www.vie-publique.sn
PUBLIC_SHOW_PINNED_PEOLPLES=false
PUBLIC_SHOW_SCANDALS=false
PUBLIC_SHOW_BAROMETER=true
BREVO_API_KEY=xxx
BREVO_LIST_ID=xxx
```

vous pouvez mettre des valeurs fictives en local

2. Démarrer le serveur de dev sur `http://localhost:3000`:

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

1. Exécutez Docker

```shell
docker-compose up --build
```

ou

```shell
docker compose up
```

2. Assurez-vous que Docker n'est pas en cours d'exécution

```shell
docker compose stop
```

Votre application Nuxt 3 devrait maintenant être accessible à l'adresse http://localhost:3000 et se recharger automatiquement lorsque vous modifiez vos fichiers source.

En savoir plus : https://code.visualstudio.com/docs/devcontainers/containers

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
