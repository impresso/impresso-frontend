<template>
  <div>
    <div class="p-2 pb-5 mb-1 border-bottom">
      <vue-slider
        v-model="value"
        :min="rangeMin"
        :max="rangeMax"
        :marks="marks"
        :tooltip="'always'"
        :silent="true"
        :enable-cross="false"/>
    </div>
    <b-button
      v-if='valueChanged'
      @click="applyFilter()"
      class="w-100 my-2 btn btn-sm btn-outline-primary"
      v-html="$tc('actions.addToCurrentFiltersDetailed', 1)">
    </b-button>
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
    currentValue: undefined
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
      /** @type {import('vue').PropType<Number[]>} */
      type: Array,
      required: true
    }
  },
  computed: {
    value: {
      get() {
        if (this.currentValue != null) return this.currentValue
        if (this.filterValue != null) return this.filterValue
        return this.range && this.range.length
          ? this.range
          : undefined
      },
      set(value) { this.currentValue = value }
    },
    marks() {
      if (this.buckets && this.buckets.length > 0) {
        const x = this.buckets.map(({ val }) => parseInt(val, 0)).concat([this.range[1]])
        return x
      }
      const marksCount = 10
      const [min, max] = this.range
      const step = (max - min) / marksCount
      if (Number.isNaN(step)) return undefined

      return Array.from({length: marksCount + 1}, (_, i) =>  min + Math.round(i * step))
    },
    valueChanged() {
      return this.currentValue != null && JSON.stringify(this.currentValue) !== JSON.stringify(this.filterValue)
    },
    filterValue() {
      const { items: [item = {}] = [] } = this.filter || {}
      const { start, end } = item
      return Number.isFinite(start) && Number.isFinite(end)
        ? [start, end]
        : undefined
    },
    rangeMin() { return this.range[0] || 0 },
    rangeMax() { return this.range[1] || 1 },
  },
  methods: {
    applyFilter() {
      const originalFilter = this.filter
        ? this.filter
        : { type: this.filterType }
      const updatedFilter = Object.assign({}, originalFilter, {
        q: this.currentValue.map(v => String(v)),
        items: [{ start: this.currentValue[0], end: this.currentValue[1] }]
      })
      this.$emit('change', updatedFilter)
    }
  }
}
</script>