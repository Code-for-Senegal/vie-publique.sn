<script setup lang="ts">
const links = [
    {
        label: 'Rapports publics',
        to: '/',
    },
    {
        label: 'Personnes épinglées',
        to: '/individuals-cited',
    },

]
</script>

<template>

    <!-- <UHorizontalNavigation :links="links"
        class="flex border-b border-gray-200 dark:border-gray-800 mx-auto mb-3 top-0 z-50 justify-center">
        <template #default="{ link }">
            <span class="text-sm group-hover:text-primary relative">{{ link.label }}</span>
        </template>
</UHorizontalNavigation> -->

    <!-- <UHorizontalNavigation :links="links" class="border-b border-gray-200 dark:border-gray-800" /> -->

    <UHorizontalNavigation :links="links" class="justify-center" />

</template>