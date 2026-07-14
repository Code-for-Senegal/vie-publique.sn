# 📚 Guidelines Vie-Publique.sn — index de référence

> Point d'entrée unique pour qui rejoint / pull le projet. Chaque domaine pointe vers **un doc
> canonique** (la référence à jour) + ses annexes. En cas de contradiction, **[`/CLAUDE.md`](../../CLAUDE.md)
> (racine) fait foi** : c'est la source des règles appliquées (conventions, SEO, UI, Directus).
>
> Règle de maintenance : une info = **un seul doc canonique**. Les autres docs y renvoient au lieu
> de dupliquer (évite la divergence). Mettre à jour cette table quand un doc canonique change.

## 🧭 Par domaine

| Domaine | Doc canonique | Annexes / détail |
| --- | --- | --- |
| **Règles projet (source de vérité)** | [`/CLAUDE.md`](../../CLAUDE.md) | conventions Directus, SEO, UI, cache, pièges |
| **Architecture d'accès aux données** | [`guideline-api.md`](./guideline-api.md) | pattern 3 couches, SSR, cache, ajout de collection |
| **Sécurité — applicatif** | [`../audits/audit-complet-2026-07.md`](../audits/audit-complet-2026-07.md) | findings SEC-1..10 |
| **Sécurité — infra** | [`../infra/plan-remediation.md`](../infra/plan-remediation.md) | [`../infra/securite-infra-2026-07.md`](../infra/securite-infra-2026-07.md) (INFRA-1..13), [`../infra/README.md`](../infra/README.md) (archi) |
| **SEO** | [`/CLAUDE.md`](../../CLAUDE.md) (§ SEO & Open Graph) | [`../seo/seo-audit.md`](../seo/seo-audit.md), [`../seo/seo-pages-detail-audit.md`](../seo/seo-pages-detail-audit.md), [`../seo/seo-indexation-rapide.md`](../seo/seo-indexation-rapide.md), [`../seo/llms-txt.md`](../seo/llms-txt.md) |
| **URLs / slugs** | [`url-structure-analysis.md`](./url-structure-analysis.md) | — |
| **Performance** | [`../OPTIMIZATION-GUIDE.md`](../OPTIMIZATION-GUIDE.md) | [`./skeleton-loaders.md`](./skeleton-loaders.md) |
| **UI / Design** | [`design.md`](./design.md) | [`/CLAUDE.md`](../../CLAUDE.md) (§ UI & Design) |
| **CI/CD** | [`../infra/ci-cd-github.md`](../infra/ci-cd-github.md) | — |
| **Déploiement / Docker** | [`../infra/deployment.md`](../infra/deployment.md) | [`../infra/docker.md`](../infra/docker.md), [`../infra/docker-optimization.md`](../infra/docker-optimization.md) |
| **Infra / topologie** | [`../infra/README.md`](../infra/README.md) | [`../infra/supervision-infra.md`](../infra/supervision-infra.md) |
| **Monitoring (Sentry, Kuma…)** | [`../infra/monitoring.md`](../infra/monitoring.md) | [`../infra/sentry.md`](../infra/sentry.md) |
| **DNS / redirections domaines** | [`dns-redirections-domaines.md`](./dns-redirections-domaines.md) | — |
| **Feature flags** | [`feature-flags/README.md`](./feature-flags/README.md) | [`feature-flags/feature-flags-cheatsheet.md`](./feature-flags/feature-flags-cheatsheet.md) |
| **Budget (module)** | [`../modules/budget/budget.md`](../modules/budget/budget.md) | dossier [`../modules/budget/`](../modules/budget/) |
| **Proxy images CMS** | [`proxy-images.md`](./proxy-images.md) | [`proxy-images-migration.md`](./proxy-images-migration.md) |
| **Versioning** | [`versioning.md`](./versioning.md) | — |
| **Global settings** | [`global-settings.md`](./global-settings.md) | — |

## 🔒 Sécurité — en un coup d'œil

Sujet vivant, piloté par un plan unique : **[`../infra/plan-remediation.md`](../infra/plan-remediation.md)**
(fusionne app SEC-* + infra INFRA-*, priorisé en vagues, source de vérité du statut).
Cadre directeur : **défense en profondeur** + **séparation données/app**.

## 📌 Statut des docs

- Les chantiers **terminés** (migrations, hotfixes) sont rangés dans [`../archive/`](../archive/README.md) —
  valeur historique uniquement ; le pattern final vit dans le doc canonique du domaine.
- ⚠️ Tout ce qui s'appelle « migration » n'est **pas** mort : `feature-flags-migration.md` et
  `MIGRATION-PROXY-IMAGES.md` restent en place car activement liés par leurs hubs vivants.
- Tombstone en place : [`../archive/architecture-api-directus.md`](../archive/architecture-api-directus.md)
  (migration API terminée → voir [`guideline-api.md`](./guideline-api.md)).
