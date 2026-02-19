<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 pb-16 dark:bg-gray-900 sm:px-6 sm:py-12">
    <UContainer>
      <AppBreadcrumb
        :items="[
          { label: 'Don' }
        ]"
      />

      <div class="mx-auto w-full max-w-lg text-center">
        <!-- Icône d'annulation -->
        <div class="mb-6 flex justify-center">
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"
          >
            <UIcon
              name="i-heroicons-x-circle"
              class="h-16 w-16 text-orange-600 dark:text-orange-400"
            />
          </div>
        </div>

        <!-- Message d'annulation -->
        <UCard>
          <div class="space-y-6">
            <div>
              <h1 class="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                Don annulé
              </h1>
              <p class="text-lg text-gray-600 dark:text-gray-300">
                Votre paiement a été annulé ou n'a pas pu être complété.
              </p>
            </div>

            <!-- Message informatif -->
            <div
              class="rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20"
            >
              <p class="text-sm text-blue-800 dark:text-blue-200">
                Aucune transaction n'a été effectuée et aucun montant n'a été débité de
                votre compte. Vous pouvez réessayer à tout moment.
              </p>
            </div>

            <!-- Informations -->
            <div class="space-y-3 text-left">
              <div
                class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <UIcon
                  name="i-heroicons-question-mark-circle"
                  class="mt-0.5 h-5 w-5 text-gray-500 dark:text-gray-400"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Que s'est-il passé ?
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Vous avez peut-être annulé le paiement, ou une erreur technique est
                    survenue. Pas d'inquiétude, aucun frais n'a été appliqué.
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="mt-0.5 h-5 w-5 text-gray-500 dark:text-gray-400"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Réessayer votre don
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Vous pouvez effectuer un nouveau don en utilisant l'une de nos
                    méthodes de paiement disponibles.
                  </p>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex flex-col gap-3 pt-4">
              <UButton
                :to="retryUrl"
                size="lg"
                color="primary"
                variant="solid"
                icon="i-heroicons-heart"
                block
                class="w-full"
              >
                <span class="truncate">Réessayer le don</span>
              </UButton>
              <UButton
                to="/"
                size="lg"
                color="gray"
                variant="outline"
                icon="i-heroicons-home"
                block
                class="w-full"
              >
                <span class="truncate">Retour à l'accueil</span>
              </UButton>
            </div>

            <!-- Méthodes alternatives -->
            <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
              <p class="mb-3 text-center text-sm font-medium text-gray-900 dark:text-white">
                Choisir une autre méthode de paiement
              </p>
              <div class="flex flex-col gap-2">
                <UButton
                  to="/don/bictorys"
                  size="sm"
                  color="gray"
                  variant="outline"
                  icon="i-heroicons-credit-card"
                  block
                  class="w-full justify-center"
                >
                  <span class="truncate">Don via Bictorys</span>
                </UButton>
                <UButton
                  to="/don/paydunya"
                  size="sm"
                  color="gray"
                  variant="outline"
                  icon="i-heroicons-device-phone-mobile"
                  block
                  class="w-full justify-center"
                >
                  <span class="truncate">Don via Paydunya</span>
                </UButton>
              </div>
            </div>

            <!-- Contact -->
            <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Besoin d'aide ?
                <a
                  href="mailto:contact@vie-publique.sn"
                  class="font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  Contactez-nous
                </a>
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Récupérer la gateway depuis l'URL pour proposer de réessayer avec la même méthode
const gateway = computed(() => route.query.gateway as string)

const retryUrl = computed(() => {
  switch (gateway.value) {
    case 'bictorys':
      return '/don/bictorys'
    case 'paydunya':
      return '/don/paydunya'
    default:
      return '/don/bictorys'
  }
})

// Meta tags SEO
useSeoMeta({
  title: 'Don annulé - Vie Publique Sénégal',
  description: 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.',
  robots: 'noindex, nofollow', // Ne pas indexer cette page
})
</script>
