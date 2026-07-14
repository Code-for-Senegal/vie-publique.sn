# Supervision infra (Prometheus/Grafana) — plan NON déployé

> **Statut** : piste d'évolution, **rien de déployé**. Ce qui existe aujourd'hui :
>
> - **Uptime Kuma** (<https://kuma.vpsn.cloud>, VM séparée de la prod) couvre déjà les checks
>   HTTP/disponibilité listés au §1 (front, CMS Directus, Typesense, outils internes) ;
> - **Sentry** couvre les erreurs applicatives (voir [sentry.md](./sentry.md)).
>
> Déployer cette stack n'a d'intérêt que si on veut des **métriques** (CPU/RAM/disque, taux de
> 5xx, latence, dashboards, alertes fines type « Directus 5xx pendant 5 min ») en plus du simple
> up/down que donne Kuma. Voir aussi `docs/infra/plan-remediation.md`.

## 1) Cibles & checks

- Nuxt front : `GET /api/health` (existe : `server/api/health.ts`)
- Directus : `https://cms.vie-publique.sn/server/health`
- n8n : `GET /healthz`
- MinIO : `GET /minio/health/ready`
- Redis : ping via exporter
- PostgreSQL : `pg_isready`

## 2) Stack envisagée (classique)

- **Prometheus** : collecte des métriques
- **Alertmanager** : envoi d'emails (ou Telegram/Slack)
- **Grafana** : dashboards
- **Blackbox Exporter** : tests HTTP/HTTPS (timeout, codes 200, latence)
- **cAdvisor + node_exporter** : métriques Docker et système
- **Exporters** : postgres_exporter, redis_exporter (MinIO expose déjà `/minio/v2/metrics`)

Avantage : une seule stack, des alertes précises + graphes. Coût : maintenance d'une stack de
plus — à mettre en balance avec « étendre Uptime Kuma » (alternative notée dans le plan de
remédiation infra).
