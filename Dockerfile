# Étape 1 : Build de l'application
FROM node:20 AS builder

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
COPY .npmrc .npmrc
RUN npm install

# Copier tout le projet
COPY . .

# Build Nuxt
RUN npm run build

# Étape 2 : Démarrage de l'application
FROM node:20

# Définir le dossier de travail
WORKDIR /app

# Copier uniquement ce qu'il faut
COPY --from=builder /app/.output ./.output
COPY package*.json ./
RUN npm install --production

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", ".output/server/index.mjs"]
