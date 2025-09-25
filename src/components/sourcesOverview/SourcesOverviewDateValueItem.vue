<template>
  <div class="SourcesOverviewDateValueItem position-absolute">
    <div class="position-absolute right-0 text-right border-right border-dark pr-2">
      <div class="label font-weight-bold text-no-wrap">{{ dataValue.label }}</div>
      <div v-if="dataValue.dateRange" class="date-range text-no-wrap small">
        ({{ $d(dataValue.dateRange[0], 'year') }} - {{ $d(dataValue.dateRange[1], 'year') }})
      </div>
      <div v-else class="date">{{ $d(dataValue.date, 'year') }}</div>
    </div>

    <div
      class="position-absolute left-0 top-0"
      :style="{
        width: width + 'px',
        height: height + 'px',
        backgroundColor: 'var(--clr-grey-100-rgba-20)'
      }"
    />
    <div
      class="position-absolute left-0"
      :style="{
        width: width + 'px',
        height: barHeight + 'px',
        top: height / 2 - barHeight / 2 + 'px',
        backgroundColor: 'purple'
      }"
    />
  </div>
</template>
<script lang="ts" setup>
export interface DataValue {
  id: string
  date: Date
  dateRange: [Date, Date]
  value: number
  label?: string
}

withDefaults(
  defineProps<{
    width?: number
    height?: number
    barHeight?: number
    dataValue: DataValue
  }>(),
  {
    width: 100,
    height: 50,
    barHeight: 2
  }
)
</script>
