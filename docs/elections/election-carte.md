graph LR
A[Composable] --> B[/api/carte]
A --> C[/api/carte/result]
B --> D[CMS Directus]
C --> D
E[Cache Serveur] --> B
E --> C

Avantages de cette architecture :

1. 🔒 Sécurité maximale


    - cmsApiKey reste côté serveur uniquement
    - Jamais exposée dans le bundle client

2. ⚡ Performance optimisée


    - Cache serveur partagé (1 heure TTL)
    - Moins de requêtes vers le CMS

3. 🛠️ Maintenabilité


    - Point d'entrée unique pour chaque endpoint
    - Transformation de données centralisée
    - Logging et monitoring centralisé

4. 🔄 Résilience


    - Fallback sur cache expiré en cas d'erreur
    - Gestion d'erreur centralisée

Flux de données :

1. Client → Composable useElectionMapData()
2. Composable → /api/carte (Nuxt server)
3. Server API → CMS Directus (avec authentification)
4. Server API → Cache + Retour au client
