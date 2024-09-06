<script setup lang="ts">

const isOpen = ref(false)

const links = [{
  label: 'Accueil',
  //icon: 'i-heroicons-home',
  to: '/',
},
{
  label: 'Documents',
  description: 'Rapports, Journal Officiel, Codes, Nominations, Sites Web',
  to: '/ressources-senegal',
  withDropdown: true,
  children: [
    {
      label: "Rapports Publics",
      description: "Cours des Comptes, OFNAC, IGE, CENTIF, ARMP, IGF",
      to: '/rapport-senegal',
    },
    {
      label: 'Journal Officiel',
      description: 'Textes législatifs, Lois, Décrets, Arrêtés',
      to: '/journal-officiel-senegal',
    },
    {
      label: 'Codes Généraux',
      description: 'Constitution, Code de la famille, etc',
      to: '/code-senegal',
    },
  ]
  },
  {
    label: 'Découverte',
    description: 'Annuaire des nominations du président',
    to: '/decouverte',
    children: [
      {
        label: 'Guides',
        to: '/guides-senegal',
      },
      {
        label: 'Fonctionnement de l\'État',
        to: '/fonctionnement-etat-senegal',
      },
      {
        label: 'Quiz',
        to: '/quiz',
      },
    ]
  },
  {
    label: "Annuaires",
    to: '/annuaire-sites-publics-senegal',
    children: [
      {
        label: 'Annuaire',
        description: 'Annuaire des sites internet publics',
        to: '/annuaire-sites-publics-senegal',
      },
      {
        label: 'Outils pratiques',
        description: 'API pour les développeurs',
        to: '/api-senegal',
      },
    ]
  },
  {
    label: 'Actualités',
    to: '/publications/actualites',
  }
]

</script>

<template>
  <div class="relative bg-white shadow-lg z-50">
    <div class="hidden md:block">
      <div class="xl:container flex justify-between items-center relative p-4 h-[116px] mx-auto">
        <!-- HeaderBrand à gauche -->
        <AppHeader />
        <div class="flex divide-x divide-gray-200">
          <div class="border-b-2 border-gray-300 flex justify-between w-[256px]">
            <UInput color="primary" size="lg" variant="none" placeholder="RECHERCHER..." class="font-medium" />
            <div class="bg-gray-500 px-1.5 pt-1.5 text-white">
              <UIcon name="i-heroicons-magnifying-glass" class="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>
      <div class="w-full border-t"></div>
      <div class="xl:container flex justify-between text-sm text-gray-800 mx-auto px-4">
        <ul class="flex">
          <li v-for="link in links" :key="link.label">
            <NavButton :link="link" />
          </li>
        </ul>
      </div>
    </div>
    <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
    <div class="md:hidden">
      <div class="flex justify-between items-center p-4">
        <AppHeader />
        <div>
          <UButton color="gray" variant="link" size="xl" icon="i-heroicons-magnifying-glass" to="/search" />
          <UButton @click="isOpen = true" color="gray" variant="link" size="xl" icon="i-heroicons-bars-3" />
        </div>
      </div>
    </div>
  </div>
  <UContainer class="mt-2 px-0 sm:px-10 md:px-14 lg:px-28 xl:px-40">
    <!-- Navigation verticale pour mobiles (toggle visibility with Tailwind CSS) -->
    <USlideover v-model="isOpen">
      <div class="p-4 flex-1">
        <UButton color="gray" variant="ghost" size="xl" icon="i-heroicons-x-mark-20-solid"
          class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="isOpen = false" />
        <div class="min-h-full">
          <AppHeader />
          <div class="vertical-nav">
            <ul>
              <li v-for="link in links" :key="link.label">
                <NavButton :link="link" />
              </li>
            </ul>
          </div>
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
</style>