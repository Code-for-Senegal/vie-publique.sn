<script setup lang="ts">
/* SEO */
useHead({
  title: "Contact",
  meta: [
    {
      name: "description",
      content: "Contactez-nous via email ou sur nos réseaux sociaux.",
    },
  ],
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center px-4 pb-16 sm:px-8">
    <AppBreadcrumb
      :items="[
        { label: 'Contact' },
      ]"
    />

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center dark:text-white">Contactez-nous</h1>
    </div>

    <div class="w-full max-w-4xl text-center">
      <div class="mb-4">
        <h2 class="text-gray-500 sm:text-xl">
          Vous souhaitez nous transmettre des informations, nous faire des
          suggestions, nous signalez des erreur ou nous soumettre une
          proposition de partenariat, envoyez nous un Email à l'adresse mail
          suivante
        </h2>
        <p class="py-8 text-xl text-blue-600 underline hover:text-blue-800">
          <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
        </p>
      </div>

      <div class="mb-4 hidden">
        <h2 class="text-md text-gray-500">Linkedin</h2>
        <a
          href="https://linkedin.com/in/malicktech/"
          target="_blank"
          rel="noopener"
          class="space-x-2 text-blue-600 hover:text-blue-800"
        >
          <span>@malicktech</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
