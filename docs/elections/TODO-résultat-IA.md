J'ai une une application web pour afficher les résultats des élections législatives au Sénégal 2024. J'utilise :

- Nuxt 3 avec TypeScript
- Nuxt UI avec TailwindCSSpour le KIT UI
- D3.js pour les visualisations
- j'ai nuxtjs/leaflet

Mon projet a déjà Une base de données dans DirectUs (CMS headless) qui contient tous les élements :

- Liste des 41 coalitions avec leurs infos (logo, nom, tête de liste, candidats, etc)
- Collection des candidats liés aux coalitions et aux listes départementales/nationales
- Liste des 54 départements (46 nationaux + 8 diaspora)
- Un fichier GeoJSON pour la carte du Sénégal, avec les nom des département

Voici le système électoral :

- 165 sièges au total
- 112 sièges départementaux (scrutin majoritaire)
- 53 sièges nationaux (scrutin proportionnel)
- Chaque département a un nombre de sièges spécifique
- les sièges nationaux sont réparti selon le quotient électorale et le score

Voici ci joint mes données actuelles des listes candidats et des départemetns.

Je souhaite créer une interface responsive qui montre plusieurs facon les résultats, il doit y avoir :

- Les résultats globaux par listes, sous forme de Hemicycle (classement en voix, pourcentage et nombre de sièges)
- Une carte interactive du Sénégal
- Les résultats par département
- Les détails des coalitions

L'interface doit être:

- facile à naviguer
- optimisée pour mobile car 80% des utilisateurs y accèdent via mobile.
- Pouvez-vous m'aider à structurer et construire cette interface ?
