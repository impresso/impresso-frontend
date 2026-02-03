<template>
  <svg :width="containerWidth" :height="height" class="SourceOverviewMiniTimeline">
    <!-- Background -->
    <rect width="100%" height="100%" fill="rgba(220, 220, 220, 0.1)" />

    <!-- Data value rectangles per dataValue row -->
    <g v-for="(dataValue, idx) in props.dataValues" :key="dataValue.id">
      <!-- Draw nested dataValues if they exist -->
      <g v-if="Array.isArray(dataValue.dataValues) && dataValue.dataValues.length > 0">
        <rect
          v-for="nestedValue in dataValue.dataValues"
          :key="`${dataValue.id}-${nestedValue.id}`"
          :x="xScale(nestedValue.dateRange[0])"
          :y="yScale(idx)"
          :width="Math.max(1, xScale(nestedValue.dateRange[1]) - xScale(nestedValue.dateRange[0]))"
          :height="barHeight"
          :fill="colorScale(nestedValue.value)"
          opacity="0.9"
        />
      </g>
      <!-- Draw single dataValue if no nested values -->
      <rect
        v-else
        :x="xScale(dataValue.dateRange[0])"
        :y="yScale(idx)"
        :width="Math.max(1, xScale(dataValue.dateRange[1]) - xScale(dataValue.dateRange[0]))"
        :height="barHeight"
        :fill="colorScale(dataValue.value)"
        opacity="0.9"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as d3 from 'd3'
import type { DataValue } from './SourcesOverviewDateValueItem.vue'

export interface Props {
  startDate: Date
  endDate: Date
  dataValues: DataValue[]
  containerWidth: number
  height?: number
  scaleExponent?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 200,
  scaleExponent: 2
})

const margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
}

const barHeight = computed(() => {
  return Math.max(1, (props.height - margin.top - margin.bottom) / props.dataValues.length)
})

// D3 scale for positioning on x-axis
const xScale = computed(() => {
  return d3
    .scaleTime()
    .domain([props.startDate, props.endDate])
    .range([margin.left, props.containerWidth - margin.right])
    .clamp(true)
})

// Y scale for positioning data values based on their index
const yScale = computed(() => {
  return d3
    .scalePoint<number>()
    .domain(d3.range(props.dataValues.length))
    .range([margin.top, props.height - margin.bottom])
})

// Get the min and max values for color scaling
const valueExtent = computed<{ min: number; max: number }>(() => {
  let allValues: number[] = []

  props.dataValues.forEach(dv => {
    if (Array.isArray(dv.dataValues) && dv.dataValues.length > 0) {
      allValues.push(...dv.dataValues.map(nested => nested.value))
    } else {
      allValues.push(dv.value)
    }
  })

  if (allValues.length === 0) return { min: 0, max: 1 }
  return { min: Math.min(...allValues), max: Math.max(...allValues) }
})

// D3 color scale using interpolateYlGn
const colorScale = computed(() => {
  return d3
    .scalePow()
    .exponent(props.scaleExponent)
    .domain([valueExtent.value.min, valueExtent.value.max])
    .range([0, 1])
    .interpolate(() => (t: number) => {
      // Use d3's YlGn interpolator with adjusted range for better visibility
      return d3.interpolateYlGn(0.3 + t * 0.7)
    })
})
</script>

<style scoped lang="css">
.SourceOverviewMiniTimeline {
  border: 1px solid rgba(51, 51, 51, 0.2);
  border-radius: 4px;
}
</style>
