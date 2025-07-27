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
