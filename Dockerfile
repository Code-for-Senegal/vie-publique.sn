# Utilise une image Node.js légère
FROM node:18-alpine

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers du projet et installe les dépendances
COPY package.json package-lock.json ./
RUN npm install --production

# Copie le reste des fichiers
COPY . .

# Build du projet NuxtJS
RUN npm run build

# Expose le port
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", ".output/server/index.mjs"]
