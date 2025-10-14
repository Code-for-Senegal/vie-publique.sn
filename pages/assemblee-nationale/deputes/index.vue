<template>
  <div>
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click="handleReturn()"
    />

    <div class="">
      <div class="container">
        <div class="prose prose-sm sm:prose my-2">
          <h1 class="">Annuaire des députés</h1>
        </div>
      </div>
    </div>

    <div class="flex flex-col mb-4">
      <p class="text-sm text-gray-600">
        {{ filteredDeputiesCount }} député{{ filteredDeputiesCount > 1 ? 's' : '' }} de la 15e législature
      </p>
    </div>

    <!-- Conteneur principal avec grid -->
    <div class="grid grid-cols-1 gap-2 lg:grid-cols-3">
      <!-- Colonne des filtres (1/4 en desktop) -->
      <div class="lg:col-span-1">
        <!-- Filtres -->
        <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="flex flex-col gap-4">
            <!-- Champ de recherche -->
            <div>
              <UInput
                v-model="searchQuery"
                placeholder="Rechercher un député..."
                icon="i-heroicons-magnifying-glass"
                class="custom-shadow max-w-md"
                clearable
              />
            </div>

            <!-- Filtre par genre -->
            <div>
              <USelect
                v-model="selectedGender"
                :options="genderOptions"
                placeholder="Filtrer par genre"
                class="custom-shadow"
                clearable
              />
            </div>

            <!-- Tag groups -->
            <div class="flex flex-col gap-2">
              <!-- Liste verticale en desktop -->
              <div class="hidden lg:flex lg:flex-col">
                <div
                  v-for="group in groupOptions"
                  :key="group.value"
                  class="group flex cursor-pointer items-center gap-2"
                  @click="toggleGroup(group.value)"
                >
                  <!-- Indicateur à gauche -->
                  <div
                    class="h-4 w-4 rounded-full transition-colors duration-200"
                    :class="{
                      'bg-gray-100': filterValue !== group.value,
                    }"
                    :style="{
                      backgroundColor:
                        filterValue === group.value
                          ? getGroupColor(group.value)
                          : '',
                    }"
                  ></div>

                  <!-- Nom du groupe -->
                  <span
                    class="px-4 py-2 text-sm transition-colors duration-200 hover:font-semibold hover:text-gray-600"
                    :class="{
                      'font-medium': filterValue === group.value,
                    }"
                  >
                    {{ group.label }}
                  </span>
                </div>
              </div>

              <!-- Tags en mobile -->
              <div class="flex flex-wrap gap-2 lg:hidden">
                <button
                  v-for="group in groupOptions"
                  :key="group.value"
                  class="rounded-full px-4 py-1 text-[0.8rem] transition-colors duration-200"
                  :class="{
                    'bg-gray-100 text-gray-800 hover:bg-gray-200':
                      filterValue !== group.value,
                    'text-white': filterValue === group.value,
                  }"
                  :style="{
                    backgroundColor:
                      filterValue === group.value
                        ? getGroupColor(group.value)
                        : '',
                  }"
                  @click="toggleGroup(group.value)"
                >
                  {{ group.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne de la liste des députés (3/4 en desktop) -->
      <div class="lg:col-span-2">
        <!-- Loading State -->
        <template v-if="loading">
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <USkeleton v-for="i in 6" :key="i" class="h-48" />
          </div>
        </template>

        <!-- Error State -->
        <UAlert
          v-else-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          class="mb-4"
        >
          {{ error }}
        </UAlert>

        <!-- Empty State -->
        <div v-else-if="filteredDeputies.length === 0" class="py-12 text-center">
          <UIcon name="i-heroicons-user-group" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">Aucun député trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            Essayez de modifier vos critères de recherche ou filtres.
          </p>
        </div>

        <!-- Content -->
        <div v-else>
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div
              v-for="deputy in filteredDeputies"
              :key="deputy.id"
              class="relative flex h-56 flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <NuxtLink
                :to="`/assemblee-nationale/deputes/${deputy.id}/${$getSlugifyUrlPath(deputy.first_name + ' ' + deputy.last_name)}`"
                class="block"
              >
                <!-- Image du candidat ou image par défaut -->
                <img
                  v-if="deputy.photo"
                  :src="useCmsImage(deputy.photo, '50')"
                  :alt="deputy.first_name + ' ' + deputy.last_name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <img
                  v-else
                  :src="
                    deputy.gender === 'M'
                      ? '/adobe-default-profil-man.jpg'
                      : '/adobe-default-profil-women.jpg'
                  "
                  alt="Default image"
                  class="h-full w-full object-cover"
                />

                <!-- Overlay sombre uniquement si c'est l'image par défaut -->
                <div
                  v-if="!deputy.photo"
                  class="absolute inset-0 bg-black bg-opacity-70"
                ></div>

                <!-- Overlay sombre si la photo est présente -->
                <div
                  v-if="deputy.photo"
                  class="absolute inset-0 bg-black bg-opacity-40"
                ></div>

                <!-- Texte superposé (Nom, prénom, profession) -->
                <div
                  class="absolute inset-0 flex flex-col justify-end p-2 text-white"
                >
                  <h4 class="truncate text-sm font-bold capitalize">
                    {{ deputy.first_name.toLowerCase() }}
                    <span class="font-bold tracking-wider">
                      {{ deputy.last_name.toUpperCase() }}
                    </span>
                  </h4>

                  <p class="mb-1 truncate text-xs lowercase">
                    {{ $getAgeFromBirthdate(deputy.birthdate) }} ans |
                    {{ deputy.profession.toLowerCase() }}
                  </p>
                  <h4
                    v-if="deputy.electoral_list?.coalition"
                    class="left-2 top-2 p-1 text-xs font-bold text-white"
                    :style="{
                      backgroundColor: deputy.electoral_list.coalition.color,
                    }"
                  >
                    {{ deputy.electoral_list.coalition.name }}
                    <span v-if="deputy.electoral_list.constituency">
                      {{ deputy.electoral_list.constituency.name }}
                    </span>
                  </h4>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton retour en haut -->
    <UButton
      v-show="showButton"
      :ui="{ rounded: 'rounded-full' }"
      color="gray"
      icon="i-heroicons-arrow-up-circle"
      @click="scrollToTop"
    >
      Revenir en haut
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();

const title = "Députés de l'Assemblée Nationale du Sénégal | 15e législature";
const description = "Retrouvez tous les 165 députés en activité de l'Assemblée nationale du Sénégal. Liste complète de la 15e législature avec résultats de vote et analyses.";
const url = `${siteUrl}/assemblee-nationale/deputes`;
const image = `${siteUrl}/images/vpsn-share-elections.png`;

const deputiesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "image": image,
  "isPartOf": {
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
  },
  "about": [
    {
      "@type": "GovernmentOrganization",
      "name": "Assemblée nationale du Sénégal",
      "description": "Parlement du Sénégal",
    },
    {
      "@type": "Thing",
      "name": "15e législature du Sénégal",
    },
  ],
  "mainEntity": {
    "@type": "ItemList",
    "name": "Députés de la 15e législature",
    "description": "Liste des 165 députés élus de l'Assemblée nationale du Sénégal",
    "numberOfItems": 165,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": siteUrl,
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Assemblée nationale",
      "item": `${siteUrl}/assemblee-nationale`,
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Députés",
      "item": url,
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LegislativeBuilding",
  "name": "Assemblée nationale du Sénégal",
  "url": `${siteUrl}/assemblee-nationale`,
  "description": "Parlement unicaméral de la République du Sénégal",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenue Léopold Sédar Senghor",
    "addressLocality": "Dakar",
    "addressCountry": "SN",
  },
  "governmentType": "Legislature",
  "numberOfMembers": 165,
  "politicalSystem": "Démocratie parlementaire",
  "foundingDate": "1960",
  "legislativeTerm": "15e législature",
};

const governmentSchema = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  "name": "Assemblée nationale du Sénégal",
  "url": url,
  "description": "Institution législative de la République du Sénégal composée de 165 députés",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SN",
    "addressLocality": "Dakar",
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal",
  },
  "parentOrganization": {
    "@type": "GovernmentOrganization",
    "name": "République du Sénégal",
  },
};

// SEO Meta Tags
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    "députés Sénégal",
    "Assemblée nationale Sénégal",
    "15e législature",
    "parlement sénégalais",
    "élus nationaux Sénégal",
    "représentants peuple sénégalais",
    "parlementaires Sénégal",
    "législateurs Sénégal",
  ].join(", "),
});

// Head Configuration
useHead({
  htmlAttrs: { lang: "fr-SN" },
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "theme-color", content: themeColor },
    { name: "author", content: siteName },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { name: "robots", content: "index, follow" },
    { name: "geo.region", content: "SN" },
    { name: "geo.placename", content: "Dakar" },
    { name: "geo.position", content: "14.7645042;-17.3660286" },
    { name: "ICBM", content: "14.7645042, -17.3660286" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(deputiesSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(organizationSchema),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(governmentSchema),
    },
  ],
});

const route = useRoute();
const router = useRouter();

// ✅ Nouvelle architecture SSR avec synchronisation URL
const {
  deputies,
  loading,
  error,
  totalItems,
  searchQuery,
  filterValue,
  setFilterValue,
} = useAssemblyDeputies();

// Récupération des groupes pour les filtres
const { groups: assemblyGroups } = useAssemblyGroups();

// Filtre par genre avec synchronisation URL
const selectedGender = ref((route.query.gender as string) || null);

// Synchroniser le filtre genre avec l'URL
watch(selectedGender, (newGender) => {
  const query = { ...route.query };
  if (newGender) {
    query.gender = newGender;
  } else {
    delete query.gender;
  }
  router.replace({ query });
});

// Options pour le filtre de genre
const genderOptions = [
  { label: "Homme", value: "M" },
  { label: "Femme", value: "F" },
];

// Filtrer les députés par genre côté client
const filteredDeputies = computed(() => {
  if (!selectedGender.value) return deputies.value;
  return deputies.value.filter((deputy) => deputy.gender === selectedGender.value);
});

const filteredDeputiesCount = computed(() => filteredDeputies.value.length);

// Options pour le filtre par groupe
const groupOptions = computed(() => {
  const options = [
    { value: "all", label: "Tous les groupes" },
  ];

  if (assemblyGroups.value) {
    assemblyGroups.value.forEach((group) => {
      options.push({
        value: group.id,
        label: group.name,
        color: group.color,
      });
    });
  }

  return options;
});

// Fonction pour basculer la sélection d'un groupe
const toggleGroup = (groupId) => {
  if (filterValue.value === groupId) {
    setFilterValue("all");
  } else {
    setFilterValue(groupId);
  }
};

// Fonction pour obtenir la couleur du groupe
const getGroupColor = (groupId) => {
  if (groupId === "all") return "#gray";
  const group = groupOptions.value.find((g) => g.value === groupId);
  return group?.color || "#gray";
};

// Liste des routes valides pour le retour
const validReturnPaths = [
  "/assemblee-nationale/deputes",
  "/assemblee-nationale/commissions",
  "/assemblee-nationale/bureau",
  "/assemblee-nationale/groupes",
];

// Gestion du retour
const handleReturn = () => {
  const previousRoute = router.options.history.state.back;

  if (
    previousRoute &&
    validReturnPaths.some((path) => previousRoute.startsWith(path))
  ) {
    router.back();
  } else {
    router.push("/assemblee-nationale");
  }
};

// Gestion du bouton "Retour en haut"
const showButton = ref(false);

const checkScroll = () => {
  showButton.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", checkScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});
</script>

<style scoped>
.deputies-grid-move {
  transition: transform 0.5s ease-in-out;
}

.deputies-grid-enter-active,
.deputies-grid-leave-active {
  transition: all 0.5s ease-in-out;
}

.deputies-grid-enter-from,
.deputies-grid-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.deputies-grid-leave-active {
  position: absolute;
}
</style>
