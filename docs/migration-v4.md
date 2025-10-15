# Guide de Migration vers Nuxt 4

Ce document décrit les changements apportés lors de la migration de Nuxt 3 vers Nuxt 4.

## Référence Officielle

[Guide de migration officiel Nuxt 4](https://nuxt.com/docs/4.x/getting-started/upgrade)

## Vue d'ensemble

La migration du projet vers Nuxt 4.1.3 a été effectuée en octobre 2025. Cette version majeure introduit des changements structurels importants, notamment au niveau de l'organisation des fichiers.
## Changements Majeurs

### 1. Structure des répertoires

**Nuxt 4 utilise désormais le répertoire `app/` comme base de l'application.**

#### Migrations effectuées :

```bash
# Déplacements de répertoires
providers/    → app/providers/
stores/       → app/stores/
components/   → app/components/
composables/  → app/composables/
layouts/      → app/layouts/
pages/        → app/pages/
plugins/      → app/plugins/
assets/       → app/assets/

# Répertoires restant à la racine
content/
server/
types/
public/
```

### 2. Auto-imports serveur (Server Auto-imports)

Nuxt 4 auto-importe automatiquement les utilitaires depuis `server/utils/`.

#### Changements effectués :

- **Supprimé** : 68 imports manuels de `getCmsClient` dans les fichiers API
- **Avant** : `import { getCmsClient } from "~/server/utils/cms-client"`
- **Après** : Import automatique

**Fichiers affectés :** Tous les fichiers dans `server/api/**/*.ts`

### 3. Configuration Nuxt

#### Ajout de la compatibilité Nuxt 4

```typescript
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',
})
```

#### Mise à jour des chemins de providers

```typescript
image: {
  providers: {
    cms: {
      provider: './app/providers/cms-image.ts', // Changé de '~/providers/'
      options: {
        baseURL: '/medias',
      },
    },
  },
}
```

### 4. Modules désactivés

Certains modules ne sont pas encore compatibles avec Nuxt 4 :

```typescript
modules: [
  // '@nuxtjs/web-vitals', // Désactivé - incompatible avec Nuxt 4
]
```

**Module désactivé :**
- `@nuxtjs/web-vitals` - incompatible avec Nuxt 4.1.3


**Fichiers corrigés :**
- `app/pages/medias/index.vue`
- `app/pages/medias/[id]/[slug].vue`
- `test/unit/composables/usePromesseStatus.test.ts`

## Vérification de la migration

### Commandes de test

**Pour Linux/macOS**

```bash
# Développement
npm run dev

npm run build
```


**Pour Windows PowerShell**

```bash
# Développement
npm run dev-win

npm run build-win
```

**Sur Windows privilegie Docker pour le build**
```bash
docker run --rm -v ${PWD}:/app -w /app node:22 bash -c "npm install && npm run build"
```


## Ressources

- [Documentation officielle Nuxt 4](https://nuxt.com/docs/4.x)
- [Guide de migration Nuxt 4](https://nuxt.com/docs/4.x/getting-started/upgrade)
- [Nuxt 4 Release Notes](https://nuxt.com/blog/v4)
- [Releases](https://github.com/nuxt/nuxt/releases/tag/v4.0.0)
