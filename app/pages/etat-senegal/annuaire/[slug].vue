<script setup lang="ts">
const route = useRoute();
const slug = computed(() => route.params.slug as string);

// Charger les détails
const {
  entity,
  children,
  history,
  breadcrumb,
  pending,
  error,
  hasChildren,
  hasHistory,
  childrenByType,
} = useStateEntityDetail(slug);

// Erreur 404
if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Entité non trouvée',
  });
}

// SEO dynamique
useSeoMeta({
  title: () => entity.value?.name || 'Entité publique',
  description: () =>
    entity.value?.description ||
    `Détails de l'entité publique ${entity.value?.name} - Organisation de l'État sénégalais`,
  ogTitle: () => entity.value?.name,
  ogDescription: () => entity.value?.description,
});

useHead({
  title: () => entity.value?.name || 'Entité publique',
});

// Formater les dates
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Grouper les types d'événements
const eventTypeLabels: Record<string, string> = {
  created: 'Création',
  renamed: 'Renommée',
  merged: 'Fusion',
  dissolved: 'Dissolution',
  moved: 'Déplacement',
  other: 'Autre',
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading -->
    <div v-if="pending" class="py-12 text-center">
      <UIcon name="i-heroicons-arrow-path" class="text-primary-600 h-8 w-8 animate-spin" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>

    <div v-else-if="entity">
      <!-- Fil d'Ariane -->
      <nav v-if="breadcrumb.length > 0" class="mb-6">
        <ol class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <NuxtLink to="/etat-senegal/annuaire" class="hover:text-primary-600">
              Annuaire
            </NuxtLink>
          </li>
          <li v-for="parent in breadcrumb" :key="parent.id" class="flex items-center gap-2">
            <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
            <NuxtLink
              :to="`/etat-senegal/annuaire/${parent.public_slug}`"
              class="hover:text-primary-600"
            >
              {{ parent.name }}
            </NuxtLink>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
            <span class="font-medium text-gray-900 dark:text-white">{{ entity.name }}</span>
          </li>
        </ol>
      </nav>

      <!-- En-tête -->
      <UCard class="mb-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="flex-1">
            <!-- Type et Statut -->
            <div class="mb-3 flex items-center gap-2">
              <StateEntityTypeBadge :type="entity.type" />
              <StateEntityStatusBadge :status="entity.status" />
            </div>

            <!-- Nom -->
            <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ entity.name }}
            </h1>

            <!-- Acronyme et nom court -->
            <div class="mb-4 flex flex-wrap gap-3 text-gray-600 dark:text-gray-400">
              <span v-if="entity.acronym" class="font-medium">{{ entity.acronym }}</span>
              <span v-if="entity.short_name && entity.short_name !== entity.name">
                {{ entity.short_name }}
              </span>
            </div>

            <!-- Description -->
            <p v-if="entity.description" class="mb-4 text-gray-700 dark:text-gray-300">
              {{ entity.description }}
            </p>

            <!-- Mission -->
            <div v-if="entity.mission" class="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 class="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">Mission</h3>
              <p class="text-sm text-blue-800 dark:text-blue-200">{{ entity.mission }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Grille principale -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Colonne principale -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Responsable -->
          <UCard v-if="entity.director_name">
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Direction</h2>
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-user-circle" class="h-12 w-12 text-gray-400" />
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ entity.director_name }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ entity.director_title || 'Responsable' }}
                </div>
              </div>
            </div>
          </UCard>

          <!-- Entités rattachées -->
          <UCard v-if="hasChildren">
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Entités rattachées ({{ children.length }})
            </h2>

            <div v-for="(typeChildren, type) in childrenByType" :key="type" class="mb-6 last:mb-0">
              <h3
                class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <StateEntityTypeBadge :type="type as any" />
                <span>({{ typeChildren.length }})</span>
              </h3>
              <ul class="space-y-2">
                <li v-for="child in typeChildren" :key="child.id">
                  <NuxtLink
                    :to="`/etat-senegal/annuaire/${child.public_slug}`"
                    class="block rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ child.name }}
                      <span v-if="child.acronym" class="text-gray-500">({{ child.acronym }})</span>
                    </div>
                    <div
                      v-if="child.director_name"
                      class="mt-1 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {{ child.director_title || 'Responsable' }}: {{ child.director_name }}
                    </div>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </UCard>

          <!-- Historique -->
          <UCard v-if="hasHistory">
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Historique</h2>
            <div class="space-y-4">
              <div
                v-for="event in history"
                :key="event.id"
                class="border-primary-500 border-l-4 py-2 pl-4"
              >
                <div class="mb-1 flex items-center gap-2">
                  <UBadge color="primary" variant="subtle" size="xs">
                    {{ eventTypeLabels[event.event_type] || event.event_type }}
                  </UBadge>
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(event.event_date) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ event.description }}</p>
                <div
                  v-if="event.decree_number"
                  class="mt-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ event.decree_number }}
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <!-- Budget -->
          <UCard v-if="entity.public_slug">
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Budget</h2>
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Consultez le budget détaillé, l'évolution par année et la répartition par programmes.
            </p>
            <UButton
              :to="`/budget-senegal/${entity.public_slug}`"
              color="primary"
              icon="i-heroicons-chart-bar"
              block
            >
              Voir le budget détaillé
            </UButton>
          </UCard>

          <!-- Coordonnées -->
          <UCard>
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Coordonnées</h2>
            <div class="space-y-3">
              <div v-if="entity.address" class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-map-pin"
                  class="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ entity.address }}</span>
              </div>
              <div v-if="entity.phone" class="flex items-center gap-3">
                <UIcon name="i-heroicons-phone" class="h-5 w-5 text-gray-400" />
                <a :href="`tel:${entity.phone}`" class="text-primary-600 text-sm hover:underline">
                  {{ entity.phone }}
                </a>
              </div>
              <div v-if="entity.email" class="flex items-center gap-3">
                <UIcon name="i-heroicons-envelope" class="h-5 w-5 text-gray-400" />
                <a
                  :href="`mailto:${entity.email}`"
                  class="text-primary-600 text-sm hover:underline"
                >
                  {{ entity.email }}
                </a>
              </div>
              <div v-if="entity.website" class="flex items-center gap-3">
                <UIcon name="i-heroicons-globe-alt" class="h-5 w-5 text-gray-400" />
                <a
                  :href="entity.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 text-sm hover:underline"
                >
                  Site web
                </a>
              </div>
            </div>
          </UCard>

          <!-- Informations légales -->
          <UCard v-if="entity.legal_reference || entity.decree_number">
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Références légales</h2>
            <div class="space-y-3 text-sm">
              <div v-if="entity.decree_number">
                <span class="font-medium text-gray-700 dark:text-gray-300">Décret:</span>
                <span class="ml-2 text-gray-600 dark:text-gray-400">{{
                  entity.decree_number
                }}</span>
              </div>
              <div v-if="entity.decree_date">
                <span class="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                <span class="ml-2 text-gray-600 dark:text-gray-400">{{
                  formatDate(entity.decree_date)
                }}</span>
              </div>
              <div v-if="entity.legal_reference">
                <span class="font-medium text-gray-700 dark:text-gray-300">Référence:</span>
                <span class="ml-2 text-gray-600 dark:text-gray-400">{{
                  entity.legal_reference
                }}</span>
              </div>
              <div v-if="entity.created_at">
                <span class="font-medium text-gray-700 dark:text-gray-300">Date de création:</span>
                <span class="ml-2 text-gray-600 dark:text-gray-400">{{
                  formatDate(entity.created_at)
                }}</span>
              </div>
              <div v-if="entity.dissolved_at">
                <span class="font-medium text-gray-700 dark:text-gray-300"
                  >Date de dissolution:</span
                >
                <span class="ml-2 text-red-600 dark:text-red-400">{{
                  formatDate(entity.dissolved_at)
                }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
