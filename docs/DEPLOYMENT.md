# 🚀 Guide de Déploiement - Vie-Publique.sn

## 📋 Prérequis Serveur

- Ubuntu 20.04+ / Debian 11+
- Docker & Docker Compose installés
- Nom de domaine configuré (DNS pointant vers le serveur)
- Ports 80 et 443 ouverts

## 🔑 Configuration du Token GitHub

### 1. Créer un Personal Access Token

1. Allez sur GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
2. Cliquez sur **Generate new token (classic)**
3. Nom : `vie-publique-deployment`
4. Cochez : `read:packages`
5. **Generate token** et copiez-le

### 2. Stocker le token sur le serveur

```bash
# Option 1 : Variable d'environnement
echo "export GITHUB_TOKEN=ghp_VotreTokenIci" >> ~/.bashrc
source ~/.bashrc

# Option 2 : Fichier sécurisé
echo "ghp_VotreTokenIci" > ~/.github-token
chmod 600 ~/.github-token
```

## 🖥️ Installation sur le Serveur

### Étape 1 : Préparation

```bash
# Créer le dossier de l'application
sudo mkdir -p /opt/vie-publique
cd /opt/vie-publique

# Télécharger les fichiers de configuration
wget https://raw.githubusercontent.com/malicktech/vie-publique.sn/develop/docker-compose.production.yml
wget https://raw.githubusercontent.com/malicktech/vie-publique.sn/develop/scripts/deploy.sh

# Rendre le script exécutable
chmod +x deploy.sh
```

### Étape 2 : Configuration des variables

```bash
# Créer le fichier .env
cat > .env << EOF
# Application
NODE_ENV=production
NUXT_PUBLIC_SITE_URL=https://vie-publique.sn

# API Keys
TYPESENSE_API_KEY=xyz
TYPESENSE_URL=https://search.daktic.fr
CMS_API_KEY=xxx
CMS_API_URL=https://cms.vie-publique.sn

# GitHub
GITHUB_USERNAME=malicktech
GITHUB_TOKEN=$(cat ~/.github-token)

# Domaine
DOMAIN=vie-publique.sn
ACME_EMAIL=contact@vie-publique.sn

# Traefik Auth (optionnel)
# Générer avec : htpasswd -nb admin password
TRAEFIK_AUTH=admin:\$2y\$10\$...
EOF

# Sécuriser le fichier
chmod 600 .env
```

### Étape 3 : Premier déploiement

```bash
# Se connecter au registry GitHub
export GITHUB_TOKEN=$(cat ~/.github-token)
echo $GITHUB_TOKEN | docker login ghcr.io -u malicktech --password-stdin

# Créer le réseau Docker
docker network create web

# Démarrer avec docker-compose
docker-compose -f docker-compose.production.yml up -d

# OU utiliser le script de déploiement
./deploy.sh
```

## 🔄 Mise à jour automatique

### Option 1 : Webhook GitHub (Recommandé)

Créez un webhook qui déclenche le déploiement à chaque push :

```bash
# Installer webhook listener
sudo apt install webhook

# Configurer le webhook
cat > /etc/webhook.conf << EOF
[
  {
    "id": "deploy-vie-publique",
    "execute-command": "/opt/vie-publique/deploy.sh",
    "command-working-directory": "/opt/vie-publique",
    "pass-arguments-to-command": [],
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "VOTRE_SECRET_WEBHOOK",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Démarrer le service
webhook -hooks /etc/webhook.conf -verbose -port 9000
```

### Option 2 : Cron Job

```bash
# Éditer le crontab
crontab -e

# Ajouter (mise à jour toutes les heures)
0 * * * * cd /opt/vie-publique && ./deploy.sh >> /var/log/vie-publique-deploy.log 2>&1
```

### Option 3 : GitHub Actions pour déploiement

Ajoutez ce secret dans votre repo GitHub :

- Settings → Secrets → Actions
- `DEPLOY_HOST` : IP de votre serveur
- `DEPLOY_USER` : utilisateur SSH
- `DEPLOY_KEY` : clé SSH privée

Puis créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  workflow_run:
    workflows: ["Build and Push Docker Image"]
    types:
      - completed
    branches: [develop]

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/vie-publique
            export GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
            ./deploy.sh
```

## 📊 Monitoring

### Vérifier l'état

```bash
# État des conteneurs
docker ps

# Logs de l'application
docker logs -f vie-publique-app

# Health check
curl http://localhost:3000/api/health

# Métriques Docker
docker stats vie-publique-app
```

### Logs centralisés

```bash
# Configurer log rotation
cat > /etc/logrotate.d/vie-publique << EOF
/opt/vie-publique/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker restart vie-publique-app > /dev/null
    endscript
}
EOF
```

## 🔧 Dépannage

### Problèmes courants

**1. Erreur de permission denied**

```bash
# Login au registry
docker login ghcr.io -u malicktech -p $(cat ~/.github-token)
```

**2. Image not found**

```bash
# Vérifier le nom de l'image
docker pull ghcr.io/malicktech/vie-publique.sn:latest
```

**3. Port déjà utilisé**

```bash
# Changer le port dans .env
APP_PORT=3001
```

**4. SSL/TLS ne fonctionne pas**

```bash
# Vérifier Traefik
docker logs traefik
# Vérifier les certificats
ls -la /opt/vie-publique/letsencrypt/
```

## 🔒 Sécurité

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Backup

```bash
# Script de backup
cat > /opt/vie-publique/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/vie-publique"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup des données
docker exec vie-publique-app tar czf - /app/logs > $BACKUP_DIR/logs_$DATE.tar.gz

# Backup de la config
tar czf $BACKUP_DIR/config_$DATE.tar.gz .env docker-compose.production.yml

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh
```

## 📈 Mise à l'échelle

Pour gérer plus de trafic :

```yaml
# docker-compose.production.yml
services:
  vie-publique:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

Ou utiliser Docker Swarm / Kubernetes pour une orchestration avancée.
