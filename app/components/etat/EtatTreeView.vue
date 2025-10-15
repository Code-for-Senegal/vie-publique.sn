<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  data: Array<{ name: string; children?: Array<any>; type?: string }>;
}>();
</script>

<template>
  <ul>
    <li v-for="node in data" :key="node.name">
      <EtatTreeNode :node="node" />
    </li>
  </ul>
</template>
