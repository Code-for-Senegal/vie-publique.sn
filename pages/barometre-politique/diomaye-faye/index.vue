<!-- barometre/liste.vue -->
<script setup lang="ts">
import type { Promesse } from "~/types/promesse";
import type { PromesseStats } from "~/types/promesse";

useHead({
    meta: [
        { name: 'robots', content: 'noindex' }
    ]
})

/* Get Datas */

const nuxtApp = useNuxtApp()
const { data, error } = await useFetch('/api/barometre-politique/diomaye-faye', {
    watch: false,

    transform(input: { promesses: Promesse[], stats: PromesseStats }) {
        return {
            promesses: input.promesses,
            stats: input.stats,
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
const selectedSource = ref('')
const selectedStatus = ref('')
const selectedTheme = ref('')

const sources = ['Programme présidentiel', 'Conseil des ministres', 'Communiqué', 'Discours'];

const themes = [
    { label: 'Technologie numérique', value: 'Technologie numérique' },
    { label: 'Justice', value: 'Justice' },
    { label: 'Gouvernance', value: 'Gouvernance' },
    { label: 'Économie', value: 'Économie' },
    { label: 'Éducation', value: 'Éducation' },
    { label: 'Santé', value: 'Santé' },
    { label: 'Défense & Sécurité', value: 'Défense & Sécurité' },
]
const statuses = [
    { label: 'Non tenue', value: 'non tenue' },
    { label: 'En cours', value: 'en cours' },
    { label: 'Tenue', value: 'tenue' },
    { label: 'Non évaluée', value: 'non évaluée' },
    { label: 'Inévaluable', value: 'inévaluable' }
]

const statusIcons: { [key: string]: string } = {
    'non tenue': 'i-heroicons-x-circle',
    'en cours': 'i-heroicons-arrow-path',
    'tenue': 'i-heroicons-check-circle',
    'non évaluée': 'i-heroicons-question-mark-circle',
}

const getStatusIcon = (status: string): string => {
    return statusIcons[status.toLowerCase()] || 'i-heroicons-question-mark-circle'
}

const getStatusBackgroundClass = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'tenue': return 'bg-green-100';
        case 'non tenue': return 'bg-red-100';
        case 'en cours': return 'bg-yellow-100';
        default: return 'bg-gray-100';
    }
};

const getStatusIconClass = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'tenue': return 'text-green-600';
        case 'non tenue': return 'text-red-600';
        case 'en cours': return 'text-yellow-600';
        default: return 'text-gray-600';
    }
};

const getStatusTextClass = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'tenue': return 'text-green-800';
        case 'non tenue': return 'text-red-800';
        case 'en cours': return 'text-yellow-800';
        default: return 'text-gray-800';
    }
};

const filteredPromesses = computed(() => {
    return data.value.promesses.filter((promesse: Promesse) =>
        promesse.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        &&
        (selectedSource.value ? promesse.source === selectedSource.value : true)
        &&
        (selectedStatus.value ? promesse.status.toLowerCase() === selectedStatus.value : true)
        &&
        (selectedTheme.value ? promesse.theme === selectedTheme.value : true)
    );
});

// Modification du statsDisplay pour utiliser le total des promesses
const statsDisplay = computed(() => ({
    tenues: {
        count: data.value.stats.tenues,
        label: 'Tenues',
        color: 'bg-green-600'
    },
    non_tenues: {
        count: data.value.stats.non_tenues,
        label: 'Non tenues',
        color: 'bg-red-600'
    },
    en_cours: {
        count: data.value.stats.en_cours,
        label: 'Partiellement',
        color: 'bg-orange-500'
    },
    inevaluables: {
        count: data.value.stats.inevaluables,
        label: 'Inévaluables',
        color: 'bg-gray-600'
    },
    non_evaluees: {
        count: data.value.stats.non_evaluees,
        label: 'Non évaluées',
        color: 'bg-gray-400'
    },
}));

const maxCount = computed(() =>
    Math.max(...Object.values(statsDisplay.value).map(stat => stat.count))
);

// Ajoutez cette ligne pour déboguer
watch(data, (newData) => {
    console.log('Données chargées:', newData)
})

const links = [
    { label: 'Barometre', to: '/barometre-politique' }]
</script>

<template>
    <div>
        <AppBreadcrumb :links="links" lastText="Diomaye faye" />

        <div class="container mx-auto px-4">
            <div v-if="data" class="prose prose-sm sm:prose mx-auto my-4">
                <h1 class="text-center text-2xl sm:text-3xl font-bold">
                    {{ data.stats.total }} promesses de Diomaye
                </h1>
            </div>

            <div v-if="data">
                <!-- Statistiques optimisées pour mobile -->
                <div class="bg-white shadow rounded-lg p-4 mb-6">
                    <div class="space-y-2">
                        <div v-for="(value, key) in statsDisplay" :key="key" class="flex items-center">
                            <div class="w-32 flex-shrink-0 flex items-center justify-between mr-2">
                                <span class="text-sm uppercase">{{ value.label }}</span>
                                <span class="font-bold">{{ value.count }}</span>
                            </div>
                            <div class="flex-grow bg-gray-200 h-4">
                                <div class="h-4" :class="value.color"
                                    :style="{ width: `${(value.count / data.stats.total) * 100}%` }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filtres optimisés pour mobile -->
                <div class="mb-6 space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-2">
                    <USelect v-model="selectedSource" :options="sources" placeholder="Source" class="w-full sm:w-auto"
                        icon="i-heroicons-funnel" />
                    <USelect v-model="selectedStatus" :options="statuses" placeholder="Statut" class="w-full sm:w-auto"
                        icon="i-heroicons-funnel" />
                    <USelect v-model="selectedTheme" :options="themes" placeholder="Thématique" class="w-full sm:w-auto"
                        icon="i-heroicons-funnel" />
                </div>

                <!-- Liste des promesses optimisée pour mobile -->
                <div class="space-y-4">
                    <UCard v-for="promesse in filteredPromesses" :key="promesse.id"
                        :to="`/barometre-politique/diomaye-faye/${promesse.id}`"
                        class="cursor-pointer hover:shadow-lg transition-shadow duration-300">
                        <div class="flex items-start">
                            <div class="flex flex-col items-center w-20 flex-shrink-0 mr-3">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                                    :class="getStatusBackgroundClass(promesse.status)">
                                    <UIcon :name="getStatusIcon(promesse.status)" class="text-2xl"
                                        :class="getStatusIconClass(promesse.status)" />
                                </div>
                                <span class="text-xs font-medium text-center uppercase"
                                    :class="getStatusTextClass(promesse.status)">
                                    {{ promesse.status }}
                                </span>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-base font-semibold mb-1">{{ promesse.label }}</h3>
                                <p class="text-xs text-gray-600">Échéance : {{ promesse.schedules }}</p>
                                <p class="text-xs text-gray-600">Thème : {{ promesse.theme }}</p>
                                <p class="text-xs text-gray-600">Source : {{ promesse.source }}</p>
                            </div>
                        </div>
                    </UCard>
                </div>
            </div>
            <div v-else class="text-center py-8">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl text-gray-400 mb-2" />
                <p class="text-sm">Chargement des données...</p>
            </div>
        </div>
    </div>
</template>