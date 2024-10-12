<template>
  <div class="p-4">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Newsletter Section -->
      <UCard class="custom-shadow border-gray-300 md:border-r">
        <h2 class="mb-2 text-xl font-semibold text-gray-800">
          Abonnez-vous à notre Newsletter
        </h2>
        <!-- <p class="mb-4 text-sm text-gray-600">
        Suivez nos actualités et publications
      </p> -->
        <NuxtLink to="/newsletter" class="text-green-700 underline">
          <UButton color="gray" class="">S'abonner</UButton>
        </NuxtLink>
      </UCard>

      <!-- Social Media Section -->
      <UCard class="custom-shadow">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">
          Suivez-nous sur les réseaux sociaux
        </h2>
        <div class="flex space-x-4">
          <NuxtLink to="https://twitter.com/ViePubliqueSN">
            <a href="#" class="text-gray-600 hover:text-green-600">
              <UIcon name="i-simple-icons-x" class="h-6 w-6" />
            </a>
          </NuxtLink>
          <ULink to="https://www.linkedin.com/company/vie-publique-sn">
            <a href="#" class="text-gray-600 hover:text-green-600">
              <UIcon name="i-simple-icons-linkedin" class="h-6 w-6" />
            </a>
          </ULink>
          <a href="#" class="text-gray-600 hover:text-green-600">
            <UIcon name="i-simple-icons-youtube" class="h-6 w-6" />
          </a>
          <a href="#" class="text-gray-600 hover:text-green-600">
            <UIcon name="i-simple-icons-instagram" class="h-6 w-6" />
          </a>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// No reactive state or methods needed for this version
</script>
