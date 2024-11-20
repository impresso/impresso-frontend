<template>
  <div class="diverging-bars-chart-panel">
    <div class="w-100">
      <div v-for="facet in facets" v-bind:key="`dbc-${facet.id}`" class="text-center">
        <span class="small-caps font-weight-bold"
          >{{ facet.id }}
          {{ $tc('numbers.options', facet.items.length, { n: facet.items.length }) }}</span
        >
        <diverging-bars-chart :items="facet.items" :round-value-fn="roundValueFn" :scale="scale">
          <template v-slot="tooltipScope">
            <div v-if="tooltipScope.tooltip.isActive">
              <b>{{ tooltipScope.tooltip.item.label }}</b> &middot;
              {{ roundValueFn(tooltipScope.tooltip.item.intersection) }}
              <div
                v-html="
                  $t('tooltip.common.left', {
                    value: getIntersection(
                      tooltipScope.tooltip.item.intersection,
                      tooltipScope.tooltip.item.left
                    )
                  })
                "
              />
              <div
                v-html="
                  $t('tooltip.common.right', {
                    value: getIntersection(
                      tooltipScope.tooltip.item.intersection,
                      tooltipScope.tooltip.item.right
                    )
                  })
                "
              />
            </div>
          </template>
        </diverging-bars-chart>

        <b-button
          v-if="getNumberOfAvailableBucketsToLoad(facet) > 0"
          size="sm"
          variant="outline-secondary"
          class="mt-2 mr-1"
          @click="handleLoadMore(facet)"
        >
          <span>
            {{ $t('actions.more') }}
            <span
              v-html="
                $tc('numbers.moreOptions', getNumberOfAvailableBucketsToLoad(facet), {
                  n: $n(getNumberOfAvailableBucketsToLoad(facet))
                })
              "
            />
          </span>
        </b-button>

        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import DivergingBarsChart from '@/components/modules/vis/DivergingBarsChart.vue'

/**
 * @typedef {{ left: number, right: number, intersection: number, label: string }} FacetItem
 * @typedef {{ id: string, items: FacetItem[], numBuckets: number }} FacetContainer
 */

export default {
  props: {
    /** @type {import('vue').PropOptions<FacetContainer[]>} */
    facets: {
      type: Array,
      default: () => [],
      required: true
    },
    /** @type {import('vue').PropOptions<string>} */
    scale: {
      type: String,
      default: 'linear'
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
      const v = (intersectionValue / comparableValue) * 100
      console.log('VV', v)
      return `${this.$n(v)}%`
    },
    /**
     * @param {FacetContainer} facet
     * @returns {number}
     */
    getNumberOfAvailableBucketsToLoad(facet) {
      return facet.numBuckets - facet.items.length
    },
    /**
     * @param {FacetContainer} facet
     */
    handleLoadMore(facet) {
      this.$emit('load-more-items', facet)
    }
  },
  components: {
    DivergingBarsChart
  }
}
</script>

<i18n lang="json">
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
<style lang="scss">
.diverging-bars-chart-panel {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
@media (min-width: 992px) {
  .diverging-bars-chart-panel {
    max-width: 700px;
  }
}
@media (min-width: 1200px) {
  .diverging-bars-chart-panel {
    max-width: 960px;
  }
}
</style>
