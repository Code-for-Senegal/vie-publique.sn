<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import * as d3 from "d3";

interface ChartData {
  label: string;
  value: number;
  variation_percentage: number;
}

interface Props {
  data: ChartData[];
  title: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "blue",
});

const chartRef = ref<HTMLElement | null>(null);

const createBarChart = () => {
  if (!chartRef.value || !props.data) return;

  // Nettoyer le conteneur
  d3.select(chartRef.value).selectAll("*").remove();

  // Dimensions et marges
  const margin = { top: 20, right: 180, bottom: 40, left: 200 };
  const width = 800 - margin.left - margin.right;
  const height =
    Math.max(400, props.data.length * 40) - margin.top - margin.bottom;

  // Créer le SVG
  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Échelles
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.value) as number])
    .range([0, width]);

  const y = d3
    .scaleBand()
    .domain(props.data.map((d) => d.label))
    .range([0, height])
    .padding(0.3);

  // Axes
  const xAxis = d3
    .axisBottom(x)
    .ticks(5)
    .tickFormat((d) => `${d} Mrds`);

  const yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "12px");

  svg
    .append("g")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "12px")
    .call(wrap, margin.left - 10); // Wrap long text

  // Barres
  const bars = svg.selectAll(".bar").data(props.data).enter().append("g");

  bars
    .append("rect")
    .attr("class", "bar")
    .attr("y", (d) => y(d.label) as number)
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("width", (d) => x(d.value))
    .attr("fill", `var(--${props.color}-500)`)
    .attr("opacity", 0.8)
    .on("mouseover", function () {
      d3.select(this).attr("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 0.8);
    });

  // Valeurs et variations
  bars
    .append("text")
    .attr("x", (d) => x(d.value) + 5)
    .attr("y", (d) => (y(d.label) as number) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(
      (d) =>
        `${d.value.toLocaleString()} Mrds (${d.variation_percentage > 0 ? "+" : ""}${d.variation_percentage}%)`,
    )
    .style("font-size", "12px")
    .attr("fill", (d) => (d.variation_percentage >= 0 ? "green" : "red"));
};

// Fonction pour wrapper le texte long
function wrap(
  text: d3.Selection<d3.BaseType, string, SVGGElement, unknown>,
  width: number,
) {
  text.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line: string[] = [];
    let lineNumber = 0;
    const lineHeight = 1.1;
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy") || "0");
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", -10)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if ((tspan.node()?.getComputedTextLength() || 0) > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", -10)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

watch(
  () => props.data,
  () => {
    createBarChart();
  },
  { deep: true },
);

onMounted(() => {
  createBarChart();
});
</script>

<template>
  <div class="w-full">
    <div
      ref="chartRef"
      class="w-full overflow-x-auto"
      style="min-height: 400px"
    ></div>
  </div>
</template>
