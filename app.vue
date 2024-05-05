<script setup lang="ts">
const route = useRoute()

const links = [
  {
    label: 'Rapports publics',
    // icon: 'i-heroicons-document-chart-bar',
    to: '/',
  },
  {
    label: 'Personnes épinglées',
    // icon: 'i-heroicons-user',
    to: '/individuals-cited',
  },
  {
    label: 'Scandales financiers',
    // icon: 'i-heroicons-newspaper',
    to: '/financial-scandals',
  }
]
</script>

<template>
  <UContainer class="mt-2 px-0 sm:px-10 md:px-20 lg:px-40">

    <HeaderBrand />
    <UDivider />

    <UHorizontalNavigation :links="links"
      class="border-b border-gray-200 dark:border-gray-800 mx-auto mb-3 sticky top-0 z-50 justify-center">
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