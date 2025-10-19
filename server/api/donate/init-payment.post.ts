/**
 * API endpoint pour initialiser un paiement de don via Bictorys
 */
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    // Validation des données
    const { amount, email, name, phone } = body

    if (!amount || amount <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Le montant du don doit être supérieur à 0',
      })
    }

    if (!email || !name) {
      throw createError({
        statusCode: 400,
        message: 'Email et nom sont requis',
      })
    }

    // Générer des références uniques pour ce paiement
    const paymentReference = `VPS-DON-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const merchantReference = crypto.randomUUID()


    const bictorysPayload = {
      amount: Math.round(amount),
      currency: 'XOF',
      paymentReference,
      merchantReference,
      successRedirectUrl: 'https://client.co/redirect_url',
      errorRedirectUrl: 'https://client.co/redirect_url',
      customerObject: {
        name,
        email,
        phone: phone || '',
        city: 'Dakar',
        country: 'SN',
        locale: 'fr-FR',
      },
      allowUpdateCustomer: false,
    }

    console.log('Initialisation du paiement Bictorys:', {
      amount: bictorysPayload.amount,
      reference: paymentReference,
      apiUrl: config.bictorysApiUrl,
      apiKey: config.bictorysApiKey ? `${config.bictorysApiKey.substring(0, 20)}...` : 'NON DEFINIE',
    })

    console.log('Payload complet:', JSON.stringify(bictorysPayload, null, 2))

    // Appeler l'API Bictorys pour initialiser le paiement
    const response: any = await $fetch(`${config.bictorysApiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.bictorysApiKey,
      },
      body: bictorysPayload,
    })

    console.log('Réponse Bictorys:', response)

    // Retourner l'URL de paiement et les détails de la transaction
    // Bictorys retourne: { type, link, chargeId, opToken }
    return {
      success: true,
      data: {
        payment_url: response.link || response.paymentUrl || response.data?.paymentUrl,
        transaction_id: response.chargeId || response.transactionId || response.data?.transactionId,
        op_token: response.opToken,
        payment_reference: paymentReference,
        merchant_reference: merchantReference,
        amount,
        currency: 'XOF',
      },
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'initialisation du paiement Bictorys:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de l\'initialisation du paiement',
      data: error.data || null,
    })
  }
})
