<script setup lang="ts">
import { useElectionDocuments } from '~/composables/elections/dashboard/useElectionDocuments';

const props = defineProps<{
  electionId: string;
  electionName?: string;
}>();

const { documents, loading, error } = useElectionDocuments(computed(() => props.electionId));
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
      <p class="text-sm text-gray-400">Recherche des documents...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 text-red-500 mx-auto mb-2" />
      <p class="text-red-600 dark:text-red-400 font-bold">Une erreur est survenue lors de la récupération des documents.</p>
    </div>

    <div v-else-if="!documents || documents.length === 0" class="text-center py-20 bg-slate-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
      <UIcon name="i-heroicons-document-magnifying-glass" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 font-bold">Aucun document spécifique n'est encore rattaché à ce scrutin.</p>
      <p class="text-xs text-gray-400 mt-2">Consultez la bibliothèque complète pour les textes généraux.</p>
      <UButton to="/elections-senegal/legislation" class="mt-6 rounded-full" color="black" variant="soft">
        Toute la législation
      </UButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="doc in documents" :key="doc.id" 
           class="group bg-white dark:bg-gray-800 p-5 rounded-3xl border dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-start gap-4">
          <div class="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-2xl text-primary-600 dark:text-primary-400 shrink-0 group-hover:scale-110 transition-transform">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
          </div>
          <div class="space-y-1 overflow-hidden">
            <h4 class="font-black text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
              {{ doc.title }}
            </h4>
            <div class="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span>{{ doc.publish_date ? new Date(doc.publish_date).toLocaleDateString() : 'Date inconnue' }}</span>
              <span class="h-1 w-1 rounded-full bg-gray-300"></span>
              <span class="text-primary-500">{{ doc.type }}</span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex items-center justify-between">
          <NuxtLink :to="`/documents/${doc.id}/${doc.slug}`" class="text-xs font-black text-primary-600 hover:underline flex items-center">
            Consulter
            <UIcon name="i-heroicons-arrow-right" class="ml-1 w-3 h-3" />
          </NuxtLink>
          
          <div v-if="doc.file" class="flex gap-2">
            <UButton 
              :to="`https://vie-publique.sn/assets/${typeof doc.file === 'string' ? doc.file : (doc.file as any).id}`"
              target="_blank"
              icon="i-heroicons-arrow-down-tray"
              size="xs"
              variant="ghost"
              color="gray"
              class="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
