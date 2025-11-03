<script setup lang="ts">
import * as d3 from 'd3';

interface EvolutionData {
  year: string;
  amount: number;
  label: string;
}

interface Props {
  data: EvolutionData[];
}

const props = defineProps<Props>();

const chartContainer = ref<HTMLDivElement | null>(null);
const chartSvg = ref<SVGElement | null>(null);

const drawChart = () => {
  if (!chartContainer.value || !chartSvg.value || !props.data || props.data.length === 0) return;

  // Nettoyer le SVG existant
  d3.select(chartSvg.value).selectAll('*').remove();

  const containerWidth = chartContainer.value.offsetWidth;
  const margin = { top: 20, right: 30, bottom: 40, left: 30 };
  const width = containerWidth - margin.left - margin.right;
  const height = Math.min(containerWidth * 0.6, 400) - margin.top - margin.bottom;

  const svg = d3
    .select(chartSvg.value)
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Échelles
  const x = d3
    .scaleBand()
    .domain(props.data.map((d) => d.year))
    .range([0, width])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.amount) || 0])
    .nice()
    .range([height, 0]);

  // Dégradé pour les barres
  const defs = svg.append('defs');

  const gradient = defs
    .append('linearGradient')
    .attr('id', 'barGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#60A5FA');
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#2563EB');

  // Filtre pour l'ombre
  const filter = defs.append('filter').attr('id', 'shadow').attr('height', '130%');

  filter
    .append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 3)
    .attr('result', 'blur');

  filter.append('feOffset').attr('in', 'blur').attr('dx', 2).attr('dy', 2).attr('result', 'offsetBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'offsetBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Axe X horizontal (sans rotation)
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('font-weight', '500')
    .style('fill', '#6B7280');

  // Barres avec animation
  g.selectAll('.bar')
    .data(props.data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(d.year)!)
    .attr('width', x.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('fill', 'url(#barGradient)')
    .attr('rx', 4)
    .attr('filter', 'url(#shadow)')
    .transition()
    .duration(800)
    .attr('y', (d) => y(d.amount))
    .attr('height', (d) => height - y(d.amount));

  // Labels au-dessus des barres
  g.selectAll('.label')
    .data(props.data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', (d) => x(d.year)! + x.bandwidth() / 2)
    .attr('y', (d) => y(d.amount) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#2563EB')
    .style('opacity', 0)
    .text((d) => d.amount.toFixed(1))
    .transition()
    .delay(800)
    .duration(400)
    .style('opacity', 1);
};

// Redessiner le graphique lors du redimensionnement
const handleResize = () => {
  drawChart();
};

// Watcher pour redessiner quand les données changent
watch(
  () => props.data,
  () => {
    drawChart();
  },
  { deep: true }
);

onMounted(() => {
  drawChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div ref="chartContainer" class="w-full">
    <svg ref="chartSvg" class="w-full"></svg>
  </div>
</template>
