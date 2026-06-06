<script setup lang="ts">
const route = useRoute();
const personId = route.params.id as string;

// Composable pour récupérer la personnalité (gère aussi le redirect legacy)
const { person, currentAppointment, appointments, socialLinks, loading, error } =
  usePublicPerson(personId);

const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

// Métadonnées dynamiques
const title = computed(() => {
  if (!person.value) return 'Personnalité publique | Vie Publique Sénégal';
  const apt = currentAppointment.value;
  if (apt?.position_title) {
    return `${person.value.full_name} - ${apt.position_title} | Vie Publique Sénégal`;
  }
  return `${person.value.full_name} | Vie Publique Sénégal`;
});

const description = computed(() => {
  if (!person.value) return "Profil d'une personnalité publique du Sénégal";
  const apt = currentAppointment.value;
  const parts: string[] = [];

  // Phrase d'accroche : Nom + rôle actuel ou dernier rôle
  if (apt) {
    const status = apt.is_current ? '' : ' (ancien)';
    parts.push(`${person.value.full_name}${status} : ${apt.position_title}`);
    if (apt.organization_label) parts[0] += `, ${apt.organization_label}`;
    parts[0] += '.';
  } else {
    parts.push(`${person.value.full_name}, personnalité publique sénégalaise.`);
  }

  // Contexte : bio courte ou nombre de fonctions
  if (person.value.short_bio) {
    const bio = person.value.short_bio.trim();
    const maxLen = 155 - parts[0].length - 1;
    if (bio.length > maxLen) {
      // Couper au dernier espace avant la limite
      const truncated = bio.substring(0, maxLen);
      parts.push(truncated.substring(0, truncated.lastIndexOf(' ')) + '...');
    } else {
      parts.push(bio);
    }
  } else if (appointments.value.length > 1) {
    parts.push(`Parcours de ${appointments.value.length} fonctions officielles.`);
  }

  return parts.join(' ');
});

const url = computed(() => `${siteUrl}/personnalites/${route.params.id}/${route.params.slug}`);

const image = computed(() => {
  if (!person.value?.photo) return `${siteUrl}/nomination-3.png`;
  return useCmsImage(person.value.photo);
});

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: computed(() =>
    [
      ...keywords,
      person.value?.full_name || '',
      currentAppointment.value?.position_title || '',
      currentAppointment.value?.organization_label || '',
      'personnalité publique Sénégal',
    ].join(', '),
  ),
});

const personSchema = computed(() => {
  if (!person.value) return null;

  // Liens sameAs (réseaux sociaux pour lier le profil aux autres sources)
  const sameAs: string[] = [];
  if (person.value.facebook) sameAs.push(person.value.facebook);
  if (person.value.twitter) sameAs.push(person.value.twitter);
  if (person.value.instagram) sameAs.push(person.value.instagram);
  if (person.value.linkedin) sameAs.push(person.value.linkedin);
  if (person.value.tiktok) sameAs.push(person.value.tiktok);
  if (person.value.website) sameAs.push(person.value.website);

  // Historique des postes (hasOccupation)
  const occupations = appointments.value.map((apt) => ({
    '@type': 'Role',
    roleName: apt.position_title,
    startDate: apt.appointment_date?.split('T')[0],
    ...(apt.end_date && { endDate: apt.end_date.split('T')[0] }),
    ...(apt.organization_label && {
      worksFor: {
        '@type': 'Organization',
        name: apt.organization_label,
      },
    }),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.value.full_name,
    jobTitle: currentAppointment.value?.position_title,
    worksFor: currentAppointment.value?.organization_label
      ? {
          '@type': 'Organization',
          name: currentAppointment.value.organization_label,
        }
      : undefined,
    image: image.value,
    description: description.value,
    url: url.value,
    gender: person.value.sexe === 'male' ? 'Male' : 'Female',
    nationality: {
      '@type': 'Country',
      name: 'Sénégal',
    },
    alumniOf: person.value.education
      ? {
          '@type': 'EducationalOrganization',
          name: person.value.education,
        }
      : undefined,
    ...(sameAs.length > 0 && { sameAs }),
    ...(occupations.length > 0 && { hasOccupation: occupations }),
  };
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Personnalités',
      item: `${siteUrl}/personnalites-senegal`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: person.value?.full_name || 'Personnalité',
      item: url.value,
    },
  ],
}));

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'profile' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
  ],
  script: computed(() => {
    const scripts = [];
    if (personSchema.value) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(personSchema.value),
      });
    }
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbSchema.value),
    });
    return scripts;
  }),
});

// Date formatting
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Initiales pour l'avatar fallback
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
};

// Statut de la nomination actuelle
const isActive = computed(() => currentAppointment.value?.is_current ?? false);

// Label du motif de fin
const endReasonLabels: Record<string, string> = {
  retirement: 'Retraite',
  dismissed: 'Congédié(e)',
  reassigned: 'Réaffecté(e)',
  resigned: 'Démission',
  deceased: 'Décédé(e)',
  replaced: 'Remplacé(e)',
  other: 'Autre',
};

const getEndReasonLabel = (reason: string | null | undefined) => {
  if (!reason) return null;
  return endReasonLabels[reason] || reason;
};

// Catégories des membres du gouvernement
const governmentCategories = ['Premier Ministre', 'Ministre', "Secrétaire d'État"];
const isGovernmentMember = computed(() => {
  const cat = currentAppointment.value?.position_category;
  return isActive.value && !!cat && governmentCategories.includes(cat);
});

// URL retour : gouvernement si ref=gouvernement ou si ministre actif sans ref explicite
const backUrl = computed<string>(() => {
  const referer = route.query.ref as string;
  if (referer === 'gouvernement' || (!referer && isGovernmentMember.value)) {
    return '/gouvernement-senegal';
  }
  const query = { ...route.query };
  delete query.ref;
  const qs = new URLSearchParams(query as Record<string, string>).toString();
  return qs ? `/personnalites-senegal?${qs}` : '/personnalites-senegal';
});

const backLabel = computed(() => {
  const referer = route.query.ref as string;
  if (referer === 'gouvernement' || (!referer && isGovernmentMember.value)) {
    return 'Gouvernement';
  }
  return 'Personnalités';
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-2">
      <AppBreadcrumb
        :items="[{ label: backLabel, to: backUrl }, { label: person?.full_name || 'Personnalité' }]"
      />
    </div>

    <main class="container mx-auto px-4 pt-2">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="mx-auto max-w-3xl space-y-4">
        <div
          class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 sm:p-8"
        >
          <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <USkeleton class="h-28 w-28 shrink-0 rounded-full sm:h-36 sm:w-36" />
            <div class="flex-1 space-y-3 text-center sm:text-left">
              <USkeleton class="mx-auto h-7 w-48 rounded sm:mx-0" />
              <USkeleton class="mx-auto h-5 w-64 rounded sm:mx-0" />
              <USkeleton class="mx-auto h-4 w-40 rounded sm:mx-0" />
              <div class="flex justify-center gap-2 pt-2 sm:justify-start">
                <USkeleton class="h-6 w-20 rounded-full" />
                <USkeleton class="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <USkeleton v-for="n in 4" :key="n" class="h-20 rounded-xl" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-16">
        <div
          class="mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <p class="text-sm font-medium text-red-900 dark:text-red-200">Erreur de chargement</p>
          <p class="mt-1 text-xs text-red-700 dark:text-red-300">
            Impossible de charger les informations
          </p>
          <div class="mt-4 flex justify-center gap-2">
            <UButton color="red" variant="soft" size="sm" @click="$router.go(0)">
              Réessayer
            </UButton>
            <NuxtLink :to="backUrl">
              <UButton color="gray" variant="soft" size="sm"> Retour </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="person" class="mx-auto max-w-3xl space-y-4">
        <!-- Hero Card -->
        <div
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="p-6 sm:p-8">
            <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <!-- Photo -->
              <div class="relative shrink-0">
                <img
                  v-if="person.photo"
                  :src="useCmsImage(person.photo)"
                  :alt="person.full_name"
                  class="h-28 w-28 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700 sm:h-36 sm:w-36"
                />
                <div
                  v-else
                  class="flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 ring-4 ring-gray-100 dark:bg-gray-700 dark:ring-gray-700 sm:h-36 sm:w-36"
                >
                  <span class="text-3xl font-semibold text-gray-500 dark:text-gray-400 sm:text-4xl">
                    {{ getInitials(person.full_name) }}
                  </span>
                </div>
                <!-- Status -->
                <span
                  class="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-800"
                  :class="isActive ? 'bg-green-500' : 'bg-gray-400'"
                  :title="isActive ? 'En fonction' : 'Fin de fonction'"
                >
                  <UIcon
                    :name="isActive ? 'i-heroicons-check-20-solid' : 'i-heroicons-minus-20-solid'"
                    class="h-3 w-3 text-white"
                  />
                </span>
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1 text-center sm:text-left">
                <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {{ person.full_name }}
                </h1>

                <!-- Poste actuel (en vert, bien visible) -->
                <div v-if="currentAppointment && isActive" class="mt-2">
                  <p class="text-sm font-medium text-green-700 dark:text-green-400 sm:text-base">
                    {{ currentAppointment.position_title }}
                  </p>
                  <p
                    v-if="currentAppointment.organization_label"
                    class="mt-0.5 text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ currentAppointment.organization_label }}
                  </p>
                  <p
                    v-if="currentAppointment.appointment_date"
                    class="mt-0.5 text-xs text-gray-400 dark:text-gray-500"
                  >
                    Depuis le {{ formatDate(currentAppointment.appointment_date) }}
                  </p>
                </div>

                <!-- Dernier poste connu (si plus en fonction) -->
                <div v-else-if="currentAppointment" class="mt-2">
                  <p class="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                    {{ currentAppointment.position_title }}
                  </p>
                  <p
                    v-if="currentAppointment.organization_label"
                    class="mt-0.5 text-sm text-gray-500 dark:text-gray-500"
                  >
                    {{ currentAppointment.organization_label }}
                  </p>
                </div>

                <!-- Badges -->
                <div class="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                      isActive
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800'
                        : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                    "
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="isActive ? 'bg-green-500' : 'bg-gray-400'"
                    />
                    {{ isActive ? 'En fonction' : 'Fin de fonction' }}
                  </span>
                  <span
                    v-if="currentAppointment?.position_category && currentAppointment.position_category !== 'Autre'"
                    class="bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:ring-primary-800 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                  >
                    {{ currentAppointment.position_category }}
                  </span>
                </div>

                <!-- Social links -->
                <div
                  v-if="socialLinks.length > 0"
                  class="mt-3 flex flex-col items-center gap-1.5 sm:items-start"
                >
                  <span
                    class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
                  >
                    Ses réseaux
                  </span>
                  <div class="flex items-center gap-2">
                    <a
                      v-for="link in socialLinks"
                      :key="link.name"
                      :href="link.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      :title="`Profil ${link.name}`"
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    >
                      <UIcon :name="link.icon" class="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <!-- Share -->
                <div class="mt-3 flex justify-center sm:justify-start">
                  <SocialShare :title="title" :url="url" compact />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Infos personnelles (formation, naissance) -->
        <div
          v-if="person.education || person.birthdate || person.birthplace"
          class="grid gap-3 sm:grid-cols-2"
        >
          <!-- Formation -->
          <div
            v-if="person.education"
            class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20"
            >
              <UIcon
                name="i-heroicons-academic-cap-20-solid"
                class="h-4.5 w-4.5 text-purple-600 dark:text-purple-400"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
              >
                Formation
              </p>
              <p class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                {{ person.education }}
              </p>
            </div>
          </div>

          <!-- Date et lieu de naissance -->
          <div
            v-if="person.birthdate || person.birthplace"
            class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20"
            >
              <UIcon
                name="i-heroicons-cake-20-solid"
                class="h-4.5 w-4.5 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
              >
                Naissance
              </p>
              <p class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                <template v-if="person.birthdate">{{ formatDate(person.birthdate) }}</template>
                <template v-if="person.birthdate && person.birthplace"> — </template>
                <template v-if="person.birthplace">{{ person.birthplace }}</template>
              </p>
            </div>
          </div>
        </div>

        <!-- Historique des nominations -->
        <div
          v-if="appointments.length > 0"
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              Historique des fonctions
              <span class="ml-1 text-sm font-normal text-gray-500"
                >({{ appointments.length }})</span
              >
            </h2>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="apt in appointments" :key="apt.id" class="flex items-start gap-3 px-6 py-4">
              <div
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                :class="
                  apt.is_current
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-100 dark:bg-gray-800'
                "
              >
                <UIcon
                  :name="
                    apt.is_current
                      ? 'i-heroicons-check-circle-20-solid'
                      : 'i-heroicons-clock-20-solid'
                  "
                  class="h-4 w-4"
                  :class="
                    apt.is_current
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  "
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ apt.position_title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ apt.organization_label }}
                </p>
                <p class="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                  {{ formatDate(apt.appointment_date) }}
                  <template v-if="apt.end_date">
                    — {{ formatDate(apt.end_date) }}
                    <span v-if="getEndReasonLabel(apt.end_reason)" class="text-red-400">
                      ({{ getEndReasonLabel(apt.end_reason) }})
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-green-500"> — en cours</span>
                  </template>
                </p>

                <!-- Prédécesseur -->
                <p
                  v-if="apt.predecessor || apt.predecessor_label"
                  class="mt-1 text-[11px] text-gray-400 dark:text-gray-500"
                >
                  Prédécesseur :
                  <NuxtLink
                    v-if="apt.predecessor"
                    :to="`/personnalites/${apt.predecessor.id}/${apt.predecessor.slug}`"
                    class="text-primary-600 dark:text-primary-400 underline-offset-2 hover:underline"
                  >
                    {{ apt.predecessor.full_name }}
                  </NuxtLink>
                  <span v-else>{{ apt.predecessor_label }}</span>
                </p>

                <!-- Successeur -->
                <p
                  v-if="apt.successor || apt.successor_label"
                  class="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500"
                >
                  Successeur :
                  <NuxtLink
                    v-if="apt.successor"
                    :to="`/personnalites/${apt.successor.id}/${apt.successor.slug}`"
                    class="text-primary-600 dark:text-primary-400 underline-offset-2 hover:underline"
                  >
                    {{ apt.successor.full_name }}
                  </NuxtLink>
                  <span v-else>{{ apt.successor_label }}</span>
                </p>

                <!-- Source -->
                <p
                  v-if="apt.source_label || apt.source_document"
                  class="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500"
                >
                  Source :
                  <a
                    v-if="apt.source_link"
                    :href="apt.source_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-600 dark:text-primary-400 underline-offset-2 hover:underline"
                  >
                    {{ apt.source_label }}
                  </a>
                  <span v-else-if="apt.source_label">{{ apt.source_label }}</span>
                  <span v-if="apt.source_document && apt.source_label"> · </span>
                  <span v-if="apt.source_document">{{ apt.source_document.title }}</span>
                </p>

                <!-- Notes -->
                <p
                  v-if="apt.notes"
                  class="mt-0.5 text-[11px] italic text-gray-400 dark:text-gray-500"
                >
                  {{ apt.notes }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Biography -->
        <div
          v-if="person.long_bio"
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              Biographie et Parcours
            </h2>
          </div>
          <div class="p-6">
            <div
              class="prose prose-sm max-w-none sm:prose prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600 prose-a:text-primary-600 prose-img:rounded-xl prose-img:shadow-md dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-gray-300 dark:prose-a:text-primary-400 dark:prose-hr:border-gray-700"
              v-html="person.long_bio"
            ></div>
          </div>
        </div>

        <!-- Short bio fallback -->
        <div
          v-else-if="person.short_bio"
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Portrait</h2>
          </div>
          <div class="p-6">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {{ person.short_bio }}
            </p>
          </div>
        </div>

        <!-- No bio -->
        <div
          v-else
          class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="px-6 py-12 text-center">
            <div
              class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-gray-400" />
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Biographie</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              La biographie de {{ person.full_name }} sera bientôt disponible.
            </p>
          </div>
        </div>

        <!-- Back link -->
        <div class="pt-2">
          <NuxtLink
            :to="backUrl"
            class="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <UIcon name="i-heroicons-arrow-left-20-solid" class="h-4 w-4" />
            Retour aux {{ backLabel.toLowerCase() }}
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>
