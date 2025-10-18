<!-- deprecated, to delete -->
<template>
  <ContentDoc v-slot="{ doc }">
    <div class="prose prose-sm sm:prose lg:prose-md mx-auto my-4 dark:text-white">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>
</template>

<style>
.prose div h3 a {
  text-decoration: none;
}
</style>
