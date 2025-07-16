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
            :uid="bucket.item ? bucket.item.uid : ''"
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

<script lang="ts">
import { PropType } from 'vue'
import VizBar from '../../base/VizBar.vue'
import { Bucket } from '@/models'
import { isBucket } from '@/models/typeGuards'

export default {
  props: {
    label: { type: String }, // label of the chart
    hoverId: { type: String }, // TODO: what is this?
    buckets: {
      type: Array as PropType<Bucket[]>,
      default: () => [],
      validator: (buckets: any[]) => buckets.map(isBucket).reduce((acc, v) => v && acc, true)
    },
    facetType: {
      type: String as PropType<
        | 'topic'
        | 'textReuseCluster'
        | 'textReusePassage'
        | 'collection'
        | 'year'
        | 'type'
        | 'country'
        | 'language'
        | 'newspaper'
      >
    }, // type of facet to render
    defaultClickActionDisabled: {
      type: Boolean,
      default: false
    },
    searchIndex: {
      type: String,
      default: 'search'
    }
  },
  components: {
    VizBar
  },
  computed: {
    /** @returns {number} */
    maxValue() {
      return Math.max(...this.buckets.map(b => b.count))
    }
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

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
