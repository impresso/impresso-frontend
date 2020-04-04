<template>
  <div>
    <div v-for="facet in facets"
      v-bind:key="`dbc-${facet.id}`">
      <span class="row tb-title mx-0 my-2 label small-caps font-weight-bold">{{ facet.id }}</span>
      <diverging-bars-chart :items="facet.items" :colors="chartColors" :round-value-fn="roundValueFn">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.isActive">
            <b>{{tooltipScope.tooltip.item.label}}</b> &middot; {{roundValueFn(tooltipScope.tooltip.item.intersection)}}
            <div v-html="$t('tooltip.common.left', { value: getIntersection(tooltipScope.tooltip.item.intersection, tooltipScope.tooltip.item.left)})"/>
            <div v-html="$t('tooltip.common.right', { value: getIntersection(tooltipScope.tooltip.item.intersection, tooltipScope.tooltip.item.right)})"/>
          </div>
        </div>
      </diverging-bars-chart>
    </div>
  </div>
</template>

<script>
import DivergingBarsChart from '@/components/modules/vis/DivergingBarsChart'

/**
 * @typedef {{ left: number, right: number, intersection: number, label: string }} FacetItem
 * @typedef {{ id: string, items: FacetItem[] }} FacetContainer
 */

export default {
  props: {
    /** @type {import('vue').PropOptions<FacetContainer[]>} */
    facets: {
      type: Array,
      default: () => [],
      required: true
    },
    /** @type {import('vue').PropOptions<{ left?: string, right?: string }>} */
    colors: {
      type: Object,
      default: () => ({})
    },
    /** @type {import('vue').PropOptions<(number) => string>} */
    roundValueFn: {
      type: Function,
      default: undefined
    }
  },
  methods: {
    /**
     * @param {number} intersectionValue
     * @param {number} comparableValue
     * @returns {string}
     */
    getIntersection(intersectionValue, comparableValue) {
      return `${this.$n(intersectionValue / comparableValue * 100, { notation: 'short' })}%`;
    }
  },
  components: {
    DivergingBarsChart
  },
  computed: {
    /** @returns {{ colorLeft?: string, colorRight?: string }} */
    chartColors() {
      return { colorLeft: this.colors.left, colorRight: this.colors.right }
    }
  }
}
</script>

<i18n>
{
  "en": {
    "tooltip": {
      "common": {
        "left": "<b>{value}</b> in common with left query",
        "right": "<b>{value}</b> in common with right query"
      }
    }
  }
}
</i18n>