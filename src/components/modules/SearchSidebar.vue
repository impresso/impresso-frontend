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
        <span v-if="filtersRemoved.length">
          <em class="small" v-html="$tc('numbers.filtersRemoved', filtersRemoved.length, {
            n: filtersRemoved.length,
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
    filtersRemoved: {
      /** @type {import('vue').PropType<Filter[]>} */
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
    reset() {
      this.$emit('changed', []);
    },
  },
  computed: {
    isResettable() {
      return !!this.filters.filter(d => d.type !== 'hasTextContents').length;
    },
    infoButtonName() {
      return `how-${this.contextTag}-work-with-search-filters`
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
