<script setup lang="ts">

const isOpen = ref(false)

const links = [
  {
    label: 'Rapports',
    to: '/reports',
  },
  {
    label: 'Nominations',
    to: '/nomination-senegal',
  },
  {
    label: 'Site web',
    to: '/annuaire-sites-publics-senegal',
  },
  {
    label: 'À Propos',
    to: '/about/us',
  }
]

</script>

<template>
  <UContainer class="mt-2 px-0 sm:px-10 md:px-20 lg:px-40">

    <!-- Conteneur principal avec flexbox, HeaderBrand à gauche, Bouton Burger pour mobiles à droite-->
    <div class="flex justify-between items-center pb-2">
      <HeaderBrand />
      <UButton class="sm:hidden" @click="isOpen = true" color="gray" variant="link" size="xl"
        icon="i-heroicons-bars-3" />
    </div>

    <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
    <USlideover v-model="isOpen">

      <div class="p-4 flex-1">

        <UButton color="gray" variant="ghost" size="xl" icon="i-heroicons-x-mark-20-solid"
          class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="isOpen = false" />
        <div class="h-full">
          <HeaderBrand />
          <UCard v-for="link in links" :key="link.to" class="cursor-pointer shadow-lg mb-2" @click="isOpen = false">
            <ULink :to="link.to" class="flex flex-row gap-2">
              {{ link.label }}
            </ULink>
            <!-- <UDivider /> -->
          </UCard>
        </div>

      </div>
    </USlideover>

    <UDivider />

    <!-- Navigation horizontale pour les écrans plus larges -->
    <UHorizontalNavigation :links="links"
      class="hidden sm:flex border-b border-gray-200 dark:border-gray-800 mx-auto top-0 z-50 sm:justify-center">
      <template #default="{ link }">
        <span class="group-hover:text-primary relative">{{ link.label }}</span>
      </template>
    </UHorizontalNavigation>


    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Footer />

  </UContainer>
</template>

<style scoped></style>