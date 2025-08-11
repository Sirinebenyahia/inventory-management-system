
# Étape 1 : utiliser une image Node
FROM node:18

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json .
COPY package-lock.json .

# Installer les dépendances
 RUN npm install


# Copier tout le reste du projet
COPY . .

# Exposer le port sur lequel Next.js fonctionne
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "dev"]
