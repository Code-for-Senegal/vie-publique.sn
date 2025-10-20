/**
 * Composable pour gérer les dons via Bictorys
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
    amount: number
    currency: string
  }
  error?: string
}

export const useBictorysDonation = () => {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initialiser un paiement de don via Bictorys
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

      // Appeler l'API backend pour initialiser le paiement
      const response = await $fetch<DonationResponse>('/api/donate/init-payment', {
        method: 'POST',
        body: donationData,
      })

      if (response.success && response.data?.payment_url) {
        // Rediriger vers la page de paiement Bictorys
        window.location.href = response.data.payment_url
        return response
      } else {
        throw new Error('Impossible d\'initialiser le paiement')
      }
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'

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
