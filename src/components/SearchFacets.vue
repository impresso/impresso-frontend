<template>
  <div id="search-facets">
    <filter-timeline v-if="containsTimelineFacets" class="border-top mx-3 py-2 mb-2" :filters="daterangeFilters"
      :values="timelineValues" :min-date="minDate" :max-date="maxDate" :start-year="startYear" :end-year="endYear"
      :group-by="groupBy" @reset-filters="resetFilters" @changed="updateDaterangeFilters" />
    <filter-range v-for="(facet, index) in rangeFacets" class="border-top py-2 mx-3" :key="`r-${index}`" :facet="facet"
      :facet-filters="getFacetFilters(facet.type)" @changed="filters => facetFiltersUpdated(facet.type, filters)" />
    <filter-facet class="border-top py-2 mx-3" v-for="(facet, index) in standardFacets" :key="index" :facet="facet"
      :context-filters="filters" :facet-filters="getFacetFilters(facet.type)"
      @changed="filters => facetFiltersUpdated(facet.type, filters)" collapsible />
  </div>
</template>

<script>
import FilterFacet from '@/components/modules/FilterFacet.vue'
import FilterTimeline from '@/components/modules/FilterTimeline.vue'
import FilterRange from '@/components/modules/FilterRange.vue'
import { facetToTimelineValues } from '@/logic/facets'
import FilterFactory from '@/models/FilterFactory'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').Facet} Facet
 */

const TimelineFacetTypes = ['year', 'daterange']
const RangeFacetTypes = ['contentLength']

export default {
  props: {
    /** @type {import('vue').PropOptions<string>} */
    groupBy: {
      type: String,
      default: 'articles',
    },
    /** @type {import('vue').PropOptions<Filter[]>} */
    filters: {
      type: Array,
      default: () => [],
    },
    /** @type {import('vue').PropOptions<Facet[]>} */
    facets: {
      type: Array,
      default: () => [],
    },
    /** @type {import('vue').PropOptions<number>} */
    startYear: {
      type: Number,
      default: 1737,
    },
    /** @type {import('vue').PropOptions<number>} */
    endYear: {
      type: Number,
      default: 2020,
    },
  },
  data: () => ({
    selectedFacet: false,
    selectedDaterangeFilter: null,
  }),
  computed: {
    /** @returns {Facet[]} */
    standardFacets() {
      return this.facets.filter(
        ({ type }) => !TimelineFacetTypes.includes(type) && !RangeFacetTypes.includes(type),
      )
    },
    /** @returns {Facet[]} */
    rangeFacets() {
      return this.facets.filter(({ type }) => RangeFacetTypes.includes(type))
    },
    /** @returns {boolean} */
    containsTimelineFacets() {
      return this.facets.filter(({ type }) => TimelineFacetTypes.includes(type)).length > 0
    },
    /** @returns {Filter[]} */
    daterangeFilters() {
      return this.filters.filter(({ type }) => type === 'daterange')
    },
    impressoMinDate() {
      const date = new Date(window.impressoDocumentsYearSpan.firstYear + '-01-01')
      date.setUTCHours(0, 0, 0, 0)
      return date
    },
    impressoMaxDate() {
      const date = new Date(window.impressoDocumentsYearSpan.lastYear + '-12-31')
      date.setUTCHours(23, 59, 59, 0)
      return date
    },
    /** @returns {Date} */
    minDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (min, d) => (d.t < min ? d.t : min),
          this.timelineValues[0].t,
        )
        return new Date(`${y}-01-01`)
      }
      return new Date(`${this.startYear}-01-01`)
    },
    /** @returns {Date} */
    maxDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (max, d) => (d.t > max ? d.t : max),
          this.timelineValues[0].t,
        )
        return new Date(`${y}-12-31`)
      }
      return new Date(`${this.endYear}-12-31`)
    },
    /** @returns {any[]} */
    timelineValues() {
      const yearFacet = this.facets.find(({ type }) => type === 'year')
      if (!yearFacet || !yearFacet.buckets.length) return []
      return facetToTimelineValues(yearFacet)
    },
  },
  methods: {
    /**
     * @param {string} type
     * @returns {Filter[]}
     */
    getFacetFilters(type) {
      return this.filters.filter(d => d.type === type).map(filter => FilterFactory.create(filter))
    },
    /**
     * @param {string} type
     */
    resetFilters(type) {
      this.$emit(
        'changed',
        this.filters.filter(d => d.type !== type),
      )
    },
    /**
     * @param {Filter[]} daterangeFilters
     */
    updateDaterangeFilters(daterangeFilters) {
      this.$emit(
        'changed',
        this.filters.filter(({ type }) => type !== 'daterange').concat(daterangeFilters),
      )
    },
    /**
     * @param {string} type
     * @param {Filter[]} updatedFilters
     */
    facetFiltersUpdated(type, updatedFilters) {
      let updatedFiltersIndex = 0

      const mergedFilters = this.filters
        .map(filter => {
          if (filter.type === type) {
            if (updatedFiltersIndex < updatedFilters.length - 1) {
              updatedFiltersIndex += 1
              return updatedFilters[updatedFiltersIndex - 1]
            }
            return undefined
          }
          return filter
        })
        .filter(filter => filter != null)
      const remainingUpdatedFilters = updatedFilters.slice(updatedFiltersIndex)

      this.$emit('changed', mergedFilters.concat(remainingUpdatedFilters))
    },
  },
  components: {
    FilterTimeline,
    FilterFacet,
    FilterRange,
  },
}
</script>

<style scoped lang="scss">
.facet-filter {
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-areas: 'left' 'right';

  .left {
    grid-area: 'left';
  }

  .right {
    opacity: 0;
    grid-area: 'right';
  }

  &:hover {
    .right {
      opacity: 1;
    }
  }
}

.filter-opts {
  position: absolute;
  width: 240px;
  left: auto;
  right: -1px;
  top: -2px;
  background: white;
  border: 1px solid;
  box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);
}
</style>
<i18n lang="json">{
  "en": {
    "groupBy": {
      "articles": "articles",
      "images": "images"
    }
  }
}</i18n>
