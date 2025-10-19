<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-12">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <!-- Icône d'annulation -->
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
          <UIcon name="i-heroicons-x-circle" class="h-10 w-10 text-orange-600 dark:text-orange-400" />
        </div>

        <!-- Titre -->
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Paiement annulé
        </h1>

        <!-- Message -->
        <p class="mb-6 text-gray-600 dark:text-gray-300">
          Votre transaction a été annulée. Aucun montant n'a été débité de votre compte.
        </p>

        <!-- Informations supplémentaires -->
        <div class="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Vous pouvez réessayer à tout moment. Chaque contribution compte pour maintenir notre plateforme accessible à tous.
          </p>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col gap-3">
          <UButton
            @click="retryDonation"
            color="primary"
            size="lg"
            block
            icon="i-heroicons-arrow-path"
          >
            Réessayer le paiement
          </UButton>

          <UButton
            to="/"
            color="gray"
            variant="ghost"
            size="lg"
            block
            icon="i-heroicons-home"
          >
            Retour à l'accueil
          </UButton>
        </div>

        <!-- Message de soutien alternatif -->
        <div class="mt-8 border-t pt-6 dark:border-gray-700">
          <p class="mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Autres façons de nous soutenir
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Partagez notre plateforme avec vos proches ou suivez-nous sur les réseaux sociaux pour rester informé.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { openDonateModal } = useDonate()

// Configuration SEO pour la page
useSeoMeta({
  title: 'Paiement annulé - Vie-Publique.sn',
  description: 'Votre paiement a été annulé.',
  robots: 'noindex, nofollow', // Pas d'indexation pour cette page
})

// Fonction pour réouvrir la modal de don
const retryDonation = () => {
  navigateTo('/')
  setTimeout(() => {
    openDonateModal()
  }, 500)
}
</script>
