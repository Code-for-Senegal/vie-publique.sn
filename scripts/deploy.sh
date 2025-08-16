#!/bin/bash
# Script de déploiement pour Vie-Publique.sn

set -e  # Arrêter en cas d'erreur

# Configuration
GITHUB_USERNAME="malicktech"  # Remplacez par votre username
GITHUB_TOKEN="${GITHUB_TOKEN}"  # Sera lu depuis l'environnement
IMAGE_NAME="ghcr.io/${GITHUB_USERNAME}/vie-publique.sn"
CONTAINER_NAME="vie-publique-app"
ENV_FILE="/opt/vie-publique/.env"  # Chemin vers votre fichier .env sur le serveur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Démarrage du déploiement de Vie-Publique.sn${NC}"

# 1. Login au GitHub Container Registry
echo -e "${YELLOW}📦 Connexion au registry GitHub...${NC}"
echo "${GITHUB_TOKEN}" | docker login ghcr.io -u "${GITHUB_USERNAME}" --password-stdin

# 2. Pull la dernière image
echo -e "${YELLOW}⬇️  Pull de la dernière image...${NC}"
docker pull "${IMAGE_NAME}:latest"

# 3. Arrêter et supprimer l'ancien conteneur
echo -e "${YELLOW}🛑 Arrêt de l'ancien conteneur...${NC}"
docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm "${CONTAINER_NAME}" 2>/dev/null || true

# 4. Démarrer le nouveau conteneur
echo -e "${YELLOW}▶️  Démarrage du nouveau conteneur...${NC}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file "${ENV_FILE}" \
  --health-cmd="curl -f http://localhost:3000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  "${IMAGE_NAME}:latest"

# 5. Attendre que le conteneur soit healthy
echo -e "${YELLOW}⏳ Attente du health check...${NC}"
for i in {1..30}; do
  if [ "$(docker inspect -f '{{.State.Health.Status}}' ${CONTAINER_NAME})" == "healthy" ]; then
    echo -e "${GREEN}✅ Conteneur démarré avec succès !${NC}"
    break
  fi
  echo -n "."
  sleep 2
done

# 6. Nettoyage des anciennes images
echo -e "${YELLOW}🧹 Nettoyage des anciennes images...${NC}"
docker image prune -f

# 7. Vérification finale
if [ "$(docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME})" == "true" ]; then
  echo -e "${GREEN}✅ Déploiement réussi !${NC}"
  echo -e "${GREEN}🌐 Application accessible sur http://$(hostname -I | awk '{print $1}'):3000${NC}"
  
  # Afficher les logs
  echo -e "${YELLOW}📋 Derniers logs :${NC}"
  docker logs --tail 20 "${CONTAINER_NAME}"
else
  echo -e "${RED}❌ Erreur lors du déploiement${NC}"
  docker logs "${CONTAINER_NAME}"
  exit 1
fi