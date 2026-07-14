# Sécurité de l'infrastructure — findings & remédiation (Juillet 2026)

> **Complément « infra » de l'audit applicatif** [`../audits/audit-complet-2026-07.md`](../audits/audit-complet-2026-07.md)
> (qui couvre le code : SEC-1 à SEC-10). Ce document couvre le **serveur, l'exposition réseau,
> les comptes et les sauvegardes**, à partir des `docker-compose` et de la topologie réelle.
>
> **Date** : 5 juillet 2026. **Périmètre** : VPS PROD/TEST/N8N Hostinger + stack Coolify.
> **⚠️ Repo public** : aucun secret / IP / URL d'admin ici. Les cibles concrètes sont dans Vaultwarden.

---

## 🎯 Cadre directeur (issu du webinaire)

Deux principes guident la priorisation :

**1. Défense en profondeur** — ne pas dépendre d'une seule barrière. Aujourd'hui la sécurité repose
surtout sur « le mot de passe du panneau » : pas de WAF edge (INFRA-6), panneaux exposés (INFRA-4),
root SSH par mot de passe (INFRA-10), pas de 2FA Coolify (INFRA-11). Objectif : **empiler les couches**
— edge (Cloudflare) → firewall origine → réseau Docker interne → auth forte + 2FA → moindre privilège
des tokens → logs/détection. Chaque couche doit tenir même si la précédente tombe.

**2. Séparation données / application** — les données ne doivent pas partager l'exposition ni le
cycle de vie de l'app. Aujourd'hui PostgreSQL, Redis, MinIO et l'app cohabitent, avec des ports data
publiés (INFRA-2) et Adminer exposé (INFRA-1) ; trois sites partagent la même VM (INFRA-8). Objectif :
**sortir/isoler la couche données** — DB & Redis strictement sur réseau interne (jamais de port public),
**assets hors du serveur** (Cloudflare R2, INFRA-9), sauvegardes **offsite** (INFRA-5), et à terme
tier data séparé du tier app.

Chaque finding ci-dessous porte l'un de ces deux angles (ou les deux).

---

## 📋 Sommaire priorisé

### 🔴 Critique

- [ ] **INFRA-1** — Adminer (UI admin PostgreSQL) exposé sur Internet
- [ ] **INFRA-2** — MinIO (API 9000 + console 9001) exposé publiquement sur chaque VM
- [ ] **INFRA-3** — Directus PROD servi en **HTTP** (`http://cms.vie-publique.sn`)
- [ ] **INFRA-4** — Panneaux d'administration exposés (Coolify, Kuma, MinIO, n8n, **CyberPanel**)
- [ ] **INFRA-5** — Sauvegardes : uniquement snapshot VM hebdo, pas de dump DB testé ni offsite
- [ ] **INFRA-10** — 🔴 **Root SSH par mot de passe activé** (durcissement SSH/firewall/fail2ban)

### 🟠 Important

- [ ] **INFRA-6** — Aucun WAF / anti-DDoS / rate-limit edge (pas de Cloudflare)
- [ ] **INFRA-7** — `LOG_LEVEL=debug` en production sur Directus
- [ ] **INFRA-8** — Co-hébergement PROD (VP + archives.sn + kaddu.org) : blast radius partagé
- [ ] **INFRA-9** — MinIO figé (non upgradable) → dette de sécurité S3 dans le temps
- [ ] **INFRA-10** — Durcissement OS / SSH / firewall à vérifier et documenter

### 🟡 Suivi

- [ ] **INFRA-11** — 2FA à généraliser (GitHub org, Coolify, Directus, OVH, Hostinger, Google OAuth)
- [ ] **INFRA-12** — Politique de mises à jour « à l'opportunité » → cadence à formaliser
- [ ] **INFRA-13** — Tokens Directus **write** (n8n & intégrations) : portée minimale + protéger n8n

---

## 🔴 Critique

### INFRA-1 — Adminer exposé sur Internet

Le service `adminer` est déclaré dans le `docker-compose` Directus **sans restriction d'accès**.
C'est une **UI web d'administration de la base PostgreSQL** : si elle est joignable publiquement,
un attaquant dispose d'un formulaire de login direct sur la base (brute-force, exploitation de
faille Adminer connue, exfiltration de toute la donnée si les creds fuitent).

**Fix** :
1. **Le plus sûr** : retirer complètement `adminer` du compose de production (le garder uniquement
   en local / TEST, à la demande). L'admin ponctuelle de la DB se fait par tunnel SSH.
2. À défaut : ne PAS publier de domaine/port pour Adminer (pas de label Traefik / port mappé),
   le laisser sur le réseau Docker interne et y accéder via `ssh -L`.
3. Vérifier immédiatement les logs d'accès pour toute connexion suspecte passée.

### INFRA-2 — MinIO exposé publiquement (API 9000 + console 9001)

Dans le compose, MinIO publie `ports: 9000:9000` et `9001:9001` **sur l'hôte** → l'API S3 et la
**console d'administration** sont potentiellement accessibles depuis Internet sur chaque VM.
Or Directus parle à MinIO en **interne** (`STORAGE_S3_ENDPOINT=http://minio:9000`) : **aucune raison
d'exposer ces ports publiquement**. Risques : énumération/lecture de bucket, brute-force console,
surface CVE MinIO directement joignable.

**Fix** :
1. Supprimer le mapping de ports `9000`/`9001` du compose (Directus continue via le réseau Docker).
2. Si un accès console est nécessaire : tunnel SSH uniquement, ou domaine dédié derrière Traefik
   **avec IP allowlist**.
3. Vérifier que le bucket `directus-bucket` n'est pas en lecture publique anonyme.
4. Bloquer 9000/9001 au firewall (INFRA-10) en défense en profondeur.

### INFRA-3 — Directus PROD servi en HTTP

`http://cms.vie-publique.sn/` répond en clair. Le frontend, les tokens d'API et les identifiants
admin Directus transitent alors **sans chiffrement de bout en bout** (interception possible sur le
chemin réseau). `PUBLIC_URL` est pourtant en `https://` dans le compose → incohérence à corriger.

**Fix** : forcer HTTPS (Let's Encrypt via Traefik/Coolify) + redirection 301 HTTP→HTTPS + HSTS,
comme le frontend. Vérifier ensuite qu'aucun appel serveur ne pointe encore vers `http://`.

### INFRA-4 — Panneaux d'administration exposés publiquement

Coolify (prod & test), Uptime Kuma, console MinIO, n8n, Adminer et **CyberPanel** (installé par
Hostinger, user `admin` par défaut) sont accessibles depuis Internet.
Chaque panneau = surface d'attaque (brute-force, CVE du produit, prise de contrôle totale du serveur
dans le cas de **Coolify**, qui peut déployer/exécuter des conteneurs).

**Fix** (par ordre d'efficacité) :
1. **Coolify** : c'est le plus critique. Le mettre derrière **IP allowlist** (Traefik middleware) ou
   VPN, activer 2FA obligatoire, mots de passe forts uniques (Vaultwarden).
2. Kuma / n8n / MinIO console : IP allowlist ou auth forte + 2FA ; ne rien laisser en creds par défaut.
3. Documenter la liste des panneaux et leur protection **dans Vaultwarden**, pas ici.

### INFRA-5 — Sauvegardes insuffisantes

Actuel : **1 snapshot VM Hostinger / semaine**. Problèmes :
- **RPO 7 jours** : jusqu'à une semaine de contenu CMS perdu en cas de sinistre.
- Pas de **dump PostgreSQL applicatif** (un snapshot VM d'une base en écriture peut être incohérent).
- Pas de copie **offsite** (si le compte/VM Hostinger tombe, la sauvegarde tombe avec).
- **Restore jamais testé** → une sauvegarde non testée n'est pas une sauvegarde.

**Fix** :
1. `pg_dump` quotidien de la base Directus (cron ou job n8n) + rétention 7/30 jours.
2. Sauvegarde du bucket MinIO (les uploads) — voir INFRA-9 (migration R2 simplifierait ce point).
3. Copie **offsite** chiffrée (autre fournisseur / R2 / stockage objet distinct du VPS).
4. **Test de restauration** documenté au moins 1×/trimestre.

---

## 🟠 Important

### INFRA-6 — Pas de WAF / anti-DDoS (sujet Cloudflare du webinaire)

Aujourd'hui le DNS OVH pointe **directement sur l'IP du VPS** : l'IP origine est exposée, aucun
filtrage edge, aucune protection volumétrique. Un DDoS L7 basique peut saturer le VPS unique
(qui héberge en plus archives.sn + kaddu.org, cf. INFRA-8).

**Fix recommandé (aligné webinaire)** : passer les domaines derrière **Cloudflare** (plan gratuit
suffisant pour commencer) :
- proxy orange-cloud → **masque l'IP origine**, cache statique, protection DDoS L3/L4/L7 de base ;
- règles WAF managées + rate-limiting sur les endpoints sensibles (`/admin`, formulaires, paiement) ;
- cohérent avec l'usage **Turnstile** déjà prévu (même compte Cloudflare).
- ⚠️ Après bascule : **verrouiller le firewall origine sur les IP Cloudflare uniquement**, sinon
  l'IP directe reste attaquable et le WAF est contournable.

### INFRA-7 — LOG_LEVEL=debug en production

Le compose Directus PROD a `LOG_LEVEL=debug` → logs verbeux pouvant contenir requêtes, en-têtes,
détails internes ; coût I/O et fuite d'information potentielle.

**Fix** : `LOG_LEVEL=info` (ou `warn`) en production. `debug` réservé au TEST.

### INFRA-8 — Co-hébergement PROD (blast radius)

VP, `archives.sn` et `kaddu.org` sur le **même VPS**. Une faille sur l'un (ou une saturation
ressources) impacte les trois. À mettre en regard de la duplication SEO archives.sn↔VP (BING-7).

**Fix** : à moyen terme, isoler au moins archives.sn/kaddu.org de la prod VP (VM séparée, comme
n8n l'est déjà), ou au minimum limiter les ressources par conteneur (`deploy.resources.limits`)
pour éviter qu'un site n'étouffe les autres.

### INFRA-9 — MinIO figé + migration vers Cloudflare R2 (sujet webinaire)

MinIO n'est plus upgradable (compatibilité Directus + évolution de licence de l'édition open source).
Un stockage objet **figé** = CVE non corrigées qui s'accumulent + point de sauvegarde fragile.

**Fix recommandé (aligné webinaire)** : migrer le stockage des assets Directus vers **Cloudflare R2**
(compatible S3, driver `s3` déjà utilisé — c'est surtout un changement d'`ENDPOINT`/clés) :
- supprime le service MinIO à maintenir/sauvegarder/exposer (résout aussi INFRA-2) ;
- stockage managé, redondé, offsite par nature (aide INFRA-5) ;
- pas de frais d'egress R2. **Prévoir la migration des objets existants** (rclone/`mc mirror`) et
  la mise à jour des `STORAGE_S3_*` Directus, puis retrait de MinIO du compose.

### INFRA-10 — Durcissement OS / SSH / firewall — 🔴 root SSH par mot de passe activé

**État constaté (05/07/2026)** : accès `ssh root@<ip>` avec **mot de passe root** (fourni par Hostinger).
Si le port 22 est ouvert sur Internet → **brute-force direct sur root** possible. L'admin quotidienne
passe en réalité par le **terminal web Hostinger** (hors-bande, indépendant de SSH) → **on peut
donc verrouiller SSH sans rien perdre**.

**Fix (fort gain, coût nul sur le workflow)** :
- `PermitRootLogin no` + `PasswordAuthentication no` dans `sshd_config` (garder une clé pour un compte
  sudo dédié en secours) — l'accès Hostinger web terminal reste disponible quoi qu'il arrive ;
- **firewall** (firewalld sur AlmaLinux) : n'ouvrir que 80/443 ; fermer 22 au public (ou IP allowlist),
  9000/9001 (MinIO), 5432 (PG), 6379 (Redis), 8080/panels… ;
- **fail2ban** sur SSH + endpoints d'auth ;
- vérifier/désactiver **CyberPanel** (voir INFRA-4) et tout service inutile ;
- documenter l'état réel par VPS **dans Vaultwarden**.

---

## 🟡 Suivi

### INFRA-11 — 2FA — 🔴 manquante sur Coolify

**État constaté (05/07/2026)** :
- ✅ 2FA active : **Hostinger**, **GitHub**, **OVH**.
- 🔴 **Coolify : PAS de 2FA** — or Coolify est exposé publiquement et peut déployer/exécuter des
  conteneurs = **compromission totale du serveur** derrière un seul mot de passe. **Priorité absolue.**
- ⚠️ **Directus : pas de 2FA native**, connexion via **Google SSO** → la 2FA réelle du CMS est celle
  du **compte Google** (voir section « Authentification des utilisateurs CMS »). Sécuriser le compte
  admin à mot de passe résiduel.

**Fix** : activer la 2FA Coolify **immédiatement** (Profile → Two-Factor) + IP allowlist (INFRA-4) ;
puis Directus admin ; mots de passe uniques dans Vaultwarden ; audit « qui accède à quoi » (moindre
privilège).

### INFRA-12 — Politique de mises à jour

Mises à jour Directus/Coolify/OS faites « à l'opportunité ». Formaliser une cadence minimale
(ex. patchs de sécurité OS via `dnf-automatic`/unattended-upgrades ; revue mensuelle des versions
Directus/Coolify ; veille CVE sur les images du compose). Documenter la date de dernière MAJ par VPS.

---

## Portée du token CMS — ✅ vérifié read-only (05/07/2026)

Le frontend lit Directus via un rôle dédié (`web-vie-publique-access-policies`) : **seule l'action
`Read`** est cochée par collection (Create/Update/Delete/Share désactivés) — vérifié dans Access
Policies. ✅ Bon point. Reste à faire par hygiène :
- confirmer qu'aucune collection **sensible/system** (users, secrets, tokens…) n'est lisible par ce rôle ;
- prévoir une **rotation périodique** du token (il vit dans l'env des conteneurs déployés par Coolify).

### ⚠️ Tokens à droits d'écriture (n8n & autres) — INFRA-13

D'autres tokens Directus ont des droits **write** (utilisés par **n8n** et d'autres intégrations).
C'est le maillon le plus sensible : un token write qui fuit = **modification/suppression de contenu
CMS**. Et **n8n est exposé publiquement** (`n8n.vie-publique.sn`) → si n8n est compromis, l'attaquant
hérite de ces droits d'écriture.

**Fix** :
- **Portée minimale par token** : un rôle write distinct par intégration, limité aux **seules
  collections** qu'elle doit modifier (pas un token admin global).
- **Protéger n8n** comme un système privilégié : 2FA obligatoire, IP allowlist ou VPN, mots de passe
  forts (Vaultwarden), pas de creds par défaut, MAJ régulières.
- **Inventaire** de tous les tokens/API keys Directus (qui, quelle portée, quelle rotation) tenu
  **dans Vaultwarden** ; révoquer les tokens inutilisés ; rotation périodique.
- Ne jamais logguer ces tokens (attention à `LOG_LEVEL=debug`, cf. INFRA-7).

## Authentification des utilisateurs CMS

Les rédacteurs se connectent à Directus **via Google (SSO/OIDC)**. **Pas de 2FA native Directus** →
la frontière d'authentification réelle est le **compte Google**. Un compte admin à **mot de passe**
subsiste toutefois (ex. `…@volkeno.sn`, vu sur l'écran de login).

Recommandations :
- **La 2FA du compte Google EST la 2FA de Directus** → exiger **2FA activée sur chaque compte Google**
  autorisé au CMS (c'est le point vraiment structurant ici). Auditer la liste.
- **Compte(s) admin à mot de passe** : c'est le maillon faible (pas de 2FA Directus). Le sécuriser —
  mot de passe fort unique (Vaultwarden), et si possible **désactiver le login mot de passe** pour ne
  laisser que le SSO Google, ou réserver ce compte à un usage de secours strictement contrôlé.
- `AUTH_GOOGLE_ALLOW_PUBLIC_REGISTRATION=false` déjà en place ✅ (pas d'auto-inscription).
- Revue périodique des utilisateurs actifs (retirer inactifs / ex-collaborateurs).

---

## Ordre d'attaque recommandé (quick wins d'abord)

1. **INFRA-1 + INFRA-2** (retirer Adminer, dé-exposer MinIO) — changement de compose, effet immédiat.
2. **INFRA-3** (HTTPS Directus) — config Traefik/Coolify.
3. **INFRA-4** (verrouiller Coolify en priorité) + **INFRA-7** (log level) + **INFRA-11** (2FA Coolify/GitHub).
4. **INFRA-5** (pg_dump quotidien + offsite + test restore).
5. **INFRA-6 + INFRA-9** (Cloudflare devant + migration R2) — chantier structurant, aligné webinaire.
6. **INFRA-8, INFRA-10, INFRA-12** — durcissement et hygiène continue.
