# Migration vers Feature Flags - Guide d'implémentation

## 🎯 Plan d'action

### Phase 1 : Configuration de base (30 min)

1. ✅ Créer la collection Directus
2. ✅ Ajouter les variables d'environnement
3. ✅ Créer les fichiers de configuration

### Phase 2 : Code (1h)

1. ✅ Créer le composable `useFeatureFlags`
2. ✅ Créer l'API endpoint
3. ✅ Créer le fichier de config

### Phase 3 : Migration du code existant (2h)

1. ✅ Migrer `menu.vue`
2. ✅ Migrer la navbar
3. ✅ Migrer la homepage
4. ✅ Tester

## 📋 Checklist d'implémentation

### 1. Directus - Créer la collection `feature_flags`

**Via l'interface Directus :**

1. Aller dans Settings → Data Model
2. Créer une nouvelle collection : `feature_flags`
3. Ajouter les champs :

| Nom du champ | Type | Options |
|--------------|------|---------|
| `id` | UUID | Primary Key, auto-généré |
| `key` | String | Required, Unique |
| `enabled` | Boolean | Default: false |
| `environments` | JSON | Default: [] |
| `description` | Text | Optional |
| `status` | String | Default: draft |

4. Configurer les permissions :
   - **Public** : Read only (pour l'API)
   - **Admin** : Full access

**Via SQL (alternative) :**

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  environments JSON DEFAULT '[]',
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Données initiales dans Directus

**Insérer via l'interface Directus ou SQL :**

```json
[
  {
    "key": "menu_search_v1",
    "enabled": false,
    "environments": ["dev"],
    "description": "Recherche V1 (obsolète)",
    "status": "published"
  },
  {
    "key": "menu_search_v2",
    "enabled": false,
    "environments": ["dev", "test"],
    "description": "Recherche V2 (en test)",
    "status": "published"
  },
  {
    "key": "menu_chatbot",
    "enabled": false,
    "environments": ["dev"],
    "description": "Chatbot (en développement)",
    "status": "published"
  },
  {
    "key": "menu_dashboard_cm",
    "enabled": false,
    "environments": ["dev"],
    "description": "Dashboard Conseil des Ministres",
    "status": "published"
  },
  {
    "key": "menu_quiz",
    "enabled": true,
    "environments": ["dev", "test", "production"],
    "description": "Section Quiz",
    "status": "published"
  },
  {
    "key": "menu_donations",
    "enabled": false,
    "environments": ["dev", "test"],
    "description": "Pages de dons",
    "status": "published"
  },
  {
    "key": "home_search",
    "enabled": true,
    "environments": ["dev", "test", "production"],
    "description": "Barre de recherche sur l'accueil",
    "status": "published"
  },
  {
    "key": "budget_evolution_charts",
    "enabled": true,
    "environments": ["dev", "test", "production"],
    "description": "Graphiques évolution budgétaire",
    "status": "published"
  }
]
```

### 3. Variables d'environnement

**Ajouter dans `.env` :**

```bash
# Feature Flags
NUXT_PUBLIC_APP_ENV=production
NUXT_FEATURE_FLAGS_ENABLED=true
```

**Créer `.env.development` :**

```bash
NUXT_PUBLIC_APP_ENV=dev
NUXT_FEATURE_FLAGS_ENABLED=true
```

**Créer `.env.production` :**

```bash
NUXT_PUBLIC_APP_ENV=production
NUXT_FEATURE_FLAGS_ENABLED=true
```

### 4. Configuration Nuxt

**Modifier `nuxt.config.ts` :**

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-side only)
    featureFlagsEnabled: process.env.NUXT_FEATURE_FLAGS_ENABLED === 'true',

    // Public (exposed to client)
    public: {
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'production',
      enableBetaFeatures: process.env.NUXT_PUBLIC_ENABLE_BETA_FEATURES === 'true',
    },
  },

  // ... reste de la config
});
```

### 5. Créer les fichiers

**Créer `app/config/features.config.ts` :**

Copier le contenu depuis `docs/feature-flags.md` section 3.

**Créer `server/api/features/flags.get.ts` :**

Copier le contenu depuis `docs/feature-flags.md` section 4.

**Créer `app/composables/useFeatureFlags.ts` :**

Copier le contenu depuis `docs/feature-flags.md` section 5.

### 6. Migration de `menu.vue`

**Avant :**

```typescript
const navigationCards: NavigationCard[] = [
  {
    title: 'Recherche v1',
    to: '/recherche',
    icon: 'i-heroicons-magnifying-glass',
  },
  {
    title: 'Recherche v2',
    to: '/recherche-avancee',
    icon: 'i-heroicons-magnifying-glass',
  },
  // ... autres
];
```

**Après :**

```typescript
const { isEnabled } = useFeatureFlags();

const navigationCards: NavigationCard[] = [
  {
    title: 'Actualités',
    to: '/actualites',
    icon: 'i-heroicons-newspaper',
  },
  // Toujours visible

  // Conditionnels
  ...(isEnabled('menu_search_v1') ? [{
    title: 'Recherche v1',
    to: '/recherche',
    icon: 'i-heroicons-magnifying-glass',
  }] : []),

  ...(isEnabled('menu_search_v2') ? [{
    title: 'Recherche v2',
    to: '/recherche-avancee',
    icon: 'i-heroicons-magnifying-glass',
  }] : []),

  ...(isEnabled('menu_chatbot') ? [{
    title: 'Chatbot',
    to: '/chatbot',
    icon: 'i-heroicons-chat-bubble-left-ellipsis',
  }] : []),

  ...(isEnabled('menu_dashboard_cm') ? [{
    title: 'Dashboard Conseil des Ministres',
    to: '/dashboard/conseil-ministre',
    icon: 'i-heroicons-chart-bar',
  }] : []),

  ...(isEnabled('menu_quiz') ? [{
    title: 'Quiz',
    to: '/quiz',
    icon: 'i-heroicons-puzzle-piece',
  }] : []),

  ...(isEnabled('menu_donations') ? [
    {
      title: 'Don avec Bictorys',
      to: '/don/bictorys',
      icon: 'i-heroicons-heart',
    },
    {
      title: 'Don avec Paydunya',
      to: '/don/paydunya',
      icon: 'i-heroicons-heart',
    },
  ] : []),
];
```

### 7. Tests

**Test en développement :**

```bash
# Vérifier que l'environnement est bien détecté
NUXT_PUBLIC_APP_ENV=dev npm run dev

# Ouvrir http://localhost:3000/menu
# → Toutes les features "dev" doivent être visibles
```

**Test en production :**

```bash
# Build
NUXT_PUBLIC_APP_ENV=production npm run build

# Preview
npm run preview

# Ouvrir http://localhost:3000/menu
# → Seules les features "production" doivent être visibles
```

**Test Directus :**

1. Aller dans Directus → `feature_flags`
2. Changer `menu_chatbot.enabled` à `true`
3. Attendre 5 minutes (ou redémarrer)
4. Vérifier que le chatbot apparaît

## 🎨 Recommandations pour ton cas

### Fonctionnalités à masquer en prod

Basé sur `menu.vue`, voici ce que je recommande :

```typescript
// À MASQUER en production (mettre environments: ["dev"])
{
  "key": "menu_search_v1",
  "enabled": false,
  "environments": ["dev"],
  "description": "Obsolète, sera supprimé"
}

{
  "key": "menu_search_v2",
  "enabled": false,
  "environments": ["dev", "test"],
  "description": "En test, pas encore prêt pour prod"
}

{
  "key": "menu_chatbot",
  "enabled": false,
  "environments": ["dev"],
  "description": "En développement"
}

{
  "key": "menu_dashboard_cm",
  "enabled": false,
  "environments": ["dev"],
  "description": "Page de test interne"
}

{
  "key": "menu_donations",
  "enabled": false,
  "environments": ["dev"],
  "description": "Pas encore prêt"
}

// À GARDER visible en production
{
  "key": "menu_actualites",
  "enabled": true,
  "environments": ["dev", "test", "production"],
  "description": "Page principale"
}

{
  "key": "menu_budget",
  "enabled": true,
  "environments": ["dev", "test", "production"],
  "description": "Budget 2026 - prêt"
}

{
  "key": "menu_quiz",
  "enabled": true,
  "environments": ["dev", "test", "production"],
  "description": "Quiz fonctionnel"
}
```

### Pages `2024.vue` et `2025.vue`

Option 1 : Les supprimer complètement
Option 2 : Les masquer avec feature flag

```typescript
// Dans le router ou via middleware
{
  "key": "page_budget_2024",
  "enabled": false,
  "environments": ["dev"],
  "description": "Ancienne page budget 2024 (obsolète)"
}
```

## 🚀 Déploiement en production

### Stratégie progressive

**Semaine 1 - Soft launch (environnement de test) :**
```json
{
  "key": "nouvelle_feature",
  "enabled": true,
  "environments": ["dev", "test"]
}
```

**Semaine 2 - Beta test (quelques utilisateurs prod) :**

Utiliser un flag avec URL spéciale :
```
https://vie-publique.sn?beta=true
```

**Semaine 3 - Déploiement complet :**
```json
{
  "key": "nouvelle_feature",
  "enabled": true,
  "environments": ["dev", "test", "production"]
}
```

## 🔒 Sécurité

### Ne PAS exposer de flags sensibles

❌ **Mauvais :**
```typescript
{
  "key": "admin_panel",
  "enabled": true,
  "environments": ["production"]
}
```

✅ **Bon :**
```typescript
// Utiliser un vrai système d'auth
// Les feature flags sont pour les fonctionnalités, pas la sécurité
```

### Utiliser des middleware pour les routes protégées

```typescript
// middleware/feature-protected.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled('chatbot_access')) {
    return navigateTo('/');
  }
});
```

## 📊 Monitoring

### Logger les features actives

```typescript
// plugins/feature-flags-logger.ts
export default defineNuxtPlugin(() => {
  const { flags, environment } = useFeatureFlags();

  if (process.client) {
    console.info('[Feature Flags]', {
      environment,
      enabled: Object.entries(flags.value)
        .filter(([_, flag]) => flag.enabled)
        .map(([key]) => key),
    });
  }
});
```

## 🎯 Prochaines étapes

1. ✅ Créer la collection Directus
2. ✅ Ajouter les fichiers de configuration
3. ✅ Migrer `menu.vue`
4. ✅ Tester en dev
5. ✅ Tester en prod (avec feature masquée)
6. ✅ Documenter pour l'équipe
7. ✅ Supprimer les anciennes pages (2024.vue, 2025.vue)

## ❓ Questions fréquentes

**Q: Dois-je mettre tous les liens de menu dans les feature flags ?**
R: Non, seulement ceux qui ne sont pas encore finalisés ou que tu veux pouvoir désactiver rapidement.

**Q: Que se passe-t-il si Directus est down ?**
R: Le système utilise automatiquement les `DEFAULT_FLAGS` définis dans le code.

**Q: Combien de temps reste le cache ?**
R: 5 minutes par défaut. Tu peux changer dans l'API endpoint.

**Q: Puis-je utiliser des feature flags côté serveur ?**
R: Oui ! Le composable fonctionne aussi en SSR.

**Q: Comment tester une feature en prod sans l'exposer ?**
R: Mettre `environments: ["dev", "test"]` et accéder à la prod avec un VPN ou IP whitelistée (via un autre flag).
