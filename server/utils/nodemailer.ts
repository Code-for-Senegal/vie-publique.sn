/**
 * Utilitaire Nodemailer pour l'envoi d'emails
 * Configuration et fonctions pour envoyer des emails de confirmation de dons
 */
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

/**
 * Créer et configurer le transporteur Nodemailer
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter
  }

  const config = useRuntimeConfig()

  // Configuration du transporteur SMTP
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    secure: config.smtpSecure === 'true',
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  })

  return transporter
}

/**
 * Interface pour les données de don
 */
interface DonationEmailData {
  gateway: 'bictorys'
  transaction_id: string
  amount: number
  donor_name: string
  donor_email: string
  donor_phone?: string
  invoice_ref?: string
  created_at: string
}

/**
 * Formater un montant en FCFA
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Envoyer un email de confirmation de don
 */
export async function sendDonationConfirmationEmail(
  donationData: DonationEmailData
): Promise<boolean> {
  try {
    const config = useRuntimeConfig()
    const transport = getTransporter()

    const gatewayName = 'Bictorys'
    const formattedAmount = formatAmount(donationData.amount)
    const formattedDate = new Date(donationData.created_at).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    // Construire le contenu de l'email en HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de don - Vie Publique Sénégal</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #0000d3;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #0000d3;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0 0 0;
    }
    .success-icon {
      text-align: center;
      font-size: 60px;
      margin: 20px 0;
    }
    .message {
      background-color: #e6f3ff;
      border-left: 4px solid #0000d3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .details {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .details h2 {
      color: #0000d3;
      margin-top: 0;
      font-size: 18px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #16a34a;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #0000d3;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      color: #0000d3;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vie Publique Sénégal</h1>
      <p>Plateforme d'information publique transparente</p>
    </div>

    <div class="success-icon">✅</div>

    <h2 style="text-align: center; color: #16a34a;">Don reçu avec succès !</h2>

    <div class="message">
      <p>Cher(e) <strong>${donationData.donor_name}</strong>,</p>
      <p>
        Nous tenons à vous remercier chaleureusement pour votre généreuse contribution à
        Vie Publique Sénégal. Votre soutien nous permet de continuer à maintenir une plateforme
        d'information publique transparente et accessible à tous les Sénégalais.
      </p>
    </div>

    <div class="details">
      <h2>Détails de votre don</h2>

      <div class="detail-row">
        <span class="detail-label">Montant :</span>
        <span class="detail-value amount">${formattedAmount}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Référence :</span>
        <span class="detail-value">${donationData.transaction_id}</span>
      </div>

      ${donationData.invoice_ref ? `
      <div class="detail-row">
        <span class="detail-label">Numéro de facture :</span>
        <span class="detail-value">${donationData.invoice_ref}</span>
      </div>
      ` : ''}

      <div class="detail-row">
        <span class="detail-label">Méthode de paiement :</span>
        <span class="detail-value">${gatewayName}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Date :</span>
        <span class="detail-value">${formattedDate}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Email :</span>
        <span class="detail-value">${donationData.donor_email}</span>
      </div>

      ${donationData.donor_phone ? `
      <div class="detail-row">
        <span class="detail-label">Téléphone :</span>
        <span class="detail-value">${donationData.donor_phone}</span>
      </div>
      ` : ''}
    </div>

    <div style="text-align: center;">
      <a href="https://www.vie-publique.sn" class="button">Visiter Vie Publique Sénégal</a>
    </div>

    <div class="message" style="background-color: #fff3cd; border-left-color: #ffc107;">
      <p style="margin: 0;">
        <strong>Note :</strong> Conservez cet email comme preuve de votre transaction.
        Si vous avez des questions, n'hésitez pas à nous contacter à
        <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>.
      </p>
    </div>

    <div class="footer">
      <p>
        <strong>Vie Publique Sénégal</strong><br>
        Plateforme citoyenne indépendante<br>
        Dakar, Sénégal
      </p>
      <div class="social-links">
        <a href="https://x.com/ViePubliqueSN">Twitter</a> |
        <a href="https://www.facebook.com/ViePubliqueSenegal">Facebook</a> |
        <a href="https://www.linkedin.com/company/vie-publique-sn">LinkedIn</a> |
        <a href="https://www.whatsapp.com/channel/0029VawbhaFLikg1htAGXc2I">Chaîne WhatsApp</a> |
        <a href="https://www.youtube.com/@ViePubliqueSenegal">Youtube</a> |
        <a href="https://www.vie-publique.sn">Site Web</a>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Version texte brut pour les clients email qui ne supportent pas HTML
    const textContent = `
Confirmation de don - Vie Publique Sénégal

Cher(e) ${donationData.donor_name},

Nous tenons à vous remercier chaleureusement pour votre généreuse contribution à Vie Publique Sénégal.

DÉTAILS DE VOTRE DON
--------------------
Montant : ${formattedAmount}
Référence : ${donationData.transaction_id}
${donationData.invoice_ref ? `Numéro de facture : ${donationData.invoice_ref}\n` : ''}Méthode de paiement : ${gatewayName}
Date : ${formattedDate}
Email : ${donationData.donor_email}
${donationData.donor_phone ? `Téléphone : ${donationData.donor_phone}\n` : ''}

Conservez cet email comme preuve de votre transaction.

Pour toute question, contactez-nous à : contact@vie-publique.sn
Visitez notre site : https://www.vie-publique.sn

Merci pour votre soutien !

---
Vie Publique Sénégal - Plateforme d'information publique transparente
    `

    // Envoyer l'email
    const info = await transport.sendMail({
      from: `"Vie Publique Sénégal" <${config.smtpFromEmail}>`,
      to: donationData.donor_email,
      subject: `Merci pour votre don de ${formattedAmount} - Vie Publique Sénégal`,
      text: textContent,
      html: htmlContent,
    })

    console.log('Email de confirmation envoyé:', info.messageId)
    return true
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error)
    return false
  }
}
