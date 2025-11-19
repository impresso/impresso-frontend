<template>
  <div class="SourceOverviewLegend">
    <h2 class="small-caps m-0">{{ $t('legend') }}</h2>
    <p class="very-small text-muted font-style-italic m-0">
      {{ $t('colorGradient') }}
    </p>
    <div class="d-flex align-items-end gap-2 justify-content-center mb-2">
      <div class="position-relative w-100">
        <div class="position-absolute top-0 left-0 pr-2 very-small">
          {{ $n(dataValuesExtent.min) }}
        </div>
        <div
          class="legend-gradient"
          :style="{
            width: '100%',
            height: '20px',
            marginTop: '20px',
            background: `linear-gradient(to right, ${colorScale(dataValuesExtent.min)}, ${colorScale(dataValuesExtent.max)})`
          }"
        ></div>
        <div class="position-absolute top-0 right-0 pl-2 very-small text-right">
          {{ $n(dataValuesExtent.max) }}
        </div>
      </div>
      <InfoButton :name="$t('colorGradient')" :default-content="$t('colorGradientExplanation')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { interpolateYlGn, scaleSequential } from 'd3'
import { computed } from 'vue'
import InfoButton from '../base/InfoButton.vue'

export interface SourceOverviewLegendProps {
  dataValues?: Array<{
    value: number
    dataValues?: Array<{ value: number }>
  }>
  normalizeLocally?: boolean
}

const props = withDefaults(defineProps<SourceOverviewLegendProps>(), {
  normalizeLocally: false
})

const dataValuesExtent = computed<{ min: number; max: number }>(() => {
  let min = Infinity
  let max = -Infinity
  props.dataValues!.forEach(dv => {
    if (Array.isArray(dv.dataValues) && dv.dataValues.length > 0) {
      dv.dataValues.forEach(nestedDv => {
        if (nestedDv.value < min) min = nestedDv.value
        if (nestedDv.value > max) max = nestedDv.value
      })
    } else {
      if (dv.value < min) min = dv.value
      if (dv.value > max) max = dv.value
    }
  })
  return { min, max }
})

const colorScale = computed(() => {
  return scaleSequential(t => interpolateYlGn(0.5 + t * 0.5)).domain([
    0,
    dataValuesExtent.value.max
  ])
})
</script>
<i18n lang="json">
{
  "en": {
    "colorGradient": "Color Gradient",
    "colorGradientExplanation": "The color gradient represents the number of content items over time across all sources."
  }
}
</i18n>
