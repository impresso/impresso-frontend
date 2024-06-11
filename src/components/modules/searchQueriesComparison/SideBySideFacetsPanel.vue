<template>
  <div class="side-by-side-facets-panel container-fluid">
    <!-- This row is composed of threee columns! -->
    <div class="row"
      v-for="(facet, facetIndex) in facets"
      :key="facetIndex">
      <div class="one-third"
           v-for="(comparableItem, comparableIndex) in facet.comparableItems"
           :key="comparableIndex"
           :class="{
             'loading-bg': isComparableLoading(comparableIndex),
             'border-right': comparableIndex === 1,
             'border-left': comparableIndex === 1,
            }">

        <!-- loading indicator -->
        <div class="col" v-if="isComparableLoading(comparableIndex) && !disableHandlingLoadingAndEmpty">
          <loading-indicator class="col py-3" v-if="facetIndex === 0"/>
        </div>

        <!-- empty -->
        <div class="col empty-col" v-if="!isComparableLoading(comparableIndex) && !comparableItem.isLoaded  && !disableHandlingLoadingAndEmpty">
          <div v-if="facetIndex === 0" style="text-align: center;">
            <div v-if="comparableIndex === 1">
              <i>{{$t('missingSearchQueries')}}</i>
            </div>
            <div v-if="comparableIndex !== 1">
              <button class="btn mb-1 btn-outline-primary btn-sm"
                      v-on:click="insertMostRecentSearchQuery(comparableIndex)">
                {{$t('actions.useCurrentQuery')}}
              </button>
            </div>
          </div>
        </div>

        <!-- content -->
        <div class="col">
          <facet-overview-panel
            class="px-2"
            :class="{
              left : comparableIndex === 0,
              right: comparableIndex === 2,
              middle: comparableIndex === 1,
            }"
            v-if="!isComparableLoading(comparableIndex) && comparableItem.isLoaded"
            :facet="facet.id"
            :type="facet.visualisationType"
            :values="comparableItem.buckets"
            :numBuckets="comparableItem.numBuckets"
            @timeline-highlight="onTimelineHighlight"
            @timeline-highlight-off="onTimelineHighlightOff"
            @hovered="onHovered"
            @load-more-items="handleLoadMoreItems(comparableIndex, facet)"
            @facetItemClick="handleFacetItemClicked(comparableIndex, $event)"
            :hover-id="hoverId"
            :timeline-highlight-value="getTimelineHighlight(facet.id).data"
            :timeline-highlight-enabled="getTimelineHighlight(facet.id).enabled"
            :timeline-domain="timelineDomain"
            :search-query-id="`queryComparison/p-${comparableIndex}`"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FacetOverviewPanel from '@/components/modules/searchQueriesComparison/FacetOverviewPanel.vue';
import LoadingIndicator from '@/components/modules/LoadingIndicator.vue';
import { ComparableTypes } from '@/logic/queryComparison'
import { mapStores } from 'pinia'
import { useMonitorStore } from '@/stores/monitor'

/**
 * @typedef {import('../../../models').Bucket} Bucket
 * @typedef {import('../../../models').Entity} Entity
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/logic/queryComparison').Comparable} Comparable
 * @typedef {{ buckets: Bucket[], isLoaded: boolean, numBuckets: number }} ComparableItem
 * @typedef {{ id: string, comparableItems: ComparableItem[], visualisationType: string }} FacetContainer
 */

/**
 * @param {FacetContainer[]} facets
 * @returns {[number, number] | []}
 */
function getYearsSpan(facets) {
  const yearFacet = facets.find(({ id }) => id === 'year')
  if (!yearFacet) return []

  const years = [...new Set(yearFacet.comparableItems
    .flatMap(({ buckets }) => buckets.map(({ val }) => parseInt(val, 10))))].sort()

  return years.length > 0
    ? [years[0], years[years.length - 1]]
    : []
}

export default {
  data: () => ({
    /** @type {{ [key: string]: any }} */
    timelineHighlights: {},
    /** @type {string | undefined} */
    hoverId: undefined
  }),
  props: {
    /** @type {import('vue').PropOptions<FacetContainer[]>} */
    facets: {
      type: Array,
      default: () => []
    },
    /** @type {import('vue').PropOptions<boolean[]>} */
    comparableLoadingFlags: {
      type: Array,
      default: () => []
    },
    disableHandlingLoadingAndEmpty: {
      type: Boolean,
      default: false
    },
    /** @type {import('vue').PropOptions<Comparable[]>} */
    comparables: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    /**
     * @param {number} comparableIndex
     * @returns {boolean}
     */
    isComparableLoading(comparableIndex) { return !!this.comparableLoadingFlags[comparableIndex] },
    /**
     * @param {number} comparableIndex
     */
    insertMostRecentSearchQuery(comparableIndex) {
      this.$emit('insert-recent-search-query', comparableIndex)
    },
    /**
     * @param {{ facetId: string, data: any }} param
     */
    onTimelineHighlight({ facetId, data }) {
      this.timelineHighlights[facetId] = { enabled: true, data: data.datum };
    },
    /**
     * @param {{ facetId: string }} param
     */
    onTimelineHighlightOff({ facetId }) {
      this.timelineHighlights[facetId] = { enabled: false };
      this.timelineHighlights[facetId] = { enabled: false };
    },
    /**
     * @param {any} val
     */
    onHovered(val) {
      this.hoverId = String(val);
    },
    /**
     * @param {string} facetId
     * @returns {any}
     */
    getTimelineHighlight(facetId) {
      return this.timelineHighlights[facetId] || {};
    },
    /**
     * @param {number} comparableIndex
     * @param {FacetContainer} facet
     */
    handleLoadMoreItems(comparableIndex, facet) {
      const value = { comparableIndex, facetId: facet.id }
      this.$emit('load-more-items', value)
    },
    /**
     * @param {number} comparableIndex
     * @param {{ params: { item: Entity, type: string }, defaultActionExecuted: boolean }} facetItem
     */
    handleFacetItemClicked(comparableIndex, { params: { item, type } }) {
      const comparable = this.comparables[comparableIndex]
      const filters = comparable?.filters ?? comparable?.query?.filters

      this.monitorStore.activate({
        item,
        type,
        filters,
        disableFilterModification: comparable.type !== ComparableTypes.Query,
        subtitle: this.getMonitorSubtitleForComparable(comparableIndex),
        filtersUpdatedCallback: filters => {
          if (comparable.type !== ComparableTypes.Query) return // only queries can be modified
          const updatedComparable = {
            ...this.comparables[comparableIndex],
            query: { filters }
          }
          this.$emit(
            'comparable-updated',
            { comparableIndex, comparable: updatedComparable }
          )
        }
      })
    },
    /**
     * @param {number} comparableIndex
     * @returns {string | undefined}
     */
    getMonitorSubtitleForComparable(comparableIndex) {
      if (comparableIndex === 0) return '(left comparable)'
      if (comparableIndex === 1) return '(intersection)'
      if (comparableIndex === 2) return '(right comparable)'
      return undefined
    }
  },
  computed: {
    ...mapStores(useMonitorStore),
    /**
     * The span of the domain to fit the widest result on timeline.
     * @returns {[number, number]}
     */
    timelineDomain() {
      const span = getYearsSpan(this.facets)
      return span.length === 2
        ? span
        : [0, 0]
    }
  },
  components: {
    FacetOverviewPanel,
    LoadingIndicator
  }
}
</script>

<style lang="scss" scoped>
  .one-third {
    flex: 1 1 auto !important;
    max-width: 33.33%;
    max-width: calc(100% / 3);
  }

  .empty-col {
    align-items: center;
    display: flex;
    justify-items: center;
    justify-content: center;
    height: 100%;
  }

  .loading-bg {
    background: #ececec87;
  }
</style>
<i18n lang="json">
  {
    "en": {
      "missingSearchQueries": "Two queries are required to compute intersection"
    }
  }
</i18n>
