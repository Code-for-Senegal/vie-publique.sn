<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import { useCoalitionVideos } from '~/composables/elections/dashboard/useCoalitionVideos';
import { useIntersectionObserver } from '@vueuse/core';
import type { Candidate } from '~~/types/candidate';

interface Props {
  candidate: Candidate;
  coalitionName?: string;
  coalitionId?: string | number | null;
}

const props = defineProps<Props>();

const { formatDate, calculateAge, getYoutubeEmbedUrl } = useElectoralFormatting();

const activeTab = ref(0);
const isManualClick = ref(false);

const items = [
  { id: 'portrait', label: 'Portrait', icon: 'i-heroicons-user-circle' },
  { id: 'programme', label: 'Programme', icon: 'i-heroicons-document-text' },
  { id: 'videos', label: 'Vidéos de Campagne', icon: 'i-heroicons-video-camera' }
]

const { videos, loading: videosLoading } = useCoalitionVideos(computed(() => props.coalitionId));

const age = computed(() => calculateAge(props.candidate.birthdate || null));

// Scrollspy Logic
const sections = ref<HTMLElement[]>([]);
const setSectionRef = (el: any) => {
  if (el) sections.value.push(el);
};

onBeforeUpdate(() => {
  sections.value = [];
});

const scrollToSection = (id: string, index: number) => {
  isManualClick.value = true;
  activeTab.value = index;
  const element = document.getElementById(id);
  if (element) {
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 140 : 180;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  // Reset manual click after animation
  setTimeout(() => {
    isManualClick.value = false;
  }, 1000);
};

// Intersection Observer for scrollspy
onMounted(() => {
  const isMobile = window.innerWidth < 768;

  items.forEach((item, index) => {
    const el = document.getElementById(item.id);
    if (el) {
      useIntersectionObserver(
        el,
        ([{ isIntersecting, intersectionRatio }]) => {
          // Sur mobile, on est plus souple sur l'intersection
          const minRatio = isMobile ? 0.1 : 0.2;

          if (isIntersecting && !isManualClick.value && intersectionRatio >= minRatio) {
            activeTab.value = index;
          }
        },
        {
          // RootMargin: haut, droite, bas, gauche
          // On réduit la zone de capture sur mobile pour éviter les chevauchements
          rootMargin: isMobile ? '-120px 0px -60% 0px' : '-180px 0px -40% 0px',
          threshold: [0.1, 0.2, 0.3]
        }
      );
    }
  });
});

// Fonction pour obtenir l'URL de l'asset via le nouveau proxy
const getAssetUrl = (assetId: string, slug: string) => {
  return useCmsFile(`${assetId}/${slug}.pdf`);
};
</script>

<template>
  <div class="relative">
    <!-- Card Info -->
    <UCard class="overflow-hidden shadow-xl mb-6" :ui="{ body: { padding: 'p-0' } }">
      <div class="grid md:grid-cols-5 gap-0">
        <!-- Photo du candidat -->
        <div class="md:col-span-2 relative aspect-square md:aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800">
          <CmsImage
            v-if="candidate.photo"
            :src="candidate.photo"
            class="h-full w-full object-cover"
            :alt="`${candidate.first_name} ${candidate.last_name}`"
          />
          <div v-else class="h-full w-full flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="h-32 w-32 text-gray-300" />
          </div>
        </div>

        <!-- Informations du candidat -->
        <div class="md:col-span-3 p-8 space-y-8 flex flex-col justify-center">
          <div>
            <p class="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Candidat Présidentiel
            </p>
            <h2 class="text-5xl font-black text-gray-900 dark:text-white uppercase leading-none">
              {{ candidate.first_name }}<br />{{ candidate.last_name }}
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-if="candidate.profession" class="flex items-start gap-3">
              <UIcon name="i-heroicons-briefcase" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Profession</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ candidate.profession }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-flag" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Coalition</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ coalitionName }}</p>
              </div>
            </div>

            <div v-if="candidate.birthdate || candidate.birthplace" class="flex items-start gap-3">
              <UIcon name="i-heroicons-cake" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Naissance</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">
                  <template v-if="candidate.birthdate">{{ formatDate(candidate.birthdate) }}</template>
                  <template v-if="candidate.birthdate && candidate.birthplace"> à </template>
                  <template v-if="candidate.birthplace">{{ candidate.birthplace }}</template>
                  <span v-if="age" class="ml-2 text-primary-600 dark:text-primary-400">({{ age }} ans)</span>
                </p>
              </div>
            </div>

            <div v-if="candidate.voter_number" class="flex items-start gap-3">
              <UIcon name="i-heroicons-identification" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">N° Électeur</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ candidate.voter_number }}</p>
              </div>
            </div>
          </div>

          <!-- Réseaux sociaux - Style bouton -->
          <div v-if="candidate.facebook || candidate.twitter" class="flex gap-4 pt-4">
            <UButton
              v-if="candidate.facebook"
              icon="i-simple-icons-facebook"
              color="gray"
              variant="ghost"
              size="sm"
              :to="candidate.facebook"
              target="_blank"
              class="rounded-full h-10 w-10 flex items-center justify-center p-0"
              title="Facebook"
            />
            <UButton
              v-if="candidate.twitter"
              icon="i-simple-icons-x"
              color="gray"
              variant="ghost"
              size="sm"
              :to="candidate.twitter"
              target="_blank"
              class="rounded-full h-10 w-10 flex items-center justify-center p-0"
              title="Twitter/X"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Sticky Tabs Navigation -->
    <div class="sticky top-[80px] md:top-[124px] z-40 bg-gray-50/95 backdrop-blur-md dark:bg-gray-950/95 py-4 -mx-4 px-4 transition-all duration-300">
      <div class="bg-white dark:bg-gray-900 p-1 rounded-xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 flex gap-1 max-w-2xl mx-auto">
        <button
          v-for="(item, index) in items"
          :key="index"
          @click="scrollToSection(item.id, index)"
          class="flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300"
          :class="activeTab === index
            ? 'bg-primary-600 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
        >
          <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
          <span
            class="truncate transition-all duration-200"
            :class="activeTab === index ? 'inline' : 'hidden sm:inline'"
          >
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>

    <!-- Scrollable Content Sections -->
    <div class="mt-8 space-y-12 pb-32">
      <!-- Portrait Section -->
      <section :id="items[0].id" class="scroll-mt-40">
        <UCard :ui="{ body: { padding: 'p-8' } }" class="border-t-4 border-t-primary-500">
          <div v-if="candidate.biography" class="prose prose-sm dark:prose-invert max-w-none">
            <div class="flex items-center gap-3 mb-6">
               <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                 <UIcon :name="items[0].icon" class="h-6 w-6 text-primary-600" />
               </div>
               <h3 class="text-2xl font-black uppercase text-gray-900 dark:text-white m-0">Le Portrait</h3>
            </div>
            <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 italic">
              "{{ candidate.biography }}"
            </p>
          </div>
          <div v-else class="text-center py-12">
            <UIcon name="i-heroicons-user-circle" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Le portrait de {{ candidate.first_name }} {{ candidate.last_name }} n'est pas disponible pour le moment.</p>
          </div>
        </UCard>
      </section>

      <!-- Programme Section -->
      <section :id="items[1].id" class="scroll-mt-40">
        <UCard :ui="{ body: { padding: 'p-0' } }" class="overflow-hidden border-t-4 border-t-primary-500">
          <div class="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div class="flex items-center gap-3">
               <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                 <UIcon :name="items[1].icon" class="h-6 w-6 text-primary-600" />
               </div>
               <h3 class="text-2xl font-black uppercase text-gray-900 dark:text-white m-0">Programme Électoral</h3>
            </div>
          </div>

          <div v-if="candidate.documents" class="p-4 md:p-8">
            <div v-if="candidate.documents.file" class="space-y-6">

              <!-- PDF Viewer Integration -->
              <ClientOnly>
                <div class="rounded-2xl border dark:border-gray-800 overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-900">
                  <PdfViewer
                    :source="getAssetUrl(candidate.documents.file, candidate.documents.slug)"
                    :download-name="`${candidate.documents.slug}.pdf`"
                  />
                </div>
              </ClientOnly>
            </div>
          </div>
          <div v-else class="text-center py-20 flex flex-col items-center justify-center space-y-4">
            <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full">
              <UIcon name="i-heroicons-document-text" class="h-12 w-12 text-orange-500" />
            </div>
            <h3 class="text-2xl font-black uppercase tracking-tight">Programme Non Disponible</h3>
            <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Le programme détaillé de {{ candidate.first_name }} {{ candidate.last_name }} n'est pas disponible pour le moment.
            </p>
          </div>
        </UCard>
      </section>

      <!-- Vidéos Section -->
      <section :id="items[2].id" class="scroll-mt-40">
        <UCard :ui="{ body: { padding: 'p-8' } }" class="border-t-4 border-t-primary-500">
          <div class="flex items-center gap-3 mb-8">
             <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
               <UIcon :name="items[2].icon" class="h-6 w-6 text-primary-600" />
             </div>
             <h3 class="text-2xl font-black uppercase text-gray-900 dark:text-white m-0">Vidéos de Campagne</h3>
          </div>

          <div v-if="videosLoading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <USkeleton v-for="i in 2" :key="i" class="h-64 w-full rounded-2xl" />
          </div>
          <div v-else-if="videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="video in videos" :key="video.id" class="group space-y-4">
              <div class="aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-100 dark:border-gray-800 transition-transform duration-500 group-hover:scale-[1.02]">
                <iframe
                  v-if="getYoutubeEmbedUrl(video.url_youtube)"
                  :src="getYoutubeEmbedUrl(video.url_youtube)"
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div class="text-center p-4">
                    <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p class="text-xs text-gray-500">URL vidéo invalide</p>
                  </div>
                </div>
              </div>
              <div class="px-2">
                <p v-if="video.title" class="font-bold text-gray-900 dark:text-white line-clamp-1 italic">"{{ video.title }}"</p>
                <p v-if="video.date" class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Diffusé le {{ formatDate(video.date) }}
                </p>
              </div>
            </div>
          </div>
          <div v-else-if="!videosLoading" class="text-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
            <UIcon name="i-heroicons-video-camera-slash" class="h-16 w-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
            <p class="text-gray-500 font-medium">Aucune vidéo de campagne de {{ candidate.first_name }} {{ candidate.last_name }} pour le moment.</p>
          </div>
        </UCard>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior specifically for this component */
.scroll-mt-40 {
  scroll-margin-top: 180px;
}

@media (max-width: 768px) {
  .scroll-mt-40 {
    scroll-margin-top: 140px;
  }
}
</style>
