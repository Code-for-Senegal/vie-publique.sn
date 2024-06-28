<script setup lang="ts">
import type { GovernmentMember } from '~/types/government-member';


useHead({
    title: 'Annuaire nominations Sénégal | Vie-Publique.sn',
    meta: [
        {
            name: 'description',
            content: 'Liste des nominations du président Diomaye Faye au Sénégal'
        }
    ]
})

const { data } = useFetch<GovernmentMember[]>('/api/government');

const searchQuery = ref('');
const selectedType = ref('Ministre');

const filteredMinisters = computed(() => {
    if (data.value === null) {
        return [];
    }
    return data.value.filter(minister =>
        minister.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
        (!selectedType.value || minister.type === selectedType.value)
    );
});

const filteredMinistersType = computed(() => {
    if (data.value === null) {
        return [];
    }
    return data.value.filter(minister =>
        (!selectedType.value || minister.type === selectedType.value)
    );
});

// const typesCount = computed(() => {
//     const countMap: Record<string, number> = {};
//     data.value?.forEach(minister => {
//         if (!countMap[minister.type]) {
//             countMap[minister.type] = 0;
//         }
//         countMap[minister.type]++;
//     });
//     return countMap;
// });

const types = ['Ministre', 'Secrétaire d’État'];

const selectedMinister = ref<GovernmentMember | null>(null);
const isModalOpen = ref(false);

function openModal(minister: GovernmentMember) {
    selectedMinister.value = minister;
    isModalOpen.value = true;
}

</script>

<template>

    <div class="flex flex-col items-center px-4 sm:px-8">

        <h1 class="text-xl font-semibold text-center mt-4 mb-2">
            Nominations du président Diomaye Faye au Sénégal
        </h1>
        <p class="mb-4 text-gray-600">
            Liste non exhaustive
        </p>

        <!-- Modal pour afficher les détails du membre -->
        <UModal v-model="isModalOpen">
            <UCard v-if="selectedMinister" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <!-- <Placeholder v-else class="h-8" /> -->
                    <div class="flex justify-center items-center">
                        <NuxtImg
                            :src="selectedMinister.photo || 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Unknown_Member.jpg?20170805162126'"
                            alt="Profile Photo" sizes="300px" class="max-w-full h-auto rounded-lg" />
                    </div>
                </template>

                <div class="p-4 text-center">
                    <h2 class="font-semibold">{{ selectedMinister.name }}</h2>
                    <p class="text-sm">{{ selectedMinister.role }}</p>
                    <p class="text-sm text-gray-500">Nommé le {{ selectedMinister.nominationDate }}</p>
                </div>

                <template #footer>
                    <Placeholder class="h-8" />
                    <div class="text-right p-4">
                        <button class="btn btn-primary" @click="isModalOpen = false">Fermer</button>
                    </div>
                </template>
            </UCard>
        </UModal>

        <div class="w-full max-w-4xl">
            <div>

                <UInput class="input w-full sm:w-full mb-3 custom-shadow" size="lg" icon="i-heroicons-magnifying-glass"
                    placeholder="Rechercher une nomination..." v-model="searchQuery" />

                <USelect class="w-full sm:w-full mb-3 custom-shadow" size="lg" icon="i-heroicons-funnel"
                    placeholder="Filtrer par type" v-model="selectedType" :options="types" />

                <!-- <p class="text-sm mb-4 text-gray-600">
                    Total: {{ filteredMinistersType.length }}
                </p> -->

                <!-- Liste des ministres avec onClick event -->
                <div class="space-y-2">
                    <UCard v-for="minister in filteredMinisters" :key="minister.name"
                        class="cursor-pointer custom-shadow" @click="openModal(minister)">
                        <div class="flex flex-row gap-2 ">
                            <div class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                                <NuxtImg
                                    :src="minister.photo || 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Unknown_Member.jpg?20170805162126'"
                                    alt="Photo ministre" class="object-cover rounded-full w-full h-full" />

                            </div>
                            <div class="flex-grow">
                                <h2 class="font-semibold">{{ minister.name }}</h2>
                                <p class="text-sm">{{ minister.role }}</p>
                                <p class="text-sm text-gray-500">Nommé le {{ minister.nominationDate }}</p>
                            </div>
                        </div>
                    </UCard>
                </div>
            </div>
        </div>

    </div>
</template>