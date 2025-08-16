- [] suppirmer les gros fichiers: gérer via CND ou appel API

  - [] carte-json élection

- [] supprimer tous les pdf qui ne sont plus utiles
- [] supprimer tous les fichier json qui ne sont plus utiles
- [] supprimer tous les composants qui ne sont plus utilisé

📋 Récapitulatif final de la séparation BUILD vs RUNTIME :

🏗️ GitHub Secrets (Variables de BUILD)

Ces variables sont intégrées dans le JavaScript final lors du  
 build :
NUXT_PUBLIC_SITE_URL
GTAG_ID
FACEBOOK_PIXEL_ID
PUBLIC_SHOW_PINNED_PEOLPLES
PUBLIC_SHOW_SCANDALS
PUBLIC_SHOW_BAROMETER
MAINTENANCE_MODE

🚀 Docker Compose .env (Variables de RUNTIME)

Ces variables sont utilisées côté serveur quand l'application  
 s'exécute :
CMS_API_URL
CMS_API_KEY
BREVO_API_KEY
BREVO_LIST_ID
NUXT_TURNSTILE_SECRET_KEY
SUNU_ELECTION_API_URL
SUNU_ELECTION_API_KEY

🎯 Pourquoi cette distinction ?

1. Variables publiques → Visibles dans le navigateur →
   Intégrées au build
2. Variables secrètes → Côté serveur uniquement → Runtime
   seulement
3. Sécurité → Pas de secrets dans GitHub Actions → Secrets en  
   production seulement

Cette configuration respecte les bonnes pratiques de sécurité  
 et évite l'erreur CMS_API_KEY environment variable is required  
 pendant le build Docker !

🎯 Solution finale : Approche "Vercel-like" avec Docker

✅ Avantages de cette nouvelle configuration :

1. 🔄 Une seule image Docker pour tous les environnements
2. 📝 Variables par environnement via fichiers .env différents
3. 🚀 Déploiement flexible comme Vercel mais avec Docker
4. 🔒 Sécurité maintenue secrets pas dans l'image

🔍 Différence Vercel vs Docker :

📦 Vercel (Edge Computing)

# Vercel fait le BUILD à chaque déploiement sur leur

infrastructure
git push → Vercel build avec vos ENV → Deploy

- Build dynamique par environnement
- Variables injectées au moment du build sur Vercel
- Un build différent par environnement (dev/staging/prod)

🐳 Docker (Container)

# Docker fait le BUILD une seule fois → Image réutilisable

git push → GitHub Actions build → Image → Deploy partout

- Build statique une seule fois
- Image Docker identique pour tous les environnements
- Variables runtime injectées à l'exécution

⚡ Solution : Build-time vs Runtime

Vous avez raison d'être confus ! Voici les deux approches
possibles :

Option 1 : Build par environnement (comme Vercel)

Créer une image Docker différente par environnement

Option 2 : Image universelle + Runtime (recommandée)

Une seule image, variables injectées au runtime

🎯 Recommandation : Migrer vers Runtime

La meilleure pratique Docker est d'avoir une seule image avec  
 variables runtime.
