<template>
  <div class="diverging-bars-chart-panel">
    <div class="w-100">
      <div v-for="facet in facets" v-bind:key="`dbc-${facet.id}`" class="text-center">
        <span class="small-caps font-weight-bold">
          {{ facet.id }}
          <span v-if="facet?.items?.length > 0">
            {{
              $tc('numbers.options', facet?.items?.length ?? 0, { n: facet?.items?.length ?? 0 })
            }}
          </span>
        </span>
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

<script lang="ts">
import DivergingBarsChart from '@/components/modules/vis/DivergingBarsChart.vue'
import { PropType } from 'vue'

export interface FacetItem {
  left: number
  right: number
  intersection: number
  label: string
}

export interface FacetContainer {
  id: string
  items: FacetItem[]
  numBuckets: number
}

export default {
  props: {
    facets: {
      type: Array as PropType<FacetContainer[]>,
      default: () => [],
      required: true
    },
    scale: {
      type: String,
      default: 'linear'
    },
    roundValueFn: {
      type: Function as PropType<(number) => string>,
      default: undefined
    }
  },
  methods: {
    getIntersection(intersectionValue: number, comparableValue: number): string {
      const v = (intersectionValue / comparableValue) * 100
      return `${this.$n(v)}%`
    },
    getNumberOfAvailableBucketsToLoad(facet: FacetContainer): number {
      return facet.numBuckets - facet.items.length
    },
    handleLoadMore(facet: FacetContainer) {
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
