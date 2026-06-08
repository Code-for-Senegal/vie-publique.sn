<template>
  <div>
    <!-- Bouton flotant de don -->
    <ClientOnly>
      <UButton
        icon="i-heroicons-heart"
        size="lg"
        color="yellow"
        variant="solid"
        :ui="{
          rounded: 'rounded-full',
        }"
        class="donate-button shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        aria-label="Faire un don"
        @click="openDonateModal"
      >
        <span class="hidden md:inline">Faire un don</span>
      </UButton>
    </ClientOnly>

    <!-- Modal de don avec formulaire Bictorys -->
    <UModal v-model="isDonateModalOpen" :ui="{ width: 'sm:max-w-lg' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold">Soutenez Vie-Publique.sn</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="closeDonateModal"
            />
          </div>
        </template>

        <div class="space-y-5">
          <p class="text-gray-600 dark:text-gray-300">
            Votre soutien nous aide à maintenir une plateforme d'information publique
            transparente et accessible à tous les Sénégalais.
          </p>

          <!-- Formulaire de don -->
          <form class="space-y-4" @submit.prevent="handleDonation">
            <!-- Sélection du montant -->
            <div>
              <label class="mb-2 block text-sm font-medium">
                Choisissez un montant
              </label>
              <div class="grid grid-cols-3 gap-2">
                <UButton
                  v-for="suggested in suggestedAmounts"
                  :key="suggested.value"
                  :variant="selectedAmount === suggested.value ? 'solid' : 'outline'"
                  :color="selectedAmount === suggested.value ? 'primary' : 'gray'"
                  size="sm"
                  type="button"
                  @click="selectedAmount = suggested.value"
                >
                  {{ suggested.label }}
                </UButton>
              </div>
            </div>

            <!-- Montant personnalisé -->
            <UFormGroup label="Ou entrez un montant personnalisé (FCFA)">
              <UInput
                v-model.number="customAmount"
                type="number"
                placeholder="Montant en FCFA"
                :min="100"
                icon="i-heroicons-currency-dollar"
              />
            </UFormGroup>

            <!-- Informations du donateur -->
            <UFormGroup label="Nom complet" required>
              <UInput
                v-model="donorName"
                placeholder="Votre nom"
                icon="i-heroicons-user"
                required
              />
            </UFormGroup>

            <UFormGroup label="Email" required>
              <UInput
                v-model="donorEmail"
                type="email"
                placeholder="votre@email.com"
                icon="i-heroicons-envelope"
                required
              />
            </UFormGroup>

            <UFormGroup label="Téléphone (optionnel)">
              <UInput
                v-model="donorPhone"
                type="tel"
                placeholder="+221 XX XXX XX XX"
                icon="i-heroicons-phone"
              />
            </UFormGroup>

            <!-- Message d'erreur -->
            <UAlert
              v-if="error"
              color="red"
              variant="soft"
              :title="error"
              :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
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
                <span class="text-lg font-bold text-green-900 dark:text-green-100">
                  {{ formatAmount(finalAmount) }}
                </span>
              </div>
            </div>

            <!-- Bouton de soumission -->
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              :loading="isProcessing"
              :disabled="!canSubmit"
              icon="i-heroicons-credit-card"
            >
              {{ isProcessing ? 'Redirection...' : 'Procéder au paiement' }}
            </UButton>

            <p class="text-center text-xs text-gray-500">
              Paiement sécurisé via Bictorys
            </p>
          </form>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { isDonateModalOpen, openDonateModal, closeDonateModal } = useDonate()
const {
  isProcessing,
  error,
  initiateDonation,
  suggestedAmounts,
  formatAmount,
} = useBictorysDonation()

// État du formulaire
const selectedAmount = ref<number>(0)
const customAmount = ref<number | null>(null)
const donorName = ref('')
const donorEmail = ref('')
const donorPhone = ref('')

// Montant final (montant sélectionné ou personnalisé)
const finalAmount = computed(() => {
  return customAmount.value || selectedAmount.value
})

// Vérifier si le formulaire peut être soumis
const canSubmit = computed(() => {
  return (
    finalAmount.value > 0 &&
    donorName.value.trim() !== '' &&
    donorEmail.value.trim() !== '' &&
    !isProcessing.value
  )
})

// Gérer la soumission du formulaire
const handleDonation = async () => {
  if (!canSubmit.value) return

  const success = await initiateDonation({
    amount: finalAmount.value,
    name: donorName.value,
    email: donorEmail.value,
    phone: donorPhone.value,
  })
}

// Réinitialiser le formulaire quand la modal se ferme
watch(isDonateModalOpen, (isOpen) => {
  if (!isOpen) {
    selectedAmount.value = 0
    customAmount.value = null
    donorName.value = ''
    donorEmail.value = ''
    donorPhone.value = ''
    error.value = null
  }
})
</script>

<style scoped>
.donate-button {
  position: fixed;
  z-index: 40;

  /* Position pour desktop : milieu-droite */
  @media (min-width: 1024px) {
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Position pour mobile : haut-droite, juste en dessous du header */
  @media (max-width: 1023px) {
    right: 1rem;
    top: 5rem;
  }
}

/* Animation au hover */
.donate-button:hover {
  animation: pulse-heart 0.6s ease-in-out;
}

@keyframes pulse-heart {
  0%,
  100% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) scale(1.1);
  }
}

/* Ajustement de l'animation pour mobile */
@media (max-width: 1023px) {
  @keyframes pulse-heart {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
}
</style>
