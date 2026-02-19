<template>
  <div class="min-h-screen bg-gray-50 py-12 pb-16 dark:bg-gray-900">
    <UContainer>
      <AppBreadcrumb
        :items="[
          { label: 'Don' }
        ]"
      />

      <div class="mx-auto max-w-2xl">
        <!-- En-tête -->
        <div class="mb-8 text-center">
          <UIcon
            name="i-heroicons-heart"
            class="mx-auto mb-4 h-16 w-16 text-red-500"
          />
          <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Soutenez Vie Publique Sénégal
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Paiement sécurisé via Paydunya
          </p>
        </div>

        <!-- Carte du formulaire -->
        <UCard>
          <div class="space-y-6">
            <!-- Message d'introduction -->
            <div
              class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20"
            >
              <p class="text-sm text-blue-800 dark:text-blue-200">
                Votre soutien nous aide à maintenir une plateforme d'information
                publique transparente et accessible à tous les Sénégalais. Merci pour
                votre générosité !
              </p>
            </div>

            <!-- Formulaire de don -->
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <!-- Sélection du montant -->
              <div>
                <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Choisissez un montant
                </label>
                <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <UButton
                    v-for="suggested in suggestedAmounts"
                    :key="suggested.value"
                    :variant="selectedAmount === suggested.value ? 'solid' : 'outline'"
                    :color="selectedAmount === suggested.value ? 'primary' : 'gray'"
                    size="lg"
                    @click="selectAmount(suggested.value)"
                    type="button"
                    class="h-16"
                  >
                    {{ suggested.label }}
                  </UButton>
                </div>
              </div>

              <!-- Montant personnalisé -->
              <UFormGroup
                label="Ou entrez un montant personnalisé"
                help="Montant minimum : 100 FCFA"
              >
                <UInput
                  v-model.number="customAmount"
                  type="number"
                  placeholder="Montant en FCFA"
                  :min="100"
                  size="lg"
                  icon="i-heroicons-currency-dollar"
                  @input="onCustomAmountChange"
                />
              </UFormGroup>

              <UDivider />

              <!-- Informations du donateur -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Vos informations
                </h3>

                <UFormGroup label="Nom complet" required>
                  <UInput
                    v-model="donorName"
                    placeholder="Prénom Nom"
                    size="lg"
                    icon="i-heroicons-user"
                    required
                  />
                </UFormGroup>

                <UFormGroup label="Email" required>
                  <UInput
                    v-model="donorEmail"
                    type="email"
                    placeholder="votre@email.com"
                    size="lg"
                    icon="i-heroicons-envelope"
                    required
                  />
                </UFormGroup>

                <UFormGroup label="Téléphone (optionnel)">
                  <UInput
                    v-model="donorPhone"
                    type="tel"
                    placeholder="+221 XX XXX XX XX"
                    size="lg"
                    icon="i-heroicons-phone"
                  />
                </UFormGroup>
              </div>

              <UDivider />

              <!-- Checkbox acceptation de la charte -->
              <UFormGroup required>
                <UCheckbox
                  v-model="acceptedCharter"
                  required
                  :ui="{ wrapper: 'items-start' }"
                >
                  <template #label>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      J'accepte la
                      <NuxtLink
                        to="/a-propos/charte-dons"
                        target="_blank"
                        class="font-medium text-blue-600 underline dark:text-blue-600"
                      >
                        Charte des dons
                      </NuxtLink>
                      de Vie Publique Sénégal <span class="text-red-500">*</span>
                    </span>
                  </template>
                </UCheckbox>
              </UFormGroup>

              <!-- Message d'erreur -->
              <UAlert
                v-if="error"
                color="red"
                variant="soft"
                :title="error"
                :close-button="{
                  icon: 'i-heroicons-x-mark-20-solid',
                  color: 'red',
                  variant: 'link',
                }"
                @close="error = null"
              />

              <!-- Résumé du don -->
              <div
                v-if="finalAmount > 0"
                class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-green-800 dark:text-green-200">
                    Montant du don :
                  </span>
                  <span class="text-2xl font-bold text-green-900 dark:text-green-100">
                    {{ formatAmount(finalAmount) }}
                  </span>
                </div>
              </div>

              <!-- Bouton de soumission -->
              <UButton
                type="submit"
                color="primary"
                size="xl"
                block
                :loading="isProcessing"
                :disabled="!canSubmit"
                icon="i-heroicons-credit-card"
              >
                {{ isProcessing ? 'Redirection vers Paydunya...' : 'Procéder au paiement' }}
              </UButton>

              <p class="text-center text-xs text-gray-500 dark:text-gray-400">
                Paiement sécurisé via Paydunya (Orange Money, Wave)
              </p>
            </form>
          </div>
        </UCard>

        <!-- Informations de sécurité -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-heroicons-shield-check" class="mr-1" />
            Vos données sont protégées et sécurisées
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const {
  isProcessing,
  error,
  initiateDonation,
  suggestedAmounts,
  formatAmount,
} = usePaydunyaDonation()

// Meta tags SEO
useSeoMeta({
  title: 'Faire un don via Paydunya - Vie Publique Sénégal',
  description:
    'Soutenez Vie Publique Sénégal en faisant un don sécurisé via Paydunya. Payez avec Orange Money, Wave ou Free Money.',
  ogTitle: 'Soutenez Vie Publique Sénégal',
  ogDescription: 'Faites un don pour soutenir la transparence de l\'information publique au Sénégal',
})

// État du formulaire
const selectedAmount = ref<number>(0)
const customAmount = ref<number | null>(null)
const donorName = ref('')
const donorEmail = ref('')
const donorPhone = ref('')
const acceptedCharter = ref(false)

// Sélectionner un montant prédéfini
const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  customAmount.value = null
}

// Gérer le changement de montant personnalisé
const onCustomAmountChange = () => {
  if (customAmount.value && customAmount.value > 0) {
    selectedAmount.value = 0
  }
}

// Montant final (montant sélectionné ou personnalisé)
const finalAmount = computed(() => {
  return customAmount.value || selectedAmount.value
})

// Vérifier si le formulaire peut être soumis
const canSubmit = computed(() => {
  return (
    finalAmount.value >= 100 &&
    donorName.value.trim() !== '' &&
    donorEmail.value.trim() !== '' &&
    acceptedCharter.value &&
    !isProcessing.value
  )
})

// Gérer la soumission du formulaire
const handleSubmit = async () => {
  if (!canSubmit.value) {
    if (!acceptedCharter.value) {
      error.value = 'Vous devez accepter la charte des dons pour continuer'
    }
    return
  }

  await initiateDonation({
    amount: finalAmount.value,
    name: donorName.value,
    email: donorEmail.value,
    phone: donorPhone.value,
  })
}
</script>
