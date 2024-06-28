<script setup lang="ts">
const individualCited = ref<any | null>(null);

const route = useRoute();

onMounted(async () => {
    individualCited.value = (await import('@/assets/data/personnes-epinglees.json'))
        .default.find(s => s.slug === route.params.slug);
});

const links = [{ label: '← Retour à la liste', to: '/individuals-cited' }]

</script>

<template>
      <h1 v-if="individualCited != null" class="sr-only">{{ individualCited.nom }}</h1>

    <div class="p-0">
        <UBreadcrumb v-if="individualCited != null" divider=">" :links=links class="mb-2 px-2.5" />

        <UCard v-if="individualCited != null">
            <template #header>
                <div class="">
                    <h1 class="font-semibold text-2xl">{{ individualCited.nom }}</h1>
                    <p class="text-sm text-gray-500">{{ individualCited.fonction }}</p>
                </div>
            </template>

            <img :src="individualCited.photo" loading="lazy" alt="Photo de profil" class="profile-photo mb-1">

            <div v-if="individualCited.facts_denounced != null" v-for="(factItem, i) in individualCited.facts_denounced"
                :key="i" class="mb-1 text-sm ">
                <UBadge variant="solid">{{ factItem.rapport }}</UBadge>
                <p v-if="factItem.intro != null" class="my-2">
                    {{ factItem.intro }}
                </p>
                <ul class="list-disc">
                    <li v-for="(infractionsItem, i) in factItem.infractions" :key="i" class="ml-5 mt-1">
                        <span v-if="infractionsItem.title != null" class="font-semibold">
                            {{ infractionsItem.title }}:
                        </span>
                        {{ infractionsItem.content }}

                    </li>
                </ul>
                <p v-if="factItem.intro != null" class="font-semibold my-2">
                    {{ factItem.outro }}
                </p>
            </div>

        </UCard>
    </div>
</template>

<style scoped>
.profile-photo {
    width: 100%;
    height: 250px;
    object-fit: cover;
}
</style>