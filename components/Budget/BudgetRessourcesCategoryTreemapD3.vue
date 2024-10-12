<template>
  <div ref="treemapContainer" class="treemap"></div>
</template>

<script setup lang="ts">
import * as d3 from "d3";

const props = defineProps<{
  data: Array<{ name: string; value: number }>;
}>();

const treemapContainer = ref(null);

onMounted(() => {
  if (treemapContainer.value) {
    const width = 800;
    const height = 400;

    const treemap = d3.treemap().size([width, height]).padding(1).round(true);

    const root = d3
      .hierarchy({ children: props.data })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    treemap(root);

    const svg = d3
      .select(treemapContainer.value)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("id", (d) => d.data.name)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", "#69b3a2");

    nodes
      .append("text")
      .attr("x", 3)
      .attr("y", 10)
      .text((d) => d.data.name);
  }
});
</script>

<style scoped>
.treemap {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
