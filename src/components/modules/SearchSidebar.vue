<template lang="html">
  <i-layout-section :width="width">
    <!--  header -->
    <div slot="header" class="border-bottom bg-light">
      <search-tabs/>
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
    <div class="pt-3">
      <slot>
        <!-- slot here for extra facets -->
      </slot>

      <search-facets
        :store="store"
        :facets="facets"
        :filters="filters"
        @changed="handleFiltersChanged"/>
        <!-- @submit-facet="onAddFilter"
        @update-filter="onFilterUpdated"
        @reset-filter="onFilterReset"/> -->
    </div>
  </i-layout-section>
</template>

<script>
import SearchPills from '@/components/SearchPills';
import SearchTabs from '@/components/modules/SearchTabs';
import InfoButton from '@/components/base/InfoButton';
import SearchFacets from '@/components/SearchFacets';

export default {
  props: {
    store: {
      type: String,
    },
    width: {
      type: String,
      default: '400px',
    },
    excludedTypes: {
      type: Array,
      default: () => [],
    },
    filters: {
      /** @type {import('vue').PropType<import('../../models/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
    facets: {
      /** @type {import('vue').PropType<import('../../models/models').Facet[]>} */
      type: Array,
      default: () => [],
    },
    filtersRemoved: {
      /** @type {import('vue').PropType<import('../../models/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleFiltersChanged(filters) {
      // propagate filters changed
      this.$emit('changed', filters);
    },
  },
  computed: {
    infoButtonName() {
      return ['how-', this.store, '-work-with-search-filters'].join('');
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

<style lang="css" scoped>
</style>
