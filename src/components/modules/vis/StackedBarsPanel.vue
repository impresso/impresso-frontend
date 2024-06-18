<template>
  <div class="d-flex wrapper mx-0">
    <!-- label -->
    <div class="tb-title label small-caps font-weight-bold my-2">{{ label }}</div>

    <!-- bars -->
    <div class="row mx-0">
      <div class="col bg-light">
        <div
          v-for="(bucket, idx) in buckets"
          :key="idx"
          :class="`bar-container row my-1 small ${isHovered(bucket) ? 'hilight' : ''}`"
          @mouseover="onHover(bucket)"
        >
          <VizBar
            class="w-100"
            :percent="toScaledValue(bucket.count) * 100"
            :count="bucket.count"
            :uid="bucket.item ? bucket.item.uid : null"
            :item="bucket.item"
            :type="facetType"
            :default-click-action-disabled="defaultClickActionDisabled"
            :search-index="searchIndex"
            @click="param => $emit('barItemClick', param)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VizBar from '../../base/VizBar.vue'
import BucketModel from '../../../models/Bucket'

/**
 * @typedef {import('@/models').Bucket} Bucket
 */

export default {
  props: {
    /** @type {import('vue').PropOptions<string>} */
    label: { type: String }, // label of the chart
    /** @type {import('vue').PropOptions<string>} */
    hoverId: { type: String }, // TODO: what is this?
    /** @type {import('vue').PropOptions<Bucket[]>} */
    buckets: {
      type: Array,
      default: () => [],
      validator: buckets =>
        buckets.map(b => b instanceof BucketModel).reduce((acc, v) => v && acc, true),
    },
    /** @type {import('vue').PropOptions<string>} */
    facetType: { type: String }, // type of facet to render
    /** @type {import('vue').PropOptions<boolean>} */
    defaultClickActionDisabled: {
      type: Boolean,
      default: false,
    },
    searchIndex: {
      type: String,
      default: 'search',
    },
  },
  components: {
    VizBar,
  },
  computed: {
    /** @returns {number} */
    maxValue() {
      return Math.max(...this.buckets.map(b => b.count))
    },
  },
  methods: {
    /**
     * @param {number} val
     * @returns {number}
     */
    toScaledValue(val) {
      return val / this.maxValue
    },
    /**
     * @param {Bucket} bucket
     */
    onHover(bucket) {
      this.$emit('hovered', String(bucket?.item?.uid ?? ''))
    },
    /**
     * @param {Bucket} bucket
     * @returns {boolean}
     */
    isHovered(bucket) {
      return this.hoverId === bucket?.item?.uid
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'impresso-theme/src/scss/variables.sass';

.wrapper {
  flex-direction: column;
  flex-grow: 1;
}

.bar-container {
  &.hilight {
    background-color: transparentize($clr-accent, 0);
  }
}
</style>
