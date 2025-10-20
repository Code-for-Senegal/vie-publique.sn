/**
 * API endpoint pour initialiser un paiement de don via Paydunya
 * Documentation Paydunya: https://paydunya.com/developers/
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

    // Générer une référence unique pour ce paiement
    const invoiceRef = `VPSN-PAYDUNYA-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // URLs de callback
    const siteUrl = config.public.siteUrl || 'http://localhost:3000'
    const callbackUrl = `${siteUrl}/api/donate/paydunya/callback`
    const returnUrl = `${siteUrl}/don/success?gateway=paydunya`
    const cancelUrl = `${siteUrl}/don/cancel?gateway=paydunya`

    // Construire le payload selon l'API Paydunya
    const paydunyaPayload = {
      invoice: {
        total_amount: Math.round(amount),
        description: `Don à Vie Publique Sénégal - ${name}`,
      },
      store: {
        name: 'Vie Publique Sénégal',
        tagline: 'Plateforme d\'information publique transparente',
      },
      custom_data: {
        donor_name: name,
        donor_email: email,
        donor_phone: phone || '',
        invoice_ref: invoiceRef,
      },
      actions: {
        callback_url: callbackUrl,
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }

    console.log('Initialisation du paiement Paydunya:', {
      amount: paydunyaPayload.invoice.total_amount,
      reference: invoiceRef,
      apiUrl: config.paydunyaApiUrl,
    })

    // Appeler l'API Paydunya pour créer l'invoice
    const response: any = await $fetch(`${config.paydunyaApiUrl}/checkout-invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': config.paydunyaMasterKey,
        'PAYDUNYA-PRIVATE-KEY': config.paydunyaPrivateKey,
        'PAYDUNYA-TOKEN': config.paydunyaToken,
      },
      body: paydunyaPayload,
    })

    // Paydunya retourne: { response_code, response_text, token }
    // En sandbox Paydunya, l'URL de paiement est dans response_text !
    const responseCode = response.response_code || response.code

    // L'URL peut être dans response_text (sandbox) ou response_url (production)
    const paymentUrl = response.response_text || response.response_url || response.url || response.payment_url

    if (responseCode === '00' || responseCode === '0' || responseCode === 0) {
      // Vérifier que l'URL de paiement existe
      if (!paymentUrl) {
        console.error('❌ URL de paiement manquante dans la réponse Paydunya')
        console.error('Réponse complète:', response)
        throw new Error('URL de paiement manquante dans la réponse de Paydunya')
      }

      // Vérifier que c'est bien une URL valide
      if (!paymentUrl.startsWith('http')) {
        console.error('❌ URL de paiement invalide:', paymentUrl)
        throw new Error(`URL de paiement invalide: ${paymentUrl}`)
      }

      console.log('✅ Paiement Paydunya initialisé avec succès:', {
        payment_url: paymentUrl,
        token: response.token,
      })

      return {
        success: true,
        data: {
          payment_url: paymentUrl,
          transaction_id: response.token,
          token: response.token,
          invoice_ref: invoiceRef,
          amount,
          currency: 'XOF',
        },
      }
    } else {
      const errorMessage = response.response_text || response.message || 'Erreur lors de l\'initialisation du paiement'
      console.error('❌ Erreur Paydunya:', errorMessage, 'Code:', responseCode)
      throw new Error(errorMessage)
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de l\'initialisation du paiement',
      data: error.data || null,
    })
  }
})
