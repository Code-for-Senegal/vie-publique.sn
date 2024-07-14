<script setup lang="ts">

useHead({
    title: "l'information publique au Sénégal | Vie-Publique.sn",
    meta: [
        {
            name: 'description',
            content: 'Annuaire publiqc, Rapports OFNAC cours des compte, Nominations, Site web des institutions publiques du Sénégal'
        }
    ]
})

const links = [
    {
        label: 'Quiz Jeux',
        description: 'Jeux QCM sur les institutions publiques du Sénégal',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-puzzle-piece',
        to: '/quiz',
    },
    {
        label: 'Nominations',
        description: 'Annuaire des nominations du président Diomaye',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-identification',
        to: '/nomination-senegal',
    },
    {
        label: "Rapports d'audit",
        description: "Cours des Comptes, OFNAC, IGE, ARMP, IGF",
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-document-text',
        to: '/reports',
    },
    {
        label: "Sites web",
        description: 'Annuaire des sites internet publics du Sénégal',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-computer-desktop',
        to: '/annuaire-sites-publics-senegal',
    },
    // {
    //     label: 'Prix des denrées',
    //     description: 'Prix des denrées de première nécessité au Sénégal',
    //     photo: '/unknown_member.webp',
    //     icon: 'i-heroicons-globe-alt',
    //     to: '/annuaire-sites-publics-senegal',
    // },
]

</script>

<template>
    <div class="container mx-auto p-2 sm:p-4">

        <!-- <div>
            <p class="text-sm mb-4 text-gray-500 text-center">
                Au coeur du débat public, annuaire, info
            </p>
        </div> -->

        <!-- <HomeMenuCards1 :menus="links" /> -->
        <HomeMenuCards2 :menus="links" />
    </div>
</template>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.5rem;
}
</style>