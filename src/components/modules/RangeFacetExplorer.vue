<template>
  <div>
    <vue-slider v-model="currentValue"
      :min="range[0]"
      :max="range[1]"
      :marks="marks"
      :tooltip="'always'"
      :enable-cross="false"></vue-slider>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default {
  model: {
    prop: 'filter',
    event: 'change'
  },
  components: {
    VueSlider
  },
  data: () => ({
    currentValue: []
  }),
  props: {
    filter: {
      /** @type {import('vue').PropType<import('../../models/models').Filter>} */
      type: Object
    },
    filterType: {
      type: String,
      required: true
    },
    buckets: {
      type: Array,
      default: () => []
    },
    range: {
      type: Array,
      required: true
    }
  },
  computed: {
    marks() {
      const marksCount = 10
      const [min, max] = this.range
      const step = (max - min) / marksCount
      return Array.from({length: marksCount + 1}, (_, i) =>  Math.round(i * step))
      // return this.range
    }
  },
  methods: {
    applyFilter() {
      const originalFilter = this.filter
        ? this.filter
        : { type: this.filterType }
      const updatedFilter = Object.assign({}, originalFilter, {
        q: this.currentValue
      })
      this.$emit('change', updatedFilter)
    }
  },
  watch: {
    filter: {
      handler() {
        if (this.filter && this.filter.q) {
          this.currentValue = [...this.filter.q]
        } else {
          this.currentValue = [...this.range]
        }
      },
      immediate: true
    }
  }
}
</script>