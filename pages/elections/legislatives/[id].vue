<script setup lang="ts">
import type { Candidate } from "~/types/candidate";

const route = useRoute();
const coalitionId = route.params.id as string;

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const links = [{ label: "Coalitions", to: "/elections/legislatives" }];

const {
  data: coalition,
  pending: loadingCoalition,
  error: errorCoalition,
} = useCoalitions(coalitionId);

const { data: lists, pending: loading, error } = useElectoralLists(coalitionId);

const listTypeFilter = ref("national");

const searchQuery = ref("");

const filteredLists = computed(() => {
  if (!lists.value) return [];
  if (!searchQuery.value) {
    return lists.value.filter((list) => list.type === listTypeFilter.value);
  } else {
    return lists.value;
  }
});

const filteredCandidates = computed(() => {
  if (!lists.value) return [];

  const search = searchQuery.value.toLowerCase();

  if (!search) {
    return filteredLists.value;
  }

  return filteredLists.value
    .map((list) => {
      const matchingCandidates = list.candidates.filter((candidate) =>
        `${candidate.first_name} ${candidate.last_name}`
          .toLowerCase()
          .includes(search),
      );
      return {
        ...list,
        candidates: matchingCandidates,
      };
    })
    .filter((list) => list.candidates.length > 0);
});

const listFiltersOptions = [
  { label: "Nationale", value: "national" },
  { label: "Départements", value: "departmental" },
  { label: "Diaspora", value: "diaspora" },
];

const viewType = ref("");

const viewOptions = [
  { label: "Bulletin", value: "bulletin" },
  // { label: "Vidéos", value: "videos" },
];

watch(searchQuery, () => {
  if (!searchQuery.value) {
    listTypeFilter.value = "national";
  } else {
    viewType.value = "";
    listTypeFilter.value = "";
  }
});

const selectFilter = (option: string) => {
  listTypeFilter.value = option;
  viewType.value = "";
};

const selectView = (option: string) => {
  viewType.value = option;
  listTypeFilter.value = "";
};

const selectedCandidat = ref<Candidate | null>(null);
const isModalOpen = ref(false);

function openModal(minister: Candidate) {
  selectedCandidat.value = minister;
  isModalOpen.value = true;
}
</script>

<template>
  <div class="container mx-auto px-4">
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <div class="mb-2 flex items-center">
      <div
        v-if="!loadingCoalition && coalition"
        class="h-12 w-12 flex-shrink-0"
      >
        <UAvatar
          v-if="coalition.logo"
          :src="$directusImageUrl(coalition.logo, '50')"
          :alt="coalition.name"
          size="lg"
          loading="lazy"
        />
        <UAvatar
          v-else
          :text="coalition.list_order"
          size="lg"
          class="font-bold"
        />
      </div>
      <div class="ml-4 flex-grow">
        <h1 class="text-xl font-bold">
          <span v-if="!loadingCoalition && coalition">{{
            coalition.name
          }}</span>
          <span v-else>coalition N°{{ coalitionId }}</span>
        </h1>
      </div>
    </div>

    <UCard v-if="loading">
      <USkeleton class="h-32" />
    </UCard>

    <UAlert v-else-if="errorCoalition || error" type="danger">
      {{ errorCoalition || error }}
    </UAlert>

    <template v-else-if="lists">
      <!-- Modal pour afficher les détails du membre -->
      <UModal v-model="isModalOpen">
        <UCard
          v-if="selectedCandidat"
          :ui="{
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          }"
        >
          <template #header>
            <div class="flex items-center justify-center">
              <img
                v-if="selectedCandidat.photo"
                :src="$directusImageUrl(selectedCandidat.photo, '50')"
                :alt="
                  selectedCandidat.first_name + ' ' + selectedCandidat.last_name
                "
                class="h-full w-full object-cover"
                loading="lazy"
                fetchpriority="high"
              />
              <img
                v-else
                :src="
                  selectedCandidat.gender === 'M'
                    ? '/adobe-default-profil-man.jpg'
                    : '/adobe-default-profil-women.jpg'
                "
                alt="Default image"
                class="h-full w-full object-cover"
              />
            </div>
          </template>

          <div class="text-center">
            <h2 class="text-xl font-semibold">
              <span class="capitalize">{{
                selectedCandidat.first_name.toLowerCase()
              }}</span>
              {{ selectedCandidat.last_name.toUpperCase() }}
            </h2>
            <div v-if="selectedCandidat.profession" class="mt-1">
              <p class="text-sm font-semibold capitalize text-green-700">
                {{ selectedCandidat.profession.toLowerCase() }}
              </p>
            </div>
            <div v-if="selectedCandidat.biography" class="mt-1">
              <p class="text-sm">
                {{ selectedCandidat.biography }}
              </p>
            </div>
          </div>

          <template #footer>
            <div class="p-0 text-right">
              <UButton color="white" @click="isModalOpen = false"
                >Fermer</UButton
              >
            </div>
          </template>
        </UCard>
      </UModal>

      <UInput
        v-model="searchQuery"
        size="lg"
        placeholder="Rechercher un candidat"
        icon="i-heroicons-magnifying-glass"
        class="input custom-shadow mb-3 w-full"
      />

      <div v-if="!searchQuery" class="my-3 w-full text-center">
        <UButton
          v-for="option in listFiltersOptions"
          :key="option.value"
          class="custom-shadow mb-1 ml-1"
          :color="listTypeFilter === option.value ? 'white' : 'gray'"
          :class="
            listTypeFilter === option.value
              ? 'border-b border-green-700 text-green-700'
              : ''
          "
          @click="selectFilter(option.value)"
          size="lg"
        >
          {{ option.label }}
        </UButton>
        <UButton
          v-for="option in viewOptions"
          :key="option.value"
          class="custom-shadow mb-1 ml-1"
          :color="viewType === option.value ? 'white' : 'gray'"
          :class="viewType === option.value ? 'text-green-700' : ''"
          @click="selectView(option.value)"
          size="lg"
        >
          {{ option.label }}
        </UButton>
      </div>

      <!-- <USelect
        v-model="listTypeFilter"
        :options="listFiltersOptions"
        class="custom-shadow mb-3 hidden"
        icon="i-heroicons-funnel"
        size="lg"
      /> -->

      <div
        v-if="
          listTypeFilter == 'national' ||
          listTypeFilter == 'departmental' ||
          listTypeFilter == 'diaspora' ||
          searchQuery
        "
      >
        <div v-if="filteredCandidates.length > 0" class="mt-6">
          <!-- Utilisation de UAccordion pour afficher chaque liste dans un accordéon -->
          <UAccordion
            :items="filteredCandidates"
            default-open
            multiple
            color="green"
          >
            <!-- Slot pour le titre de chaque liste -->
            <!-- <UCard></UCard> -->
            <template #default="{ item, index, open }">
              <UButton
                color="gray"
                size="md"
                variant="link"
                :class="[
                  'w-full text-left dark:border-gray-700',
                  item.is_substitute
                    ? 'border-gray-600'
                    : 'text-md text-green-700',
                ]"
                :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }"
              >
                <span class="truncate font-bold">
                  {{ item.constituency?.name || "" }}
                  {{ item.is_substitute ? "Suppléants" : "Titulaires" }}
                </span>
                <!-- <span>{{ open }} {{ index }}</span> -->
                <template #trailing>
                  <UIcon
                    name="i-heroicons-chevron-right-20-solid"
                    class="ms-auto h-5 w-5 transform transition-transform duration-200"
                    :class="[open && 'rotate-90']"
                  />
                </template>
              </UButton>
            </template>

            <!-- Slot pour le contenu de chaque liste -->
            <template #item="{ item }">
              <div class="mt-2">
                <!-- Affichage des titulaires en grille -->
                <div
                  v-if="!item.is_substitute"
                  class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                >
                  <div
                    v-for="candidate in item.candidates"
                    :key="candidate.voter_number"
                    class="relative flex h-56 flex-col overflow-hidden rounded-lg shadow-lg"
                    @click="openModal(candidate)"
                  >
                    <!-- Image du candidat ou image par défaut -->
                    <img
                      v-if="candidate.photo"
                      :src="$directusImageUrl(candidate.photo, '50')"
                      :alt="candidate.first_name + ' ' + candidate.last_name"
                      class="h-full w-full object-cover"
                      loading="lazy"
                      fetchpriority="high"
                    />
                    <img
                      v-else
                      :src="
                        candidate.gender === 'M'
                          ? '/adobe-default-profil-man.jpg'
                          : '/adobe-default-profil-women.jpg'
                      "
                      alt="Default image"
                      class="h-full w-full object-cover"
                    />

                    <!-- Overlay sombre uniquement si c'est l'image par défaut -->
                    <div
                      v-if="!candidate.photo"
                      class="absolute inset-0 bg-black bg-opacity-50"
                    ></div>

                    <!-- Overlay sombre si la photo est présente -->
                    <div
                      v-if="candidate.photo"
                      class="absolute inset-0 bg-black bg-opacity-40"
                    ></div>

                    <!-- Texte superposé (Nom, prénom, profession) -->
                    <div
                      class="absolute inset-0 flex flex-col justify-end p-2 text-white"
                    >
                      <div
                        class="absolute left-2 top-2 rounded-full p-1 text-xs font-bold text-white"
                        :class="
                          item.is_substitute ? 'bg-orange-600' : 'bg-green-700'
                        "
                        style="
                          width: 30px;
                          height: 30px;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                        "
                      >
                        {{ candidate.position }}
                      </div>
                      <h4 class="font-bold capitalize">
                        {{ candidate.first_name.toLowerCase() }}
                      </h4>
                      <h3 class="font-bold tracking-wider">
                        {{ candidate.last_name.toUpperCase() }}
                      </h3>
                      <p class="text-xs lowercase">
                        {{ candidate.profession.toLowerCase() }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Tableau des suppléants -->
                <UCard v-else class="custom-shadow w-full">
                  <div
                    v-for="candidate in item.candidates"
                    :key="candidate.voter_number"
                    class="my-2"
                  >
                    <p>
                      {{ candidate.position }}.
                      <span class="capitalize text-gray-700"
                        >{{ candidate.first_name.toLowerCase() }}&nbsp</span
                      >
                      <span class="tracking-wider text-gray-700">
                        {{ candidate.last_name.toUpperCase() }}</span
                      >
                      <span class="text-sm font-normal text-gray-500">
                        &nbsp{{ candidate.profession.toLowerCase() }}
                      </span>
                    </p>

                    <UDivider class="my-2" />
                  </div>
                </UCard>
              </div>
            </template>
          </UAccordion>
        </div>

        <div v-else class="my-4 text-center text-gray-600">
          Aucune liste présentée
        </div>
      </div>

      <!-- BULLETIN -->
      <div
        v-if="viewType === 'bulletin' && !loadingCoalition && coalition"
        class="mx-auto flex w-full items-center justify-center"
      >
        <NuxtPicture
          v-if="coalition.bulletin"
          provider="directus"
          :src="coalition.bulletin"
          fit="inside"
          quality="100"
          width="100%"
          loading="lazy"
          fetchpriority="high"
        />
        <div v-else class="my-4 text-center text-gray-600">
          Bulletin non disponible
        </div>
      </div>

      <!-- VIDEOS -->
      <div
        v-if="viewType === 'videos' && !loadingCoalition && coalition"
        class="mx-auto w-full text-center"
      >
        <h2 class="mb-4 text-xl font-bold">Journal de campagne RTS</h2>

        <!-- Grille des vidéos avec une carte pour chaque vidéo -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="(video, index) in coalition.videos"
            :key="video.url_youtube"
            class="flex flex-col items-center overflow-hidden rounded-lg bg-white p-2 shadow-lg"
          >
            <!-- Titre du jour -->
            <h3 class="text-lg font-semibold text-gray-800">
              Jour {{ index + 1 }}
            </h3>
            <!-- Date de la vidéo -->
            <p class="mb-2 text-sm text-gray-500">
              <!-- {{ new Date(video.date).toLocaleDateString() }} -->
              {{ $dateformatWithDayName(video.date) }}
            </p>

            <!-- Vidéo YouTube intégrée -->
            <iframe
              :src="`${video.url_youtube.replace('watch?v=', 'embed/')}`"
              class="video h-64 w-full rounded-lg"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>

      <div v-if="viewType === 'stats'">
        <pre>stats</pre>
        <pre>Bientôt disponible</pre>
      </div>
    </template>

    <template v-else>
      <p class="text-center text-gray-500">
        Il n'y a pas de liste départementale disponible.
      </p>
    </template>
  </div>
</template>
