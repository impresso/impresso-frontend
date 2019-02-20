<template lang="html">
  <div id="search-filters" class="px-3">
    <div v-bind:class="`filter-wrapper filter-${filter.type}`" v-for="(filter, index) in filters">
      <filter-facet-year
        v-if="filter.type === 'year'"
        v-model="filters[index]"
        v-on:input="updateFilter"
        v-on:remove="submitFilter" />
      <filter-string
        v-if="filter.type.toLowerCase() === 'string'"
        v-model="filters[index]"
        v-on:input="updateFilter(index, filter)"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-regex
        v-if="filter.type.toLowerCase() === 'regex'"
        v-model="filters[index]"
        v-on:input="updateFilter(index, filter)"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-topic
        v-if="filter.type.toLowerCase() === 'topic'"
        v-model="filters[index]"
        v-on:input="updateFilter(index, filter)"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-language
        v-if="filter.type.toLowerCase() === 'language'"
        v-model="filters[index]"
        v-on:input="updateFilter(index, filter)"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-newspaper
        v-if="filter.type.toLowerCase() === 'newspaper'"
        v-model="filters[index]"
        v-on:input="updateFilter(index, filter)"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-named-entity
        v-if="filter.type.toLowerCase() === 'entity'"
        v-model="filters[index]"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-date-range
        v-if="filter.type.toLowerCase() === 'daterange'"
        v-model="filters[index]"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
    </div>
  </div>
</template>

<script>
import FilterFacetYear from './modules/FilterFacetYear';
import FilterDateRange from './modules/FilterDateRange';
import FilterNamedEntity from './modules/FilterNamedEntity';
import FilterRegex from './modules/FilterRegex';
import FilterTopic from './modules/FilterTopic';
import FilterLanguage from './modules/FilterLanguage';
import FilterNewspaper from './modules/FilterNewspaper';
import FilterString from './modules/FilterString';

export default {
  data: () => ({
    filtersOrder: ['string', 'regex', 'entity', 'topic', 'daterange', 'newspaper', 'language', 'year'],
  }),
  computed: {
    search: {
      get() {
        return this.$store.getters['search/getSearch'];
      },
    },
    filters: {
      get() {
        return this.search.filters.sort((a, b) => {
          const indexA = this.filtersOrder.indexOf(a.type);
          const indexB = this.filtersOrder.indexOf(b.type);

          if (indexA < indexB) {
            return -1;
          }

          if (indexA > indexB) {
            return 1;
          }

          return 0;
        });
      },
    },
  },
  methods: {
    updateFilter(index, filter) {
      this.$store.commit('search/UPDATE_FILTER', {
        index,
        filter,
      });
      this.$emit('input', filter);
    },
    submitFilter(filter) {
      this.$emit('submit-filter', filter);
    },
    removeFilter(index) {
      this.$store.commit('search/REMOVE_FILTER', index);
      this.$emit('remove-filter');
    },
  },
  components: {
    'filter-string': FilterString,
    'filter-regex': FilterRegex,
    'filter-named-entity': FilterNamedEntity,
    'filter-date-range': FilterDateRange,
    'filter-facet-year': FilterFacetYear,
    'filter-topic': FilterTopic,
    'filter-newspaper': FilterNewspaper,
    'filter-language': FilterLanguage,
  },
};
</script>

<style lang="scss">
#search-filters{
  .filter-wrapper:not(.filter-year){
    display: inline-block;
  }
}
</style>
