# Dockerfile multi-stage optimisé pour Nuxt 3
FROM node:20-alpine AS base

# Installation des dépendances système et curl pour healthcheck
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY .npmrc* ./

# Stage de build
FROM base AS builder

# Déclaration des arguments de build (minimal)
ARG NODE_ENV=production
ARG BUILDTIME
ARG VERSION

# Installer toutes les dépendances
RUN npm ci --frozen-lockfile

# Copier le code source
COPY . .

# Créer le dossier PDF worker (pour éviter les erreurs)
RUN mkdir -p public/pdf-worker
RUN if [ -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs ]; then \
      cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf-worker/; \
    fi

# Variables d'environnement pour le build (minimal)
ENV NODE_ENV=${NODE_ENV}
ENV NITRO_PRESET=node-server

# Build de l'application avec configuration minimale
# TOUTES les variables seront fournies au runtime via docker-compose
RUN npm run build

# Stage de production
FROM base AS runner

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copier seulement les fichiers nécessaires
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json /app/package.json

# Installer seulement les dépendances de production
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Passer à l'utilisateur non-root
USER nuxtjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement de runtime
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Healthcheck pour vérifier que l'app fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Commande de démarrage
CMD ["node", ".output/server/index.mjs"]
