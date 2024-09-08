<script setup lang="ts">
import type { GovernmentMember } from '~/types/government-member';

useHead({
    title: 'Annuaire nominations Sénégal',
    meta: [
        { name: 'description', content: 'Liste des nominations du président Diomaye Faye au Sénégal' },
        { name: "twitter:title", content: "Annuaire nominations Sénégal" },
        { name: "twitter:description", content: "Nominations du président Diomaye Faye" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/nomination-3.png" },
        { property: "og:title", content: "Annuaire nominations Sénégal" },
        { property: "og:description", content: "Nominations du président Diomaye Faye" },
        { property: "og:image", content: "/nomination-3.png" },
        { property: "og:url", content: "https://vie-publique.sn/nomination-senegal" },
        { property: "og:type", content: "website" },
    ]
})

const { $dateformat } = useNuxtApp()

const { data } = await useFetch('/api/government', {
    watch: false,
    transform(input) {
        return { members: input, fetchedAt: new Date() }
    },
    getCachedData(key) {
        const data = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
        if (!data) return
        const expirationDate = new Date(data.fetchedAt)
        expirationDate.setTime(expirationDate.getTime() + 120 * 1000)
        return expirationDate.getTime() < Date.now() ? undefined : data
    },
})

const searchQuery = ref('')
const selectedType = ref('Ministre') // Initialisé à 'Ministre' par défaut
const selectedGender = ref('')
const viewMode = ref('list') // Initialisé à 'list' par défaut
const page = ref(1)
const pageCount = 10

const filteredMinisters = computed(() => {
    return (data.value?.members?.filter((member: GovernmentMember) =>
        (member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
        (selectedType.value === 'Ministre' ? member.type === 'Ministre' : (!selectedType.value || member.type === selectedType.value)) &&
        (!selectedGender.value || member.sexe === selectedGender.value)
    ) || []).sort((a, b) => new Date(b.nominationDate).getTime() - new Date(a.nominationDate).getTime())
})

const rowsfilteredMinisters = computed(() =>
    filteredMinisters.value.slice((page.value - 1) * pageCount, page.value * pageCount)
)

const totalsByType = computed(() => {
    const totals: Record<string, number> = {}
    data.value?.members?.forEach((member: GovernmentMember) => {
        if (member.type) {
            totals[member.type] = (totals[member.type] || 0) + 1
        }
    })
    return Object.fromEntries(Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)))
})

const totalsByGender = computed(() => {
    let maleCount = 0, femaleCount = 0
    data.value?.members?.forEach((member: GovernmentMember) => {
        member.sexe === 'Monsieur' ? maleCount++ : member.sexe === 'Madame' ? femaleCount++ : null
    })
    return { maleCount, femaleCount }
})

const selectedMinister = ref<GovernmentMember | null>(null)
const isModalOpen = ref(false)

function openModal(minister: GovernmentMember) {
    selectedMinister.value = minister
    isModalOpen.value = true
}

watch([searchQuery, selectedType, selectedGender], () => {
    page.value = 1
})
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">{{ data?.members?.length }} Nominations</h1>

        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Lien vers les récentes nominations -->
            <div class="text-center mb-4">
                <ULink to="/nomination-senegal/conseil-des-ministres-07-aout"
                    class="text-sm mb-2 underline text-center text-gray-600 hover:text-gray-800">
                    Voir les nominations du dernier conseil des ministres
                </ULink>
            </div>

            <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Rechercher une nomination..."
                class="w-full" />

            <div class="flex flex-wrap justify-center gap-2">
                <UButton v-for="gender in ['Monsieur', 'Madame']" :key="gender"
                    :color="selectedGender === gender ? 'primary' : 'gray'"
                    @click="selectedGender = selectedGender === gender ? '' : gender" class="text-sm">
                    {{ gender === 'Monsieur' ? 'Hommes' : 'Femmes' }}
                    <UBadge :label="totalsByGender[gender === 'Monsieur' ? 'maleCount' : 'femaleCount']"
                        :variant="selectedGender === gender ? 'solid' : 'soft'" />
                </UButton>
                <UButton v-for="(total, type) in totalsByType" :key="type"
                    :color="selectedType === type ? 'primary' : 'gray'"
                    @click="selectedType = selectedType === type ? '' : type" class="text-sm">
                    {{ type }}
                    <UBadge :label="total" :variant="selectedType === type ? 'solid' : 'soft'" />
                </UButton>
            </div>

            <div class="flex justify-end mb-4">
                <UButtonGroup size="sm">
                    <UButton :color="viewMode === 'grid' ? 'primary' : 'gray'" @click="viewMode = 'grid'">
                        <UIcon name="i-heroicons-squares-2x2-solid" />
                    </UButton>
                    <UButton :color="viewMode === 'list' ? 'primary' : 'gray'" @click="viewMode = 'list'">
                        <UIcon name="i-heroicons-bars-3-solid" />
                    </UButton>
                </UButtonGroup>
            </div>

            <div v-if="rowsfilteredMinisters.length === 0" class="text-center py-8">
                <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p class="text-xl text-gray-600">Aucun résultat trouvé</p>
            </div>

            <div v-else
                :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'">
                <UCard v-for="minister in rowsfilteredMinisters" :key="minister.name"
                    class="cursor-pointer hover:shadow-lg transition-shadow duration-300" @click="openModal(minister)">
                    <div :class="viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-4'">
                        <NuxtImg :src="minister.photo || '/unknown_member.webp'"
                            :class="viewMode === 'grid' ? 'w-32 h-32 mx-auto rounded-full mb-4' : 'w-16 h-16 rounded-full'"
                            :alt="minister.name" />
                        <div>
                            <h2 class="font-semibold">{{ minister.name }}</h2>
                            <p class="text-sm text-gray-600">{{ minister.role }}</p>
                            <p class="text-xs text-gray-500">Nommé le {{ $dateformat(minister.nominationDate) }}</p>
                        </div>
                    </div>
                </UCard>
            </div>

            <div v-if="filteredMinisters.length > pageCount" class="flex justify-center mt-8">
                <UPagination v-model="page" :total="filteredMinisters.length" :page-count="pageCount" />
            </div>
        </div>

        <UModal v-model="isModalOpen">
            <UCard v-if="selectedMinister" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="flex justify-center items-center">
                        <NuxtImg :src="selectedMinister.photo || '/unknown_member.webp'" alt="Profile Photo"
                            sizes="300px md:400px" :placeholder="[300, 300]" />
                    </div>
                </template>

                <div class="px-4 text-center">
                    <h2 class="text-xl font-semibold">{{ selectedMinister.name }}</h2>
                    <p class="text-sm">{{ selectedMinister.role }}</p>
                    <div v-if="selectedMinister.nominationDate" class="mt-1">
                        <p class="text-sm text-gray-500">Nommé le</p>
                        <p class="text-sm">{{ $dateformat(selectedMinister.nominationDate) }}</p>
                    </div>
                    <div v-if="selectedMinister.endDate" class="mt-1">
                        <p class="text-sm text-gray-500">Fin de fonction le</p>
                        <p class="text-sm">{{ $dateformat(selectedMinister.endDate) }}</p>
                    </div>
                    <div v-if="selectedMinister.formation" class="mt-1">
                        <p class="text-sm text-gray-500">Formation</p>
                        <p class="text-sm">{{ selectedMinister.formation }}</p>
                    </div>
                    <div v-if="selectedMinister.predecessor" class="mt-1">
                        <p class="text-sm text-gray-500">Prédécesseur</p>
                        <p class="text-sm">{{ selectedMinister.predecessor }}</p>
                    </div>

                    <ULink v-if="selectedMinister.portrait" :to="selectedMinister.portrait"
                        class="text-blue-600 hover:text-blue-800 underline text-sm font-semibold">
                        Voir le portrait complet
                    </ULink>
                </div>

                <template #footer>
                    <div class="text-right p-2">
                        <UButton color="gray" @click="isModalOpen = false">Fermer</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>

<style scoped>
/* Ajoutez ici des styles spécifiques si nécessaire */
</style>