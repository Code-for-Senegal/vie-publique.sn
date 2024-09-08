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
9. [Dev Containers](#utiliser-les-dev-containers)
10. [Production](#production)

## Présentation

Plateforme Web citoyenne dédiée à la promotion de la transparence et de l'accessibilité à l'information publique au Sénégal.

C'est une plateforme participative, collective, ouverte et open source visant à rendre accessible au grand public les informations publiques (rapports d'audit, budget, journal officiel, lois et règlements, code général, nominations etc.).

> ⚠️ **AVERTISSEMENT IMPORTANT**  
> Projet initié dans l'urgence pour répondre à [l'indisponiblité du site de la cours des comptes le 01/05/2024](https://twitter.com/malick_yacine/status/1785472745150742983). Les data (metadata sur les rapports et les pdf) on été incluses directement dans le repo git. Ce point sera corrigé très rapidement en séparant les data du code.

## Roadmap

https://github.com/Code-for-Senegal/vie-publique.sn/wiki/ROADMAP

## Stack

- [Vue 3](https://vuejs.org)

- [Nuxt 3](https://nuxt.com)

  - [Nuxt UI](https://ui.nuxt.com) pour les composants UI
  - [Nuxt SEO](https://nuxtseo.com) pour optimiser SEO référencement naturel
  - [Nuxt Content](https://content.nuxt.com/) pour générer du contenu statique en markdown
  - [nuxt-gtag](https://nuxt.com/modules/gtag) pour le suivi Google Analytics

- [Tailwind css](https://tailwindcss.com/) pour le style UI

- [ES lint](https://nuxt.com/docs/guide/concepts/code-style) et [prettier](https://prettier.io) pour le code Style

- [Brevo (ex Sendinblue)](https://www.brevo.com/fr/) pour la newsletter

- Package Manager: npm

- Bundler: Vite

- Nom de domaine

  - DNS [vie-publique.sn](https://www.vie-publique.sn) acheté via OVH

- Hébergement
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
└── content/           # Dossier content pour les contenus statiques markdown
└── server/            # parter serveur API
└── nuxt.config.ts     # Nuxt root config file
└── eslint.config.mjs  # ESLint config file
└── .prettierrc        # Prettier Config file
```

## Prérequis

- Node.js > v18.0.0

## Setup

Make sure to install the dependencies:

```bash
npm install
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

2. Development server

```bash
npm run dev
```

Votre application Nuxt 3 devrait maintenant être accessible à l'adresse http://localhost:3000 et se recharger automatiquement lorsque vous modifiez vos fichiers source.

Accès au viewer tailwind `http://localhost:3000/\_tailwind`

3. IDE

Pour VSCode, installer ces 2 extensions :

- Prettier - Code formatter https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
- ESLint https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

Executer la commande 'npm run lint' pour vérifier si le code style est correct ou 'npm run lint:fix' pour fixer automatiquement les issues.

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
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
