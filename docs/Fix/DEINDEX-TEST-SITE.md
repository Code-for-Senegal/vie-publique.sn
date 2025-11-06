# Désindexer test.vie-publique.sn

https://nuxtseo.com/docs/robots/guides/disable-indexing

## 🔴 Problème
Le site de test **test.vie-publique.sn** est indexé sur Bing et peut-être Google.

## ✅ Solutions appliquées

### 1. **robots.txt dynamique** ⭐
- **Fichier** : `server/routes/robots.txt.ts`
- **Logique** : Si `NUXT_PUBLIC_SITE_URL !== https://vie-publique.sn` → Bloquer tous les robots

**Test** :
```bash
# Test
curl https://test.vie-publique.sn/robots.txt
# Devrait afficher: User-agent: * / Disallow: /

# Production
curl https://vie-publique.sn/robots.txt
# Devrait afficher: User-agent: * / Allow: /
```

### 2. **Meta tags noindex** ⭐⭐
- **Fichier** : `app.vue` (lignes 10-18)
- **Logique** : Ajoute `<meta name="robots" content="noindex, nofollow">` si pas production

**Vérification** :
```bash
curl -s https://test.vie-publique.sn | grep -i "robots"
# Devrait afficher: <meta name="robots" content="noindex, nofollow">
```

### 3. **Header HTTP X-Robots-Tag** ⭐⭐
- **Fichier** : `server/middleware/noindex.ts`
- **Logique** : Ajoute header `X-Robots-Tag: noindex, nofollow` sur toutes les requêtes

**Vérification** :
```bash
curl -I https://test.vie-publique.sn
# Devrait afficher: X-Robots-Tag: noindex, nofollow
```

## 🚀 Actions immédiates pour Bing

### 1. **Soumettre une demande de désindexation**

#### Pour Bing Webmaster Tools :
1. Aller sur https://www.bing.com/webmasters/
2. Ajouter **test.vie-publique.sn** (si pas déjà fait)
3. Aller dans **Site Explorer** → **URLs**
4. Sélectionner toutes les URLs de test.vie-publique.sn
5. Cliquer **Remove URLs** → **Remove this URL only** ou **Remove this URL and all pages under this directory**

#### Alternative : URL Removal Tool
1. https://www.bing.com/webmasters/tools/removals
2. Ajouter **test.vie-publique.sn** ou des URLs spécifiques
3. Soumettre la demande

### 2. **Vérifier Google Search Console**

1. Aller sur https://search.google.com/search-console
2. Vérifier si **test.vie-publique.sn** y est
3. Si oui, aller dans **Removals** → **Temporarily remove URL**
4. Ajouter **test.vie-publique.sn**

### 3. **Attendre le recrawl naturel**

Avec les 3 protections en place :
- **robots.txt** : Immédiat (quelques heures)
- **Meta noindex** : 1-7 jours (au prochain crawl)
- **X-Robots-Tag** : 1-7 jours (au prochain crawl)

## 📋 Checklist de validation

### Déploiement
- [ ] Déployer les modifications sur **test.vie-publique.sn**
- [ ] Vérifier que `NUXT_PUBLIC_SITE_URL` est bien configuré dans les variables d'env
- [ ] Redémarrer l'application

### Tests techniques
- [ ] `curl https://test.vie-publique.sn/robots.txt` → Doit afficher `Disallow: /`
- [ ] `curl -I https://test.vie-publique.sn` → Doit afficher `X-Robots-Tag: noindex, nofollow`
- [ ] Voir le source HTML → Doit contenir `<meta name="robots" content="noindex, nofollow">`
- [ ] `curl https://vie-publique.sn/robots.txt` → Doit afficher `Allow: /` (prod OK)

### Actions Bing/Google
- [ ] Soumettre demande de suppression Bing Webmaster
- [ ] Vérifier Google Search Console
- [ ] Attendre 7 jours et vérifier désindexation :
  ```bash
  site:test.vie-publique.sn  # Sur Google
  site:test.vie-publique.sn  # Sur Bing
  ```

## 🔒 Configuration environnement

Assurez-vous que dans votre configuration Docker/env :

### Production (vie-publique.sn)
```env
NUXT_PUBLIC_SITE_URL=https://vie-publique.sn
```

### Test (test.vie-publique.sn)
```env
NUXT_PUBLIC_SITE_URL=https://test.vie-publique.sn
```

## ⚠️ Important

**Ne JAMAIS mettre `NUXT_PUBLIC_SITE_URL=https://vie-publique.sn` sur l'env de test !**

Sinon, le test sera traité comme production et sera indexable.

## 📊 Suivi

| Date | Action | Résultat |
|------|--------|----------|
| 2025-10-12 | Déploiement protections | En attente |
| 2025-10-12 | Demande suppression Bing | En attente |
| 2025-10-19 | Vérification désindexation | En attente |

## 🔍 Debug

Si le site de test est toujours indexé après 7 jours :

1. **Vérifier les logs Nuxt** :
   ```bash
   docker logs <container> | grep "NUXT_PUBLIC_SITE_URL"
   ```

2. **Tester en local** :
   ```bash
   NUXT_PUBLIC_SITE_URL=https://test.vie-publique.sn npm run dev
   curl http://localhost:3000/robots.txt
   # Devrait afficher Disallow: /
   ```

3. **Vérifier le cache CDN** (si vous en utilisez un) :
   - Purger le cache de test.vie-publique.sn
   - Vérifier que les headers passent bien

## 📚 Références

- [Google: Block Search indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Bing: Remove URLs](https://www.bing.com/webmasters/help/how-to-remove-a-url-from-bing-b5df4c16)
- [X-Robots-Tag HTTP header](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag)
