<!-- pages/assemblee-nationale/groupes/[id]/[name].vue -->
<template>
  <div>
    <!-- Hero section -->
    <div class="relative h-40 bg-gray-900">
      <div class="absolute inset-0">
        <img
          src="/images/menu/assemblee-nationale-1.jpg"
          alt="Hémicycle de l'Assemblée nationale"
          class="h-full w-full object-cover opacity-50"
        />
      </div>

      <div class="absolute left-4 top-4">
        <UBreadcrumb
          class="mb-2 mt-2 text-white"
          :links="[
            { label: '15e législature', to: '/assemblee-nationale' },
            { label: 'Groupes', to: '/assemblee-nationale/groupes' },
          ]"
        >
          <template #divider>
            <span class="h-0.5 w-2 rounded-full bg-white dark:bg-gray-700" />
          </template>
          <template #default="{ link, isActive, index }">
            <div class="truncate text-white">
              {{ link.label }}
            </div>
          </template>
        </UBreadcrumb>
      </div>
    </div>

    <!-- Message d'erreur -->
    <UContainer v-if="error" class="relative -mt-24">
      <UAlert
        title="Erreur de chargement"
        description="Impossible de charger les informations du groupe parlementaire"
        color="red"
      >
        <template #description>
          {{ error }}
          <UButton
            label="Réessayer"
            color="red"
            variant="ghost"
            class="mt-4"
            @click="fetchAssemblyGroupById(groupId)"
          />
        </template>
      </UAlert>
    </UContainer>

    <!-- Contenu principal -->
    <UContainer v-else class="relative -mt-24 px-2">
      <div class="flex flex-col gap-2 lg:flex-row">
        <!-- Sidebar -->
        <div class="lg:w-64">
          <div class="sticky top-8">
            <!-- Squelette pendant le chargement -->
            <div
              v-if="loading"
              class="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <div class="p-6">
                <div class="flex flex-col items-center">
                  <USkeleton class="mb-6 h-32 w-32 rounded-lg" />
                  <USkeleton class="mb-6 h-8 w-48" />

                  <div class="w-full space-y-4">
                    <div v-for="i in 3" :key="i" class="flex justify-between">
                      <USkeleton class="h-5 w-24" />
                      <USkeleton class="h-5 w-32" />
                    </div>
                  </div>

                  <USkeleton class="mt-6 h-10 w-full" />
                </div>
              </div>
              <USkeleton class="h-12 w-full" />
            </div>

            <!-- Contenu réel -->
            <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
              <div class="p-2">
                <div class="flex flex-col items-center">
                  <!-- Logo -->
                  <div class="mb-2 overflow-hidden rounded-lg bg-white">
                    <UAvatar
                      v-if="groupById?.logo"
                      :src="$directusImageUrl(groupById.logo, '100')"
                      :alt="`Logo ${groupById?.name}`"
                      class="h-full w-full object-contain"
                      size="2xl"
                      loading="lazy"
                      fetchpriority="high"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center bg-gray-100"
                    >
                      <UIcon
                        name="i-heroicons-user-group"
                        class="h-16 w-16 text-gray-400"
                      />
                    </div>
                  </div>

                  <!-- Nom et infos -->
                  <!-- <div class="text-sm text-gray-600">Groupe</div> -->
                  <h1 class="mb-4 text-2xl font-bold">{{ groupById?.name }}</h1>
                  <div class="w-full space-y-2 text-center">
                    <div class="flex flex-col text-sm">
                      <span class="text-gray-600">Création</span>
                      <span class="font-medium">
                        {{
                          groupById?.creation_date
                            ? formatDate(groupById.creation_date)
                            : "N/A"
                        }}
                      </span>
                    </div>
                    <div class="flex flex-col text-sm">
                      <span class="text-gray-600">Président(e) </span>
                      <span class="truncate font-medium">
                        {{ groupById?.president?.first_name }}
                        {{ groupById?.president?.last_name }}
                      </span>
                    </div>
                    <div
                      v-if="groupById?.vice_president"
                      class="flex flex-col text-sm"
                    >
                      <span class="text-gray-600">Vice-président(e)</span>
                      <span class="truncate font-medium">
                        {{ groupById.vice_president.first_name }}
                        {{ groupById?.vice_president?.last_name }}
                      </span>
                    </div>
                  </div>

                  <!-- <UButton
                    :to="`/assemblee-nationale/groupes/${groupById?.id}/membres`"
                    class="mt-6 w-full"
                    color="primary"
                    variant="soft"
                  >
                    Voir les {{ groupById?.members?.length }} membres
                  </UButton> -->
                </div>
              </div>

              <div
                v-if="groupById?.status === 'active'"
                class="w-full bg-emerald-500 p-4 text-center font-medium text-white"
              >
                EN ACTIVITÉ
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="flex-1">
          <!-- Squelette pendant le chargement -->
          <div
            v-if="loadingGroupsById"
            class="rounded-lg bg-white p-6 shadow-sm"
          >
            <USkeleton class="mb-4 h-8 w-64" />
            <USkeleton class="mb-3 h-4 w-full" />
            <USkeleton class="mb-3 h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>

          <!-- Contenu réel -->
          <div v-else class="rounded-lg bg-white shadow-sm">
            <div class="p-4">
              <h2 class="text-normal mb-2 font-semibold">
                Le groupe en quelques mots
              </h2>
              <p class="text-sm text-gray-700" v-if="groupById?.description">
                {{ groupById?.description }}
              </p>
              <p
                v-if="groupById?.president"
                class="mt-2 hidden text-sm text-gray-700"
              >
                Dirigé par {{ groupById.president.first_name }}
                {{ groupById.president.last_name }}, à ce poste depuis
                {{ formatDate(groupById.creation_date) }}.
              </p>
            </div>

            <div
              class="grid grid-cols-2 gap-2 px-2 md:grid-cols-2 lg:grid-cols-3"
            >
              <AssemblyDeputyCard2
                v-for="deputy in deputies"
                :key="deputy.id"
                :deputy="deputy"
              />
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { fetchAssemblyGroupById, groupById, loading, error } =
  useAssemblyGroups();

import { useDeputev2 } from "@/composables/parliament/useDeputev2";

const { deputies, fetchElectedDeputies } = useDeputev2();

const groupId = route.params.id as string;

// Chargement des données au montage
onMounted(async () => {
  await fetchAssemblyGroupById(groupId);
  await fetchElectedDeputies(groupId);
});

// Fonction de formatage de date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>
