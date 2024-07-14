<script setup lang="ts">

const isOpen = ref(false)

const links = [{
  label: 'Accueil',
  to: '/',
}, {
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
  label: 'Quiz',
  to: '/Quiz',
}
]

const aboutUslinks = [
  {
    label: 'À Propos',
    to: '/about/us',
  }
]


</script>

<template>
  <UContainer class="mt-2 px-0 sm:px-10 md:px-20 lg:px-40">

    <!-- Conteneur principal avec flexbox, HeaderBrand à gauche, Bouton Burger pour mobiles à droite-->
    <div class=" top-header flex justify-between items-center top-0 z-50 sticky opacity-100">
      <HeaderBrand />

      <!-- Navigation horizontale pour les écrans plus larges -->
      <UHorizontalNavigation :links="links" class="hidden sm:flex items-center w-auto">
      </UHorizontalNavigation>

      <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
      <UButton class="sm:hidden" @click="isOpen = true" color="gray" variant="link" size="xl"
        icon="i-heroicons-bars-3" />
    </div>

    <!-- Navigation verticale pour mobiles (toggle visibility with Tailwind CSS) -->
    <USlideover v-model="isOpen">

      <div class="p-4 flex-1">

        <UButton color="gray" variant="ghost" size="xl" icon="i-heroicons-x-mark-20-solid"
          class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="isOpen = false" />
        <div class="h-full">
          <HeaderBrand />
          <UCard v-for="link in links" :key="link.to" class="cursor-pointer custom-shadow mb-2" @click="isOpen = false">
            <ULink :to="link.to" class="flex flex-row gap-2 uppercase">
              {{ link.label }}
            </ULink>
          </UCard>
          <UDivider />
          <UCard v-for="link in aboutUslinks" :key="link.to" class="cursor-pointer custom-shadow mb-2"
            @click="isOpen = false">
            <ULink :to="link.to" class="flex flex-row gap-2">
              {{ link.label }}
            </ULink>
          </UCard>
          <!-- <UVerticalNavigation :links="links" @click="isOpen = false" class="test" /> -->
        </div>

      </div>
    </USlideover>

    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Footer />

  </UContainer>
</template>

<style>
.top-header {
  background-color: #f9f9f9;
  /* background-color: #f2f2f2; */
  /* box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05); */
  box-shadow: 0 2px 6px rgba(0, 0, 0, .1);
}

nav ul li a span {
  text-transform: uppercase;
  font-family: "Quicksand", sans-serif;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.004);
}
</style>