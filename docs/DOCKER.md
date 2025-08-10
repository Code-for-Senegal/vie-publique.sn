# 🐳 Guide Docker - Vie-Publique.sn

Ce guide explique comment utiliser Docker pour développer et déployer l'application Vie-Publique.sn.

## 📋 Prérequis

- [Docker](https://docs.docker.com/get-docker/) v20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2.0+
- Git

## 🚀 Démarrage Rapide

### Production

```bash
# 1. Cloner le projet
git clone https://github.com/your-username/vie-publique.sn.git
cd vie-publique.sn

# 2. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos valeurs

# 3. Démarrer l'application
docker-compose up -d

# L'application est accessible sur http://localhost:3000
```

### Développement

```bash
# 1. Démarrer en mode développement avec hot reload
docker-compose -f docker-compose.dev.yml up

# 2. Avec cache Redis (optionnel)
docker-compose -f docker-compose.dev.yml --profile cache up

# 3. Avec base de données de test (optionnel)
docker-compose -f docker-compose.dev.yml --profile database up
```

## 🔧 Configuration Avancée

### Variables d'environnement

Créez un fichier `.env` à la racine :

```bash
# Application
NODE_ENV=production
APP_PORT=3000

# API Keys
TYPESENSE_API_KEY=your_typesense_key
TYPESENSE_URL=https://your-typesense-instance.com
CMS_API_KEY=your_cms_key
CMS_API_URL=https://your-cms-instance.com

# SSL (pour production avec Traefik)
ACME_EMAIL=your-email@domain.com
```

### Profils Docker Compose

Le projet utilise des profils pour activer des services optionnels :

```bash
# Production avec proxy Traefik + SSL
docker-compose --profile production up -d

# Développement avec cache Redis
docker-compose -f docker-compose.dev.yml --profile cache up

# Développement avec BDD + Cache + Email testing
docker-compose -f docker-compose.dev.yml --profile database --profile cache --profile email up
```

## 🏗️ Construction de l'image

### Construction locale

```bash
# Construction de l'image de production
docker build -t vie-publique:latest .

# Construction avec cache
docker build --cache-from vie-publique:latest -t vie-publique:latest .

# Construction multi-plateforme (ARM64 + AMD64)
docker buildx build --platform linux/amd64,linux/arm64 -t vie-publique:latest .
```

### Optimisations Docker

L'image utilise plusieurs optimisations :

- **Multi-stage build** : Sépare les étapes de build et runtime
- **Alpine Linux** : Image de base légère (Node 20 Alpine)
- **Utilisateur non-root** : Sécurité renforcée
- **Cache npm** : Réutilise le cache des dépendances
- **Healthcheck** : Vérifie automatiquement l'état de l'app

## 📊 Monitoring

### Health Check

L'application expose un endpoint de santé :

```bash
# Vérifier l'état de l'application
curl http://localhost:3000/api/health

# Réponse attendue
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production"
}
```

### Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f vie-publique-app

# Logs des 100 dernières lignes
docker-compose logs --tail=100 vie-publique-app

# Logs avec timestamps
docker-compose logs -t vie-publique-app
```

### Métriques

```bash
# Stats des conteneurs
docker stats

# Inspect du conteneur
docker inspect vie-publique-app

# Utilisation des volumes
docker system df
```

## 🔄 GitHub Actions

Le projet inclut une GitHub Action qui :

1. **Build automatique** sur push vers `develop`
2. **Push vers GitHub Container Registry** (ghcr.io)
3. **Scan de sécurité** avec Trivy
4. **Multi-architecture** (AMD64 + ARM64)
5. **Cache optimisé** pour des builds rapides

### Utilisation de l'image depuis le registry

```bash
# Pull de l'image depuis GitHub Container Registry
docker pull ghcr.io/your-username/vie-publique.sn:latest

# Démarrage avec l'image du registry
docker run -p 3000:3000 --env-file .env ghcr.io/your-username/vie-publique.sn:latest
```

## 🛠️ Commandes Utiles

### Développement

```bash
# Rebuild après changements du Dockerfile
docker-compose up --build

# Démarrer seulement certains services
docker-compose up vie-publique-app redis

# Exécuter des commandes dans le conteneur
docker-compose exec vie-publique-app npm run lint
docker-compose exec vie-publique-app npm test
```

### Production

```bash
# Mettre à jour l'image
docker-compose pull
docker-compose up -d

# Redémarrer sans downtime
docker-compose up -d --no-deps vie-publique-app

# Sauvegarder les volumes
docker run --rm -v vie-publique_logs-volume:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz /data
```

### Nettoyage

```bash
# Arrêter et supprimer tous les conteneurs
docker-compose down

# Supprimer aussi les volumes
docker-compose down -v

# Nettoyage complet du système Docker
docker system prune -a
```

## 🚨 Dépannage

### Problèmes courants

1. **Port 3000 occupé**
   ```bash
   # Changer le port dans .env
   APP_PORT=3001
   ```

2. **Erreur de permissions**
   ```bash
   # Sur Linux, ajuster les permissions
   sudo chown -R $USER:$USER .
   ```

3. **Cache npm corrompu**
   ```bash
   # Rebuild sans cache
   docker-compose build --no-cache
   ```

4. **Variables d'environnement manquantes**
   ```bash
   # Vérifier le fichier .env
   docker-compose config
   ```

### Debug

```bash
# Se connecter au conteneur
docker-compose exec vie-publique-app sh

# Vérifier les variables d'environnement
docker-compose exec vie-publique-app env

# Tester la connectivité
docker-compose exec vie-publique-app wget -qO- http://localhost:3000/api/health
```

## 🔒 Sécurité

- **Utilisateur non-root** : L'app s'exécute avec l'utilisateur `nuxtjs`
- **Scan de vulnérabilités** : GitHub Actions inclut Trivy
- **Variables sensibles** : Utilisez des secrets Docker en production
- **Network isolation** : Services isolés dans des réseaux privés

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nuxt 3 Deployment](https://nuxt.com/docs/getting-started/deployment)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)