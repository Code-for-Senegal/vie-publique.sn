<!-- pages/deputes/[id].vue -->
<template>
    <div class="container mx-auto px-4 py-8">
        <!-- Breadcrumb -->
        <UBreadcrumb :links="[
            { label: 'Accueil', to: '/' },
            { label: 'Députés', to: '/deputes' },
            { label: deputy ? `${deputy?.first_name} ${deputy?.last_name}` : '' },
        ]" />

        <div class="flex flex-col md:flex-row gap-6 mt-3">
            <div class="w-full md:w-1/3">
              <div class="sticky top-[84px] md:z-1 bg-gray-100 md:bg-transparent">
                <ProfileHeader :deputy="deputy"/>
              </div>
            </div>

            <div class="w-full md:w-2/3 flex flex-col gap-5">
                <MotionVote
                    :title="lastVote?.motion?.title"
                    :description="lastVote?.motion?.description"
                />
                <Biography :deputy="deputy" />
                <RecentVotes :votes="deputy?.votes"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ProfileHeader from '@/components/parliament/deputies/ProfileHeader.vue';
import MotionVote from '@/components/parliament/deputies/MotionVote.vue';
import Biography from '@/components/parliament/deputies/Biography.vue';
import RecentVotes from '~/components/parliament/deputies/RecentVotes.vue';

import { useDepute } from '@/composables/parliament/useDepute';

const route = useRoute();

const { deputy, loading } = useDepute(parseInt(route.params?.id));

const age = computed(() => {
    if (!deputy.value?.birthdate) return null;
    const birthDate = new Date(deputy.value.birthdate);
    const today = new Date();

    return today.getFullYear() - birthDate.getFullYear();
});

const lastVote = computed(() => {
    return deputy.value?.votes[0];
});


onMounted(async () => {
  // Attendre que deputy soit chargé
  await nextTick();

  // Configuration SEO une fois deputy chargé
  useHead({
    title: computed(() =>
      deputy.value
        ? `${deputy.value.first_name} ${deputy.value.last_name} - Député`
        : 'Chargement...'
    ),
    meta: [
      {
        name: 'description',
        content: computed(() =>
          deputy.value
            ? `Découvrez le profil et l'activité parlementaire de ${deputy.value.first_name} ${deputy.value.last_name}, député de ${deputy.value.electoral_list.constituency?.name}`
            : ''
        )
      }
    ]
  });
});
</script>