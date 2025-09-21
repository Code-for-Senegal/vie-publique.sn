# 📋 Système de Versioning

## 🎯 Vue d'ensemble

Le système de versioning automatique affiche la version de l'application dans le footer et suit les bonnes pratiques de versioning sémantique (SemVer).

## 📦 Composants

### 1. **Composable `useAppVersion()`**
```typescript
const { 
  version,        // '1.0.0'
  fullVersion,    // 'v1.0.0 (abc1234) - 21/09/2025'
  shortVersion,   // 'v1.0.0'
  buildTime,      // ISO timestamp du build
  gitCommit,      // Hash du commit Git
  environment,    // 'development' | 'production'
  isProduction    // boolean
} = useAppVersion()
```

### 2. **Composant `<AppVersion />`**
```vue
<!-- Version complète (desktop) -->
<AppVersion />

<!-- Version mobile (condensée) -->
<AppVersion mobile />
```

### 3. **Variables d'environnement automatiques**
- `VERCEL_GIT_COMMIT_SHA` (Vercel)
- `GITHUB_SHA` (GitHub Actions)
- `GIT_COMMIT` (Custom)
- `NODE_ENV` (Environment)

## 🚀 Usage en Production

### Mise à jour de version avant déploiement

```bash
# Version patch (1.0.0 -> 1.0.1) - corrections de bugs
npm run version:patch

# Version minor (1.0.0 -> 1.1.0) - nouvelles fonctionnalités
npm run version:minor

# Version major (1.0.0 -> 2.0.0) - breaking changes
npm run version:major
```

### Build avec informations automatiques

```bash
# Les informations sont automatiquement injectées au build
npm run build

# En production, la version sera visible dans le footer :
# "v1.2.3 (a1b2c3d) - 21/09/2025 © 2025"
```

## 🔧 Configuration CI/CD

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v3
      
      # Le commit SHA sera automatiquement disponible via GITHUB_SHA
      - name: Build
        run: npm run build
        env:
          GITHUB_SHA: ${{ github.sha }}
```

### Vercel
```bash
# Vercel injecte automatiquement VERCEL_GIT_COMMIT_SHA
# Aucune configuration supplémentaire nécessaire
```

## 📱 Affichage Responsive

| Device | Affichage | Exemple |
|--------|-----------|---------|
| **Desktop** | Version complète + tooltip | `v1.2.3 (abc1234) - 21/09/2025` |
| **Mobile** | Version courte | `v1.2.3` |
| **Hover** | Détails complets | `Build: 21/09/2025 14:30 | Commit: abc1234` |

## 🎨 Styling

```vue
<style scoped>
.app-version {
  font-family: 'Courier New', monospace;
  user-select: none;
}
</style>
```

## 🛠️ Personnalisation

### Modifier le format d'affichage

```typescript
// Dans useAppVersion.ts
const fullVersion = computed(() => {
  let versionString = `v${version}`
  
  // Ajouter environnement en dev
  if (isDevelopment) {
    versionString += ' (dev)'
  }
  
  // Format personnalisé
  if (gitCommit && isProduction) {
    versionString += ` build-${gitCommit.substring(0, 7)}`
  }
  
  return versionString
})
```

### Ajouter dans d'autres composants

```vue
<template>
  <div class="debug-info" v-if="isDevelopment">
    <AppVersion />
    <span>Build: {{ buildTime }}</span>
  </div>
</template>

<script setup>
const { buildTime, isDevelopment } = useAppVersion()
</script>
```

## 🔍 Debug & Monitoring

### Vérifier la version déployée

```bash
# Via les DevTools (Console)
console.log(document.querySelector('.app-version').textContent)

# Via API (si exposée)
curl https://vie-publique.sn/api/version
```

### Logs de déploiement

```typescript
// server/api/version.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    version: config.public.appVersion,
    buildTime: config.public.buildTime,
    gitCommit: config.public.gitCommit,
    environment: config.public.nodeEnv
  }
})
```

## 📝 Bonnes Pratiques

1. **Toujours mettre à jour la version** avant un déploiement majeur
2. **Utiliser le versioning sémantique** : `MAJOR.MINOR.PATCH`
3. **Taguer les releases** dans Git avec la même version
4. **Documenter les changements** dans un CHANGELOG.md
5. **Tester le système** de version en staging avant prod

## 🚨 Troubleshooting

### Version n'apparaît pas
```bash
# Vérifier que les variables sont bien injectées
npm run dev
# Ouvrir DevTools > Console
console.log(window.__NUXT__.config.public.appVersion)
```

### Commit hash 'unknown'
```bash
# Vérifier les variables d'environnement
echo $VERCEL_GIT_COMMIT_SHA
echo $GITHUB_SHA

# Ou définir manuellement
export GIT_COMMIT=$(git rev-parse HEAD)
npm run build
```

### Build time incorrect
```bash
# Le build time est généré au moment du build Nuxt
# Pour forcer une mise à jour :
rm -rf .nuxt .output
npm run build
```

## 🎯 Avantages

✅ **Traçabilité** : Version visible par tous les utilisateurs  
✅ **Debug facilité** : Identification rapide de la version déployée  
✅ **Monitoring** : Suivi des déploiements en production  
✅ **Automatisation** : Pas de mise à jour manuelle  
✅ **CI/CD ready** : Integration native avec les pipelines  
✅ **SEO friendly** : Meta tags avec version (optionnel)