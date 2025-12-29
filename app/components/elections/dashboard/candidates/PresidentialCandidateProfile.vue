<script setup lang="ts">
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';
import type { Candidate } from '~~/types/candidate';

interface Props {
  candidate: Candidate;
  coalitionName?: string;
}

const props = defineProps<Props>();

const { getCmsAsset } = useElectoralFormatting();
</script>

<template>
  <div class="space-y-6">
    <UCard class="overflow-hidden shadow-xl" :ui="{ body: { padding: 'p-0' } }">
      <div class="grid md:grid-cols-2 gap-0">
        <!-- Photo du candidat -->
        <div class="relative aspect-square md:aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-900">
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
        <div class="p-8 space-y-6">
          <div>
            <p class="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Candidat Présidentiel
            </p>
            <h2 class="text-4xl font-black text-gray-900 dark:text-white uppercase leading-tight">
              {{ candidate.first_name }}<br />{{ candidate.last_name }}
            </h2>
          </div>

          <div class="space-y-4">
            <div v-if="candidate.profession" class="flex items-start gap-3">
              <UIcon name="i-heroicons-briefcase" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Profession</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ candidate.profession }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-flag" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coalition</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ coalitionName }}</p>
              </div>
            </div>

            <div v-if="candidate.voter_number" class="flex items-start gap-3">
              <UIcon name="i-heroicons-identification" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">N° Électeur</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ candidate.voter_number }}</p>
              </div>
            </div>

            <div v-if="candidate.biography" class="flex items-start gap-3 pt-4 border-t dark:border-gray-700">
              <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div>
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Biographie</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ candidate.biography }}</p>
              </div>
            </div>

            <!-- Réseaux sociaux -->
            <div v-if="candidate.facebook || candidate.twitter" class="flex items-start gap-3 pt-4 border-t dark:border-gray-700">
              <UIcon name="i-heroicons-share" class="h-5 w-5 text-primary-500 mt-0.5" />
              <div class="w-full">
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Réseaux Sociaux</p>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-if="candidate.facebook"
                    icon="i-heroicons-link"
                    color="blue"
                    variant="soft"
                    size="sm"
                    :to="candidate.facebook"
                    target="_blank"
                    external
                  >
                    Facebook
                  </UButton>
                  <UButton
                    v-if="candidate.twitter"
                    icon="i-heroicons-link"
                    color="gray"
                    variant="soft"
                    size="sm"
                    :to="candidate.twitter"
                    target="_blank"
                    external
                  >
                    Twitter/X
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
