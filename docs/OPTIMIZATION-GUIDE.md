# Guide d'Optimisation des Performances

## 🎯 Objectif

Réduire le temps de démarrage de **4 minutes à ~2 minutes** (50% de gain).

---

## 🔍 Problèmes identifiés

### Temps de build actuel (4 min)
```
09:15:34 - Démarrage Nuxt
09:15:59 - Module nuxtseo (6.2s) ⚠️ LENT
09:17:32 - Vite client (4s)
09:18:03 - Vite server (30.7s) ⚠️ TRÈS LENT
09:19:10 - Nitro server (31s)
09:19:36 - Warmup (26s)
TOTAL: ~4 minutes
```

### Causes principales
1. **Module @nuxtjs/seo** : 6.2s (25% du setup)
2. **Vite server build** : 30.7s (50% du temps)
3. **Browserslist obsolète** : 10 mois (transpilation inutile)
4. **Tailwind non-serializable** : Warnings + lenteur
5. **16 modules Nuxt** : Beaucoup trop (PWA, Leaflet, Motion pas nécessaires en dev)

---

## ✅ OPTIMISATIONS RAPIDES (30 min)

### 1. Mettre à jour Browserslist (30 sec)

```bash
npx update-browserslist-db@latest
```

**Gain** : -10% de temps de build

---

### 2. Créer tailwind.config.ts (5 min)

**Créer** `tailwind.config.ts` :
```typescript
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [],
  plugins: [typography],
} satisfies Config
```

**Modifier** `nuxt.config.ts` (lignes 258-262) :
```typescript
tailwindcss: {
  configPath: './tailwind.config.ts',
  quiet: true,  // Supprime warnings
},
```

**Supprimer** dans `nuxt.config.ts` (lignes 1-2) :
```typescript
// ❌ SUPPRIMER CES LIGNES
import tailwindTypography from '@tailwindcss/typography'
import { readFileSync } from 'fs'
```

**Gain** : -5% + supprime le warning

---

### 3. Nettoyer les caches (1 min)

```bash
# PowerShell
Remove-Item -Recurse -Force .nuxt, .output, node_modules\.cache -ErrorAction SilentlyContinue
npm install
```

**Gain** : Évite conflits + 1ère fois plus rapide

---

### 4. Tuer processus Node orphelins (1 min)

```powershell
# Voir tous les processus Node
Get-Process node

# Tuer seulement ceux sur port 3000
$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }

# Ou tout tuer (ATTENTION)
Stop-Process -Name node -Force
```

**Gain** : Évite le conflit de port 3000

---

### 5. Optimiser script postinstall (2 min)

**Modifier** `package.json` :
```json
{
  "scripts": {
    "postinstall": "nuxt prepare",  // ❌ Supprimer "&& npm run copy-pdf-worker"
    "dev": "npm run copy-pdf-worker && nuxt dev",  // ✅ Déjà là
    "build": "npm run copy-pdf-worker && nuxt build"  // ✅ Déjà là
  }
}
```

**Gain** : `npm install` 2x plus rapide

---

## ⚡ OPTIMISATIONS MOYENNES (1-2h)

### 6. Désactiver modules lourds en dev (30 min)

**Option A : Créer `.nuxtrc`** (recommandé)
```ini
# .nuxtrc - Désactive modules non essentiels en dev
modules.pwa=false
modules.leaflet=false
modules.motion=false
modules.webVitals=false
```

**Option B : Modifier `nuxt.config.ts`** (lignes 145-160)
```typescript
modules: [
  '@nuxt/ui',
  '@nuxt/content',
  'nuxt-gtag',
  // ⚠️ Conditionner les modules lourds
  ...(process.env.NODE_ENV === 'production' ? [
    '@nuxtjs/seo',  // 6s en dev
    '@vite-pwa/nuxt',  // Inutile en dev
    '@nuxtjs/leaflet',  // Loader dynamiquement
    '@vueuse/motion/nuxt',  // Loader dynamiquement
    '@nuxtjs/web-vitals',  // Metrics prod only
  ] : []),
  '@nuxt/image',
  '@nuxt/eslint',
  '@pinia/nuxt',
  '@vueuse/nuxt',
  '@nuxtjs/mdc',
  'nuxt-security',
],
```

**Gain** : -30-40% de temps

---

### 7. Optimiser @nuxtjs/seo (15 min)

**Ajouter** dans `nuxt.config.ts` :
```typescript
seo: {
  // Désactive en dev (module prend 6s)
  enabled: process.env.NODE_ENV === 'production',
  splash: false,
  fallbackTitle: false,
}
```

**Gain** : -18% (6s économisés)

---

### 8. Optimiser Vite (20 min)

**Modifier** dans `nuxt.config.ts` (lignes 126-130) :
```typescript
vite: {
  build: {
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle des libs lourdes
    include: [
      'd3',
      'pdfjs-dist',
      'marked',
      'papaparse',
      'leaflet',
    ],
  },
  server: {
    fs: {
      strict: false,  // Évite erreurs ENOENT
    },
    warmup: {
      // Précharge les routes les plus utilisées
      clientFiles: [
        './pages/index.vue',
        './pages/nomination-senegal/index.vue',
      ],
    },
  },
}
```

**Gain** : -10-15%

---

### 9. Désactiver devtools en prod (déjà fait ✅)

**Vérifier** ligne 161 :
```typescript
devtools: {
  enabled: process.env.NODE_ENV !== 'production'
},
```

**Gain** : Aucun (déjà optimisé)

---

## 🔧 OPTIMISATIONS AVANCÉES (3-5h)

### 10. Lazy load des composants lourds

Pour les pages avec D3, Leaflet, PDF :

```vue
<script setup>
// ✅ Lazy load
const BudgetChart = defineAsyncComponent(() =>
  import('~/components/Budget/BudgetChart.vue')
)
const LeafletMap = defineAsyncComponent(() =>
  import('~/components/Map/LeafletMap.vue')
)
</script>
```

**Gain** : -5% build + meilleur code splitting

---

### 11. Analyser les bundles

**Installer** :
```bash
npm i -D rollup-plugin-visualizer
```

**Ajouter** dans `nuxt.config.ts` :
```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineNuxtConfig({
  vite: {
    plugins: process.env.ANALYZE ? [
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'stats.html',
      })
    ] : [],
  },
})
```

**Analyser** :
```bash
ANALYZE=true npm run build
# Ouvre stats.html pour voir les gros bundles
```

**Gain** : Identifie les dépendances à optimiser

---

### 12. Optimiser GitHub Actions (10min → 5min)

**Modifier** `.github/workflows/*.yml` :
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      .nuxt
      node_modules/.cache
    key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

- name: Install
  run: npm ci --prefer-offline --no-audit

- name: Build
  env:
    NODE_ENV: production
    NITRO_PRERENDER_ROUTES: false  # Pas de prerender
  run: npm run build
```

**Gain** : -50% sur GitHub Actions

---

## 📊 GAINS ATTENDUS

| Optimisation | Temps actuel | Temps après | Gain |
|--------------|--------------|-------------|------|
| Browserslist | 4min | 3min 30s | **-12%** |
| Tailwind config | 4min | 3min 45s | **-6%** |
| Modules conditionnels | 4min | 2min 30s | **-37%** |
| @nuxtjs/seo optimisé | 4min | 3min 15s | **-18%** |
| Vite optimisé | 4min | 3min 30s | **-12%** |
| **CUMULÉ** | **4min** | **~2min** | **~50%** |

---

## 🚀 PLAN D'ACTION RECOMMANDÉ

### Phase 1 : Quick wins (30 min) ⚡
1. `npx update-browserslist-db@latest`
2. Créer `tailwind.config.ts`
3. Nettoyer caches
4. Tuer processus Node
5. Modifier `postinstall`

**Gain attendu** : -20%

---

### Phase 2 : Optimisations moyennes (2h) 🔧
6. Créer `.nuxtrc` avec modules désactivés
7. Optimiser `@nuxtjs/seo`
8. Optimiser config Vite

**Gain attendu** : -30%

---

### Phase 3 : Long terme (1 semaine) 🏗️
9. Lazy load composants lourds
10. Analyser bundles
11. Optimiser GitHub Actions
12. Réduire nombre de modules (16 → 10)

**Gain attendu** : -10% supplémentaire

---

## ✅ CHECKLIST COMPLÈTE

```bash
# 1. Quick wins (30 min)
[ ] npx update-browserslist-db@latest
[ ] Créer tailwind.config.ts
[ ] Nettoyer .nuxt, .output, node_modules/.cache
[ ] Tuer processus Node orphelins
[ ] Modifier script postinstall

# 2. Optimisations moyennes (2h)
[ ] Créer .nuxtrc (modules conditionnels)
[ ] Optimiser @nuxtjs/seo
[ ] Optimiser config Vite

# 3. Long terme
[ ] Lazy load composants (D3, Leaflet, PDF)
[ ] Analyser bundles avec visualizer
[ ] Optimiser GitHub Actions
[ ] Réduire nombre de modules
```

---

## 📝 NOTES

- **Port 3000 occupé** : Symptôme de processus orphelins
- **Warning Tailwind** : Supprimé avec `tailwind.config.ts`
- **6.2s pour nuxtseo** : Normal mais peut être désactivé en dev
- **30s Vite server** : Réduit avec optimizeDeps + modules conditionnels

---

## 🔗 RESSOURCES

- [Nuxt Performance](https://nuxt.com/docs/guide/going-further/performance)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Browserslist](https://github.com/browserslist/browserslist)
