<template>
  <div class="min-h-screen bg-white py-8 dark:bg-gray-900">
    <UContainer>
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <!-- Bouton retour -->
        <div class="mb-6">
          <UButton
            to="/don/bictorys"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            size="sm"
          >
            Retour
          </UButton>
        </div>

        <!-- En-tête -->
        <div class="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
          <h1 class="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
            Charte des Dons
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Vie-Publique.sn - Plateforme citoyenne indépendante
          </p>
          <div class="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Dernière mise à jour : Janvier 2025</span>
            <span>•</span>
            <span>Version 1.0</span>
          </div>
        </div>

        <!-- Contenu de la charte avec ContentDoc -->
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <ContentDoc path="/a-propos/charte-dons" />
        </div>

        <!-- Actions en bas -->
        <div class="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div class="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <UButton
              to="/don/bictorys"
              color="primary"
              size="lg"
              icon="i-heroicons-heart"
            >
              Faire un don via Bictorys
            </UButton>
            <UButton
              to="/don/paydunya"
              color="primary"
              variant="outline"
              size="lg"
              icon="i-heroicons-heart"
            >
              Faire un don via Paydunya
            </UButton>
          </div>

          <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Des questions ? Contactez-nous à
            <a
              href="mailto:contact@vie-publique.sn"
              class="font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              contact@vie-publique.sn
            </a>
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// Meta tags SEO
useSeoMeta({
  title: 'Charte des Dons - Vie-Publique.sn',
  description:
    'Découvrez notre charte des dons et comment nous utilisons vos contributions pour maintenir une plateforme d\'information publique transparente au Sénégal.',
  ogTitle: 'Charte des Dons - Vie-Publique.sn',
  ogDescription:
    'Transparence et engagement : comment vos dons soutiennent l\'information publique au Sénégal',
})
</script>

<style scoped>
/* Style personnalisé pour le contenu markdown en mode dark */
:deep(.prose) {
  @apply text-gray-900 dark:text-gray-100;
}

:deep(.prose h2) {
  @apply text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 mt-8;
}

:deep(.prose h3) {
  @apply text-gray-900 dark:text-white mt-6 mb-3;
}

:deep(.prose p) {
  @apply text-gray-700 dark:text-gray-300;
}

:deep(.prose a) {
  @apply text-primary-600 dark:text-primary-400 hover:underline;
}

:deep(.prose ul) {
  @apply text-gray-700 dark:text-gray-300;
}

:deep(.prose li) {
  @apply mb-2;
}

:deep(.prose strong) {
  @apply text-gray-900 dark:text-white;
}

:deep(.prose code) {
  @apply bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-2 py-1 rounded;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-primary-500 dark:border-primary-400 pl-4 italic text-gray-700 dark:text-gray-300;
}

:deep(.prose hr) {
  @apply border-gray-200 dark:border-gray-700;
}
</style>
