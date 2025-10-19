<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-12">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <!-- Icône de succès -->
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <UIcon name="i-heroicons-check-circle" class="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <!-- Titre -->
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Merci pour votre don !
        </h1>

        <!-- Message -->
        <p class="mb-6 text-gray-600 dark:text-gray-300">
          Votre contribution nous aide à maintenir Vie-Publique.sn accessible et transparent pour tous les Sénégalais.
        </p>

        <!-- Informations supplémentaires -->
        <div class="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Un email de confirmation vous a été envoyé avec les détails de votre transaction.
          </p>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col gap-3">
          <UButton
            to="/"
            color="primary"
            size="lg"
            block
            icon="i-heroicons-home"
          >
            Retour à l'accueil
          </UButton>

          <UButton
            to="/a-propos/qui-sommes-nous"
            color="gray"
            variant="ghost"
            size="lg"
            block
          >
            En savoir plus sur nous
          </UButton>
        </div>

        <!-- Réseaux sociaux -->
        <div class="mt-8 border-t pt-6 dark:border-gray-700">
          <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Suivez-nous sur les réseaux sociaux
          </p>
          <div class="flex justify-center">
            <HomeSocialNetworks />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Configuration SEO pour la page
useSeoMeta({
  title: 'Merci pour votre don - Vie-Publique.sn',
  description: 'Votre don a été reçu avec succès. Merci de soutenir l\'information publique au Sénégal.',
  robots: 'noindex, nofollow', // Pas d'indexation pour cette page
})

// Optionnel : Récupérer les paramètres de la transaction depuis l'URL
const route = useRoute()
const transactionId = route.query.transaction_id || route.query.reference
</script>
