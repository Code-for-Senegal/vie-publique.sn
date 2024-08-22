<script setup lang="ts">
useHead({
    title: "Documents officiels du Sénégal | Vie-Publique.sn",
    meta: [
        {
            name: 'description',
            content: "Accédez aux documents officiels du Sénégal: Journal officiel, rapports d'audit, codes généraux et plus encore.",
        },
    ],
})

const documentCategories = [
    {
        title: 'Journal Officiel',
        description: 'Textes, Lois, Décrets, Arrêtés...',
        icon: 'i-heroicons-clipboard-document-list',
        to: '/journal-officiel-senegal',
        color: 'bg-blue-100 text-blue-700'
    },
    {
        title: "Rapports Publics",
        description: "Cours des Comptes, OFNAC, IGE...",
        icon: 'i-heroicons-document-text',
        to: '/rapport-senegal',
        color: 'bg-green-100 text-green-700'
    },
    {
        title: 'Codes Généraux',
        description: 'Constitution, Code de la famille, Code de la presse...',
        icon: 'i-heroicons-book-open',
        to: '/code-senegal',
        color: 'bg-purple-100 text-purple-700'
    }
]
</script>

<template>
    <div class="container mx-auto p-2 sm:p-4">

        <!-- <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Documents</h1> -->

        <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">Documents</h1>
        </div>

        <div class=" hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard v-for="category in documentCategories" :key="category.title"
                class="transition-all duration-300 hover:shadow-lg">
                <NuxtLink :to="category.to" class="block p-2">
                    <div :class="['rounded-full w-14 h-14 flex items-center justify-center mb-2', category.color]">
                        <UIcon :name="category.icon" class="w-8 h-8" />
                    </div>
                    <h2 class="text-xl font-semibold mb-2">{{ category.title }}</h2>
                    <p class="text-gray-600">{{ category.description }}</p>
                </NuxtLink>
            </UCard>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <UCard v-for="menu in documentCategories" :key="menu.label" class="p-4 custom-shadow hover:shadow-xl">
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