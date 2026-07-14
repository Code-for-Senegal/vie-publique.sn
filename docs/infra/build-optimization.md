# Optimisation du build (temps de build & variables d'environnement)

> Fusion de l'ancien `OPTIMIZATION-GUIDE.md` (guide temps de build, état des lieux ~2025) et de
> `guidelines/build-time.md` (séparation variables BUILD vs RUNTIME). Voir aussi
> [`docker-optimization.md`](./docker-optimization.md) (build de l'image) et
> [`ci-cd-github.md`](./ci-cd-github.md) (pipeline).

## 🏗️ Variables BUILD vs RUNTIME (Docker)

Le projet suit l'approche **une seule image Docker + variables runtime** (contrairement à Vercel
qui rebuild par environnement) :

- **Vercel** : `git push → build avec les ENV → deploy` — un build différent par environnement,
  variables injectées au moment du build.
- **Docker (notre cas)** : `git push → GitHub Actions build → image unique → deploy partout` —
  build statique une seule fois, variables runtime injectées à l'exécution.

### GitHub Secrets (variables de BUILD)

Intégrées dans le JavaScript final lors du build (variables **publiques**, visibles navigateur) :

```
NUXT_PUBLIC_SITE_URL
GTAG_ID
FACEBOOK_PIXEL_ID
PUBLIC_SHOW_PINNED_PEOLPLES
PUBLIC_SHOW_SCANDALS
PUBLIC_SHOW_BAROMETER
MAINTENANCE_MODE
```

### Docker Compose `.env` (variables de RUNTIME)

Utilisées côté serveur à l'exécution (variables **secrètes**, jamais dans l'image ni dans
GitHub Actions) :

```
CMS_API_URL
CMS_API_KEY
BREVO_API_KEY
BREVO_LIST_ID
NUXT_TURNSTILE_SECRET_KEY
SUNU_ELECTION_API_URL
SUNU_ELECTION_API_KEY
```

### Pourquoi cette distinction ?

1. Variables publiques → visibles dans le navigateur → intégrées au build.
2. Variables secrètes → côté serveur uniquement → runtime seulement.
3. Sécurité → pas de secrets dans GitHub Actions → secrets en production seulement.

Cette configuration évite l'erreur `CMS_API_KEY environment variable is required` pendant le
build Docker.

---

## 🎯 Réduction du temps de build (état des lieux ~2025)

Objectif initial : réduire le démarrage de **4 minutes à ~2 minutes** (50 % de gain).

### Problèmes identifiés

```
09:15:34 - Démarrage Nuxt
09:15:59 - Module nuxtseo (6.2s) ⚠️ LENT
09:17:32 - Vite client (4s)
09:18:03 - Vite server (30.7s) ⚠️ TRÈS LENT
09:19:10 - Nitro server (31s)
09:19:36 - Warmup (26s)
TOTAL: ~4 minutes
```

Causes principales :

1. **Module @nuxtjs/seo** : 6.2s (25 % du setup)
2. **Vite server build** : 30.7s (50 % du temps)
3. **Browserslist obsolète** (transpilation inutile)
4. **Tailwind non-serializable** : warnings + lenteur
5. **16 modules Nuxt** (PWA, Leaflet, Motion pas nécessaires en dev)

### Optimisations rapides (30 min)

1. **Browserslist** : `npx update-browserslist-db@latest` (gain ~-10 %)
2. **`tailwind.config.ts`** dédié + `tailwindcss: { configPath, quiet: true }` dans
   `nuxt.config.ts` (gain ~-5 %, supprime le warning)
3. **Nettoyer les caches** : supprimer `.nuxt`, `.output`, `node_modules/.cache`
4. **Tuer les processus Node orphelins** (port 3000 occupé = symptôme) :
   ```powershell
   $processId = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
   if ($processId) { Stop-Process -Id $processId -Force }
   ```
5. **`postinstall`** : garder seulement `nuxt prepare` (pas `copy-pdf-worker`, déjà dans
   `dev`/`build`) → `npm install` 2× plus rapide

### Optimisations moyennes (1-2 h)

6. **Modules lourds conditionnels** (dev vs prod) : `@nuxtjs/seo`, `@vite-pwa/nuxt`,
   `@nuxtjs/leaflet`, `@vueuse/motion/nuxt`, `@nuxtjs/web-vitals` seulement en production
   (gain ~-30/40 %)
7. **@nuxtjs/seo** : `seo: { enabled: NODE_ENV === 'production', splash: false }` (gain ~-18 %)
8. **Vite** : `optimizeDeps.include` des libs lourdes (`d3`, `pdfjs-dist`, `marked`,
   `papaparse`, `leaflet`) + `server.warmup.clientFiles` des routes chaudes (gain ~-10/15 %)

### Optimisations avancées

9. **Lazy load** des composants lourds (D3, Leaflet, PDF) via `defineAsyncComponent`
10. **Analyser les bundles** : `rollup-plugin-visualizer` + `ANALYZE=true npm run build`
11. **GitHub Actions** : cache npm/.nuxt + `npm ci --prefer-offline --no-audit` (gain ~-50 % CI)

### Checklist

```
# Quick wins
[ ] npx update-browserslist-db@latest
[ ] Créer tailwind.config.ts
[ ] Nettoyer .nuxt, .output, node_modules/.cache
[ ] Modifier script postinstall

# Moyennes
[ ] Modules conditionnels dev/prod
[ ] Optimiser @nuxtjs/seo
[ ] Optimiser config Vite (optimizeDeps + warmup)

# Long terme
[ ] Lazy load composants (D3, Leaflet, PDF)
[ ] Analyser bundles avec visualizer
[ ] Optimiser GitHub Actions
[ ] Réduire le nombre de modules

# Hygiène repo (réduit le contexte de build Docker — cf. audit DOC-2)
[ ] Supprimer les gros fichiers versionnés (PDF/JSON) → CDN ou API
[ ] Supprimer les composants qui ne sont plus utilisés
```

## 🔗 Ressources

- [Nuxt Performance](https://nuxt.com/docs/guide/going-further/performance)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Browserslist](https://github.com/browserslist/browserslist)
