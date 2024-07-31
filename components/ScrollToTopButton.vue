<script setup lang="ts">

const showButton = ref(false)

const checkScroll = (): void => {
    showButton.value = window.scrollY > 300
}

const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
    window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
    <UButton v-show="showButton" @click="scrollToTop" :ui="{ rounded: 'rounded-full' }"
        class="fixed bottom-4 right-4 bg-primary text-white p-2 shadow-lg" icon="i-heroicons-arrow-up-circle">
        Sommaire
    </UButton>
</template>