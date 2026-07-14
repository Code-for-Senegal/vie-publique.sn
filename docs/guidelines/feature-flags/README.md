# Feature Flags - Documentation complète

## 📚 Documents disponibles

1. **[feature-flags.md](./feature-flags.md)** - Documentation technique complète
   - Architecture du système
   - Implémentation détaillée
   - Exemples de code
   - Bonnes pratiques

2. **[feature-flags-migration.md](./feature-flags-migration.md)** - Guide de migration
   - Checklist d'implémentation
   - Configuration Directus
   - Migration du code existant
   - Tests et déploiement

## 🎯 Résumé rapide

### Qu'est-ce qu'un feature flag ?

Un **feature flag** (ou feature toggle) est un mécanisme permettant d'activer/désactiver des fonctionnalités sans redéployer l'application.

### Pourquoi en avons-nous besoin ?

Pour **Vie Publique Sénégal**, les feature flags permettent de :

✅ **Masquer des fonctionnalités non finalisées en production**
- Le chatbot en cours de développement
- La recherche V2 en phase de test
- Les pages de dons pas encore prêtes

✅ **Tester en production sans exposer aux utilisateurs**
- Activer une feature uniquement pour toi (environnement dev)
- Tester avec quelques utilisateurs beta (environnement test)
- Déployer progressivement en production

✅ **Désactiver rapidement en cas de bug**
- Sans redéploiement
- Juste un clic dans Directus
- Effet en 5 minutes (cache)

✅ **Gérer plusieurs environnements**
- Dev : Toutes les features visibles
- Test : Features stables uniquement
- Production : Features finalisées seulement

## 🚀 Quick Start

### 1. Configuration (5 min)

**Ajouter dans `.env` :**

```bash
NUXT_PUBLIC_APP_ENV=dev
NUXT_FEATURE_FLAGS_ENABLED=true
```

### 2. Créer la collection Directus (10 min)

Voir [feature-flags-migration.md](./feature-flags-migration.md#1-directus---créer-la-collection-feature_flags)

### 3. Créer les fichiers (15 min)

```bash
# Configuration
app/config/features.config.ts

# Composable
app/composables/useFeatureFlags.ts

# API
server/api/features/flags.get.ts
```

Copier le contenu depuis [feature-flags.md](./feature-flags.md)

### 4. Utiliser dans le code (5 min)

```vue
<script setup lang="ts">
const { isEnabled } = useFeatureFlags();
</script>

<template>
  <div>
    <!-- Fonctionnalité toujours visible -->
    <SearchBar />

    <!-- Fonctionnalité conditionnelle -->
    <Chatbot v-if="isEnabled('chatbot')" />
  </div>
</template>
```

## 📊 Cas d'usage concrets

### Cas 1 : Masquer des liens dans le menu

**Problème :** Le menu `/menu` affiche des liens vers des fonctionnalités pas encore prêtes (chatbot, donations, etc.)

**Solution :**

```typescript
// app/pages/menu.vue
const { isEnabled } = useFeatureFlags();

const navigationCards = [
  // Toujours visible
  {
    title: 'Actualités',
    to: '/actualites',
    icon: 'i-heroicons-newspaper',
  },

  // Conditionnel - seulement si activé
  ...(isEnabled('menu_chatbot') ? [{
    title: 'Chatbot',
    to: '/chatbot',
    icon: 'i-heroicons-chat-bubble-left-ellipsis',
  }] : []),

  ...(isEnabled('menu_donations') ? [
    {
      title: 'Don avec Bictorys',
      to: '/don/bictorys',
      icon: 'i-heroicons-heart',
    },
  ] : []),
];
```

**Configuration Directus :**

```json
{
  "key": "menu_chatbot",
  "enabled": false,
  "environments": ["dev"],
  "description": "Chatbot (en développement)"
}
```

**Résultat :**
- En **dev** : Chatbot visible ✅
- En **test** : Chatbot masqué ❌
- En **production** : Chatbot masqué ❌

### Cas 2 : Masquer la recherche sur l'accueil

**Problème :** La barre de recherche sur l'accueil n'est pas encore optimisée

**Solution :**

```vue
<!-- app/pages/index.vue -->
<template>
  <div>
    <Hero />

    <!-- Barre de recherche conditionnelle -->
    <SearchBar v-if="isEnabled('home_search')" />

    <QuickLinks />
  </div>
</template>

<script setup lang="ts">
const { isEnabled } = useFeatureFlags();
</script>
```

**Configuration Directus :**

```json
{
  "key": "home_search",
  "enabled": true,
  "environments": ["dev", "test"],
  "description": "Barre de recherche accueil (en test)"
}
```

### Cas 3 : Désactiver rapidement une feature en production

**Scénario :** Un bug critique sur les graphiques d'évolution budgétaire

**Action :**
1. Aller dans Directus → `feature_flags`
2. Trouver `budget_evolution_charts`
3. Mettre `enabled: false`
4. Sauvegarder
5. Attendre 5 minutes (ou redémarrer)

**Résultat :** Les graphiques disparaissent sans redéploiement

## 🎨 Recommandations spécifiques

### Features à masquer immédiatement en production

Basé sur l'analyse de ton code actuel :

| Feature | Action | Raison |
|---------|--------|--------|
| `menu_search_v1` | ❌ Masquer | Obsolète, sera supprimé |
| `menu_search_v2` | ⚠️ Dev/Test uniquement | En cours de test |
| `menu_chatbot` | ❌ Dev uniquement | En développement |
| `menu_dashboard_cm` | ❌ Dev uniquement | Page de test interne |
| `menu_donations` | ⚠️ Dev/Test uniquement | Pas encore finalisé |
| Pages `2024.vue`, `2025.vue` | 🗑️ Supprimer | Obsolètes, remplacées par `index.vue` |

### Features à garder visibles

| Feature | Status | Raison |
|---------|--------|--------|
| `menu_budget` | ✅ Production | Fonctionnel et testé |
| `menu_quiz` | ✅ Production | Stable |
| `budget_evolution_charts` | ✅ Production | Nouvellement implémenté, testé |
| `home_search` | ✅ Production | Fonctionnel |

## 🔧 Configuration par environnement

### Développement (`.env.development`)

```bash
NUXT_PUBLIC_APP_ENV=dev
NUXT_FEATURE_FLAGS_ENABLED=true
NUXT_PUBLIC_ENABLE_BETA_FEATURES=true
NUXT_PUBLIC_ENABLE_DEBUG_MENU=true
```

**Résultat :** Toutes les features visibles, y compris celles en développement

### Test (`.env.test`)

```bash
NUXT_PUBLIC_APP_ENV=test
NUXT_FEATURE_FLAGS_ENABLED=true
NUXT_PUBLIC_ENABLE_BETA_FEATURES=true
NUXT_PUBLIC_ENABLE_DEBUG_MENU=false
```

**Résultat :** Features stables + features en phase de test

### Production (`.env.production`)

```bash
NUXT_PUBLIC_APP_ENV=production
NUXT_FEATURE_FLAGS_ENABLED=true
NUXT_PUBLIC_ENABLE_BETA_FEATURES=false
NUXT_PUBLIC_ENABLE_DEBUG_MENU=false
```

**Résultat :** Uniquement les features finalisées et approuvées

## 📈 Workflow de déploiement d'une nouvelle feature

### Exemple : Déployer la recherche V2

**Semaine 1 - Développement**

```json
{
  "key": "menu_search_v2",
  "enabled": true,
  "environments": ["dev"],
  "description": "Recherche V2 (en développement)"
}
```

**Semaine 2 - Tests internes**

```json
{
  "key": "menu_search_v2",
  "enabled": true,
  "environments": ["dev", "test"],
  "description": "Recherche V2 (en phase de test)"
}
```

**Semaine 3 - Beta en production**

Déployer en prod mais garder masqué :
```json
{
  "key": "menu_search_v2",
  "enabled": true,
  "environments": ["dev", "test"],
  "description": "Recherche V2 (beta test)"
}
```

Toi seul y accède en te connectant depuis ton IP dev ou via un cookie spécial.

**Semaine 4 - Déploiement complet**

```json
{
  "key": "menu_search_v2",
  "enabled": true,
  "environments": ["dev", "test", "production"],
  "description": "Recherche V2 (stable)"
}
```

**Semaine 5 - Nettoyage**

Supprimer le flag car la feature est maintenant standard :
- Retirer le `v-if="isEnabled('menu_search_v2')"`
- Supprimer le flag de Directus
- Supprimer l'ancienne recherche V1

## ❓ FAQ - Questions fréquentes

### Q1: Comment activer une feature partout (dev, test, prod) ?

**Réponse :**
```json
{
  "key": "ma_feature",
  "enabled": true,
  "environments": ["dev", "test", "production"]
}
```

### Q2: Comment masquer une feature en prod mais la garder en dev et test ?

**Réponse :**
```json
{
  "key": "ma_feature",
  "enabled": true,
  "environments": ["dev", "test"]  // ← Ne PAS mettre "production"
}
```

### Q3: Quelle est la différence entre `enabled: false` et retirer l'environnement ?

**Réponse :**

**Option 1 - Kill switch (désactivation totale) :**
```json
{
  "enabled": false,  // ← Désactive PARTOUT
  "environments": ["dev", "test", "production"]
}
```

**Option 2 - Contrôle par environnement :**
```json
{
  "enabled": true,
  "environments": ["dev", "test"]  // ← Actif en dev/test, masqué en prod
}
```

### Q4: Que se passe-t-il si je mets `environments: []` ?

**Réponse :** La feature sera masquée partout, même si `enabled: true`

### Q5: Comment tester une feature en prod sans l'exposer aux utilisateurs ?

**Réponse :** Garde la feature dans `["dev", "test"]` uniquement. Tu pourras y accéder via :
- Une connexion VPN
- Un cookie beta spécial (à implémenter)
- Un paramètre URL `?beta=true` (à implémenter)

### Q6: Combien de temps prend le changement d'un flag ?

**Réponse :** 5 minutes maximum (temps du cache). Pour un effet immédiat, redémarre le serveur.

## 🚨 Troubleshooting

### Les features ne changent pas

**Vérifier :**
1. L'environnement actuel : `console.log(process.env.NUXT_PUBLIC_APP_ENV)`
2. Le cache (attendre 5 min ou redémarrer)
3. Les permissions Directus (la collection doit être readable par Public)
4. Vérifier que l'environnement est bien dans `environments: [...]`

### Une feature s'affiche alors qu'elle est désactivée

**Vérifier :**
1. La configuration dans Directus
2. L'array `environments` contient bien l'environnement actuel
3. Le cache navigateur (Ctrl+F5)
4. Les deux conditions : `enabled: true` ET environnement dans la liste

### Directus indisponible

Le système fallback automatiquement sur les `DEFAULT_FLAGS` dans le code.

## 📚 Ressources

- [Documentation complète](./feature-flags.md)
- [Guide de migration](./feature-flags-migration.md)
- [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Feature Flags Best Practices](https://www.featureflags.io/feature-flag-best-practices/)

## ✅ Checklist de départ en production

- [ ] Collection Directus `feature_flags` créée
- [ ] Permissions configurées (Public: Read, Admin: Full)
- [ ] Données initiales insérées
- [ ] Variables d'environnement ajoutées (`.env.production`)
- [ ] Fichiers de code créés (config, composable, API)
- [ ] `menu.vue` migré avec feature flags
- [ ] Tests effectués en dev
- [ ] Tests effectués en test
- [ ] Tests effectués en prod (avec features masquées)
- [ ] Documentation partagée avec l'équipe
- [ ] Anciennes pages supprimées (2024.vue, 2025.vue)
- [ ] Monitoring configuré (optionnel)

## 💡 Prochaines améliorations possibles

1. **Dashboard admin** : Page `/admin/features` pour visualiser tous les flags
2. **Analytics** : Logger quelles features sont utilisées
3. **A/B Testing** : Activer pour 50% des utilisateurs
4. **User-based flags** : Activer pour certains utilisateurs (beta testers)
5. **Scheduled flags** : Auto-activer à une date précise

## 🤝 Support

Pour toute question :
1. Consulter [feature-flags.md](./feature-flags.md)
2. Consulter [feature-flags-migration.md](./feature-flags-migration.md)
3. Vérifier les logs serveur
4. Contacter l'équipe technique
