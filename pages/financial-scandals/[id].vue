<script setup lang="ts">
const scandal = ref<any | null>(null);

const route = useRoute();

onMounted(async () => {
    scandal.value = (await import('@/assets/data/scandales-financiers.json'))
        .default.find(s => s.id === parseInt(route.params.id as string));
});
</script>

<template>
    <div class="p-4">
        <UCard v-if="scandal != null">
            <template #header>
                <!-- <Placeholder class="h-8" /> -->
                <h1 class="text-2xl">{{ scandal.titre }}</h1>
                <h3 class="mb-2">{{ scandal.sous_titre }}</h3>
                <p>Année de l'affaire: {{ scandal.annee }}</p>
                <p>Date de publication: {{ new Date(scandal.date_publication).toLocaleDateString() }}</p>

                <!-- <img :src="scandal.image_url" :alt="scandal.titre" class="w-full h-auto"> -->

            </template>
            <!-- <img :src="scandal.image_url" :alt="scandal.titre" class="w-full h-auto"> -->

        </UCard>
    </div>
</template>