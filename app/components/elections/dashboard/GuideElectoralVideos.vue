<script setup lang="ts">
import { useGuideElectoral } from '~/composables/elections/guide/useGuideElectoral';

interface Props {
  typeElection?: string;
  defaultLanguage?: string;
}

const props = defineProps<Props>();

const selectedLanguage = ref(props.defaultLanguage || 'all');
const selectedType = ref('all');
const route = useRoute();
const router = useRouter();

const electionTypes = [
    { label: 'Présidentielles', value: 'presidential' },
    { label: 'Législatives', value: 'legislative' },
    { label: 'Locales', value: 'local' }
];

if (!props.typeElection) {
    if (route.query.lang) {
        selectedLanguage.value = route.query.lang as string;
    }
    if (route.query.type) {
        selectedType.value = route.query.type as string;
    }
    
    watch(selectedLanguage, (newLang) => {
        router.replace({ query: { ...route.query, lang: newLang === 'all' ? undefined : newLang } });
    });

    watch(selectedType, (newType) => {
        router.replace({ query: { ...route.query, type: newType === 'all' ? undefined : newType } });
    });
}

const { videos, loading, languages } = useGuideElectoral({
    type: computed(() => props.typeElection || 'all'),
});


const filteredVideos = computed(() => {
   if (!videos.value) return [];
   
   let filtered = videos.value;

    if (selectedLanguage.value !== 'all') {
        filtered = filtered.filter(v => v.langue === selectedLanguage.value);
    }
    
    // Filter by type (either prop or local state)
    const effectiveType = props.typeElection || selectedType.value;
    if (effectiveType && effectiveType !== 'all') {
         filtered = filtered.filter(v => v.type_election === effectiveType);
    }

   return filtered;
});
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h2 class="text-3xl font-black uppercase tracking-tighter">
        Guide Électoral - Comment Voter
      </h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Découvrez comment voter aux élections en vidéo, disponible en plusieurs langues nationales.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-500" />
    </div>

    <template v-else>
        <div v-if="!props.typeElection" class="flex flex-wrap justify-center gap-2 mb-4">
             <UButton
                color="white"
                :variant="selectedType === 'all' ? 'solid' : 'ghost'"
                :class="[
                selectedType === 'all'
                    ? 'ring-2 ring-primary-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                ]"
                class="rounded-full px-4"
                @click="selectedType = 'all'"
            >
                Toutes les élections
            </UButton>
            <UButton
                v-for="type in electionTypes"
                :key="type.value"
                color="white"
                :variant="selectedType === type.value ? 'solid' : 'ghost'"
                 :class="[
                selectedType === type.value
                    ? 'ring-2 ring-primary-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                ]"
                class="rounded-full px-4"
                @click="selectedType = type.value"
            >
                {{ type.label }}
            </UButton>
        </div>

        <div class="flex flex-wrap justify-center gap-2">
        <UButton
            color="gray"
            :variant="selectedLanguage === 'all' ? 'solid' : 'ghost'"
            :class="[
            selectedLanguage === 'all'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            class="rounded-full px-4 transition-all duration-200"
            @click="selectedLanguage = 'all'"
        >
            Toutes les langues
        </UButton>

        <UButton
            v-for="(label, lang) in languages"
            :key="lang"
            color="gray"
            :variant="selectedLanguage === lang ? 'solid' : 'ghost'"
            :class="[
            selectedLanguage === lang
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
            class="rounded-full px-4 transition-all duration-200"
            @click="selectedLanguage = lang"
        >
            {{ label }}
        </UButton>
        </div>

        <!-- Empty State -->
        <div v-if="filteredVideos.length === 0" class="text-center py-12">
             <UIcon name="i-heroicons-video-camera-slash" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <p class="text-gray-500">Aucune vidéo disponible pour cette sélection.</p>
        </div>

        <!-- Affichage d'une seule vidéo centrée -->
        <div v-else-if="filteredVideos.length === 1" class="flex justify-center">
        <UCard class="w-full max-w-2xl overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 rounded-2xl">
            <div class="aspect-video w-full">
            <iframe
                :src="filteredVideos[0].url_youtube.replace('watch?v=', 'embed/')"
                class="w-full h-full rounded-lg"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
            </div>
            <div class="p-4 text-center">
            <h3 class="text-lg font-black uppercase tracking-tight">
                {{ languages[filteredVideos[0].langue] || filteredVideos[0].langue.toUpperCase() }}
            </h3>
            <p v-if="filteredVideos[0].description" class="text-sm text-gray-500 mt-2">{{ filteredVideos[0].description }}</p>
            </div>
        </UCard>
        </div>

        <!-- Affichage de plusieurs vidéos sous forme de grille -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
            v-for="video in filteredVideos"
            :key="video.id"
            class="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900 rounded-2xl"
        >
            <div class="aspect-video w-full">
            <iframe
                :src="video.url_youtube.replace('watch?v=', 'embed/')"
                class="w-full h-full rounded-t-lg"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
            </div>
            <div class="p-4 text-center">
            <h3 class="text-lg font-black uppercase tracking-tight">
                {{ languages[video.langue] || video.langue.toUpperCase() }}
            </h3>
             <p v-if="video.description" class="text-sm text-gray-500 mt-2 line-clamp-2">{{ video.description }}</p>
            </div>
        </UCard>
        </div>
    </template>
  </div>
</template>
