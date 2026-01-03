<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import { useCoalitionVideos } from '~/composables/elections/dashboard/useCoalitionVideos';
import type { Candidate } from '~~/types/candidate';

interface Props {
  candidate: Candidate;
  coalitionName?: string;
  coalitionId?: string | number | null;
}

const props = defineProps<Props>();

const { getCmsAsset, formatDate, calculateAge, getYoutubeEmbedUrl } = useElectoralFormatting();

const activeTab = ref(0);

const items = [
  { label: 'Portrait', icon: 'i-heroicons-user-circle', slot: 'portrait' },
  { label: 'Programme', icon: 'i-heroicons-document-text', slot: 'programme' },
  { label: 'Vidéos de Campagne', icon: 'i-heroicons-video-camera', slot: 'videos' }
]

const { videos, loading: videosLoading } = useCoalitionVideos(computed(() => props.coalitionId));

const age = computed(() => calculateAge(props.candidate.birthdate || null));
</script>

<template>
  <div>
    <!-- Card Info -->
    <UCard class="overflow-hidden shadow-xl mb-6" :ui="{ body: { padding: 'p-0' } }">
      <div class="grid md:grid-cols-5 gap-0">
        <!-- Photo du candidat -->
        <div class="md:col-span-2 relative aspect-square md:aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-800">
          <img
            v-if="candidate.photo"
            :src="getCmsAsset(candidate.photo)"
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

    <!-- Sticky Tabs -->
    <div class="sticky top-[132px] z-40 bg-gray-50/90 backdrop-blur-md dark:bg-gray-950/90 py-4 -mx-4 px-4">
      <div class="bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 flex gap-1">
        <button
          v-for="(item, index) in items"
          :key="index"
          @click="activeTab = index"
          class="flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200"
          :class="activeTab === index 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'"
        >
          <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
          <!-- Sur mobile: texte visible uniquement pour le tab actif -->
          <!-- Sur desktop: texte toujours visible -->
          <span 
            class="truncate transition-all duration-200"
            :class="activeTab === index ? 'inline' : 'hidden sm:inline'"
          >
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="mt-4">
      <!-- Portrait -->
      <UCard v-show="activeTab === 0">
        <div v-if="candidate.biography" class="prose prose-sm dark:prose-invert max-w-none">
          <h3 class="text-xl font-black uppercase mb-4 text-primary-600">Le Portrait</h3>
          <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{{ candidate.biography }}</p>
        </div>
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-user-circle" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">Aucun portrait disponible pour ce candidat.</p>
        </div>
      </UCard>

      <!-- Programme -->
      <UCard v-show="activeTab === 1">
        <div class="text-center py-20 flex flex-col items-center justify-center space-y-4">
          <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full">
            <UIcon name="i-heroicons-wrench-screwdriver" class="h-12 w-12 text-orange-500" />
          </div>
          <h3 class="text-2xl font-black uppercase tracking-tight">Programme en construction</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Le programme détaillé de ce candidat sera disponible très prochainement.
          </p>
        </div>
      </UCard>

      <!-- Videos -->
      <UCard v-show="activeTab === 2">
        <div v-if="videosLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <USkeleton v-for="i in 2" :key="i" class="h-48 w-full rounded-xl" />
        </div>
        <div v-else-if="videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="video in videos" :key="video.id" class="space-y-2">
            <div class="aspect-video rounded-xl overflow-hidden shadow-lg border dark:border-gray-800">
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
                  <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p class="text-xs text-gray-500">URL vidéo invalide</p>
                </div>
              </div>
            </div>
            <p v-if="video.date" class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
              Publié le {{ formatDate(video.date) }}
            </p>
          </div>
        </div>
        <div v-else-if="!videosLoading" class="text-center py-20">
          <UIcon name="i-heroicons-video-camera" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">Aucune vidéo de campagne disponible.</p>
        </div>
      </UCard>
    </div>
  </div>
</template>
