<script setup lang="ts">

/* SEO */

useHead({
    title: 'Annuaire sites web Sénégal | Vie-Publique.sn',
    meta: [
        {
            name: 'description',
            content: 'Annuaire de sites internets publics du Senegal'
        }
    ]
})

/* Get Datas */

const nuxtApp = useNuxtApp()
const { data, error } = await useFetch('/api/websites', {
    watch: false,

    transform(input) {
        return {
            sites: input,
            fetchedAt: new Date()
        }
    },

    getCachedData(key) {
        const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
        // If data is not fetched yet
        if (!data) {
            // Fetch the first time
            return
        }
        // Is the data too old?
        const expirationDate = new Date(data.fetchedAt)
        expirationDate.setTime(expirationDate.getTime() + 120 * 1000) // 120 secondes
        const isExpired = expirationDate.getTime() < Date.now()
        if (isExpired) {
            // Refetch the data
            return
        }

        return data
    },
})

if (error.value) {
    console.error('Failed to fetch websites data:', error.value)
}

/* Filters */

const searchQuery = ref('');
const selectedType = ref('');

const filteredSites = computed(() => {
    return data.value.sites.filter((site: any) =>
        site.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
        (selectedType.value ? site.type === selectedType.value : true)
    );
});

const types = computed(() => {
    const allTypes = data.value.sites.map((site: any) => site.type.trim());
    return Array.from(new Set(allTypes));
});

/* Pagination */

const page = ref(1)
const pageCount = 20

const rowsFilteredSites = computed(() => {
    return filteredSites.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
});

// Réinitialiser la page lors du changement de type
watch(selectedType, () => {
    page.value = 1;
});

</script>

<template>

    <div class="flex flex-col items-center px-4 sm:px-8">

        <h1 class="text-xl font-semibold text-center mt-4 mb-2">
            Annuaire de {{ data.sites.length }} sites internets publics du Sénégal
        </h1>
        <p class="text-sm mb-4 text-gray-500">
            Liste non exhaustive
        </p>

        <div class="w-full max-w-4xl">
            <UInput class="input w-full sm:w-full mb-3 custom-shadow" size="lg" icon="i-heroicons-magnifying-glass"
                placeholder="Rechercher un site..." v-model="searchQuery" />

            <USelect class="w-full sm:w-full mb-3 custom-shadow" size="lg" icon="i-heroicons-funnel"
                placeholder="Filtrer par type" v-model="selectedType" :options="types" />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UCard v-for="site in rowsFilteredSites" :key="site.url" class="cursor-pointer custom-shadow">
                    <ULink :to="site.url" target="_blank"
                        class="text-blue-600 hover:text-blue-800 underline text-sm font-semibold">
                        {{ site.url }}
                    </ULink>
                    <div>
                        <p class="text-sm">{{ site.nom }}</p>
                        <span class="siteweb-type inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800">
                            {{ site.type }}
                        </span>
                    </div>
                </UCard>
            </div>

            <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
                <UPagination size="md" v-model="page" :page-count="pageCount" :total="filteredSites.length" />
            </div>
        </div>

    </div>

</template>

<style scoped></style>