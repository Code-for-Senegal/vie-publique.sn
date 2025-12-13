# Feature Flags - Gestion des fonctionnalités par environnement

## 🎯 Objectif

Système de feature flags pour :
- Masquer des fonctionnalités non finalisées en production
- Tester des features en production avant déploiement public
- Activer/désactiver des fonctionnalités sans redéploiement
- Gérer différents niveaux d'accès (dev, test, prod)

## 🏗️ Architecture recommandée : Approche hybride

### Pourquoi l'approche hybride ?

**Variables d'environnement** (`.env`) :
- ✅ Rapide, pas de dépendance externe
- ✅ Pas besoin d'appel API
- ❌ Nécessite redéploiement pour changer

**Directus Settings** (API) :
- ✅ Modifiable sans redéploiement
- ✅ Interface d'administration
- ❌ Dépendance à l'API
- ❌ Appel réseau supplémentaire

**Solution hybride** :
- Variables d'environnement pour l'environnement de base (dev/test/prod)
- Directus pour activer/désactiver des features spécifiques en temps réel
- Fallback sur `.env` si Directus indisponible

## 📁 Structure

```
app/
├── config/
│   └── features.config.ts          # Configuration des features
├── composables/
│   └── useFeatureFlags.ts          # Composable pour accéder aux flags
├── middleware/
│   └── feature-flags.global.ts     # Middleware pour charger les flags
└── utils/
    └── feature-flags.ts            # Utilitaires

server/
└── api/
    └── features/
        └── flags.get.ts            # API endpoint pour les flags

docs/
└── feature-flags.md                # Cette doc
```

## 🚀 Implémentation

### 1. Variables d'environnement

```bash
# .env
NUXT_PUBLIC_APP_ENV=production  # dev | test | production
NUXT_PUBLIC_ENABLE_BETA_FEATURES=false
NUXT_PUBLIC_ENABLE_DEBUG_MENU=false

# Directus Feature Flags (optionnel)
NUXT_FEATURE_FLAGS_ENABLED=true
CMS_API_URL=https://cms.vie-publique.sn
```

### 2. Collection Directus : `feature_flags`

**Structure de la collection** :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `key` | String (unique) | Clé de la feature (ex: `search_v2`) |
| `enabled` | Boolean | Feature activée ou non |
| `environments` | JSON | Liste des environnements autorisés |
| `description` | String | Description de la feature |
| `updated_at` | Timestamp | Dernière modification |
| `status` | String | `published` / `draft` |

## 🎯 Comment fonctionnent les feature flags - IMPORTANT

### Règle de visibilité

Une feature est **visible** si et seulement si **les DEUX conditions** sont vraies :

1. ✅ `enabled: true`
2. ✅ L'environnement actuel est dans la liste `environments`

### Exemples concrets

#### ✅ Activer partout (dev, test, prod)

```json
{
  "key": "home_search",
  "enabled": true,
  "environments": ["dev", "test", "production"],
  "description": "Barre de recherche (stable)"
}
```

**Résultat :**
- En **dev** ✅ (car `dev` dans la liste ET `enabled: true`)
- En **test** ✅ (car `test` dans la liste ET `enabled: true`)
- En **production** ✅ (car `production` dans la liste ET `enabled: true`)

#### ⚠️ Activer en dev et test uniquement (masquer en prod)

```json
{
  "key": "chatbot",
  "enabled": true,
  "environments": ["dev", "test"],
  "description": "Chatbot (en test, pas encore en prod)"
}
```

**Résultat :**
- En **dev** ✅ (car `dev` dans la liste ET `enabled: true`)
- En **test** ✅ (car `test` dans la liste ET `enabled: true`)
- En **production** ❌ (car `production` N'EST PAS dans la liste)

#### 🔒 Activer uniquement en dev (feature en développement)

```json
{
  "key": "chatbot",
  "enabled": true,
  "environments": ["dev"],
  "description": "Chatbot (en développement)"
}
```

**Résultat :**
- En **dev** ✅
- En **test** ❌
- En **production** ❌

#### 🚨 Désactivation d'urgence (kill switch)

```json
{
  "key": "budget_charts",
  "enabled": false,
  "environments": ["dev", "test", "production"],
  "description": "Graphiques budget (désactivés temporairement - bug)"
}
```

**Résultat :**
- En **dev** ❌ (car `enabled: false`)
- En **test** ❌ (car `enabled: false`)
- En **production** ❌ (car `enabled: false`)

### 📊 Tableau récapitulatif

| enabled | environments | dev | test | prod | Cas d'usage |
|---------|-------------|-----|------|------|-------------|
| `true` | `["dev", "test", "production"]` | ✅ | ✅ | ✅ | Feature stable, déployée partout |
| `true` | `["dev", "test"]` | ✅ | ✅ | ❌ | **Feature en phase de test** |
| `true` | `["dev"]` | ✅ | ❌ | ❌ | **Feature en développement** |
| `false` | `["dev", "test", "production"]` | ❌ | ❌ | ❌ | **Désactivation d'urgence** |
| `true` | `[]` | ❌ | ❌ | ❌ | Feature en pause |

### 🔄 Workflow de déploiement progressif

**Semaine 1 - Développement :**
```json
{
  "key": "nouvelle_feature",
  "enabled": true,
  "environments": ["dev"]
}
```

**Semaine 2 - Tests :**
```json
{
  "key": "nouvelle_feature",
  "enabled": true,
  "environments": ["dev", "test"]  // ← Ajouter "test"
}
```

**Semaine 3 - Production :**
```json
{
  "key": "nouvelle_feature",
  "enabled": true,
  "environments": ["dev", "test", "production"]  // ← Ajouter "production"
}
```

**Semaine 4+ - Feature standard :**
Supprimer le flag du code et de Directus (feature devenue permanente)

## 📝 Exemples de données initiales

**Exemple de données** :

```json
[
  {
    "key": "search_v2",
    "enabled": true,
    "environments": ["dev", "test"],
    "description": "Nouvelle recherche avancée (en test)"
  },
  {
    "key": "chatbot",
    "enabled": true,
    "environments": ["dev"],
    "description": "Chatbot IA (en développement)"
  },
  {
    "key": "budget_charts",
    "enabled": true,
    "environments": ["dev", "test", "production"],
    "description": "Graphiques d'évolution budgétaire"
  },
  {
    "key": "menu_dashboard_cm",
    "enabled": false,
    "environments": ["dev"],
    "description": "Dashboard Conseil des Ministres (test)"
  },
  {
    "key": "menu_quiz",
    "enabled": true,
    "environments": ["dev", "test", "production"],
    "description": "Section Quiz"
  },
  {
    "key": "menu_donations",
    "enabled": false,
    "environments": ["production"],
    "description": "Pages de dons (pas encore prêt)"
  }
]
```

### 3. Configuration des features (`app/config/features.config.ts`)

```typescript
/**
 * Configuration centralisée des feature flags
 *
 * - DEFAULT_FLAGS : Valeurs par défaut si Directus indisponible
 * - FEATURE_CATEGORIES : Organisation des features par catégorie
 */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  environments: string[];
  description: string;
}

export const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  // Navigation
  'menu_search_v1': {
    key: 'menu_search_v1',
    enabled: false,
    environments: ['dev'],
    description: 'Recherche V1 (obsolète)',
  },
  'menu_search_v2': {
    key: 'menu_search_v2',
    enabled: false,
    environments: ['dev', 'test'],
    description: 'Recherche V2 (en test)',
  },
  'menu_chatbot': {
    key: 'menu_chatbot',
    enabled: false,
    environments: ['dev'],
    description: 'Chatbot (en développement)',
  },
  'menu_dashboard_cm': {
    key: 'menu_dashboard_cm',
    enabled: false,
    environments: ['dev'],
    description: 'Dashboard Conseil des Ministres',
  },
  'menu_quiz': {
    key: 'menu_quiz',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Section Quiz',
  },
  'menu_donations': {
    key: 'menu_donations',
    enabled: false,
    environments: ['dev', 'test'],
    description: 'Pages de dons',
  },
  'menu_budget_2024': {
    key: 'menu_budget_2024',
    enabled: false,
    environments: ['dev'],
    description: 'Anciennes pages budget (obsolètes)',
  },

  // Homepage
  'home_search': {
    key: 'home_search',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Barre de recherche sur l\'accueil',
  },
  'home_quicklinks_elections': {
    key: 'home_quicklinks_elections',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Quick link Élections',
  },

  // Features
  'budget_evolution_charts': {
    key: 'budget_evolution_charts',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Graphiques évolution budgétaire',
  },
  'assembly_member_detail': {
    key: 'assembly_member_detail',
    enabled: true,
    environments: ['dev', 'test', 'production'],
    description: 'Pages détail députés',
  },
};

export const FEATURE_CATEGORIES = {
  menu: [
    'menu_search_v1',
    'menu_search_v2',
    'menu_chatbot',
    'menu_dashboard_cm',
    'menu_quiz',
    'menu_donations',
    'menu_budget_2024',
  ],
  homepage: [
    'home_search',
    'home_quicklinks_elections',
  ],
  features: [
    'budget_evolution_charts',
    'assembly_member_detail',
  ],
};
```

### 4. API Endpoint (`server/api/features/flags.get.ts`)

```typescript
import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const env = config.public.appEnv || 'production';

    // Si feature flags désactivés, retourner les defaults
    if (!config.featureFlagsEnabled) {
      return {
        environment: env,
        flags: DEFAULT_FLAGS,
        source: 'default',
      };
    }

    try {
      const directus = getCmsClient();

      // Récupérer les flags depuis Directus
      const flags = await directus.request(
        readItems('feature_flags', {
          fields: ['key', 'enabled', 'environments', 'description'],
          filter: {
            status: { _eq: 'published' },
          },
        })
      );

      // Convertir en objet avec key comme clé
      const flagsMap = flags.reduce((acc, flag) => {
        acc[flag.key] = flag;
        return acc;
      }, {} as Record<string, any>);

      // Merger avec les defaults (fallback)
      const mergedFlags = { ...DEFAULT_FLAGS, ...flagsMap };

      return {
        environment: env,
        flags: mergedFlags,
        source: 'directus',
      };
    } catch (error) {
      console.error('Erreur chargement feature flags:', error);

      // Fallback sur defaults en cas d'erreur
      return {
        environment: env,
        flags: DEFAULT_FLAGS,
        source: 'default (fallback)',
      };
    }
  },
  {
    maxAge: 60 * 5, // Cache 5 minutes
    name: 'feature-flags',
    getKey: () => 'feature-flags',
  }
);
```

### 5. Composable (`app/composables/useFeatureFlags.ts`)

```typescript
import { DEFAULT_FLAGS } from '~/config/features.config';

export const useFeatureFlags = () => {
  const config = useRuntimeConfig();
  const currentEnv = config.public.appEnv || 'production';

  // Fetch des flags depuis l'API
  const { data: flagsData } = useFetch('/api/features/flags', {
    key: 'feature-flags',
    default: () => ({
      environment: currentEnv,
      flags: DEFAULT_FLAGS,
      source: 'default',
    }),
    server: true,
    lazy: false,
  });

  /**
   * Vérifie si une feature est activée
   * @param featureKey - Clé de la feature
   * @returns true si la feature est activée pour l'environnement actuel
   */
  const isEnabled = (featureKey: string): boolean => {
    const flag = flagsData.value?.flags[featureKey];

    if (!flag) {
      console.warn(`Feature flag "${featureKey}" non trouvé`);
      return false;
    }

    // Vérifier si la feature est activée
    if (!flag.enabled) {
      return false;
    }

    // Vérifier si l'environnement actuel est autorisé
    if (!flag.environments.includes(currentEnv)) {
      return false;
    }

    return true;
  };

  /**
   * Récupère toutes les features d'une catégorie
   * @param category - Catégorie (menu, homepage, features)
   */
  const getCategory = (category: string) => {
    const categoryKeys = FEATURE_CATEGORIES[category] || [];
    return categoryKeys.filter(key => isEnabled(key));
  };

  /**
   * Récupère l'environnement actuel
   */
  const environment = computed(() => flagsData.value?.environment || currentEnv);

  /**
   * Vérifie si on est en mode développement
   */
  const isDev = computed(() => environment.value === 'dev');

  /**
   * Vérifie si on est en mode test
   */
  const isTest = computed(() => environment.value === 'test');

  /**
   * Vérifie si on est en production
   */
  const isProd = computed(() => environment.value === 'production');

  return {
    isEnabled,
    getCategory,
    environment,
    isDev,
    isTest,
    isProd,
    flags: computed(() => flagsData.value?.flags || {}),
    source: computed(() => flagsData.value?.source || 'unknown'),
  };
};
```

### 6. Utilisation dans les pages

#### Exemple : `app/pages/menu.vue`

```typescript
<script setup lang="ts">
const { isEnabled, isDev } = useFeatureFlags();

const navigationCards: NavigationCard[] = [
  {
    title: 'Actualités',
    icon: 'i-heroicons-newspaper',
    to: '/actualites',
  },
  // ... autres cartes toujours visibles

  // Cartes conditionnelles
  ...(isEnabled('menu_search_v1') ? [{
    title: 'Recherche v1',
    icon: 'i-heroicons-magnifying-glass',
    to: '/recherche',
  }] : []),

  ...(isEnabled('menu_search_v2') ? [{
    title: 'Recherche v2',
    icon: 'i-heroicons-magnifying-glass',
    to: '/recherche-avancee',
  }] : []),

  ...(isEnabled('menu_chatbot') ? [{
    title: 'Chatbot',
    icon: 'i-heroicons-chat-bubble-left-ellipsis',
    to: '/chatbot',
  }] : []),

  ...(isEnabled('menu_dashboard_cm') ? [{
    title: 'Dashboard Conseil des Ministres',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard/conseil-ministre',
  }] : []),

  ...(isEnabled('menu_quiz') ? [{
    title: 'Quiz',
    icon: 'i-heroicons-puzzle-piece',
    to: '/quiz',
  }] : []),

  ...(isEnabled('menu_donations') ? [
    {
      title: 'Don avec Bictorys',
      icon: 'i-heroicons-heart',
      to: '/don/bictorys',
    },
    {
      title: 'Don avec Paydunya',
      icon: 'i-heroicons-heart',
      to: '/don/paydunya',
    },
  ] : []),
];
</script>
```

#### Exemple : Navbar avec recherche conditionnelle

```vue
<template>
  <nav>
    <!-- Barre de recherche conditionnelle -->
    <div v-if="isEnabled('navbar_search')">
      <SearchBar />
    </div>

    <!-- Debug info en dev uniquement -->
    <div v-if="isDev" class="text-xs text-gray-500">
      Env: {{ environment }} | Flags source: {{ source }}
    </div>
  </nav>
</template>

<script setup lang="ts">
const { isEnabled, isDev, environment, source } = useFeatureFlags();
</script>
```

#### Exemple : Homepage avec quicklinks

```vue
<template>
  <div class="quicklinks">
    <NuxtLink
      v-for="link in enabledQuickLinks"
      :key="link.to"
      :to="link.to"
    >
      {{ link.title }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { isEnabled } = useFeatureFlags();

const allQuickLinks = [
  { title: 'Budget', to: '/budget-senegal', flag: 'home_quicklinks_budget' },
  { title: 'Élections', to: '/elections', flag: 'home_quicklinks_elections' },
  { title: 'Assemblée', to: '/assemblee-nationale', flag: 'home_quicklinks_assembly' },
];

const enabledQuickLinks = computed(() =>
  allQuickLinks.filter(link => isEnabled(link.flag))
);
</script>
```

## 🔧 Configuration par environnement

### `.env.development`
```bash
NUXT_PUBLIC_APP_ENV=dev
NUXT_PUBLIC_ENABLE_BETA_FEATURES=true
NUXT_PUBLIC_ENABLE_DEBUG_MENU=true
NUXT_FEATURE_FLAGS_ENABLED=true
```

### `.env.test`
```bash
NUXT_PUBLIC_APP_ENV=test
NUXT_PUBLIC_ENABLE_BETA_FEATURES=true
NUXT_PUBLIC_ENABLE_DEBUG_MENU=false
NUXT_FEATURE_FLAGS_ENABLED=true
```

### `.env.production`
```bash
NUXT_PUBLIC_APP_ENV=production
NUXT_PUBLIC_ENABLE_BETA_FEATURES=false
NUXT_PUBLIC_ENABLE_DEBUG_MENU=false
NUXT_FEATURE_FLAGS_ENABLED=true
```

## 📊 Interface d'administration Directus

### Permissions requises

**Collection `feature_flags`** :
- Lecture : Public (ou rôle API)
- Création/Modification : Admin uniquement

### Workflow de gestion

1. **Développement** : Créer la feature avec `environments: ["dev"]`
2. **Test** : Ajouter `"test"` dans environments
3. **Production** :
   - Soit ajouter `"production"` pour déploiement public
   - Soit garder `["dev", "test"]` pour tester en prod sans exposer aux utilisateurs

### Désactiver une feature rapidement

En cas de bug en production :
1. Aller dans Directus → `feature_flags`
2. Trouver la feature
3. Mettre `enabled: false`
4. Sauvegarder
5. Attendre 5 minutes (cache) ou purger le cache

## 🎨 Bonnes pratiques

### Nommage des flags

```
{catégorie}_{nom_feature}

Exemples :
- menu_chatbot
- home_search
- budget_evolution_charts
- assembly_member_detail
```

### Nettoyage des flags

- Supprimer les flags de features complètement déployées
- Supprimer les flags de features abandonnées
- Faire un audit trimestriel

### Tests

```typescript
// Tester avec différents environnements
describe('Feature Flags', () => {
  it('should enable feature in dev', () => {
    process.env.NUXT_PUBLIC_APP_ENV = 'dev';
    expect(isEnabled('menu_chatbot')).toBe(true);
  });

  it('should disable feature in prod', () => {
    process.env.NUXT_PUBLIC_APP_ENV = 'production';
    expect(isEnabled('menu_chatbot')).toBe(false);
  });
});
```

## 📈 Dashboard de monitoring (optionnel)

Créer une page admin `/admin/features` pour visualiser :
- Liste de toutes les features
- État par environnement
- Dernière modification
- Source (Directus ou default)

```vue
<template>
  <div class="container mx-auto p-8">
    <h1>Feature Flags Dashboard</h1>

    <div class="mb-4">
      <strong>Environnement actuel :</strong> {{ environment }}
      <br>
      <strong>Source :</strong> {{ source }}
    </div>

    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Dev</th>
          <th>Test</th>
          <th>Prod</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(flag, key) in flags" :key="key">
          <td>{{ key }}</td>
          <td>{{ flag.environments.includes('dev') ? '✅' : '❌' }}</td>
          <td>{{ flag.environments.includes('test') ? '✅' : '❌' }}</td>
          <td>{{ flag.environments.includes('production') ? '✅' : '❌' }}</td>
          <td>{{ flag.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const { flags, environment, source } = useFeatureFlags();
</script>
```

## 🚨 Troubleshooting

### Les flags ne se mettent pas à jour

**Cause** : Cache de 5 minutes
**Solution** : Attendre ou purger le cache Nitro

### Une feature s'affiche alors qu'elle est désactivée

**Vérifier** :
1. L'environnement actuel : `console.log(process.env.NUXT_PUBLIC_APP_ENV)`
2. Le flag dans Directus
3. Le cache navigateur (Ctrl+F5)

### Directus indisponible

Le système fallback automatiquement sur `DEFAULT_FLAGS` définis dans le code.

## 📚 Ressources

- [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Feature Flags Best Practices](https://www.featureflags.io/feature-flag-best-practices/)
- [LaunchDarkly Guide](https://launchdarkly.com/blog/what-are-feature-flags/)
