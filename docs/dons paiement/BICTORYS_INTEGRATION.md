# Intégration Bictorys - Système de Don

Ce document explique comment configurer et utiliser le système de don via Bictorys sur Vie-Publique.sn.

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Bictorys Payment Configuration
# Pour le mode test:
BICTORYS_API_KEY=public-XXXXXXXX.YYYYYYYYYYYYYY
BICTORYS_API_URL=https://api.test.bictorys.com/pay/v1/charges

# Pour la production:
# BICTORYS_API_KEY=votre_cle_api_production
# BICTORYS_API_URL=https://api.bictorys.com

BICTORYS_PUBLIC_KEY=votre_cle_publique_bictorys
BICTORYS_WEBHOOK_SECRET=votre_secret_webhook
```

### 2. Obtenir les clés API Bictorys

1. Créez un compte marchand sur [Bictorys](https://bictorys.com)
2. Accédez à votre dashboard
3. Récupérez vos clés API (API Key, Public Key)
4. Configurez votre webhook secret
5. Configurez l'URL du webhook : `https://vie-publique.sn/api/donate/webhook`

### 3. Configuration du webhook Bictorys

Dans votre dashboard Bictorys, configurez les webhooks :

- **URL du webhook** : `https://vie-publique.sn/api/donate/webhook`
- **Événements à surveiller** :
  - `charge.success` ou `payment.success`
  - `charge.failed` ou `payment.failed`
  - `charge.pending` ou `payment.pending`

## Architecture

### Composants créés

1. **[app/components/DonateButton.vue](app/components/DonateButton.vue)**
   - Bouton flotant responsive
   - Formulaire de don avec montants prédéfinis
   - Validation des données
   - Interface utilisateur intuitive

2. **[app/composables/useDonate.ts](app/composables/useDonate.ts)**
   - Gestion de l'état de la modal de don

3. **[app/composables/useBictorysDonation.ts](app/composables/useBictorysDonation.ts)**
   - Logique de paiement Bictorys
   - Formatage des montants
   - Gestion des erreurs

### Endpoints API

1. **POST /api/donate/init-payment**
   - Initialise un paiement Bictorys
   - Paramètres requis :
     ```json
     {
       "amount": 5000,
       "name": "Prénom Nom",
       "email": "email@example.com",
       "phone": "+221XXXXXXXXX" // optionnel
     }
     ```
   - Appelle l'API Bictorys avec le format suivant :
     ```json
     {
      "amount": 5000,
      "currency": "XOF",
      "paymentReference": "VPS-DON-1234567890-abc123",
      "merchantReference": "uuid-v4",
      "successRedirectUrl": "https://client.co/redirect_url",
      "errorRedirectUrl": "https://client.co/redirect_url",
      "customerObject": {
        "name": "Prénom Nom",
        "email": "email@example.com",
        "phone": "+221XXXXXXXXX",
        "city": "Dakar",
        "country": "SN",
        "locale": "fr-FR"
      }
     }
     ```
   - Headers utilisés :
     - `Content-Type: application/json`
     - `X-Api-Key: votre_cle_api_bictorys`
   - Retourne l'URL de paiement Bictorys

2. **POST /api/donate/webhook**
   - Reçoit les notifications de Bictorys
   - Traite les paiements réussis/échoués
   - Authentification via signature webhook

### Pages de callback

1. **[/donate/success](app/pages/donate/success.vue)**
   - Page de confirmation après paiement réussi
   - Affiche un message de remerciement

2. **[/donate/cancel](app/pages/donate/cancel.vue)**
   - Page affichée si l'utilisateur annule
   - Permet de réessayer le paiement

## Flux de paiement

1. L'utilisateur clique sur le bouton "Faire un don"
2. La modal s'ouvre avec le formulaire
3. L'utilisateur sélectionne un montant/saisi un montant et remplit ses informations
4. Soumission du formulaire → Appel à `/api/donate/init-payment`
5. Redirection vers la page de paiement Bictorys
6. L'utilisateur effectue le paiement sur Bictorys
7. Bictorys redirige vers :
   - `/donate/success` si paiement réussi
   - `/donate/cancel` si annulé
8. Bictorys envoie un webhook à `/api/donate/webhook` avec le statut final

## Montants prédéfinis

Les montants suggérés sont configurés dans `useBictorysDonation.ts` :

```typescript
const suggestedAmounts = [
  { label: '1 000 FCFA', value: 1000 },
  { label: '2 500 FCFA', value: 2500 },
  { label: '5 000 FCFA', value: 5000 },
  { label: '10 000 FCFA', value: 10000 },
  { label: '25 000 FCFA', value: 25000 },
  { label: '50 000 FCFA', value: 50000 },
]
```

## Personnalisation

### Modifier les montants prédéfinis

Éditez le fichier `app/composables/useBictorysDonation.ts` et modifiez le tableau `suggestedAmounts`.

### Modifier la position du bouton

Éditez les styles dans `app/components/DonateButton.vue` :

```css
.donate-button {
  position: fixed;
  z-index: 40;

  /* Desktop */
  @media (min-width: 1024px) {
    right: 2rem;      /* Distance du bord droit */
    top: 50%;         /* Position verticale */
  }

  /* Mobile */
  @media (max-width: 1023px) {
    right: 1rem;      /* Distance du bord droit */
    top: 5rem;        /* Distance du haut */
  }
}
```

### Modifier la couleur du bouton

Dans `app/components/DonateButton.vue`, changez la prop `color` du UButton :

```vue
<UButton
  color="yellow"    <!-- Changez cette valeur: red, blue, green, etc. -->
  ...
>
```

## Sécurité

### Vérification de la signature webhook

Le fichier `server/api/donate/webhook.post.ts` contient une section TODO pour implémenter la vérification de signature :

```typescript
// TODO: Implémenter la vérification de signature selon la documentation Bictorys
const isValid = verifyBictorysSignature(body, signature, webhookSecret)
if (!isValid) {
  throw createError({
    statusCode: 401,
    message: 'Signature du webhook invalide',
  })
}
```

Consultez la documentation Bictorys pour la méthode exacte de vérification.

## Fonctionnalités à implémenter (TODO)

Dans `server/api/donate/webhook.post.ts`, implémentez :

1. **Enregistrement en base de données**
   - Stocker les transactions réussies
   - Tracker les donateurs récurrents

2. **Email de confirmation**
   - Envoyer un reçu au donateur
   - Notification à l'équipe

3. **Reçu fiscal** (si applicable)
   - Générer un reçu PDF
   - Envoyer par email

4. **Statistiques**
   - Dashboard des dons
   - Graphiques de suivi

## Support et documentation

- **Documentation Bictorys** : [Docs.bictorys.com](https://docs.bictorys.com)
- **Dashboard Bictorys** : [Dashboard](https://dashboard.bictorys.com)
- **Support technique** : Remplir ce [formulaire](https://infos.bictorys.com/contact/)

## Tests

### Mode test Bictorys

Bictorys propose un mode test. Utilisez les clés API de test pour vos développements :

```env
BICTORYS_API_KEY=test_votre_cle_api_test
BICTORYS_PUBLIC_KEY=test_votre_cle_publique_test
```

### Tester le workflow complet

1. Démarrez le serveur : `npm run dev-win`
2. Ouvrez http://localhost:3000
3. Cliquez sur le bouton "Faire un don"
4. Remplissez le formulaire avec des données de test
5. Vérifiez la redirection vers Bictorys
6. Testez un paiement avec les cartes de test Bictorys

## Troubleshooting

### Le bouton ne s'affiche pas

- Vérifiez que `DonateButton` est bien importé dans `app.vue`
- Vérifiez le z-index si d'autres éléments le cachent

### Erreur lors de l'initialisation du paiement

- Vérifiez que les variables d'environnement sont correctement configurées
- Vérifiez que votre clé API Bictorys est valide
- Consultez les logs serveur pour plus de détails

### Webhook non reçu

- Vérifiez l'URL du webhook dans votre dashboard Bictorys
- Vérifiez que votre serveur est accessible publiquement
- Consultez les logs webhook dans le dashboard Bictorys
