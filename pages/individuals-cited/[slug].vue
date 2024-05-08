<script setup lang="ts">
const individualCited = ref<any | null>(null);

const route = useRoute();

onMounted(async () => {
    individualCited.value = (await import('@/assets/data/personnes-epinglees.json'))
        .default.find(s => s.slug === route.params.slug);
});
</script>

<template>
    <div class="p-0">
        <UCard v-if="individualCited != null">
            <template #header>
                <div class="">
                    <h1 class="font-semibold text-2xl">{{ individualCited.nom }}</h1>
                    <p class="text-sm text-gray-500">{{ individualCited.fonction }}</p>
                </div>
            </template>

            <img :src="individualCited.photo" alt="Photo de profil" class="profile-photo mb-1">

            <div v-if="individualCited.facts_denounced != null" v-for="(factItem, i) in individualCited.facts_denounced"
                :key="i" class="mb-1">
                <UBadge variant="solid">{{ factItem.rapport }}</UBadge>
                <p v-if="factItem.intro != null" class="text-sm my-2">
                    {{ factItem.intro }}
                </p>
                <ul class="list-disc">
                    <li v-for="(infractionsItem, i) in factItem.infractions" :key="i" class="text-sm ml-5 mt-1">
                        {{ infractionsItem }}
                    </li>
                </ul>
                <p v-if="factItem.intro != null" class="font-semibold text-sm my-2">
                    {{ factItem.outro }}
                </p>
            </div>

        </UCard>
    </div>
</template>