## 1) Ce qu’on va monitorer (cibles & checks)

* Nuxt front: GET /api/health

* Directus: https://cms.vie-publique.sn/server/health

* n8n : GET /healthz

* MinIO : GET /minio/health/ready

* Redis : ping via exporter

* PostgreSQL : pg_isready via

## 2) Stack de supervision (propre & classique)

Prometheus : collecte métriques

Alertmanager : envoi d’emails (ou Telegram/Slack)

Grafana : dashboards

Blackbox Exporter : tests HTTP/HTTPS (timeout, codes 200, latence)

cAdvisor + node_exporter : métriques Docker et système

Exporters : postgres_exporter, redis_exporter (MinIO expose déjà /minio/v2/metrics)

Avantage : une seule stack, des alertes précises (ex. « Directus HTTP 5xx 5 minutes ») + graphes.
