<template lang="html">
  <div>
    <div v-if="filter.type.toLowerCase() == 'string'">
      <filter-string v-model="filter" v-on:input="updateFilter" />
    </div>
    <div v-if="filter.type.toLowerCase() == 'daterange'">
      <filter-date-range v-model="filter" />
    </div>
    <div v-if="filter.type.toLowerCase() == 'boundingbox'">
      <filter-map v-model="filter" v-on:input="updateFilter" />
    </div>
  </div>
</template>

<script>
import FilterAbstractContext from './FilterAbstractContext';
import FilterDateRange from './FilterDateRange';
import FilterMap from './FilterMap';
import FilterString from './FilterString';

export default {
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  components: {
    'filter-map': FilterMap,
    'filter-string': FilterString,
    'filter-date-range': FilterDateRange,
    'filter-context': FilterAbstractContext,
  },
  methods: {
    updateFilter() {
      this.$emit('input', this.filter);
    },
  },
};
</script>

<style lang="css">
</style>
