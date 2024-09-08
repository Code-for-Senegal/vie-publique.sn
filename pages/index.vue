<script setup lang="ts">

/* SEO */
useHead({
    title: "l'information publique au Sénégal, Actualité au Sénégal | Vie-Publique.sn",
    meta: [
        {
            name: 'description',
            content:
                "Information sur la République du Sénégal: Gouvernement de Diomaye et Sonko, journal officiel, rapports d'audit OFNAC Cours des Comptes CENTIG IGE",
        },
    ],
})

// Fetch les 3 dernières actualités

const { data: latestNews } = await useAsyncData('latestNews', () =>
    queryContent('publications/actualites')
        .sort({ date: -1 })
        .limit(2)
        .find()
)

const links = [
    {
        label: 'Conseil des ministres',
        description: 'Communiqués des conseil des ministres...',
        icon: 'i-heroicons-document',
        to: '/conseil-des-ministres',
    },
    {
        label: 'Annuaires',
        description: "Nominations gouvernement, Sites Web, Justice, Medias...",
        icon: 'i-heroicons-rectangle-stack',
        to: '/annuaires',
    },
    {
        label: 'Documents',
        description: "Journal officiel, Codes, Rapports OFNAC Cours des comptes...",
        icon: 'i-heroicons-document-text',
        to: '/documents',
    },
    {
        label: 'Quiz Jeux',
        description: "Jeux QCM sur les institutions et l'organisation de l'Etat",
        icon: 'i-heroicons-puzzle-piece',
        to: '/quiz',
    }
]


</script>

<template>
    <div class="container mx-auto p-2 sm:p-4">
        <!-- Section des liens -->
        <HomeMenuCards2 :menus="links" />

        <!-- Section des dernières actualités -->
        <div class="">
            <div class="prose prose-sm sm:prose mx-auto my-2">
                <h1 class="text-center">Actualités</h1>
                <!-- <h2 class="text-center text-2xl font-bold text-green-700">Dernières Actualités</h2> -->
            </div>
            <div class="text-center">
                <p class="text-sm mb-2 text-gray-500">
                    Communiqués, discours, annonces, déclarations, etc.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UCard class="cursor-pointer custom-shadow">
                    <NuxtLink to="/medias">
                        <img src="/images/actu-presse-en-ligne-senegal-sites-internet-informations-senegal.jpg"
                            alt="Aide à la presse" class="w-full h-48 object-cover mb-4" fetchpriority="high">
                        <div class="siteweb-type inline-block px-2 py-1 my-1 text-xs bg-gray-200 text-gray-800">
                            Article
                        </div>
                        <div class="text-gray-800 text-sm">
                            {{ $dateformatWithDayName("2024-08-20") }}
                        </div>
                        <p class="font-semibold">
                            Classement aides à la presse 2023
                        </p>

                    </NuxtLink>
                </UCard>
                <UCard v-for="item in latestNews" :key="item._path" class="cursor-pointer custom-shadow">
                    <NuxtLink :to="item._path">
                        <img :src="item.image" :alt="item.title" class="w-full h-48 object-cover mb-4" fetchpriority="high">
                        <div class="siteweb-type inline-block px-2 py-1 my-1 text-xs bg-gray-200 text-gray-800">
                            {{ item.category }}
                        </div>
                        <div class="text-gray-800 text-sm">
                            {{ $dateformatWithDayName(item.date) }}
                        </div>
                        <p class="font-semibold">
                            {{ item.title }}
                        </p>
                    </NuxtLink>
                </UCard>
            </div>
            <div class="text-center mt-4">
                <NuxtLink to="/publications/actualites" class="text-green-700 underline">
                    Voir toutes les actualités
                </NuxtLink>
            </div>
        </div>

    </div>
</template>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.5rem;
}
</style>