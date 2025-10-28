# 🚀 Guide de démarrage rapide - Annuaire des Entités Publiques

## Étape 1 : Configuration Directus

### 1.1 Créer les collections

Connectez-vous à votre interface Directus Admin et créez les deux collections suivantes :

#### Collection `state_entities`

```
Nom : state_entities
Type : Standard
Primary Key : id (integer, auto-increment)
```

**Champs à créer :**

| Nom du champ | Type | Options | Requis |
|--------------|------|---------|--------|
| `id` | Integer | Auto-increment, Primary Key | ✅ |
| `public_slug` | String | Unique, Interface: Input | ✅ |
| `name` | String | Interface: Input | ✅ |
| `short_name` | String | Interface: Input | ❌ |
| `acronym` | String | Interface: Input | ❌ |
| `type` | Dropdown | Choices: ministere, secretariat_etat, direction, agence, autorite, societe_nationale, etablissement, commission, conseil, autre | ✅ |
| `status` | Dropdown | Choices: active, inactive, dissolved, merged, renamed. Default: active | ✅ |
| `description` | Text | Interface: Textarea | ❌ |
| `mission` | Text | Interface: Textarea | ❌ |
| `parent_entity` | Many-to-One | Related Collection: state_entities | ❌ |
| `address` | String | Interface: Input | ❌ |
| `phone` | String | Interface: Input | ❌ |
| `email` | String | Interface: Input, Validation: Email | ❌ |
| `website` | String | Interface: Input, Validation: URL | ❌ |
| `director_name` | String | Interface: Input | ❌ |
| `director_title` | String | Interface: Input | ❌ |
| `created_at` | Date | Interface: Datetime | ❌ |
| `dissolved_at` | Date | Interface: Datetime | ❌ |
| `legal_reference` | String | Interface: Input | ❌ |
| `decree_number` | String | Interface: Input | ❌ |
| `decree_date` | Date | Interface: Datetime | ❌ |
| `date_created` | Timestamp | System field | Auto |
| `date_updated` | Timestamp | System field | Auto |

#### Collection `state_entity_events`

```
Nom : state_entity_events
Type : Standard
Primary Key : id (integer, auto-increment)
```

**Champs à créer :**

| Nom du champ | Type | Options | Requis |
|--------------|------|---------|--------|
| `id` | Integer | Auto-increment, Primary Key | ✅ |
| `entity_id` | Many-to-One | Related Collection: state_entities | ✅ |
| `event_type` | Dropdown | Choices: created, renamed, merged, dissolved, moved, other | ✅ |
| `event_date` | Date | Interface: Datetime | ✅ |
| `description` | Text | Interface: Textarea | ✅ |
| `legal_reference` | String | Interface: Input | ❌ |
| `decree_number` | String | Interface: Input | ❌ |
| `old_name` | String | Interface: Input | ❌ |
| `new_name` | String | Interface: Input | ❌ |
| `old_parent` | Many-to-One | Related Collection: state_entities | ❌ |
| `new_parent` | Many-to-One | Related Collection: state_entities | ❌ |
| `date_created` | Timestamp | System field | Auto |

### 1.2 Configurer les permissions

Pour chaque collection, configurez les permissions :

**Public Role :**
- ✅ Read (lecture uniquement)
- ❌ Create, Update, Delete

**Administrator Role :**
- ✅ All permissions

## Étape 2 : Importer les données de test

### Option A : Via l'interface Directus

1. Allez dans la collection `state_entities`
2. Cliquez sur "Import" (si disponible)
3. Sinon, créez manuellement quelques entités de test :

**Exemple de ministère :**
```
public_slug: ministere-sante
name: Ministère de la Santé et de l'Action sociale
acronym: MSAS
type: ministere
status: active
description: Ministère en charge de la santé publique
website: http://www.sante.gouv.sn
director_name: Dr. Ibrahima Sy
director_title: Ministre
```

**Exemple de direction :**
```
public_slug: direction-prevention
name: Direction de la Prévention
acronym: DP
type: direction
status: active
parent_entity: [ID du ministère de la santé]
director_name: Dr. Mamadou Ndiaye
director_title: Directeur
```

### Option B : Via SQL (recommandé pour import massif)

Utilisez le fichier `docs/model/state-entities-sample-data.sql` comme base et adaptez-le avec vos vraies données.

## Étape 3 : Vérifier la configuration

### 3.1 Variables d'environnement

Vérifiez que votre fichier `.env` contient :

```env
CMS_API_URL=https://your-directus-instance.com
CMS_API_KEY=your-directus-token
CMS_API_URL_ASSETS=https://your-directus-instance.com
```

**⚠️ Important : Pas de trailing slash `/` à la fin des URLs !**

### 3.2 Tester la connexion Directus

Lancez le serveur :

```bash
npm run dev
```

Testez l'API directement :

```bash
# Test de la liste des entités
curl http://localhost:3000/api/state/entities

# Test des statistiques
curl http://localhost:3000/api/state/stats

# Test de l'arbre
curl http://localhost:3000/api/state/tree
```

Vous devriez recevoir des réponses JSON avec vos données.

## Étape 4 : Accéder à l'annuaire

Ouvrez votre navigateur et accédez à :

```
http://localhost:3000/etat-senegal/annuaire
```

Vous devriez voir :
- ✅ Les statistiques en haut (total, ministères, agences, directions)
- ✅ Les 2 onglets "Liste" et "Arbre hiérarchique"
- ✅ La barre de filtres fonctionnelle
- ✅ La liste des entités affichée en grille

## Étape 5 : Tester les fonctionnalités

### Test de la recherche
1. Tapez un nom d'entité dans la barre de recherche
2. Attendez 500ms (debounce)
3. Les résultats doivent se filtrer automatiquement

### Test des filtres
1. Sélectionnez un type (ex: "Agences")
2. La liste doit se mettre à jour
3. L'URL doit contenir `?type=agence`

### Test de la pagination
1. Si vous avez plus de 20 entités, la pagination doit apparaître
2. Cliquez sur "Page 2"
3. L'URL doit contenir `?page=2`

### Test de l'arbre hiérarchique
1. Cliquez sur l'onglet "Arbre hiérarchique"
2. Cliquez sur le bouton "Tout déplier"
3. Tous les noeuds doivent s'ouvrir
4. Cliquez sur un noeud individuel pour le replier

### Test de la page de détail
1. Cliquez sur une entité dans la liste
2. Vous devez être redirigé vers `/etat-senegal/annuaire/[slug]`
3. Vérifiez que toutes les sections s'affichent :
   - Fil d'Ariane
   - Informations principales
   - Coordonnées
   - Références légales
   - Entités rattachées (si applicable)
   - Historique (si applicable)

## Étape 6 : Déploiement en production

### 6.1 Build de production

```bash
npm run build
```

### 6.2 Vérifier le build

```bash
npm run preview
```

### 6.3 Déployer

Suivez les instructions de déploiement de votre hébergeur (Vercel, Netlify, etc.).

N'oubliez pas de configurer les variables d'environnement en production !

## 🐛 Dépannage

### Problème : "Aucune entité trouvée"

**Solutions :**
1. Vérifiez que vous avez bien des données dans Directus
2. Vérifiez que les permissions sont configurées (Public → Read)
3. Vérifiez les variables d'environnement (`CMS_API_URL`, `CMS_API_KEY`)
4. Regardez les logs du serveur pour voir les erreurs

### Problème : "500 Internal Server Error"

**Solutions :**
1. Vérifiez que `CMS_API_KEY` est correcte
2. Vérifiez que les collections existent dans Directus
3. Vérifiez les logs du serveur : `console.log` dans les routes API
4. Testez directement l'API Directus :
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://your-directus-instance.com/items/state_entities
   ```

### Problème : L'arbre hiérarchique ne s'affiche pas

**Solutions :**
1. Vérifiez que le champ `parent_entity` est bien configuré comme Many-to-One
2. Vérifiez que des entités ont bien une valeur `parent_entity`
3. Testez l'endpoint directement : `/api/state/tree`

### Problème : Les filtres ne fonctionnent pas

**Solutions :**
1. Vérifiez que l'URL change quand vous filtrez
2. Ouvrez la console du navigateur pour voir les erreurs
3. Vérifiez que les champs `type` et `status` existent dans Directus

## 📚 Ressources

- [Documentation complète](./ANNUAIRE-ENTITES-PUBLIQUES.md)
- [Checklist d'implémentation](./ANNUAIRE-CHECKLIST.md)
- [Modèle de données](./model/state-prompt.md)
- [Guide d'architecture API](./guideline-api.md)

## 💡 Conseils

1. **Import des données** : Utilisez un script Python ou Node.js pour importer automatiquement depuis les décrets PDF
2. **Maintenance** : Mettez à jour les données après chaque nouveau décret
3. **Performance** : Si vous avez plus de 1000 entités, envisagez d'ajouter un index sur `public_slug` et `type`
4. **SEO** : Ajoutez un sitemap automatique pour référencer toutes les pages

## ✅ Checklist de vérification

- [ ] Collections créées dans Directus
- [ ] Permissions configurées
- [ ] Données de test importées
- [ ] Variables d'environnement configurées
- [ ] Serveur de dev lancé (`npm run dev`)
- [ ] Page principale accessible
- [ ] Recherche fonctionnelle
- [ ] Filtres fonctionnels
- [ ] Pagination fonctionnelle
- [ ] Arbre hiérarchique fonctionnel
- [ ] Pages de détail accessibles
- [ ] SEO vérifié (meta tags)
- [ ] Responsive testé (mobile, tablette)

## 🎉 Prêt à lancer !

Une fois toutes ces étapes complétées, votre annuaire des entités publiques est prêt à être utilisé !

Pour toute question ou problème, consultez la documentation complète ou ouvrez une issue sur le repository.
