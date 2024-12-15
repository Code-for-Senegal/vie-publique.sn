<!-- pages/deputies.vue -->
<template>
    <div>
        <UBreadcrumb class="mt-2" :links="[
            { label: 'Accueil', to: '/' },
            { label: 'Députés' },
        ]" />

        <div class="py-5">
            <div class="container">
                <div class="prose prose-sm sm:prose my-2">
                    <h1 class="">
                        Les députés de l'Assemblée nationale
                    </h1>
                </div>

                <template v-if="!loading && deputies">
                    <p class="mt-2 text-gray-600">{{ deputies.length }} candidats élus</p>
                </template>
            </div>
        </div>
        <!-- Informations sur l'Assemblée nationale -->
        <div class="flex flex-col gap-4">
            <p v-html="legislature.description">
            </p>
        </div>

        <ElectionResultDeputiesGrid
            :deputies="deputies"
            :loading="loading"
            :error="error"
        />

    </div>
</template>

<script setup>
import { useLegislature } from '@/composables/parliament/useLegislature';

// Récupération des données
const { legislature, fetchLegislature, loading, error } = useLegislature();
const deputies = ref([]);

// Appeler fetchElectedDeputies dans onMounted
onMounted(async () => {
    await fetchLegislature();
    const legislatureData = legislature.value;
    deputies.value = legislatureData.deputies;
});

const seoTitle = "Députés - Assemblée Nationale";
const seoDescription =
    "Retrouvez tous les députés en activité de l'Assemblée nationale. Résultats de vote et analyses pour chaque député.";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/deputes";
useHead({
    title: seoTitle,
    meta: [
        {
            name: "description",
            content: seoDescription,
        },
        // Twitter Card Meta Tags
        {
            name: "twitter:title",
            content: seoTitle,
        },
        {
            name: "twitter:description",
            content: seoDescription,
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: seoImgPath },
        // Open Graph Meta Tags
        {
            property: "og:title",
            content: seoTitle,
        },
        {
            property: "og:description",
            content: seoDescription,
        },
        { property: "og:image", content: seoImgPath },
        { property: "og:url", content: seoPageUrl },
        { property: "og:type", content: "website" },
    ],
});
</script>