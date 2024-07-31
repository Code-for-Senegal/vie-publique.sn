<template>
  <ContentDoc v-slot="{ doc }">
    <div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto mt-2">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>
</template>