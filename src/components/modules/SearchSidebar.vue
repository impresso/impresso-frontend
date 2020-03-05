<template lang="html">
  <i-layout-section :width="width">
    <!--  header -->
    <div slot="header" class="border-bottom bg-light">
      <search-tabs/>
      <div class="py-3 px-3">
        <search-pills
          :filters="filtersAvailable"
          @changed="handleFiltersChanged"
        />
        <span v-if="filtersRemoved.length">
          <em class="small" v-html="$tc('numbers.filtersRemoved', filtersRemoved.length, {
            n: filtersRemoved.length,
          })"/>
          &nbsp;
          <info-button :name="infoButtonName" />
        </span>
        <!-- slot here for autocomplete / other stuff. -->
      </div>
    </div>
    <!-- body (aka) facets -->
    <div class="pt-3">
      <search-facets
        :store="store"
        :filters="filtersAvailable"
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
      /** @type {import('vue').PropType<import('../models/models').Filter[]>} */
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
    filtersRemoved() {
      return this.filters.filter(d => this.excludedTypes.includes(d.type));
    },
    filtersAvailable() {
      return this.filters.filter(d => !this.excludedTypes.includes(d.type));
    },
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
