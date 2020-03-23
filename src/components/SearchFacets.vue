<template>
  <div id="search-facets">
    <filter-timeline
      class="border-top mx-3 py-2 mb-2"
      :filters="daterangeFilters"
      :values="timelineValues"
      :min-date="minDate"
      :max-date="maxDate"
      :start-year="startYear"
      :end-year="endYear"
      :group-by="groupBy"
      @reset-filters="resetFilters"
      @changed="updateDaterangeFilters"
    />
    <filter-facet
      class="border-top py-2 mx-3"
      v-for="(facet, index) in standardFacets"
      :key="index"
      :facet="facet"
      :context-filters="filters"
      :facet-filters="getFacetFilters(facet.type)"
      @changed="filters => facetFiltersUpdated(facet.type, filters)"
      collapsible/>
  </div>
</template>

<script>
import FilterFacet from '@/components/modules/FilterFacet';
import FilterTimeline from '@/components/modules/FilterTimeline';
import { facetToTimelineValues } from '@/logic/facets'
import FilterFactory from '@/models/FilterFactory'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').Facet} Facet
 */

export default {
  props: {
    groupBy: {
      type: String,
      default: 'articles',
    },
    filters: {
      /** @type {import('vue').PropType<Filter[]>} */
      type: Array,
      default: () => [],
    },
    facets: {
      /** @type {import('vue').PropType<Facet[]>} */
      type: Array,
      default: () => [],
    },
    startYear: {
      type: Number,
      default: 1737,
    },
    endYear: {
      type: Number,
      default: 2020,
    },
    nonStandardFacetTypes: {
      type: Array,
      default: () => ['year', 'daterange']
    }
  },
  data: () => ({
    selectedFacet: false,
    selectedDaterangeFilter: null,
  }),
  computed: {
    standardFacets() {
      return this.facets.filter(({ type }) => !this.nonStandardFacetTypes.includes(type))
    },
    daterangeFilters() {
      return this.filters.filter(({ type }) => type === 'daterange');
    },
    daterangeIncluded() {
      return this.daterangeFilters.filter(({ filter: { context } }) => context === 'include');
    },
    minDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce((min, d) => (d.t < min ? d.t : min), this.timelineValues[0].t);
        return new Date(`${y}-01-01`);
      }
      return new Date(`${this.startYear}-01-01`);
    },
    maxDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce((max, d) => (d.t > max ? d.t : max), this.timelineValues[0].t);
        return new Date(`${y}-12-31`);
      }
      return new Date(`${this.endYear}-12-31`);
    },
    timelineValues() {
      const yearFacet = this.facets.find(({ type }) => type === 'year')
      if (!yearFacet || !yearFacet.buckets.length) return []
      return facetToTimelineValues(yearFacet)
    }
  },
  methods: {
    getFacetFilters(type) {
      return this.filters
        .filter(d => d.type === type)
        .map(filter => FilterFactory.create(filter));
    },
    resetFilters(type) {
      this.$emit('changed', this.filters.filter(d => d.type !== type));
    },
    updateDaterangeFilters(daterangeFilters) {
      this.$emit('changed', this.filters
        .filter(({ type }) => type !== 'daterange')
        .concat(daterangeFilters));
    },
    facetFiltersUpdated(type, updatedFilters) {
      let updatedFiltersIndex = 0

      const mergedFilters = this.filters
        .map(filter => {
          if (filter.type === type) {
            if (updatedFiltersIndex < (updatedFilters.length - 1)) {
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
  },
};
</script>

<style scoped lang="scss">
.facet-filter{
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-areas: "left" "right";
  .left{
    grid-area: "left"
  }
  .right{
    opacity: 0;
    grid-area: "right"
  }
  &:hover{
    .right{
      opacity: 1;
    }
  }
}

.filter-opts{
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
<i18n>
  {
    "en": {
      "groupBy": {
        "articles": "articles",
        "images": "images"
      }
    }
  }
</i18n>
