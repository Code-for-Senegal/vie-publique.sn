<script setup lang="ts">

const isOpen = ref(false)

const links = [{
  label: 'Accueil',
  icon: 'i-heroicons-home',
  to: '/',
}, {
  label: "Rapports",
  description: "Cours des Comptes, OFNAC, IGE, CENTIF, ARMP, IGF",
  photo: '/unknown_member.webp',
  icon: 'i-heroicons-document-text',
  to: '/rapport-senegal',
},
{
  label: 'JO',
  description: 'Textes législatifs, Lois, Décrets, Arrêtés',
  photo: '/unknown_member.webp',
  icon: 'i-heroicons-newspaper',
  to: '/journal-officiel-senegal',
},
{
  label: 'Codes',
  description: 'Constitution, Code de la famille, etc',
  photo: '/unknown_member.webp',
  icon: 'i-heroicons-clipboard-document-list',
  to: '/code-senegal',
},
{
  label: 'Nominations',
  description: 'Annuaire des nominations du président',
  photo: '/unknown_member.webp',
  icon: 'i-heroicons-identification',
  to: '/nomination-senegal',
},
{
  label: "Sites Web",
  description: 'Annuaire des sites internet publics',
  photo: '/unknown_member.webp',
  icon: 'i-heroicons-computer-desktop',
  to: '/annuaire-sites-publics-senegal',
},

]

const aboutUslinks = [
  {
    label: 'À Propos',
    to: '/about/us',
    icon: 'i-heroicons-information-circle',
  },
  {
    label: 'Newsletter',
    description: 'Abonnez vous à notre newsletter',
    photo: '/unknown_member.webp',
    icon: 'i-heroicons-envelope',
    to: '/newsletter',
  },
  {
    label: 'Quiz',
    description: 'Jeux QCM sur les institutions publiques',
    photo: '/unknown_member.webp',
    icon: 'i-heroicons-puzzle-piece',
    to: '/quiz',
  }
]

// const betalinks = [
//   {
//     label: 'x',
//     to: '/x'
//   }
// ]

</script>

<template>
  <UContainer class="mt-2 px-0 sm:px-10 md:px-14 lg:px-28 xl:px-40">

    <div class=" top-header flex justify-between items-center top-0 z-50 sticky opacity-100">
      <!-- HeaderBrand à gauche -->
      <AppHeader />

      <!-- Navigation horizontale pour les écrans plus larges -->
      <UHorizontalNavigation :links="links" class="hidden md:flex items-center w-auto">
      </UHorizontalNavigation>

      <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
      <UButton class="md:hidden" @click="isOpen = true" color="gray" variant="link" size="xl"
        icon="i-heroicons-bars-3" />
    </div>

    <!-- Navigation verticale pour mobiles (toggle visibility with Tailwind CSS) -->
    <USlideover v-model="isOpen">

      <div class="p-4 flex-1">

        <UButton color="gray" variant="ghost" size="xl" icon="i-heroicons-x-mark-20-solid"
          class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="isOpen = false" />
        <div class="h-full">
          <AppHeader />

          <!-- <UCard v-for="link in links" :key="link.to" class="cursor-pointer custom-shadow mb-2" @click="isOpen = false">
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
          <UDivider />
          <UCard v-for="link in betalinks" :key="link.to" class="hidden cursor-pointer custom-shadow mb-2"
            @click="isOpen = false">
            <ULink :to="link.to" class="flex flex-row gap-2">
              {{ link.label }}
            </ULink>
          </UCard> -->

          <UVerticalNavigation :links="links" @click="isOpen = false" :ui="{ size: 'text-md' }" class="vertical-nav"/>
          <UDivider />
          <UVerticalNavigation :links="aboutUslinks" @click="isOpen = false" :ui="{ size: 'text-md' }" class="vertical-nav"/>
        </div>

      </div>
    </USlideover>

    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <AppFooter />

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

  /* font-size: 0.75rem; */

}

.vertical-nav ul li a {
  margin: 0.5rem;
  padding-left: 1rem !important;
   box-shadow: 0 2px 4px #0000001a;
  line-height: 2rem;
}
</style>