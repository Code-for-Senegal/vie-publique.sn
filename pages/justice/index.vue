<script setup lang="ts">

const seoTitle = 'Justice République du Sénégal';
const seoDescription = "La justice Sénégal, Conseil supérieur de la magistrature, Cour suprême, Conseil constitutionnel, Conseil d'État, Cour d'appel, Tribunal";
const seoImgPath = 'https://vie-publique.sn/images/share-linkedin.png';
const seoPageUrl = 'https://vie-publique.sn/justice';
useHead({
    title: seoTitle,
    meta: [
        {
            name: 'description',
            content: seoDescription
        },
        // Twitter Card Meta Tags
        {
            name: "twitter:title",
            content: seoTitle
        },
        {
            name: "twitter:description",
            content: seoDescription
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
            content: seoDescription
        },
        { property: "og:image", content: seoImgPath },
        { property: "og:url", content: seoPageUrl },
        { property: "og:type", content: "artcile" },
    ]
})

const searchQuery = ref('')

const { data: codes, pending, error } = await useAsyncData('codes', () =>
    queryContent('code-senegal').find(),
    { server: true, lazy: false }
)

const filteredCodes = computed(() => {
    if (!codes.value) return []
    return codes.value.filter(code =>
        code.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const links = [
    {
        label: 'Annuaire des magistrats',
        description: 'Magistrats nommé lors du conseil supérieur de la magistrature',
        icon: 'i-heroicons-identification',
        to: '/justice/magistrature',
    }, {
        label: 'Conseil supérieur de la Magistrature du 09 août 2024',
        description: 'Procès-verbal du Conseil supérieur de la Magistrature de ce vendredi 09 août 2024',
        icon: 'i-heroicons-document',
        to: '/publications/justice/conseil-superieur-de-la-magistrature-18-aout-2024',
    }, {
        label: 'Textes portant sur les Professions judiciaires et extra judiciaires',
        description: 'Règlements, Lois, Décrets, Arrêtés etc.',
        icon: 'i-heroicons-document',
        to: '/publications/justice/textes-professions-judiciaires-et-extra-judiciaires',
    }];
</script>

<template>
    <div class="container mx-auto px-4">

        <div class="prose prose-sm sm:prose mx-auto my-2">
            <h1 class="text-center">
                La Justice au Sénégal
            </h1>
        </div>

        <div class="text-center">
            <p v-if="filteredCodes.length > 1" class="text-sm mb-2 text-gray-500">
                Annuaire acteurs de la justice, publications, Textes
            </p>
        </div>

        <div class="flex flex-col gap-2">
            <UCard v-for="link in links" :key="link.to" class="cursor-pointer custom-shadow">
                <NuxtLink :to="link.to">
                    <p class="font-semibold underline text-blue-600">
                        {{ link.label }}
                    </p>
                    <p class="text-gray-500 text-sm">{{ link.description }}</p>
                </NuxtLink>
            </UCard>
        </div>
    </div>
</template>