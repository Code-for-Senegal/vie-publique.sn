/**
 * Webhook endpoint pour recevoir les notifications de paiement de Bictorys
 * Ce endpoint sera appelé par Bictorys lorsqu'un paiement est complété
 */

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    // Vérification de la signature du webhook (sécurité)
    const signature = getHeader(event, 'x-bictorys-signature') || ''
    const webhookSecret = config.bictorysWebhookSecret

    // TODO: Implémenter la vérification de signature selon la documentation Bictorys
    // Exemple de vérification HMAC (à adapter selon Bictorys)
    // const isValid = verifyBictorysSignature(body, signature, webhookSecret)
    // if (!isValid) {
    //   throw createError({
    //     statusCode: 401,
    //     message: 'Signature du webhook invalide',
    //   })
    // }

    // Logger l'événement pour debug
    console.log('Webhook Bictorys reçu:', {
      event_type: body.event || body.type,
      transaction_id: body.data?.reference || body.reference,
      status: body.data?.status || body.status,
      timestamp: new Date().toISOString(),
    })

    // Traiter différents types d'événements
    const eventType = body.event || body.type
    const transactionData = body.data || body

    switch (eventType) {
      case 'charge.success':
      case 'payment.success':
        // Paiement réussi
        await handleSuccessfulPayment(transactionData)
        break

      case 'charge.failed':
      case 'payment.failed':
        // Paiement échoué
        await handleFailedPayment(transactionData)
        break

      case 'charge.pending':
      case 'payment.pending':
        // Paiement en attente
        await handlePendingPayment(transactionData)
        break

      default:
        console.warn(`Type d'événement non géré: ${eventType}`)
    }

    // Retourner une réponse 200 pour confirmer la réception du webhook
    return {
      success: true,
      message: 'Webhook traité avec succès',
    }
  } catch (error: any) {
    console.error('Erreur lors du traitement du webhook Bictorys:', error)

    // Même en cas d'erreur, retourner 200 pour éviter que Bictorys ne retente
    // On log l'erreur pour investigation
    return {
      success: false,
      message: error.message,
    }
  }
})

/**
 * Gérer un paiement réussi
 */
async function handleSuccessfulPayment(data: any) {
  console.log('💰 Paiement réussi:', {
    reference: data.reference,
    amount: data.amount,
    email: data.customer?.email,
  })

  // TODO: Enregistrer le don dans la base de données
  // - Sauvegarder dans une table donations
  // - Mettre à jour les statistiques de dons
  // - Émettre un reçu fiscal si applicable

  // Envoyer un email de remerciement au donateur
  try {
    await sendDonationConfirmationEmail({
      gateway: 'bictorys',
      transaction_id: data.reference || data.transaction_id,
      amount: data.amount,
      donor_name: data.customer?.name || data.customerObject?.name || 'Donateur',
      donor_email: data.customer?.email || data.customerObject?.email,
      donor_phone: data.customer?.phone || data.customerObject?.phone,
      invoice_ref: data.merchantReference || data.reference,
      created_at: new Date().toISOString(),
    })
    console.log('✉️ Email de confirmation envoyé avec succès')
  } catch (emailError) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
    // Ne pas faire échouer le webhook si l'email échoue
  }
}

/**
 * Gérer un paiement échoué
 */
async function handleFailedPayment(data: any) {
  console.log('❌ Paiement échoué:', {
    reference: data.reference,
    reason: data.failure_reason || data.error_message,
  })

  // TODO: Logger l'échec pour analyse
}

/**
 * Gérer un paiement en attente
 */
async function handlePendingPayment(data: any) {
  console.log('⏳ Paiement en attente:', {
    reference: data.reference,
  })

  // TODO: Mettre à jour le statut si nécessaire
}
