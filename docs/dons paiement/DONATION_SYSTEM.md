# Système de Donation - Vie-Publique.sn

Documentation du système de donation via **Bictorys**.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Flux de paiement](#flux-de-paiement)
5. [Pages et composants](#pages-et-composants)
6. [API Endpoints](#api-endpoints)
7. [Emails de confirmation](#emails-de-confirmation)

---

## Vue d'ensemble

Le système de donation permet aux utilisateurs de soutenir Vie-Publique.sn via **Bictorys** (carte bancaire et Mobile Money).

### Caractéristiques principales

✅ Page dédiée `/don/bictorys`
✅ Formulaire avec montants prédéfinis et montant personnalisé
✅ Checkbox obligatoire d'acceptation de la charte des dons
✅ Envoi automatique d'email de confirmation via Nodemailer
✅ Pages de callback communes (succès/annulation)
✅ Webhook pour traiter les notifications de paiement

---

## Architecture

### Structure des fichiers

```
app/
├── pages/
│   └── don/
│       ├── bictorys.vue          # Page de don via Bictorys
│       ├── success.vue           # Page de confirmation (succès)
│       └── cancel.vue            # Page d'annulation
├── composables/
│   └── useBictorysDonation.ts   # Logique Bictorys
└── components/
    └── DonateButton.vue          # Bouton flottant

server/
├── api/
│   └── donate/
│       ├── init-payment.post.ts  # Init Bictorys
│       └── webhook.post.ts       # Webhook Bictorys
└── utils/
    └── nodemailer.ts             # Utilitaire d'envoi d'emails
```

### Diagramme de flux

```
┌─────────────────────────────────┐
│         Menu de Navigation      │
│       [Don avec Bictorys]       │
└─────────────────┬───────────────┘
                  │
         ┌────────▼────────┐
         │ /don/bictorys   │
         │ Formulaire      │
         │ + Checkbox      │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ API Init        │
         │ Bictorys        │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ Passerelle      │
         │ Bictorys        │
         └────────┬────────┘
                  │
       ┌──────────▼──────────┐
       │ Success ou Cancel   │
       └──────────┬──────────┘
                  │
       ┌──────────▼──────────┐
       │ Webhook Handler     │
       │ + Email Nodemailer  │
       └─────────────────────┘
```

---

## Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
BICTORYS_API_KEY=test_public-VOTRE_CLE_ICI
BICTORYS_SECRET_KEY=test_secret-VOTRE_CLE_ICI
BICTORYS_API_URL=https://api.test.bictorys.com/pay/v1/charges
BICTORYS_WEBHOOK_SECRET=your_webhook_secret_here
```

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM_EMAIL=noreply@vie-publique.sn
```

**Note Gmail** : utiliser un mot de passe d'application.

### Configuration du webhook Bictorys

URL : `https://vie-publique.sn/api/donate/webhook`
Événements : `charge.success`, `charge.failed`, `charge.pending`

---

## Flux de paiement

1. **Utilisateur** : Accède à `/don/bictorys`
2. **Utilisateur** : Remplit le formulaire et accepte la charte
3. **Frontend** : Appelle `POST /api/donate/init-payment`
4. **Backend** : Crée une transaction Bictorys et retourne l'URL de paiement
5. **Frontend** : Redirige vers Bictorys
6. **Utilisateur** : Effectue le paiement sur Bictorys
7. **Bictorys** : Redirige vers `/don/success?gateway=bictorys` ou `/don/cancel?gateway=bictorys`
8. **Bictorys** : Envoie un webhook à `/api/donate/webhook`
9. **Backend** : Traite le webhook et envoie l'email de confirmation

---

## Pages et composants

### `/don/bictorys.vue`

- Formulaire de don avec Bictorys
- Montants prédéfinis : 1 000, 2 500, 5 000, 10 000, 25 000, 50 000 FCFA
- Champs : Nom, Email, Téléphone (optionnel), Montant
- Checkbox obligatoire pour accepter la charte
- Composable : `useBictorysDonation()`

### `/don/success.vue`

- Page de confirmation après paiement réussi
- Détecte la gateway via `?gateway=bictorys`

### `/don/cancel.vue`

- Page affichée si l'utilisateur annule
- Propose de réessayer via Bictorys

### Composable `useBictorysDonation()`

```typescript
const {
  isProcessing,      // État du traitement
  error,             // Message d'erreur
  initiateDonation,  // Fonction d'initialisation
  suggestedAmounts,  // Montants prédéfinis
  formatAmount,      // Formater en FCFA
} = useBictorysDonation()
```

---

## API Endpoints

### `POST /api/donate/init-payment`

Initialise un paiement Bictorys.

**Request Body :**
```json
{
  "amount": 5000,
  "name": "Prénom Nom",
  "email": "email@example.com",
  "phone": "+221XXXXXXXXX"
}
```

**Response :**
```json
{
  "success": true,
  "data": {
    "payment_url": "https://...",
    "transaction_id": "xxx",
    "amount": 5000,
    "currency": "XOF"
  }
}
```

### `POST /api/donate/webhook`

Webhook Bictorys pour les notifications de paiement.

---

## Emails de confirmation

Les emails sont envoyés automatiquement via **Nodemailer** (`server/utils/nodemailer.ts`) après un paiement réussi.

```typescript
await sendDonationConfirmationEmail({
  gateway: 'bictorys',
  transaction_id: 'TXN123456',
  amount: 5000,
  donor_name: 'CISSE410',
  donor_email: 'cisse410@vpsn.sn',
  donor_phone: '+221771234567',
  invoice_ref: 'VPSN-DON-123',
  created_at: new Date().toISOString(),
})
```

### TODO

Implémenter la vérification HMAC dans `server/api/donate/webhook.post.ts`.

---

## Support

- **Documentation Bictorys** : [https://docs.bictorys.com](https://docs.bictorys.com)
- **Documentation Nodemailer** : [https://nodemailer.com](https://nodemailer.com)
