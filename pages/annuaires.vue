<script setup lang="ts">
useHead({
    title: "Annuaires du Sénégal",
    meta: [
        {
            name: 'description',
            content: "Accédez aux annuaires du Sénégal: Nominations Gouvernement, Justice, Media, Sites Web publics et plus encore.",
        },
    ],
})

const menuCategories = [
    {
        title: 'Annuaire Gouvernement',
        description: "Nominations, Ministres, DG...",
        icon: 'i-heroicons-identification',
        to: '/nomination-senegal',
        color: 'bg-green-100 text-green-700'
    },
    {
        title: 'Annuaire Justice',
        description: 'Magistrature, Acteurs de la justice...',
        icon: 'i-heroicons-scale',
        to: '/justice/magistrature',
        color: 'bg-purple-100 text-purple-700'
    }, {
        title: 'Annuaire Médias',
        description: 'Presse, Radio, Télévision, Médias en ligne',
        icon: 'i-heroicons-radio',
        to: '/medias',
        color: 'bg-red-100 text-red-700'
    }, {
        title: "Annuaire Sites Web",
        description: 'Annuaire des sites internet publics',
        icon: 'i-heroicons-computer-desktop',
        to: '/annuaire-sites-publics-senegal',
        color: 'bg-blue-100 text-blue-700'
    }
]
</script>

<template>
    <div class="container mx-auto p-2 sm:p-4">

        <!-- <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Documents</h1> -->

        <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">Annuaires</h1>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <UCard v-for="menu in menuCategories" :key="menu.title" class="p-4 custom-shadow hover:shadow-xl">
                <NuxtLink :to="menu.to" class="flex items-start">
                    <div class="flex-shrink-0 mr-4">
                        <div :class="['w-14 h-14 rounded-full flex items-center justify-center', menu.color]">
                            <UIcon :name="menu.icon" class="w-8 h-8" />
                        </div>
                    </div>
                    <div>
                        <h2 class="font-bold">{{ menu.title }}</h2>
                        <!-- <h2 class="text-xl font-semibold mb-2">{{ category.title }}</h2> -->
                        <p class="text-gray-700 text-sm">{{ menu.description }}</p>
                    </div>
                </NuxtLink>
            </UCard>
        </div>

    </div>
</template>