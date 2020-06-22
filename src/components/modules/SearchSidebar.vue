<template>
  <i-layout-section :width="width">
    <!--  header -->
    <div slot="header" class="border-bottom bg-light">
      <slot name="tabs">
        <search-tabs/>
      </slot>
      <div class="py-3 px-3">
        <search-pills
          :filters="filters"
          @changed="handleFiltersChanged"
        />
        <span v-if="ignoredFilters.length">
          <em class="small" v-html="$tc('numbers.ignoredFilters', ignoredFilters.length, {
            n: ignoredFilters.length,
          })"/>
          &nbsp;
          <info-button :name="infoButtonName" />
        </span>
        <slot name="header">
          <!-- extra header -->
        </slot>
      </div>
    </div>
    <!-- body (aka) facets -->
    <div class="pt-3 pb-5">
      <div class="mx-3" v-if="isResettable">
        <b-button class="mb-2"
          variant="outline-danger"
          size="sm" @click="reset">{{ $t('actions.resetFilters') }}</b-button>
      </div>
      <slot>
        <!-- slot here for extra facets -->
      </slot>
      <search-facets
        :facets="facets"
        :filters="filters"
        :start-year="startYear"
        :end-year="endYear"
        @changed="handleFiltersChanged"/>
    </div>
  </i-layout-section>
</template>

<script>
import SearchPills from '@/components/SearchPills'
import SearchTabs from '@/components/modules/SearchTabs'
import InfoButton from '@/components/base/InfoButton'
import SearchFacets from '@/components/SearchFacets'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').Facet} Facet
 */

export default {
  props: {
    /* Used for helper button */
    contextTag: {
      type: String,
    },
    width: {
      type: String,
      default: '400px',
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
    /** @type {import('vue').PropOptions<Filter[]>} */
    ignoredFilters: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // propagate filters changed
      this.$emit('changed', filters);
    },
    reset() { this.$emit('changed', []); },
  },
  computed: {
    /** @return {boolean} */
    isResettable() {
      return !!this.filters.filter(d => d.type !== 'hasTextContents').length;
    },
    /** @return {string} */
    infoButtonName() {
      return `how-${this.contextTag}-work-with-search-filters`
    },
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear;
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear;
    },
  },
  components: {
    SearchPills,
    InfoButton,
    SearchTabs,
    SearchFacets,
  },
};
</script>
