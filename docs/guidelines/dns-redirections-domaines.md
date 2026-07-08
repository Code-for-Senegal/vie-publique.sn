# DNS, hôte canonique & redirections de domaines

> **Date** : juillet 2026 — mis en place suite à l'audit Bing (voir
> `docs/audit/audit-complet-2026-07.md`, section BING-1).
> Concerne **vie-publique.sn** ET **archives.sn** (même mécanisme, repo séparé).

## L'hôte canonique est `https://www.vie-publique.sn` (AVEC www)

Toutes les URLs publiques (canonical, `og:url`, sitemap, JSON-LD) sont émises sur le
`www`. Toute requête arrivant sur un autre hôte doit finir en **redirection 301
permanente** vers le www — jamais 302/307 : une redirection temporaire n'est pas
consolidée par Bing/Google, les deux hôtes restent indexés et le site est vu en
double (c'est ce qui est arrivé : 25,3K URLs découvertes par Bing pour 12,6K réelles).

## Les 3 couches du mécanisme (qui fait quoi)

```text
navigateur → 1. DNS OVH        (résout le nom en IP — ne redirige RIEN)
           → 2. Traefik/Coolify (TLS + routage des 2 hôtes — ne redirige plus)
           → 3. middleware Nitro (host = apex ? → 301 vers www)
           → app Nuxt           (sert la page)
```

### 1. DNS (OVH)

Zone `vie-publique.sn` : enregistrement `www CNAME vie-publique.sn.` — les deux noms
pointent vers le même serveur. **Le DNS ne fait aucune redirection HTTP** (il en est
incapable) ; il amène juste le trafic des 2 hôtes au serveur. Ne pas toucher.

### 2. Coolify / Traefik

App Coolify *vie-publique.sn (prod)* → Configuration → General :

- **Domains** : `https://www.vie-publique.sn,https://vie-publique.sn` — **garder les
  DEUX** : c'est ce qui fait émettre un certificat TLS pour chaque hôte. Retirer
  l'apex casserait `https://vie-publique.sn` en erreur SSL au lieu de rediriger.
- **Direction** : `Allow www & non-www` — Traefik route les 2 hôtes vers le conteneur
  **sans rediriger lui-même**.

⚠️ **Ne PAS remettre Direction sur « `Redirect to www.` »** : ce réglage fait répondre
Traefik par une redirection **307 temporaire** (non paramétrable en 301 dans l'UI
Coolify), avant même que l'app ne voie la requête — c'était la cause du bug SEO BING-1,
et cela rendrait le middleware ci-dessous inerte.

Résidu connu et accepté : le saut `http→https` (redirection d'entrypoint Traefik,
gérée globalement par Coolify) reste en 302. Impact mineur : le saut suivant vers le
www est en 301.

### 3. Middleware Nitro — la redirection 301 elle-même

`server/middleware/host-redirect.ts` : si le header `Host` est exactement l'apex
(`vie-publique.sn`), répond `301 → https://www.vie-publique.sn<path+query>`. Tout
autre hôte (www, localhost, preview) passe sans redirection. Fichier miroir dans le
repo `archives.sn` (apex `archives.sn` → `https://www.archives.sn`).

## Vérifier que tout fonctionne

```bash
# Attendu : 301 → https://www.vie-publique.sn/ (et pas 302/307)
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" "https://vie-publique.sn/"

# Le www répond directement (200, pas de boucle)
curl -s -o /dev/null -w "%{http_code}\n" "https://www.vie-publique.sn/"

# Le path et la query sont préservés
curl -s -o /dev/null -w "%{redirect_url}\n" "https://vie-publique.sn/documents/public?page=2"
```

⚠️ **Non testable en dev** : le serveur de dev répond `403` à tout header `Host`
différent de localhost (protection Vite). Tester sur un build prod
(`npm run build && node .output/server/index.mjs`) ou directement en prod.

## Pièges connus

- **Sitemaps Bing/Google** : ne soumettre QUE `https://www.vie-publique.sn/sitemap.xml`.
  Un sitemap soumis sur l'apex recrée la duplication d'hôtes côté moteur.
- `server/middleware/` ≠ `server/api/middleware/` : seul `server/middleware/` est
  exécuté comme middleware global Nitro (sur toutes les requêtes). Un fichier sous
  `server/api/...` devient une **route API** ordinaire (cf. audit SEC-3).
- Si un jour la redirection doit revenir au niveau proxy : il faudra éditer les labels
  Traefik générés par Coolify (`redirectregex` avec `permanent=true`) — non exposé
  dans l'UI à ce jour.
