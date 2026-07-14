/**
 * API endpoint pour initialiser un paiement de don via Bictorys
 */
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    // Validation des données
    const { amount, email, name, phone } = body;

    if (!amount || amount <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Le montant du don doit être supérieur à 0',
      });
    }

    if (!email || !name) {
      throw createError({
        statusCode: 400,
        message: 'Email et nom sont requis',
      });
    }

    // Générer des références uniques pour ce paiement
    const paymentReference = `VPSN-DON-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const merchantReference = crypto.randomUUID();

    const successRedirectUrl = 'https://client.co/redirect_url';
    const errorRedirectUrl = 'https://client.co/redirect_url';

    const bictorysPayload = {
      amount: Math.round(amount),
      currency: 'XOF',
      paymentReference,
      merchantReference,
      successRedirectUrl: successRedirectUrl,
      errorRedirectUrl: errorRedirectUrl,
      customerObject: {
        name,
        email,
        phone: phone || '',
        city: 'Dakar',
        country: 'SN',
        locale: 'fr-FR',
      },
    };

    // Appeler l'API Bictorys pour initialiser le paiement
    const response: any = await $fetch(`${config.bictorysApiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.bictorysApiKey,
      },
      body: bictorysPayload,
    });

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
    };
  } catch (error: any) {
    // Erreurs de validation ci-dessus (400) : messages destinés à l'utilisateur, on les relaie
    if (error.statusCode === 400) {
      throw error;
    }

    // Échec Bictorys ou autre : détails en logs + Sentry, message générique au client (SEC-9)
    reportServerError(error, 'api/donate/init-payment', {
      statusCode: error.statusCode || error.status,
      data: error.data,
    });
    throw createError({
      statusCode: 500,
      message: "Erreur lors de l'initialisation du paiement",
    });
  }
});
