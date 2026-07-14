# TODO: Optimisation du cache API

## Problème

Actuellement, **48 routes API** utilisent `defineCachedEventHandler` avec un `maxAge` fixe, identique en production et en développement. Cela cause des problèmes en développement car les modifications dans Directus ne sont visibles qu'après expiration du cache (parfois jusqu'à 24h).

## Solution temporaire appliquée

Les routes suivantes ont été modifiées pour avoir un cache court en dev :
- `server/api/budget/years.get.ts` : 5 min en dev, 24h en prod
- `server/api/budget/global.get.ts` : 5 min en dev, 1h en prod

## Solution recommandée à long terme

### 1. Créer une fonction utilitaire centralisée

Le fichier `server/utils/cache.ts` a déjà été créé avec :
- `getCacheMaxAge(productionSeconds, devSeconds)` : fonction pour adapter le cache selon l'environnement
- `CacheDuration` : constantes pour les durées communes (SHORT, MEDIUM, LONG, VERY_LONG)

### 2. Mettre à jour toutes les routes API

Remplacer les `maxAge` fixes par l'utilisation de la fonction utilitaire.

**Exemple avant :**
```typescript
export default defineCachedEventHandler(
  async (event) => {
    // ...
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'assembly-deputies',
  }
);
```

**Exemple après :**
```typescript
import { getCacheMaxAge, CacheDuration } from '../../utils/cache';

export default defineCachedEventHandler(
  async (event) => {
    // ...
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.MEDIUM), // 1h en prod, 30s en dev
    name: 'assembly-deputies',
  }
);
```

### 3. Routes concernées (48 fichiers)

Voici la liste complète des fichiers à mettre à jour :

**Assembly (15 fichiers)**
- `server/api/assembly/commissions/index.get.ts`
- `server/api/assembly/commissions/[id].get.ts`
- `server/api/assembly/deputies/index.get.ts`
- `server/api/assembly/deputies/[id]/commissions.get.ts`
- `server/api/assembly/deputies/[id]/index.get.ts`
- `server/api/assembly/deputies/[id]/questions.get.ts`
- `server/api/assembly/deputies/[id].get.ts`
- `server/api/assembly/groups/index.get.ts`
- `server/api/assembly/groups/[id].get.ts`
- `server/api/assembly/office/index.get.ts`
- `server/api/assembly/questions/index.get.ts`
- `server/api/assembly/questions/latest.get.ts` ⚠️ (déjà 5 min, pourrait rester tel quel)
- `server/api/assembly/questions/[id].get.ts`
- `server/api/assembly/votes/index.get.ts`
- `server/api/assembly/votes/[id].get.ts`

**Documents (2 fichiers)**
- `server/api/documents/index.get.ts`
- `server/api/documents/[id].get.ts`

**Elections (16 fichiers)**
- `server/api/elections/bureaux-temoins.get.ts` ⚠️ (déjà 5 min)
- `server/api/elections/candidates/elected.get.ts`
- `server/api/elections/coalitions/index.get.ts`
- `server/api/elections/coalitions/[id].get.ts`
- `server/api/elections/diaspora/countries.get.ts`
- `server/api/elections/diaspora/country-details/[country].get.ts`
- `server/api/elections/diaspora/country-stats/[country].get.ts`
- `server/api/elections/lists/[coalitionId].get.ts`
- `server/api/elections/map/department-details/[department].get.ts`
- `server/api/elections/map/department-stats.get.ts`
- `server/api/elections/map/national.get.ts`
- `server/api/elections/participation.get.ts`
- `server/api/elections/pvs/[source].get.ts`
- `server/api/elections/results/departments.get.ts`
- `server/api/elections/stats/lists.get.ts`
- `server/api/elections/stats/professions.get.ts`

**Medias (3 fichiers)**
- `server/api/medias/index.get.ts`
- `server/api/medias/[id].get.ts`
- `server/api/medias/stats.get.ts`

**News (2 fichiers)**
- `server/api/news/index.get.ts`
- `server/api/news/[id].get.ts`

**Nominations (3 fichiers)**
- `server/api/nominations/index.get.ts`
- `server/api/nominations/[id].get.ts`
- `server/api/nominations/stats.get.ts`

**Partners (1 fichier)**
- `server/api/partners/index.get.ts`

**State (4 fichiers)**
- `server/api/state/entities/index.get.ts`
- `server/api/state/entities/[slug].get.ts`
- `server/api/state/stats.get.ts`
- `server/api/state/tree.get.ts`

**Budget (2 fichiers)** ✅ Déjà mis à jour
- `server/api/budget/years.get.ts` ✅
- `server/api/budget/global.get.ts` ✅

## Prompt pour mise à jour automatisée

```
Je veux optimiser le cache de toutes mes routes API pour faciliter le développement.

Contexte :
- J'ai 48 routes utilisant `defineCachedEventHandler` avec `maxAge` fixe
- Le fichier `server/utils/cache.ts` existe déjà avec les fonctions `getCacheMaxAge()` et `CacheDuration`
- Je veux que le cache soit court en dev (30s par défaut) et long en prod (1h, 24h selon le type de données)

Tâche :
1. Pour chaque fichier dans `server/api/**/*.get.ts` qui utilise `defineCachedEventHandler` :
   - Ajouter l'import : `import { getCacheMaxAge, CacheDuration } from '../../utils/cache';` (ajuster le chemin relatif)
   - Remplacer `maxAge: 60 * 60` par `maxAge: getCacheMaxAge(CacheDuration.MEDIUM)`
   - Remplacer `maxAge: 60 * 60 * 24` par `maxAge: getCacheMaxAge(CacheDuration.LONG)`
   - Remplacer `maxAge: 60 * 5` par `maxAge: getCacheMaxAge(CacheDuration.SHORT)`

2. Adapter le chemin d'import selon la profondeur :
   - `server/api/xxx/yyy.get.ts` → `../../utils/cache`
   - `server/api/xxx/yyy/zzz.get.ts` → `../../../utils/cache`

3. Vérifier que le projet build correctement après les modifications

Liste complète des fichiers dans : docs/guidelines/todo-cache-optimization.md

Commence par me montrer un exemple de modification pour 2-3 fichiers, puis si validé, applique à tous.
```

## Bénéfices attendus

- ✅ **Développement plus rapide** : voir les changements en 30s-5min au lieu de 1h-24h
- ✅ **Performance en prod** : garder les caches longs pour minimiser les requêtes CMS
- ✅ **Maintenabilité** : gestion centralisée du cache, facile à ajuster
- ✅ **Cohérence** : même pattern partout dans le projet

## Estimation

- **Temps estimé** : 30-45 minutes pour modifier les 46 fichiers restants
- **Risque** : Faible (changement mécanique, pas de logique métier modifiée)
- **Priorité** : Moyenne (confort dev mais pas bloquant)
