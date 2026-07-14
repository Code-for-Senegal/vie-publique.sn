# 📚 Documentation Vie-Publique.sn — index maître

> Point d'entrée unique de la documentation. Chaque domaine pointe vers **un doc canonique**
> (la référence à jour) + ses annexes. En cas de contradiction, **[`/CLAUDE.md`](../CLAUDE.md)
> (racine) fait foi** : c'est la source des règles appliquées (conventions, SEO, UI, Directus).
>
> Règle de maintenance : une info = **un seul doc canonique**. Les autres docs y renvoient au
> lieu de dupliquer (évite la divergence). Mettre à jour cet index quand un doc canonique change.

## 🗂️ Organisation

| Dossier | Contenu |
| --- | --- |
| [`project/`](./project/) | Identité du projet : présentation, roadmap, open-source, contributeurs, PWA/mobile |
| [`guidelines/`](./guidelines/) | Règles transversales de développement (API, URLs, design, flags…) |
| [`modules/`](./modules/README.md) | Documentation par feature du site (budget, élections, dossiers…) |
| [`seo/`](./seo/) | Stratégie, audits et conventions SEO |
| [`infra/`](./infra/) | Infrastructure, déploiement, Docker, CI/CD, monitoring, sécurité infra |
| [`audits/`](./audits/) | Rapports d'audit datés (convention `audit-<sujet>-AAAA-MM.md`) |
| [`archive/`](./archive/README.md) | Chantiers terminés — valeur historique uniquement |

## 🧭 Par domaine

| Domaine | Doc canonique | Annexes / détail |
| --- | --- | --- |
| **Règles projet (source de vérité)** | [`/CLAUDE.md`](../CLAUDE.md) | conventions Directus, SEO, UI, cache, pièges |
| **Architecture d'accès aux données** | [`guidelines/guideline-api.md`](./guidelines/guideline-api.md) | pattern 3 couches, SSR, cache, ajout de collection |
| **Sécurité — applicatif** | [`audits/audit-complet-2026-07.md`](./audits/audit-complet-2026-07.md) | findings SEC-1..10 |
| **Sécurité — infra** | [`infra/plan-remediation.md`](./infra/plan-remediation.md) | [`infra/securite-infra-2026-07.md`](./infra/securite-infra-2026-07.md) (INFRA-1..13), [`infra/README.md`](./infra/README.md) (archi) |
| **SEO** | [`/CLAUDE.md`](../CLAUDE.md) (§ SEO & Open Graph) | [`seo/seo-strategy.md`](./seo/seo-strategy.md), [`seo/seo-audit.md`](./seo/seo-audit.md), [`seo/seo-pages-detail-audit.md`](./seo/seo-pages-detail-audit.md), [`seo/seo-indexation-rapide.md`](./seo/seo-indexation-rapide.md), [`seo/llms-txt.md`](./seo/llms-txt.md) |
| **URLs / slugs** | [`guidelines/url-structure-analysis.md`](./guidelines/url-structure-analysis.md) | — |
| **UI / Design** | [`guidelines/design.md`](./guidelines/design.md) | [`/CLAUDE.md`](../CLAUDE.md) (§ UI & Design), [`guidelines/skeleton-loaders.md`](./guidelines/skeleton-loaders.md) |
| **Performance / temps de build** | [`infra/build-optimization.md`](./infra/build-optimization.md) | [`infra/docker-optimization.md`](./infra/docker-optimization.md) |
| **CI/CD** | [`infra/ci-cd-github.md`](./infra/ci-cd-github.md) | — |
| **Déploiement / Docker** | [`infra/deployment.md`](./infra/deployment.md) | [`infra/docker.md`](./infra/docker.md) |
| **Infra / topologie / supervision** | [`infra/README.md`](./infra/README.md) | [`infra/supervision-infra.md`](./infra/supervision-infra.md), [`infra/cloudfare.md`](./infra/cloudfare.md) |
| **Monitoring d'erreurs (Sentry)** | [`infra/sentry.md`](./infra/sentry.md) | — |
| **DNS / redirections domaines** | [`guidelines/dns-redirections-domaines.md`](./guidelines/dns-redirections-domaines.md) | — |
| **Noindex site de test** | [`guidelines/noindex-test-site.md`](./guidelines/noindex-test-site.md) | — |
| **Feature flags** | [`guidelines/feature-flags/README.md`](./guidelines/feature-flags/README.md) | [`guidelines/feature-flags/feature-flags-cheatsheet.md`](./guidelines/feature-flags/feature-flags-cheatsheet.md) |
| **Proxy images CMS** | [`guidelines/proxy-images.md`](./guidelines/proxy-images.md) | [`guidelines/proxy-images-migration.md`](./guidelines/proxy-images-migration.md) |
| **Versioning** | [`guidelines/versioning.md`](./guidelines/versioning.md) | — |
| **Global settings** | [`guidelines/global-settings.md`](./guidelines/global-settings.md) | — |
| **Modules du site** | [`modules/README.md`](./modules/README.md) | 1 dossier par feature |

## 🚧 Chantiers en cours

- [`guidelines/todo-cache-optimization.md`](./guidelines/todo-cache-optimization.md) — migration des routes API vers `getCacheMaxAge()`
- [`seo/todo-seo.md`](./seo/todo-seo.md) — chantiers SEO restants
- [`modules/etat/todo-supprimer-systeme-a.md`](./modules/etat/todo-supprimer-systeme-a.md) — retrait de l'ancien système « état »
- [`modules/budget/budget-todo.md`](./modules/budget/budget-todo.md) — checklist module budget
- [`modules/a-propos/refonte-section-association.md`](./modules/a-propos/refonte-section-association.md) — refonte section association
- [`modules/dashboard/`](./modules/dashboard/) — dashboards RAC et projets publics
- [`audits/audit-recherche-2026-07.md`](./audits/audit-recherche-2026-07.md) — checklist recherche Typesense

## 📌 Statut des docs

- Les **rapports datés** (audits, analyses GSC) vivent dans [`audits/`](./audits/) et
  [`seo/`](./seo/) : ils décrivent un état à une date donnée, leurs checklists restent
  actionnables.
- Les chantiers **terminés** (migrations, hotfixes) sont rangés dans
  [`archive/`](./archive/README.md) — valeur historique uniquement ; le pattern final vit dans
  le doc canonique du domaine. N'archiver que **terminé et vérifié**.
- ⚠️ Tout ce qui s'appelle « migration » n'est **pas** mort : `feature-flags-migration.md` et
  `proxy-images-migration.md` restent en place car activement liés par leurs hubs vivants.
