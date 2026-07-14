# Feature Flags - Cheat Sheet

## 🎯 Règle d'or

Une feature est **visible** si et seulement si :

```
enabled: true  ET  environnement actuel dans environments[]
```

## 📋 Exemples rapides

### ✅ Activer partout

```json
{
  "enabled": true,
  "environments": ["dev", "test", "production"]
}
```
→ Visible : dev ✅ | test ✅ | prod ✅

### ⚠️ Masquer en prod

```json
{
  "enabled": true,
  "environments": ["dev", "test"]
}
```
→ Visible : dev ✅ | test ✅ | prod ❌

### 🔒 Dev uniquement

```json
{
  "enabled": true,
  "environments": ["dev"]
}
```
→ Visible : dev ✅ | test ❌ | prod ❌

### 🚨 Kill switch (désactiver partout)

```json
{
  "enabled": false,
  "environments": ["dev", "test", "production"]
}
```
→ Visible : dev ❌ | test ❌ | prod ❌

## 🔄 Workflow déploiement

1. **Dev** : `environments: ["dev"]`
2. **Test** : `environments: ["dev", "test"]`
3. **Prod** : `environments: ["dev", "test", "production"]`

## 💻 Utilisation dans le code

```vue
<script setup lang="ts">
const { isEnabled } = useFeatureFlags();
</script>

<template>
  <!-- Toujours visible -->
  <SearchBar />

  <!-- Conditionnel -->
  <Chatbot v-if="isEnabled('chatbot')" />
</template>
```

## 🎨 Menu conditionnel

```typescript
const { isEnabled } = useFeatureFlags();

const navigationCards = [
  // Toujours
  { title: 'Actualités', to: '/actualites' },

  // Conditionnel
  ...(isEnabled('menu_chatbot') ? [{
    title: 'Chatbot',
    to: '/chatbot',
  }] : []),
];
```

## 📊 Tableau de décision rapide

| Je veux... | enabled | environments |
|------------|---------|-------------|
| Activer partout | `true` | `["dev", "test", "production"]` |
| Masquer en prod | `true` | `["dev", "test"]` |
| Dev uniquement | `true` | `["dev"]` |
| Désactiver partout | `false` | `["dev", "test", "production"]` |
| En pause | `true` | `[]` |

## ⚡ Actions rapides

### Désactiver une feature rapidement

1. Aller dans Directus → `feature_flags`
2. Mettre `enabled: false`
3. Attendre 5 min (ou redémarrer)

### Passer une feature de test à prod

1. Aller dans Directus → `feature_flags`
2. Modifier `environments: ["dev", "test"]`
3. En `environments: ["dev", "test", "production"]`
4. Attendre 5 min

### Vérifier l'environnement actuel

```bash
# Dans le navigateur (console)
console.log(process.env.NUXT_PUBLIC_APP_ENV)

# Ou utiliser le composable
const { environment } = useFeatureFlags();
console.log(environment.value); // "dev", "test" ou "production"
```

## 🔍 Debug

```vue
<script setup lang="ts">
const { flags, environment, source, isDev } = useFeatureFlags();
</script>

<template>
  <div v-if="isDev">
    <h3>Feature Flags Debug</h3>
    <p>Env: {{ environment }}</p>
    <p>Source: {{ source }}</p>
    <pre>{{ flags }}</pre>
  </div>
</template>
```

## 📝 Configuration fichiers

### `.env.development`
```bash
NUXT_PUBLIC_APP_ENV=dev
NUXT_FEATURE_FLAGS_ENABLED=true
```

### `.env.production`
```bash
NUXT_PUBLIC_APP_ENV=production
NUXT_FEATURE_FLAGS_ENABLED=true
```

## 🚀 Quick Start complet

```bash
# 1. Créer collection Directus "feature_flags"
# 2. Ajouter variable d'env
echo "NUXT_PUBLIC_APP_ENV=dev" >> .env

# 3. Créer les fichiers
# - app/config/features.config.ts
# - app/composables/useFeatureFlags.ts
# - server/api/features/flags.get.ts

# 4. Utiliser dans le code
const { isEnabled } = useFeatureFlags();

# 5. Tester
npm run dev
```

## ❓ Questions rapides

**Q: Je veux masquer en prod ?**
A: `environments: ["dev", "test"]` (sans "production")

**Q: Je veux désactiver partout ?**
A: `enabled: false`

**Q: Combien de temps le cache ?**
A: 5 minutes

**Q: Comment forcer le refresh ?**
A: Redémarrer le serveur

## 📚 Docs complètes

- [feature-flags.md](./feature-flags.md) - Doc technique
- [feature-flags-migration.md](./feature-flags-migration.md) - Guide migration
- [README.md](./README.md) - Guide complet
