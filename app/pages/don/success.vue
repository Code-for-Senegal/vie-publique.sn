<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 pb-16 dark:bg-gray-900 sm:px-6 sm:py-12">
    <UContainer>
      <AppBreadcrumb
        :items="[
          { label: 'Don' }
        ]"
      />

      <div class="mx-auto w-full max-w-lg text-center">
        <!-- Icône de succès -->
        <div class="mb-6 flex justify-center">
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <UIcon
              name="i-heroicons-check-circle"
              class="h-16 w-16 text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <!-- Message de succès -->
        <UCard>
          <div class="space-y-6">
            <div>
              <h1 class="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                Merci pour votre don !
              </h1>
              <p class="text-lg text-gray-600 dark:text-gray-300">
                Votre paiement a été effectué avec succès
                <span v-if="gatewayName"> via {{ gatewayName }}</span>.
              </p>
            </div>

            <!-- Message personnalisé -->
            <div
              class="rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20"
            >
              <p class="text-sm text-blue-800 dark:text-blue-200">
                Votre contribution nous aidera à maintenir Vie Publique Sénégal comme une
                plateforme d'information publique transparente et accessible à tous les
                Sénégalais. Nous vous en sommes infiniment reconnaissants.
              </p>
            </div>

            <!-- Informations -->
            <div class="space-y-3 text-left">
              <div
                class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <UIcon
                  name="i-heroicons-envelope"
                  class="mt-0.5 h-5 w-5 text-gray-500 dark:text-gray-400"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Email de confirmation
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Vous recevrez un reçu détaillé de votre don par email dans quelques
                    minutes.
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <UIcon
                  name="i-heroicons-shield-check"
                  class="mt-0.5 h-5 w-5 text-gray-500 dark:text-gray-400"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Transaction sécurisée
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Votre paiement a été traité de manière sécurisée.
                  </p>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex flex-col gap-3 pt-4">
              <UButton
                to="/"
                size="lg"
                color="primary"
                variant="solid"
                icon="i-heroicons-home"
                block
                class="w-full"
              >
                <span class="truncate">Retour à l'accueil</span>
              </UButton>
              <UButton
                to="/a-propos/qui-sommes-nous"
                size="lg"
                color="gray"
                variant="outline"
                icon="i-heroicons-information-circle"
                block
                class="w-full"
              >
                <span class="truncate">En savoir plus</span>
              </UButton>
            </div>

            <!-- Réseaux sociaux -->
            <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
              <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
                Suivez-nous pour rester informé de nos actualités
              </p>
              <div class="flex justify-center gap-3">
                <UButton
                  to="https://x.com/ViePubliqueSN"
                  target="_blank"
                  size="sm"
                  color="gray"
                  variant="ghost"
                  icon="i-simple-icons-twitter"
                  square
                />
                <UButton
                  to="https://www.facebook.com/ViePubliqueSenegal"
                  target="_blank"
                  size="sm"
                  color="gray"
                  variant="ghost"
                  icon="i-simple-icons-facebook"
                  square
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Récupérer la gateway depuis l'URL
const gateway = computed(() => route.query.gateway as string)

const gatewayName = computed(() => {
  switch (gateway.value) {
    case 'bictorys':
      return 'Bictorys'
    default:
      return ''
  }
})

// Meta tags SEO
useSeoMeta({
  title: 'Don effectué avec succès - Vie Publique Sénégal',
  description: 'Merci pour votre don ! Votre contribution nous aide à maintenir une plateforme transparente.',
  robots: 'noindex, nofollow', // Ne pas indexer cette page
})
</script>
