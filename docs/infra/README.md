# Architecture Infrastructure — Vie-Publique.sn

> **⚠️ Ce dépôt est PUBLIC.** Ce document décrit volontairement l'architecture **sans**
> IP, sans URL de panneau d'administration, sans port ni identifiant. Les valeurs réelles
> (IPs, URLs Coolify/Kuma/Adminer/MinIO console, secrets) sont conservées dans **Vaultwarden**
> (collection « Infra VP »), pas dans le repo. Ne jamais commiter ces valeurs ici.
>
> **Dernière mise à jour** : 5 juillet 2026.

## Vue d'ensemble

Hébergement : **VPS Hostinger** (KVM, AlmaLinux). DNS chez **OVH**. Orchestration par
**Coolify** (Docker) sur chaque VPS. **Pas d'API gateway, pas de CDN/WAF (Cloudflare) devant.**

| VPS | Rôle | Contenu |
| --- | --- | --- |
| **PROD** (KVM8) | Production | Frontend `vie-publique.sn` + backend Directus, **co-hébergé avec `archives.sn` et `kaddu.org`** |
| **TEST** (KVM2) | Staging | Frontend + backend de test (`*.vpsn.cloud`) + supervision Uptime Kuma |
| **N8N** (dédié) | Automatisation | n8n de production (isolé) |

> ⚠️ **Blast radius PROD** : trois sites (`vie-publique.sn`, `archives.sn`, `kaddu.org`) partagent
> le même hôte physique. Une compromission ou une saturation ressources d'un site impacte les autres.

## Stack backend (par VPS, orchestrée Coolify)

Déployée via un `docker-compose` unique « cms » :

| Service | Image | Rôle | Exposition attendue |
| --- | --- | --- | --- |
| **Directus** | `directus/directus:11.12` | CMS / API headless | Public (HTTPS) |
| **PostgreSQL** | `postgis/postgis:16-3.4` | Base de données | **Interne only** (réseau Docker) |
| **Redis** | `redis:7-alpine` | Cache Directus | **Interne only** |
| **MinIO** | `minio/minio` | Stockage S3 des assets (bucket `directus-bucket`) | **Interne only** (voir SEC-INFRA) |
| **Adminer** | `adminer` | UI admin base PostgreSQL | **Ne devrait PAS être exposé** (voir SEC-INFRA) |
| **Typesense** | — | Moteur de recherche | Public (HTTPS) |

Services annexes (Coolify) : **Vaultwarden** (gestionnaire de secrets), **DocuSeal**, **n8n**.

## Flux de données

```
Navigateur ──HTTPS──> Traefik (Coolify) ──> Frontend Nuxt (SSR)
                                              │
                                              ├─ $fetch ──> Directus (API CMS)
                                              │               ├─ PostgreSQL (interne)
                                              │               ├─ Redis (interne)
                                              │               └─ MinIO S3 (assets)
                                              └─ recherche ─> Typesense
```

- Le frontend lit Directus avec un **token de rôle CMS dédié** (portée à auditer — cf. SEC-INFRA).
- Directus stocke ses uploads dans **MinIO** (driver S3, `STORAGE_S3_ENDPOINT` interne).
- **CORS Directus** : `CORS_METHODS=GET` uniquement, origins whitelistés (bon point).

## CI/CD

GitHub Actions (`.github/workflows/`) → build `Dockerfile.optimized` → push **ghcr.io** →
webhook **Coolify** (event « Packages ») → pull image + redémarrage conteneur.
Détail : [`../guidelines/ci-cd-github.md`](../guidelines/ci-cd-github.md).

## Sauvegardes

- **Snapshot VM Hostinger : 1× / semaine** (RPO ≈ 7 jours).
- ⚠️ Pas de dump PostgreSQL applicatif dédié, pas de sauvegarde offsite testée. Voir SEC-INFRA.

## Supervision

- **Uptime Kuma** (sur VPS TEST) : checks HTTP des endpoints (`/api/health`, Directus `/server/health`, etc.).
- Plan Prometheus/Grafana/Alertmanager décrit dans [`../SUPERVISION.md`](../SUPERVISION.md) — **non déployé** à ce jour.

## Sécurité infra

Findings et plan de remédiation : [`securite-infra-2026-07.md`](./securite-infra-2026-07.md).
