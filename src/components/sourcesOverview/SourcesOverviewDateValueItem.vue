<template>
  <div class="SourcesOverviewDateValueItem position-absolute" @click="onClick">
    <div
      class="position-absolute right-0 text-right pr-2 d-flex flex-row align-items-center gap-2 text-no-wrap"
      :style="{
        height: height + 'px'
      }"
    >
      <div class="label font-weight-bold">{{ dataValue.label }} {{ dataValue.value }}</div>
      <div v-if="dataValue.dateRange" class="date-range text-no-wrap very-small">
        {{ $d(dataValue.dateRange[0], 'month') }}
      </div>
      <div v-else class="date very-small">{{ $d(dataValue.date, 'month') }}</div>
    </div>
    <div
      class="position-absolute left-0"
      :style="{
        width: width + 'px',
        height: barHeight + 'px',
        top: height / 2 - barHeight / 2 + 'px',
        backgroundColor: 'var(--clr-grey-500)'
      }"
    />
    <div
      class="position-absolute left-0 top-0"
      :style="{
        width: width + 'px',
        height: height + 'px',
        backgroundColor: 'var(--clr-grey-100-rgba-20)'
      }"
    >
      <div
        v-for="nestedValue in nestedDataValues"
        :key="nestedValue.id"
        class="nested-value"
        :style="{
          position: 'absolute',
          left: xScale(nestedValue.date) + 'px',
          top: height / 2 - yScale(nestedValue.value) / 2 + 'px',
          width: xScale(nestedValue.dateRange[1]) - xScale(nestedValue.dateRange[0]) + 'px',
          height: yScale(nestedValue.value) + 'px',
          backgroundColor: 'rgba(128, 0, 128, 0.7)'
        }"
      ></div>
    </div>

    <div
      class="position-absolute d-flex align-items-center justify-content-end pl-2 text-no-wrap very-small"
      :style="{
        left: width + 'px',
        height: height + 'px',
        top: 0
      }"
    >
      {{ $d(dataValue.dateRange[1], 'month') }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { max, min, scalePow, scaleTime } from 'd3'
import { computed } from 'vue'

export interface DataValue {
  id: string
  date: Date
  startDate?: Date
  endDate?: Date
  dateRange: [Date, Date]
  value: number
  label?: string
  // nested datavalkues for drilldown
  dataValues?: DataValue[]
}

export interface SourcesOverviewDateValueItemProps {
  dataValue: DataValue
  width?: number
  height?: number
  barHeight?: number
  exponent?: number
  normalizeLocally?: boolean
  minValue?: number
  maxValue?: number
}

const props = withDefaults(defineProps<SourcesOverviewDateValueItemProps>(), {
  width: 100,
  height: 30,
  barHeight: 1,
  exponent: 1,
  normalizeLocally: false
})

const nestedDataValues = computed(() => {
  return props.dataValue.dataValues || []
})

const xScale = computed(() => {
  return scaleTime()
    .domain([props.dataValue.dateRange[0], props.dataValue.dateRange[1]])
    .range([0, props.width])
    .clamp(true)
})

const yScale = computed(() => {
  const maxValue = props.normalizeLocally
    ? (max(nestedDataValues.value, d => d.value) as number)
    : isNaN(props.maxValue)
      ? props.maxValue
      : props.dataValue.value
  const minValue = props.normalizeLocally
    ? (min(nestedDataValues.value, d => d.value) as number)
    : isNaN(props.minValue)
      ? props.minValue
      : 0
  return scalePow()
    .exponent(props.exponent)
    .domain([minValue, maxValue])
    .range([2, props.height])
    .clamp(true)
})
const onClick = (event: MouseEvent) => {
  event.stopPropagation()
  console.log('Clicked on', props.dataValue)
}
</script>
