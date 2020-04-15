<template>
  <div class="container-fluid">
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
              Two queries are required to compute intersection
            </div>
            <div v-if="comparableIndex !== 1">
              <button class="btn mb-1 btn-outline-primary btn-sm"
                      v-on:click="insertMostRecentSearchQuery(comparableIndex)">
                Insert most recent search query
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
            @facetItemClick="param => handleFacetItemClicked(comparableIndex, param)"
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
import FacetOverviewPanel from '@/components/modules/searchQueriesComparison/FacetOverviewPanel';
import LoadingIndicator from '@/components/modules/LoadingIndicator';

/**
 * @typedef {import('../../../models').Bucket} Bucket
 * @typedef {import('../../../models').Entity} Entity
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

/**
 * @param {number} comparableIndex
 * @returns {boolean}
 */
const isIntersection = comparableIndex => comparableIndex === 1

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
      this.$emit('insertRecentSearchQuery', comparableIndex)
    },
    /**
     * @param {{ facetId: string, data: any }} param
     */
    onTimelineHighlight({ facetId, data }) {
      this.$set(this.timelineHighlights, facetId, { enabled: true, data: data.datum });
    },
    /**
     * @param {{ facetId: string }} param
     */
    onTimelineHighlightOff({ facetId }) {
      this.timelineHighlights[facetId] = { enabled: false };
      this.$set(this.timelineHighlights, facetId, { enabled: false });
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
      console.info(`Clicked [handleFacetItemClicked] ${comparableIndex}`, item, type)
      this.$store.dispatch('monitor/ACTIVATE', {
        item,
        type,
        disableFilterModification: isIntersection(comparableIndex),
        subtitle: this.getMonitorSubtitleForComparable(comparableIndex),
        filtersUpdatedCallback: filters => console.log('SBS filters updated: ', filters)
      })
    },
    /**
     * @param {number} comparableIndex
     * @returns {string}
     */
    getMonitorSubtitleForComparable(comparableIndex) {
      // TODO:
      return `Comparable ${comparableIndex}`
    }
  },
  computed: {
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