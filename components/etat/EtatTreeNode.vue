<template>
  <div class="tree-node">
    <div @click="toggle" class="node-content">
      <UIcon
        v-if="node.children"
        :name="
          isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'
        "
        class="mr-2"
      />
      <UIcon v-else name="i-heroicons-building-office" class="mr-2" />
      {{ node.name }}
    </div>
    <div v-if="isOpen && node.children" class="children">
      <EtatTreeNode
        v-for="child in node.children"
        :key="child.name"
        :node="child"
        class="ml-4"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  node: any;
}>();

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.tree-node {
  margin-bottom: 0.5rem;
}

.node-content {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.children {
  margin-left: 1rem;
  border-left: 1px solid #ccc;
  padding-left: 1rem;
}
</style>
