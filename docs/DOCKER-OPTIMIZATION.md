# Optimisation Docker - Réduction du temps de build

## 🔴 Problème identifié

**Temps de build GitHub Actions** : ~10 minutes (trop long)

### Analyse des logs

```
#14 [deps 3/3] RUN npm ci --frozen-lockfile         25s
#19 [builder 5/5] RUN npm run build                 ~50s
#28 preparing build cache for export                160.9s ← PROBLÈME !
```

**160 secondes (2min 40s)** perdues à exporter le cache Docker.

## 🎯 Cause racine

### Avant : Architecture inefficace

```dockerfile
FROM base AS builder
RUN npm ci --frozen-lockfile  # ← Réinstalle TOUT à chaque modif de code
COPY . .                      # ← Invalide le cache npm
RUN npm run build
```

**Problème** :
- Chaque modification de code → Invalidation du cache `npm ci`
- Réinstallation de 1850 packages à chaque push
- Cache layer massif exporté à chaque fois

### Après : Architecture optimisée

```dockerfile
# Stage 1: Dependencies (CACHE PERSIST)
FROM base AS deps
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Build (utilise le cache deps)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

**Avantages** :
- ✅ Cache `npm ci` **PERSISTE** tant que `package.json` ne change pas
- ✅ Seul le code source est recopié lors des modifs
- ✅ Cache layer beaucoup plus petit

## 📊 Gains attendus

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **1er build** (sans cache) | ~230s | ~230s | 0% (normal) |
| **2e build** (avec cache) | ~230s | **~60s** | **-73%** ⚡ |
| **Cache export** | 160s | **<10s** | **-94%** 🚀 |

### Scénarios

#### Scénario 1 : Modification de code (le plus fréquent)
```bash
# Avant : 230s
npm ci (25s) + build (50s) + cache export (160s) = 235s

# Après : 60s
npm ci (CACHED!) + build (50s) + cache export (10s) = 60s
```

**Gain : -73%** (4x plus rapide)

#### Scénario 2 : Modification de package.json
```bash
# Avant : 230s
# Après : 230s (même temps, normal)
```

## ✅ Optimisations appliquées

### 1. Dockerfile multi-stage avec cache intelligent

**Fichier** : `Dockerfile`

**Changements** :
- ✅ Stage `deps` séparé pour les node_modules
- ✅ Stage `builder` réutilise le cache deps
- ✅ Stage `runner` minimaliste (production)

### 2. GitHub Actions - Double cache

**Fichier** : `.github/workflows/ci-cd.yml`

```yaml
cache-from: |
  type=gha                     # Cache GitHub Actions (rapide)
  type=registry,ref=...        # Cache Registry (fallback)
cache-to: |
  type=gha,mode=max            # Export cache GHA
  type=registry,mode=max       # Export cache Registry
```

**Avantages** :
- ✅ Cache GHA ultra-rapide (GitHub infrast)
- ✅ Fallback registry si GHA expiré
- ✅ `mode=max` = cache tous les layers

### 3. .dockerignore optimisé

**Fichier** : `.dockerignore`

Déjà optimal avec :
```dockerignore
node_modules
.nuxt
.output
.git
.github
docs/
```

## 🚀 Comment tester

### Test local

```bash
# Build initial (sans cache)
docker build -t vie-publique:test .

# Modifier un fichier source
echo "// test" >> pages/index.vue

# Rebuild (avec cache)
time docker build -t vie-publique:test .
# Devrait prendre ~60s au lieu de 230s
```

### Test GitHub Actions

1. Push une modification de code (pas package.json)
2. Observer le temps de build dans Actions
3. Chercher dans les logs :

```
#14 [deps 3/3] RUN npm ci --frozen-lockfile
#14 CACHED  ← Devrait dire "CACHED"
```

## 📈 Monitoring

### Métriques à surveiller

1. **Temps total de build**
   - Cible : < 2 minutes (avec cache)
   - Alerte si > 5 minutes

2. **Taux de cache hit**
   - Cible : > 90% sur les builds de code
   - Vérifier "CACHED" dans les logs

3. **Temps cache export**
   - Cible : < 15s
   - Alerte si > 30s

### Logs à analyser

```bash
# GitHub Actions logs
grep "CACHED" build.log
grep "preparing build cache" build.log
```

## 🔍 Troubleshooting

### Cache jamais utilisé

**Symptôme** : Toujours "npm ci" complet même sans modif package.json

**Solution** :
1. Vérifier que `.dockerignore` exclut `node_modules`
2. Vérifier l'ordre des COPY dans Dockerfile
3. Vérifier que `cache-from` est bien configuré

### Cache trop gros

**Symptôme** : "preparing build cache" > 30s

**Solution** :
1. Vérifier `.dockerignore` (exclure docs, tests, etc.)
2. Utiliser `mode=max` seulement si nécessaire
3. Nettoyer le cache registry :
   ```bash
   docker system prune -a
   ```

### Builds toujours lents

**Symptôme** : Même avec cache, > 3 minutes

**Solution** :
1. Désactiver SonarCloud temporairement
2. Vérifier la vitesse réseau GitHub → Registry
3. Tester en local pour isoler le problème

## 📚 Références

- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [GitHub Actions Cache](https://docs.docker.com/build/ci/github-actions/cache/)
- [Docker Build Cache](https://docs.docker.com/build/cache/)

## 🎯 Prochaines optimisations possibles

1. **Cache npm dans GitHub Actions**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: npm-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Paralléliser tests + build**
   ```yaml
   jobs:
     test:
       # ...
     build:
       # Sans needs: test-and-analyze
   ```

3. **Build conditionnel**
   ```yaml
   - name: Check if build needed
     id: changes
     run: |
       git diff --name-only HEAD^..HEAD | grep -E '(pages/|components/|server/)' && echo "::set-output name=build::true"
   ```

## ✅ Checklist validation

- [x] Dockerfile multi-stage créé
- [x] GitHub Actions cache configuré
- [x] .dockerignore vérifié
- [ ] Test local effectué
- [ ] Test GitHub Actions effectué
- [ ] Monitoring en place
- [ ] Documentation partagée à l'équipe

---

**Date de création** : 2025-10-12
**Auteur** : Claude Code
**Version** : 1.0
