J'ai corrigé les problèmes de typage et amélioré la gestion des valeurs optionnelles. Maintenant le code est plus robuste et type-safe.
Pour résumer les avantages de cette nouvelle implémentation avec le store :
Gestion du cache :
Les données sont mises en cache pendant 5 minutes
Évite les requêtes multiples à l'API
Meilleure performance
Conservation de l'état :
Les filtres et la recherche sont conservés lors de la navigation
L'état est persistant entre les pages
Meilleure expérience utilisateur
Meilleure organisation :
Logique de gestion d'état centralisée dans le store
Code plus maintenable
Séparation des responsabilités
Typage amélioré :
Interface NewsArticle bien définie
Meilleure gestion des valeurs optionnelles
Plus de sécurité au niveau du typage

- documents page : https://claude.ai/chat/183fdc15-30ea-473d-a561-3e25e325ce92

## Les Composables (useXXX)

Sont préférables quand :
La logique est spécifique à un composant et n'a pas besoin d'être partagée
Les données sont éphémères et n'ont pas besoin d'être conservées entre les navigations
La logique concerne principalement des comportements UI (ex: useMousePosition, useWindowSize)
On veut encapsuler une logique réutilisable mais qui ne nécessite pas de persistance

## Les Stores (Pinia)

Sont préférables quand :
Les données doivent être partagées entre plusieurs composants
On veut conserver l'état entre les navigations
On a besoin d'une source unique de vérité pour certaines données
On veut centraliser la logique métier et les appels API
On veut mettre en cache les données pour éviter des appels API inutiles
Dans notre cas spécifique des actualités :
Pourquoi le store est plus approprié :
Les actualités sont affichées sur plusieurs pages (accueil et page actualités)
On veut éviter de refaire des appels API inutiles
On veut conserver les filtres et la recherche pendant la navigation
On veut une source unique de vérité pour les actualités

# images

- loading="lazy" : "Charge cette image plus tard, quand elle sera
  proche du viewport"

  - fetchpriority="high" : "Cette image est importante, charge-la en  
    priorité"

- utilisation du proxy via /api/cms-images pour plus de sécurité (cache l'url réell du cms), performance (cache optimisé avec header appropriés), flexible, on peut changer de cms sans modifier otu le code; seo (image servi depuis notre domaine)

https://nuxt.com/docs/api/composables/use-fetch#example-usage-of-proxy

https://nuxt.com/docs/4.x/getting-started/deployment#cdn-proxy

Voici comment remplacer $directusImageUrl par le nouveau
composable :

📝 Migration avec paramètre de qualité

Sans paramètre de qualité :

Avant :
<img :src="$directusImageUrl(article.cover_image)" />

Après :
<img :src="useCmsImage(article.cover_image)" />

Avec paramètre de qualité (comme '50') :

Avant :
<img :src="$directusImageUrl(article.cover_image, '50')" />

Après :
<img :src="useCmsImage(article.cover_image, 50)" />

Dans les meta tags avec qualité :

Avant :

  <meta itemprop="url" :content="$directusImageUrl(article.cover_image,         
  '50')">

Après :

  <meta itemprop="url" :content="useCmsImageAbsolute(article.cover_image,       
  50)">

## call api

## google core vitals

https://dev.to/jacobandrewsky/optimizing-nuxt-apps-for-core-web-vitals-106j
