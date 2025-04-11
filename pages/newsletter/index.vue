<script setup lang="ts">
/* SEO */
useHead({
  title: "Abonnez-vous à notre Newsletter Sénégal",
  meta: [
    {
      name: "description",
      content: "Newsletters informations publiques officielle Sénégal",
    },
  ],
});

const handleSuccess = () => {
  // Fermer le modal après un court délai pour que l'utilisateur puisse voir le message de succès
  setTimeout(() => {
    console.log(close);
  }, 2000);
};
</script>

<template>
  <div class="newsletter-page container mx-auto px-4 py-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Newsletter</h1>
    </div>
    <p class="mb-4 text-center text-sm text-gray-500">
      Restez informé de nos dernières informations publiées.
    </p>
    <NewsletterForm />
  </div>
</template>

<style scoped>
.newsletter-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  margin-bottom: 20px;
}
</style>
