<template>
  <div class="facet-overview-panel">
    <!-- timeline type -->
    <div v-if="type === 'timeline'">
      <div class="d-flex mb-3 ml-0 justify-content-between">
        <div class="col p-0 mr-auto">
          <div class="tb-title m-0 mt-2 label small-caps font-weight-bold">
            {{ $tc(`label.${facet}.optionsTitle`) }}
          </div>
          <span class="small">
            {{ $tc(`label.${facet}.optionsDescription`) }}
          </span>
        </div>
        <div class="col p-0 align-self-end">
          <li class="form-inline display-style">
            <form class="form-inline">
              <radio-group
                :modelValue="displayStyle"
                @update:modelValue="displayStyle = $event"
                :options="displayStyleOptions"
                type="button"
              />
              <info-button name="relative-vs-absolute-year-graph" class="ml-2" />
            </form>
          </li>
        </div>
      </div>
      <div class="row mb-3">
        <timeline
          :contrast="false"
          :values="timelineValues"
          @highlight="onHighlight"
          @highlight-off="onHighlightOff"
          :highlight="timelineHighlightValue"
          :highlight-enabled-state="timelineHighlightEnabled"
          :brushable="false"
        >
          <template v-slot="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t ?? 0, 'year', 'en') }} &middot;
              <b
                v-html="
                  $tc(
                    displayStyle == 'percent' ? 'numbers.resultsPercent' : 'numbers.results',
                    tooltipScope.tooltip.item.w ?? 0,
                    {
                      n: $n(tooltipScope.tooltip.item.w ?? 0)
                    }
                  )
                "
              />
            </div>
          </template>
        </timeline>
      </div>
    </div>

    <!-- bar type -->
    <div v-if="type === 'bars'">
      <stacked-bars-panel
        :hover-id="hoverId"
        class="row"
        :label="$tc(`label.${facet}.title`, 1)"
        :buckets="values"
        :facet-type="facet"
        :default-click-action-disabled="true"
        @hovered="onHoverBar"
        @barItemClick="param => $emit('facetItemClick', param)"
      />
    </div>

    <b-button
      v-if="type === 'bars' && numberOfAvailableBucketsToLoad > 0"
      size="sm"
      variant="outline-secondary"
      class="mt-2 mr-1"
      @click="handleLoadMore"
    >
      <span v-if="isLoading" v-html="$t('actions.loading')" />
      <span v-else>
        {{ $t('actions.more') }}
        <span
          v-html="
            $tc('numbers.moreOptions', numberOfAvailableBucketsToLoad, {
              n: $n(numberOfAvailableBucketsToLoad)
            })
          "
        />
      </span>
    </b-button>

    <hr />
  </div>
</template>

<script lang="ts">
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue'
import Timeline from '@/components/modules/Timeline.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import { Bucket } from '@/models'
import { search } from '@/services'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import { PropType } from 'vue'
import { isBucket } from '@/models/typeGuards'

const DisplayStyles = ['percent', 'sum']

const timelineValuesSorter = (a, b) => a.t - b.t

function fillEmptyYearsWithZeros(timelineValues, timelineRange: [number, number] | []) {
  if (!timelineRange) return timelineValues
  const [rangeMin, rangeMax] = timelineRange
  const presentYears = timelineValues.map(({ t }) => t)

  const rangeSize = rangeMax - rangeMin
  if (isNaN(rangeSize)) return timelineValues

  const range = [...Array(rangeSize).keys()].map(i => rangeMin + i)

  return range
    .reduce((values, year) => {
      if (presentYears.indexOf(year) === -1) {
        values.push({ t: year, w: 0 })
      }
      return values
    }, timelineValues)
    .sort(timelineValuesSorter)
}

export interface IData {
  displayStyle: string
  cachedUnfilteredCounts?: { [key: string]: number }
}

export default {
  data: (): IData => ({
    displayStyle: 'sum'
  }),
  props: {
    hoverId: {
      type: String
    },
    facet: {
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
    }, // any of the common facet types: newspaper, language, etc.
    type: {
      type: String as PropType<'timeline' | 'bars'>, // type of the visualisation component
      validator: (t: string) => ['timeline', 'bars'].includes(t)
    },
    values: {
      type: Array as PropType<Bucket[]>,
      default: () => [],
      validator: (v: any[]) => v.map(isBucket).reduce((acc, v) => acc && v, true)
    },
    timelineHighlightValue: {
      type: Object as PropType<{ w: number; t: number }>
    }, // a `{ w, t }` object (see Timeline.js)
    timelineHighlightEnabled: {
      type: Boolean
    },
    timelineDomain: {
      type: Array as PropType<number[]>,
      validator: (v: any[]) => v.length === 0 || v.length === 2
    },
    isLoading: {
      type: Boolean
    },
    numBuckets: {
      type: Number
    }
  },
  components: {
    StackedBarsPanel,
    Timeline,
    InfoButton,
    RadioGroup
  },
  computed: {
    /** @returns {string} */
    title() {
      return this.$tc(`label.${this.facet}.title`, this.values.length || 1)
    },
    /** @returns {{w: number, t: number}[]} */
    timelineValues() {
      let v = this.values
        .map(({ val, count }) => ({ t: parseInt(val, 10), w: count }))
        .sort(timelineValuesSorter)

      if (this.displayStyle === 'percent' && this.cachedUnfilteredCounts != null) {
        v = v.map(({ t, w }) => {
          // @ts-ignore
          const total = this.cachedUnfilteredCounts[t]
          if (total > 0) return { t, w: w / total }
          return { t, w: 0 }
        })
      }

      return fillEmptyYearsWithZeros(v, this.timelineDomainRange)
    },
    timelineDomainRange(): [number, number] | [] {
      if (this.timelineDomain.length === 2) {
        return this.timelineDomain as [number, number]
      }
      const keys = this.values.map(({ val }) => parseFloat(val)).sort()
      return keys.length > 0 ? [keys[0], keys[keys.length - 1]] : []
    },
    /** @returns {number} */
    numberOfAvailableBucketsToLoad() {
      return this.numBuckets - this.values.length
    },
    /** @returns {any[]} */
    displayStyleOptions() {
      return DisplayStyles.map(value => ({
        text: this.$t(`label.display.${value}`),
        value
      }))
    }
  },
  methods: {
    /** @param {object} data */
    onHighlight(data) {
      this.$emit('timeline-highlight', { facetId: this.facet, data })
    },
    onHighlightOff() {
      this.$emit('timeline-highlight-off', { facetId: this.facet })
    },
    /** @param {object} val */
    onHoverBar(val) {
      this.$emit('hovered', String(val))
    },
    handleLoadMore() {
      this.$emit('load-more-items')
    }
  },
  watch: {
    /** @param {string} value */
    async displayStyle(value) {
      // percent value against total number of articles per year
      if (value === 'percent' && this.cachedUnfilteredCounts == null) {
        const query = {
          limit: 0,
          facets: 'year',
          group_by: 'articles'
        }
        const response = await search.find({ query })
        this.cachedUnfilteredCounts = response.info.facets.year.buckets.reduce((acc, bucket) => {
          acc[bucket.val] = bucket.count
          return acc
        }, {})
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';
@import '@/styles/variables.sass';

.facet-overview-panel {
  &.left {
    .viz-bar {
      background-color: $inspect-compare-left-panel-color;
    }
    .d3-timeline g.context path.curve {
      stroke: $inspect-compare-left-panel-color;
    }
  }
  &.right {
    .viz-bar {
      background-color: $inspect-compare-right-panel-color;
    }
    .d3-timeline g.context path.curve {
      stroke: $inspect-compare-right-panel-color;
    }
  }
  &.middle {
    .viz-bar {
      background-color: $inspect-compare-middle-panel-color;
    }
    .d3-timeline g.context path.curve {
      stroke: $inspect-compare-middle-panel-color;
    }
  }

  .display-style {
    float: right;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "label": {
      "display": {
        "sum": "sum",
        "percent": "%"
      }
    }
  }
}
</i18n>
