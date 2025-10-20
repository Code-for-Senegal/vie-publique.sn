/**
 * Webhook endpoint pour recevoir les notifications de paiement de Paydunya
 * Ce endpoint sera appelé par Paydunya lorsqu'un paiement est effectué
 * Documentation: https://paydunya.com/developers/
 */

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    console.log('Webhook Paydunya reçu:', {
      data: body,
      timestamp: new Date().toISOString(),
    })

    // Paydunya envoie généralement: { data: { token, status, ... } }
    const token = body.data?.token || body.token

    if (!token) {
      console.warn('Token manquant dans le callback Paydunya')
      return {
        success: false,
        message: 'Token manquant',
      }
    }

    // Vérifier le statut de la transaction auprès de Paydunya
    // Documentation: GET https://app.paydunya.com/api/v1/checkout-invoice/confirm/{token}
    const confirmResponse: any = await $fetch(
      `${config.paydunyaApiUrl}/checkout-invoice/confirm/${token}`,
      {
        method: 'GET',
        headers: {
          'PAYDUNYA_MASTER_KEY': config.paydunyaMasterKey,
          'PAYDUNYA_PRIVATE_KEY': config.paydunyaPrivateKey,
          'PAYDUNYA_TOKEN': config.paydunyaToken,
        },
      }
    )

    // Paydunya retourne: { response_code, status, custom_data, ... }
    if (confirmResponse.response_code === '00' || confirmResponse.status === 'completed') {
      await handleSuccessfulPayment({
        token,
        status: confirmResponse.status,
        amount: confirmResponse.invoice?.total_amount,
        custom_data: confirmResponse.custom_data,
        transaction_id: confirmResponse.transaction_id,
      })
    } else {
      await handleFailedPayment({
        token,
        status: confirmResponse.status,
        custom_data: confirmResponse.custom_data,
      })
    }

    // Retourner une réponse 200 pour confirmer la réception du webhook
    return {
      success: true,
      message: 'Webhook traité avec succès',
    }
  } catch (error: any) {
    console.error('Erreur lors du traitement du webhook Paydunya:', error)

    // Même en cas d'erreur, retourner 200 pour éviter que Paydunya ne retente
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

  // TODO: Enregistrer le don dans la base de données
  // - Sauvegarder dans une table donations
  // - Mettre à jour les statistiques de dons
  // - Émettre un reçu fiscal si applicable

  // Préparer les données du don
  const donationData = {
    gateway: 'paydunya' as const,
    transaction_id: data.transaction_id || data.token,
    amount: data.amount,
    donor_name: data.custom_data?.donor_name || 'Donateur',
    donor_email: data.custom_data?.donor_email,
    donor_phone: data.custom_data?.donor_phone,
    invoice_ref: data.custom_data?.invoice_ref,
    created_at: new Date().toISOString(),
  }

  // Envoyer un email de remerciement au donateur
  try {
    await sendDonationConfirmationEmail(donationData)
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
  console.log('❌ Paiement Paydunya échoué:', {
    token: data.token,
    status: data.status,
  })

  // TODO: Logger l'échec pour analyse
}
