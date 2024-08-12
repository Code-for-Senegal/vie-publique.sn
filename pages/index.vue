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

const links = [
    
    {
        label: 'Nominations',
        description: 'Annuaire des nominations du président Diomaye',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-identification',
        to: '/nomination-senegal',
    }, {
        label: 'Conseil des ministres',
        description: 'Communiqué Conseil des ministres',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-document',
        to: '/conseil-des-ministres',
    },
    {
        label: "Rapports Audit",
        description: "Cours des Comptes, OFNAC, IGE, CENTIF, ARMP, IGF",
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-document-text',
        to: '/rapport-senegal',
    },{
        label: 'Journal Officiel',
        description: 'Textes législatifs, Lois, Décrets, Arrêtés',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-newspaper',
        to: '/journal-officiel-senegal',
    }, {
        label: 'Codes Général',
        description: 'Constitution, Code de la famille, etc',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-clipboard-document-list',
        to: '/code-senegal',
    },
    {
        label: "Sites Web",
        description: 'Annuaire des sites internet publics',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-computer-desktop',
        to: '/annuaire-sites-publics-senegal',
    },
    
    {
        label: 'Quiz Jeux',
        description: 'Jeux QCM sur les institutions publiques',
        photo: '/unknown_member.webp',
        icon: 'i-heroicons-puzzle-piece',
        to: '/quiz',
    }
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