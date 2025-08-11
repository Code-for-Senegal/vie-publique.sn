# Système de Recherche Typesense

## Vue d'ensemble

Le système de recherche utilise Typesense comme moteur de recherche pour indexer et rechercher dans les actualités du site Vie-Publique.sn.

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Configuration Typesense
TYPESENSE_API_KEY=your_typesense_api_key_here
TYPESENSE_URL=https://search.vie-publique.sn
```

### Configuration Nuxt

Les variables sont configurées dans `nuxt.config.ts` :

```typescript
runtimeConfig: {
  // Variables privées (côté serveur uniquement)
  typesenseApiKey: process.env.TYPESENSE_API_KEY,
  typesenseUrl: process.env.TYPESENSE_URL || 'https://search.vie-publique.sn',
  // ...
}
```

## Architecture

### Composants

1. **AppSearch.vue** - Icône de recherche dans le header
2. **pages/recherche.vue** - Page de recherche principale
3. **server/api/search.ts** - API côté serveur pour Typesense
4. **composables/useSearch.ts** - Logique de recherche réutilisable

### Flux de données

1. L'utilisateur clique sur l'icône de recherche dans le header
2. Il est redirigé vers `/recherche`
3. Il tape sa requête dans le champ de recherche
4. La requête est envoyée à `/api/search` avec debounce (300ms)
5. L'API fait une requête vers Typesense
6. Les résultats sont affichés avec pagination

## Fonctionnalités

### Recherche en temps réel

- Debounce de 300ms pour éviter trop de requêtes
- Recherche automatique lors de la saisie
- Indicateur de chargement

### Affichage des résultats

- Titre de l'article
- Extrait avec mise en surbrillance des termes recherchés
- Image de couverture
- Catégorie et date de publication
- Pagination

�� Fonctionnalités
Recherche en temps réel avec debounce
Mise en surbrillance des termes recherchés
Navigation cohérente vers les articles
Pagination des résultats
Interface responsive et moderne
Sécurité : API key protégée côté serveur

- [] Intégrer InstantSearch.js de Typesense
- [] Ajouter filtres par catégories/tags
- [] Highlighting des résultats

2. Votre implémentation actuelle : Bien mais
   basique

Points positifs :

- Structure claire avec composable
- Gestion d'état correcte
- Pagination fonctionnelle
- UX avec debounce

Points à améliorer :

- Pas de highlighting (paramètres manquants)
- Recherche limitée à une seule collection
- Pas de filtres avancés
- Pas de suggestions/autocomplete

InstantSearch.js est une librairie qui fournit des  
 widgets prêts à l'emploi pour créer des
interfaces de recherche avancées :

● Gardez votre approche actuelle mais améliorez-la :

1. Correction immédiate : Ajoutez les paramètres  
   de highlighting
2. Améliorations courtes :

   - Tri par pertinence/date
   - Filtres par catégorie
   - Recherche facettée

3. Migration vers InstantSearch.js seulement si  
   vous voulez :

   - Interface ultra-avancée
   - Analytics détaillés
   - Moins de code custom

### Navigation

- Liens vers les articles avec formatage d'URL cohérent
- Gestion des catégories spéciales (conseil des ministres, assemblée nationale)

## API Typesense

### Endpoint

```
GET /api/search?q={query}&page={page}
```

### Paramètres

- `q` : Terme de recherche
- `page` : Numéro de page (optionnel, défaut: 1)

### Réponse

```json
{
  "data": [
    {
      "document": {
        "id": "string",
        "title": "string",
        "content_text": "string",
        "cover_image": "string",
        "category": {
          "name": "string",
          "slug": "string"
        },
        "date_published": "string"
      },
      "highlights": {
        "content_text": "string avec <mark>balises</mark>"
      }
    }
  ],
  "total": 42,
  "query": "conseil",
  "page": 1
}
```

## Sécurité

- L'API key Typesense est stockée côté serveur uniquement
- Pas d'exposition de l'API key côté client
- Validation des paramètres d'entrée
- Gestion d'erreurs appropriée

## Maintenance

### Ajout de nouveaux types de contenu

1. Indexer le nouveau contenu dans Typesense
2. Adapter la fonction `formatNewsUrl` si nécessaire
3. Mettre à jour les types TypeScript si besoin

### Optimisation des performances

- Utilisation de `useDebounceFn` pour limiter les requêtes
- Pagination côté serveur
- Cache des résultats (à implémenter si nécessaire)

## Dépannage

### Erreurs courantes

1. **Configuration manquante** : Vérifiez les variables d'environnement
2. **API key invalide** : Vérifiez la clé Typesense
3. **Pas de résultats** : Vérifiez l'indexation dans Typesense

### Logs

Les erreurs sont loggées côté serveur dans la console.

## instantsearch

Fonctionnalités implémentées :

1. InstantSearch Integration : Utilise
   typesense-instantsearch-adapter pour une recherche en temps  
   réel
2. Filtre par type : Sidebar avec des cases à cocher pour  
   filtrer entre "Document" et "Actualité"
3. Badges de type : Chaque résultat affiche un badge coloré
   (orange pour documents, bleu pour actualités)
4. Highlighting : Les termes recherchés sont mis en évidence  
   avec un fond jaune
5. Synchronisation URL : Les paramètres de recherche sont
   synchronisés avec l'URL pour partage et navigation
6. Pagination : Navigation entre les pages de résultats
7. Statistiques : Affiche le nombre de résultats et le temps de  
   recherche
8. Design responsive : Layout adaptatif avec sidebar sur
   desktop

Points clés :

- La configuration Typesense utilise les variables
  d'environnement existantes
- Les résultats sont formatés avec les mêmes règles d'URL que  
  la v1
- Support du dark mode
- Les highlights utilisent les balises <mark> avec style
  personnalisé
- Performance optimisée avec lazy loading des images

1. recherche en temps  
   réel
2. Filtre par type : Sidebar avec des cases à cocher pour  
   filtrer entre "Document" et "Actualité"
3. Badges de type : Chaque résultat affiche un badge coloré
   (orange pour documents, bleu pour actualités)
4. Highlighting : Les termes recherchés sont mis en évidence  
   avec un fond jaune
5. Synchronisation URL : Les paramètres de recherche sont
   synchronisés avec l'URL pour partage et navigation
6. Pagination : Navigation entre les pages de résultats
7. Statistiques : Affiche le nombre de résultats et le total indéxés
8. Design responsive : Layout adaptatif

🎯 Nouvelles fonctionnalités :

- Sidebar filtres (desktop) + menu coulissant (mobile)
- Recherches suggérées pour l'état initial
- Statistiques détaillées dans la sidebar
- Interface moderne avec Nuxt UI
- Gestion d'état avancée avec synchronisation URL
- Animations et transitions fluides

## v5

✅ Amélioration UX Mobile Complete !

🎯 Changements apportés :

1. ❌ Suppression de la sidebar mobile - Plus
   de USlideover à ouvrir
2. ✅ Filtres toujours visibles - Directement
   intégrés sous la recherche
3. 🎨 Design amélioré :


    - Grid 2 colonnes pour les filtres
    - Boutons toggle avec transitions
    - Compteur de filtres actifs
    - Statistiques compactes et centrées
    - Icônes et couleurs cohérentes

📱 Avantages sur mobile :

- Accès immédiat aux filtres sans clic
  supplémentaire
- Interface claire avec seulement 2 filtres
  (Documents / Actualités)
- Feedback visuel sur les filtres actifs
- Statistiques intégrées pour le contexte
- Plus compact et optimisé pour les petits
  écrans

🚀 Résultat :

L'interface mobile est maintenant plus directe  
 et intuitive :

- Pas de menu caché
- Filtres accessibles d'un coup d'œil
- Design cohérent avec le reste de
  l'application
- Performance optimale sans composants lourds
