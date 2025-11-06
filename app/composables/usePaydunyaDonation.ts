/**
 * Composable pour gérer les dons via Paydunya
 */

interface DonationData {
  amount: number
  email: string
  name: string
  phone?: string
}

interface DonationResponse {
  success: boolean
  data?: {
    payment_url: string
    transaction_id: string
    token: string
    amount: number
    currency: string
  }
  error?: string
}

export const usePaydunyaDonation = () => {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initialiser un paiement de don via Paydunya
   */
  const initiateDonation = async (donationData: DonationData): Promise<DonationResponse> => {
    isProcessing.value = true
    error.value = null

    try {
      // Validation basique
      if (!donationData.amount || donationData.amount <= 0) {
        throw new Error('Le montant du don doit être supérieur à 0')
      }

      if (!donationData.email || !donationData.name) {
        throw new Error('Email et nom sont requis')
      }

      // Appeler l'API backend pour initialiser le paiement Paydunya
      const response = await $fetch<DonationResponse>('/api/donate/paydunya/init-payment', {
        method: 'POST',
        body: donationData,
      })

      if (response.success && response.data?.payment_url) {
        // Rediriger vers la page de paiement Paydunya
        window.location.href = response.data.payment_url
        return response
      } else {
        throw new Error('Impossible d\'initialiser le paiement')
      }
    } catch (err: any) {
      // Gestion des erreurs de manière user-friendly
      if (err.statusCode === 404) {
        error.value = 'Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard.'
      } else if (err.statusCode === 500 || err.statusCode >= 500) {
        error.value = 'Une erreur serveur est survenue. Veuillez réessayer dans quelques instants.'
      } else if (err.statusCode === 400) {
        error.value = 'Les informations fournies sont invalides. Veuillez vérifier vos données.'
      } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        error.value = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
      } else if (err.message && !err.message.includes('POST') && !err.message.includes('GET') && !err.message.includes('api/')) {
        // Utiliser le message d'erreur s'il est user-friendly (ne contient pas de détails techniques)
        error.value = err.message
      } else {
        error.value = 'Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.'
      }

      return {
        success: false,
        error: error.value,
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Montants prédéfinis pour faciliter le don
   */
  const suggestedAmounts = [
    { label: '1 000 FCFA', value: 1000 },
    { label: '2 500 FCFA', value: 2500 },
    { label: '5 000 FCFA', value: 5000 },
    { label: '10 000 FCFA', value: 10000 },
    { label: '25 000 FCFA', value: 25000 },
    { label: '50 000 FCFA', value: 50000 },
  ]

  /**
   * Formater un montant en FCFA
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return {
    isProcessing,
    error,
    initiateDonation,
    suggestedAmounts,
    formatAmount,
  }
}
