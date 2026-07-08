# Système de Donation - Vie-Publique.sn

Documentation complète du système de donation avec deux méthodes de paiement : **Bictorys** et **Paydunya**.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Flux de paiement](#flux-de-paiement)
5. [Pages et composants](#pages-et-composants)
6. [API Endpoints](#api-endpoints)
7. [Emails de confirmation](#emails-de-confirmation)
8. [Tests](#tests)
9. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

Le système de donation permet aux utilisateurs de soutenir Vie-Publique.sn via deux moyens de paiement :

- **Bictorys** : Paiement par carte bancaire et Mobile Money
- **Paydunya** : Paiement via Orange Money, Wave, Free Money

### Caractéristiques principales

✅ Deux pages dédiées pour chaque méthode de paiement
✅ Formulaire avec montants prédéfinis et montant personnalisé
✅ Checkbox obligatoire d'acceptation de la charte des dons
✅ Envoi automatique d'email de confirmation via Nodemailer
✅ Pages de callback communes (succès/annulation)
✅ Webhooks pour traiter les notifications de paiement
✅ Intégration complète avec les menus de navigation

---

## Architecture

### Structure des fichiers

```
app/
├── pages/
│   └── don/
│       ├── bictorys.vue          # Page de don via Bictorys
│       ├── paydunya.vue          # Page de don via Paydunya
│       ├── success.vue           # Page de confirmation (succès)
│       └── cancel.vue            # Page d'annulation
├── composables/
│   ├── useDonate.ts              # Gestion de l'état (legacy)
│   ├── useBictorysDonation.ts   # Logique Bictorys
│   └── usePaydunyaDonation.ts   # Logique Paydunya
└── components/
    └── DonateButton.vue          # Bouton flotant (non utilisé)

server/
├── api/
│   └── donate/
│       ├── init-payment.post.ts              # Init Bictorys (legacy)
│       ├── webhook.post.ts                   # Webhook Bictorys
│       └── paydunya/
│           ├── init-payment.post.ts          # Init Paydunya
│           └── callback.post.ts              # Webhook Paydunya
└── utils/
    └── nodemailer.ts                         # Utilitaire d'envoi d'emails

content/
└── a-propos/
    └── charte-dons.md                        # Charte des dons
```

### Diagramme de flux

```
┌─────────────────────────────────────────────────────────────┐
│                   Menu de Navigation                         │
│  [Don avec Bictorys]  [Don avec Paydunya]                   │
└─────────────────┬───────────────────┬───────────────────────┘
                  │                   │
         ┌────────▼────────┐  ┌──────▼──────────┐
         │ /don/bictorys   │  │ /don/paydunya   │
         │ Formulaire      │  │ Formulaire      │
         │ + Checkbox      │  │ + Checkbox      │
         └────────┬────────┘  └──────┬──────────┘
                  │                   │
         ┌────────▼────────┐  ┌──────▼──────────┐
         │ API Init        │  │ API Init        │
         │ Bictorys        │  │ Paydunya        │
         └────────┬────────┘  └──────┬──────────┘
                  │                   │
         ┌────────▼────────┐  ┌──────▼──────────┐
         │ Passerelle      │  │ Passerelle      │
         │ Bictorys        │  │ Paydunya        │
         └────────┬────────┘  └──────┬──────────┘
                  │                   │
                  └──────┬────────────┘
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

### 1. Variables d'environnement

Copiez `.env.example` vers `.env` et configurez les variables suivantes :

#### Bictorys

```env
BICTORYS_API_KEY=test_public-VOTRE_CLE_ICI
BICTORYS_SECRET_KEY=test_secret-VOTRE_CLE_ICI
BICTORYS_API_URL=https://api.test.bictorys.com/pay/v1/charges
BICTORYS_WEBHOOK_SECRET=your_webhook_secret_here
```

#### Paydunya

```env
PAYDUNYA_MASTER_KEY=your_master_key_here
PAYDUNYA_PRIVATE_KEY=your_private_key_here
PAYDUNYA_TOKEN=your_token_here
PAYDUNYA_API_URL=https://app.paydunya.com/api/v1
# Pour le mode test: https://app.paydunya.com/sandbox-api/v1
```

#### Nodemailer (SMTP)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM_EMAIL=noreply@vie-publique.sn
```

**Note pour Gmail** : Utilisez un mot de passe d'application, pas votre mot de passe principal.

### 2. Configuration des webhooks

#### Bictorys Dashboard

URL : `https://vie-publique.sn/api/donate/webhook`
Événements : `charge.success`, `charge.failed`, `charge.pending`

#### Paydunya Dashboard

URL : `https://vie-publique.sn/api/donate/paydunya/callback`
Méthode : POST

---

## Flux de paiement

### Flux Bictorys

1. **Utilisateur** : Accède à `/don/bictorys`
2. **Utilisateur** : Remplit le formulaire et accepte la charte
3. **Frontend** : Appelle `POST /api/donate/init-payment`
4. **Backend** : Crée une transaction Bictorys
5. **Backend** : Retourne l'URL de paiement
6. **Frontend** : Redirige vers Bictorys
7. **Utilisateur** : Effectue le paiement sur Bictorys
8. **Bictorys** : Redirige vers `/don/success?gateway=bictorys` ou `/don/cancel?gateway=bictorys`
9. **Bictorys** : Envoie un webhook à `/api/donate/webhook`
10. **Backend** : Traite le webhook et envoie l'email de confirmation

### Flux Paydunya

1. **Utilisateur** : Accède à `/don/paydunya`
2. **Utilisateur** : Remplit le formulaire et accepte la charte
3. **Frontend** : Appelle `POST /api/donate/paydunya/init-payment`
4. **Backend** : Crée une invoice Paydunya
5. **Backend** : Retourne l'URL de paiement
6. **Frontend** : Redirige vers Paydunya
7. **Utilisateur** : Effectue le paiement sur Paydunya
8. **Paydunya** : Redirige vers `/don/success?gateway=paydunya` ou `/don/cancel?gateway=paydunya`
9. **Paydunya** : Envoie un webhook à `/api/donate/paydunya/callback`
10. **Backend** : Confirme le statut auprès de Paydunya et envoie l'email

---

## Pages et composants

### Pages de don

#### `/don/bictorys.vue`

- Formulaire de don avec Bictorys
- Montants prédéfinis : 1 000, 2 500, 5 000, 10 000, 25 000, 50 000 FCFA
- Champs : Nom, Email, Téléphone (optionnel), Montant
- Checkbox obligatoire pour accepter la charte
- Composable utilisé : `useBictorysDonation()`

#### `/don/paydunya.vue`

- Formulaire de don avec Paydunya
- Même structure que la page Bictorys
- Composable utilisé : `usePaydunyaDonation()`

### Pages de callback

#### `/don/success.vue`

- Page de confirmation après paiement réussi
- Affiche un message de remerciement
- Détecte la gateway via `?gateway=bictorys` ou `?gateway=paydunya`
- Liens vers l'accueil et la page À propos

#### `/don/cancel.vue`

- Page affichée si l'utilisateur annule le paiement
- Propose de réessayer avec la même méthode
- Boutons vers les deux méthodes de paiement

### Composables

#### `useBictorysDonation()`

```typescript
const {
  isProcessing,      // État du traitement
  error,             // Message d'erreur
  initiateDonation,  // Fonction d'initialisation
  suggestedAmounts,  // Montants prédéfinis
  formatAmount,      // Formater en FCFA
} = useBictorysDonation()
```

#### `usePaydunyaDonation()`

Même interface que `useBictorysDonation()`.

---

## API Endpoints

### Bictorys

#### `POST /api/donate/init-payment`

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

#### `POST /api/donate/webhook`

Webhook Bictorys pour les notifications de paiement.

---

### Paydunya

#### `POST /api/donate/paydunya/init-payment`

Initialise un paiement Paydunya.

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
    "token": "xxx",
    "invoice_ref": "VPSN-PAYDUNYA-xxx",
    "amount": 5000,
    "currency": "XOF"
  }
}
```

#### `POST /api/donate/paydunya/callback`

Webhook Paydunya pour les notifications de paiement.

---

## Emails de confirmation

Les emails sont envoyés automatiquement via **Nodemailer** après un paiement réussi.

### Fonction principale

`sendDonationConfirmationEmail()` dans `server/utils/nodemailer.ts`

### Contenu de l'email

- Logo et en-tête Vie-Publique.sn
- Message de remerciement personnalisé
- Détails de la transaction :
  - Montant
  - Référence
  - Méthode de paiement
  - Date
  - Email et téléphone du donateur
- Lien vers le site
- Version HTML et texte brut

### Exemple d'utilisation

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

---

### TODO : Vérification des signatures

Implémenter la vérification HMAC des webhooks dans :
- `server/api/donate/webhook.post.ts` (Bictorys)
- `server/api/donate/paydunya/callback.post.ts` (Paydunya)

---

## Support

- **Documentation Bictorys** : [https://docs.bictorys.com](https://docs.bictorys.com)
- **Documentation Paydunya** : [https://paydunya.com/developers/](https://paydunya.com/developers/)
- **Documentation Nodemailer** : [https://nodemailer.com](https://nodemailer.com)

Pour toute question sur l'implémentation, contactez l'équipe de développement.

---
