<template>
  <div class="filter-range">
    <base-title-bar>
      {{
        $t(`label.${facet.type}.filterTitle`)
      }}
    </base-title-bar>
    <histogram-slider
      class="histo-slider"
      @changed="onSliderValueChanged"
      :buckets="sliderBuckets"
      :only-range-labels="true"/>
  </div>
</template>

<script>
import HistogramSlider from '@/components/modules/vis/HistogramSlider'

export default {
  props: {
    /** @type {import('vue').PropOptions<import('@/models').Facet>} */
    facet: {
      type: Object,
      required: true
    }
  },
  computed: {
    /** @returns {import('@/models').Bucket[]} */
    sliderBuckets() {
      return this.facet.buckets
    }
  },
  methods: {
    /** @param {number[]} value */
    onSliderValueChanged(value) {
      console.info(`Slider value: ${value}`)
    }
  },
  components: {
    HistogramSlider
  }
}
</script>