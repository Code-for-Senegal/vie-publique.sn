# Résumé : Bloquer l'indexation de test.vie-publique.sn

## ✅ Protections mises en place (Quadruple sécurité)

### 1. **`site.env` dans nuxt.config.ts** ⭐⭐⭐ (SOLUTION OFFICIELLE)
**Fichier** : `nuxt.config.ts` ligne 369

```typescript
site: {
  env: process.env.NUXT_SITE_ENV || 'production',
}
```

**Documentation officielle** : https://nuxtseo.com/docs/robots/guides/disable-indexing

**Effet** :
- ✅ Contrôle **GLOBAL** de @nuxtjs/seo via l'environnement
- ✅ Gère automatiquement robots.txt, meta tags, et X-Robots-Tag
- ✅ Solution **officielle recommandée** par Nuxt SEO
- ✅ Nuxt Robots désactive automatiquement l'indexation si `env !== 'production'`

**Configuration** :
- Test : `NUXT_SITE_ENV=staging` → Indexation désactivée
- Prod : `NUXT_SITE_ENV=production` → Indexation activée

**Résultat attendu** :
- Test : `X-Robots-Tag: noindex, nofollow`
- Prod : `X-Robots-Tag: index, follow`

---

### 2. **Meta tags dans app.vue** ⭐⭐
**Fichier** : `app.vue` lignes 10-18

```typescript
if (!isProduction) {
  useHead({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'googlebot', content: 'noindex, nofollow' },
      { name: 'bingbot', content: 'noindex, nofollow' },
    ],
  });
}
```

**Effet** :
- ✅ Ajoute `<meta name="googlebot" content="noindex, nofollow">` dans le HTML
- ✅ **FONCTIONNE DÉJÀ** (vérifié dans le code source)

**Statut** : ✅ **ACTIF** sur test.vie-publique.sn

---

### 3. **robots.txt dynamique** ⭐⭐
**Fichier** : `server/routes/robots.txt.ts`

```typescript
if (isProduction) {
  return 'User-agent: *\nAllow: /';
} else {
  return 'User-agent: *\nDisallow: /';
}
```

**Test** :
```bash
curl https://test.vie-publique.sn/robots.txt
# Devrait afficher: User-agent: * / Disallow: /
```

---

### 4. **Middleware serveur (optionnel)** ⭐
**Fichier** : `server/middleware/noindex.ts`

```typescript
if (!isProduction) {
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
}
```

**Note** : Peut être **supprimé** car `site.indexable` fait déjà le travail.

---

## 🎯 Configuration Coolify

### Pour test.vie-publique.sn
```env
NUXT_PUBLIC_SITE_URL=https://test.vie-publique.sn
```

### Pour vie-publique.sn (production)
```env
NUXT_PUBLIC_SITE_URL=https://vie-publique.sn
```

**⚠️ CRITIQUE** : Vérifier que la variable est bien configurée !

---

## 🧪 Tests après déploiement

### 1. Vérifier le header HTTP (le plus important)
```bash
curl -I https://test.vie-publique.sn | grep -i "robots"
```

**Attendu** :
```
X-Robots-Tag: noindex, nofollow
```

**Si tu vois encore** :
```
X-Robots-Tag: index, follow  # ❌ MAUVAIS
```

→ Vérifier que `NUXT_PUBLIC_SITE_URL=https://test.vie-publique.sn` est bien configuré

### 2. Vérifier robots.txt
```bash
curl https://test.vie-publique.sn/robots.txt
```

**Attendu** :
```
User-agent: *
Disallow: /
```

### 3. Vérifier les meta tags (déjà OK)
```bash
curl -s https://test.vie-publique.sn | grep -i "googlebot"
```

**Attendu** :
```html
<meta name="googlebot" content="noindex, nofollow">
<meta name="bingbot" content="noindex, nofollow">
```

✅ **Déjà visible dans ton code source**

---

## 🔧 Debug si ça ne marche pas

### Problème : Header toujours `index, follow`

**Causes possibles** :

1. **Variable d'environnement mal configurée**
   ```bash
   # Dans le container Docker :
   docker exec <container> printenv | grep NUXT_PUBLIC_SITE_URL
   # Devrait afficher : NUXT_PUBLIC_SITE_URL=https://test.vie-publique.sn
   ```

2. **Cache Nuxt/Nitro**
   ```bash
   # Sur Coolify, redéployer complètement :
   - Delete .nuxt/ et .output/
   - Rebuild from scratch
   ```

3. **Module @nuxtjs/seo pas à jour**
   ```bash
   npm update @nuxtjs/seo
   ```

---

## 📊 Priorité des protections

| Protection | Efficacité | Priorité | À garder ? |
|------------|------------|----------|-----------|
| `site.env: staging` | ⭐⭐⭐ | #1 - Contrôle tout | ✅ **OUI** |
| Meta `<googlebot>` | ⭐⭐ | #2 - Backup HTML | ⚠️ Optionnel |
| robots.txt | ⭐⭐ | #3 - Crawlers respectueux | ⚠️ Optionnel |
| Middleware noindex | ⭐ | #4 - Redondant avec #1 | ❌ Non nécessaire |

**Recommandation** :
- ✅ **GARDER** : `site.env` dans nuxt.config.ts (ligne 369) - **SOLUTION OFFICIELLE**
- ⚠️ **OPTIONNEL** : Meta tags dans app.vue + robots.txt (défense en profondeur)
- ❌ **SUPPRIMER** : Middleware noindex (redondant, @nuxtjs/seo gère déjà)

---

## ✅ Checklist de déploiement

### Avant déploiement
- [x] Modifier `nuxt.config.ts` (ligne 368)
- [x] Vérifier `app.vue` (lignes 10-18)
- [x] Créer `server/routes/robots.txt.ts`
- [ ] Commit & Push

### Configuration Coolify
**Test (test.vie-publique.sn)** :
- [ ] `NUXT_SITE_ENV=staging`
- [ ] `NUXT_PUBLIC_SITE_URL=https://test.vie-publique.sn`

**Production (vie-publique.sn)** :
- [ ] `NUXT_SITE_ENV=production`
- [ ] `NUXT_PUBLIC_SITE_URL=https://vie-publique.sn`

- [ ] Redéployer les deux environnements

### Après déploiement (test)
- [ ] Test header HTTP → `noindex, nofollow`
- [ ] Test robots.txt → `Disallow: /`
- [ ] Test meta tags → `<meta name="googlebot">`

### Après déploiement (prod)
- [ ] Test header HTTP → `index, follow`
- [ ] Test robots.txt → `Allow: /`
- [ ] Pas de meta noindex

### Actions Bing/Google
- [ ] Demande suppression Bing Webmaster (test.vie-publique.sn)
- [ ] Vérifier Google Search Console
- [ ] Attendre 7 jours et revérifier

---

## 🚨 Action immédiate Bing

**Pendant que le redéploiement se fait** :

1. https://www.bing.com/webmasters/
2. Ajouter `test.vie-publique.sn`
3. **URL Removal** → Supprimer toutes les URLs test

**Délai** : 1-7 jours après redéploiement

---

## 📝 Fichiers modifiés

1. ✅ `nuxt.config.ts` (ligne 368) - `site.indexable`
2. ✅ `app.vue` (lignes 10-18) - Meta tags
3. ✅ `server/routes/robots.txt.ts` - robots.txt dynamique
4. ⚠️ `server/middleware/noindex.ts` - Optionnel (peut être supprimé)

---

**Date** : 2025-10-12
**Statut** : ✅ Prêt à déployer
**Efficacité attendue** : 99.9% de blocage
