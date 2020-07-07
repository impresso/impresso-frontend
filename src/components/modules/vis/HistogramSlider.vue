<template>
  <b-container>
    <b-col>
      <b-row>
        x
      </b-row>
      <b-row>
        <vue-slider
          class="slider"
          v-model="sliderValue"
          :min="sliderRange[0]"
          :max="sliderRange[1]"
          :marks="sliderMarks"
          :silent="true"
          :enable-cross="false"
          @change="handleValueChanged"/>
      </b-row>
    </b-col>
  </b-container>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

/**
 * NOTE: Only works with integers. If you need to do fractions you
 * will need to normalise them.
 */
export default {
  data: () => ({
    value: /** @type {undefined|number[]} */ (undefined)
  }),
  props: {
    /** @type {import('vue').PropOptions<Number[]>} */
    range: {
      type: Array
    },
    /** @type {import('vue').PropOptions<Number>} */
    step: {
      type: Number,
      default: 1
    },
    /** @type {import('vue').PropOptions<import('@/models').Bucket[]>} */
    buckets: {
      type: Array
    },
    /** @type {import('vue').PropOptions<Number[]>} */
    defaultValue: {
      type: Array
    }
  },
  mounted() {
    if (this.defaultValue) {
      this.value = this.defaultValue
    } else {
      this.value = this.sliderRange
    }
  },
  computed: {
    sliderValue: {
      /** @returns {undefined|number[]} */
      get() {
        return this.value
      },
      /** @param {undefined|number[]} value */
      set(value) {
        this.value = value
      }
    },
    /** @returns {string[]|undefined} */
    sliderMarks() {
      if (this.buckets && this.buckets.length > 0) {
        return this.buckets.map(({ val }) => val).concat([this.sliderRange[1].toString()])
      }
      const marksCount = 10
      const [min, max] = this.sliderRange
      const step = (max - min) / marksCount
      if (Number.isNaN(step)) return undefined

      return Array.from({length: marksCount + 1}, (_, i) =>  this.$n(min + i * step))
    },
    /** @returns {number[]} */
    sliderRange() {
      const vals = this.buckets.map(({ val }) => parseInt(val, 10))
      const min = Math.min(...vals)
      const max = Math.max(...vals)

      if (this.range == null) return [min, max]

      return [
        min < this.range[0] ? min : this.range[0],
        max > this.range[1] ? max : this.range[1],
      ]
    }
  },
  methods: {
    handleValueChanged(value) {
      this.$emit('changed', value)
    }
  },
  components: {
    VueSlider
  }
}
</script>

<style lang="scss" scoped>
  .slider {
    width: 100% !important;
  }
</style>