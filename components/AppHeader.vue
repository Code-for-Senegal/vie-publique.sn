<template>
  <NuxtLink :to="`/`">
    <div class="flex flex-row items-center gap-1 px-2.5 py-0">
      <UButton
        v-if="isChatPage"
        class="text-white md:hidden"
        color="white"
        variant="link"
        size="xl"
        icon="i-heroicons-chevron-left-20-solid"
        to="/menu"
      />
      <img
        src="~/assets/logos/vie-publique-logo-4.svg"
        loading="lazy"
        fetchpriority="high"
        alt="Logo Vie-Publique"
        class="h-auto w-40 lg:w-48"
      />
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
const isChatPage = ref(useRoute().path === "/chatbot");
watch(
  () => useRoute().path,
  (newPath) => {
    isChatPage.value = newPath === "/chatbot";
  },
);
</script>
<style scoped>
.flag-logo {
  height: auto;
  width: 60px;
}
</style>
