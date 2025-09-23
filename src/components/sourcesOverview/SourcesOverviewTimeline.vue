<template>
  <div class="timeline-container" ref="containerRef">
    <svg :width="svgWidth" :height="svgHeight">
      <!-- Main timeline line -->

      <line
        :x1="margin.left"
        :y1="svgHeight - margin.bottom"
        :x2="svgWidth - margin.right"
        :y2="svgHeight - margin.bottom"
        stroke="#333"
        stroke-width="1"
      />

      <!-- Year ticks and labels -->
      <g v-for="year in years" :key="year">
        <!-- Tick mark -->
        <line
          :x1="xScale(new Date(year, 0, 1))"
          :y1="svgHeight - margin.bottom"
          :x2="xScale(new Date(year, 0, 1))"
          :y2="svgHeight - margin.bottom - tickHeight"
          stroke="#333"
          :stroke-width="year % 10 === 0 ? 3 : year % 5 === 0 ? 2 : 1"
        />

        <!-- Year label (only for decades and every 5 years) -->
        <text
          v-if="shouldShowLabel(year)"
          :x="xScale(new Date(year, 0, 1))"
          :y="svgHeight - margin.bottom - tickHeight - 8"
          text-anchor="middle"
          :font-weight="year % 10 === 0 ? 'bold' : 'normal'"
          fill="#333"
          class="small"
        >
          {{ year }}
        </text>
      </g>

      <!-- Start and end date markers -->
      <g>
        <!-- Start date marker -->
        <circle :cx="xScale(startDate)" :cy="svgHeight - margin.bottom" r="4" fill="#007bff" />

        <!-- End date marker -->
        <circle :cx="xScale(endDate)" :cy="svgHeight - margin.bottom" r="4" fill="#dc3545" />
      </g>
    </svg>
    <svg :width="svgWidth" :height="gridHeight">
      <g v-for="year in years" :key="year">
        <line
          :x1="xScale(new Date(year, 0, 1))"
          :y1="0"
          :x2="xScale(new Date(year, 0, 1))"
          :y2="gridHeight - margin.bottom"
          stroke="#333"
          :stroke-width="
            year % 10 === 0
              ? decadeStrokeWidth
              : year % 5 === 0
                ? fiveYearStrokeWidth
                : singleYearStrokeWidth
          "
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

const singleYearStrokeWidth = 0.25
const decadeStrokeWidth = 1
const fiveYearStrokeWidth = 0.5

export interface Props {
  startDate: Date
  endDate: Date
  minimumGap?: number
}

const props = withDefaults(defineProps<Props>(), {
  minimumGap: 5
})

const containerRef = ref<HTMLElement>()
const containerWidth = ref(800)
const svgHeight = 120
const gridHeight = 400
const margin = {
  top: 20,
  right: 40,
  bottom: 40,
  left: 40
}

const tickHeight = 15

const years = computed(() => {
  const yearsArray = []
  for (let year = props.startDate.getFullYear(); year <= props.endDate.getFullYear(); year++) {
    yearsArray.push(year)
  }
  return yearsArray
})

const svgWidth = computed(() => {
  return years.value.length * props.minimumGap! + margin.left + margin.right
})
// D3 scale for positioning
const xScale = computed(() => {
  return d3
    .scaleTime()
    .domain([props.startDate, props.endDate])
    .range([margin.left, svgWidth.value - margin.right])
})

// Calculate which years should be visible based on minimum gap
//

// Determine which years should show labels
const shouldShowLabel = (year: number): boolean => {
  // Always show decades (bold)
  if (year % 10 === 0 || year % 5 === 0) return true

  return false
}

// Handle container resize
const updateContainerWidth = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateContainerWidth()

  // Set up resize observer for responsive behavior
  if (containerRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(updateContainerWidth)
    resizeObserver.observe(containerRef.value)
  } else {
    // Fallback for older browsers
    window.addEventListener('resize', updateContainerWidth)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', updateContainerWidth)
  }
})
</script>

<style scoped>
.timeline-container {
  width: 100%;
  min-height: 120px;
}

svg {
  display: block;
}
</style>
