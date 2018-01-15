<template lang="html">
  <div>
    <div v-if="filter.type.toLowerCase() == 'string'">
      <filter-context v-model="filter" v-bind:options="context.string" />
      <filter-string v-model="filter" />
    </div>
    <div v-if="filter.type.toLowerCase() == 'daterange'">
      <filter-context v-model="filter" v-bind:options="context.daterange" />
      <filter-date-range v-model="filter" />
    </div>
    <div v-if="filter.type.toLowerCase() == 'boundingbox'">
      <filter-context v-model="filter" v-bind:options="context.boundingbox" />
      <filter-map v-model="filter" />
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
  data: () => ({
    context: {
      string: [
        {
          value: 'include',
          text: 'Include',
        },
        {
          value: 'exclude',
          text: 'Exclude',
        },
      ],
      daterange: [
        {
          value: 'include',
          text: 'Include',
        },
        {
          value: 'exclude',
          text: 'Exclude',
        },
      ],
      boundingbox: [
        {
          value: 'include',
          text: 'Include',
        },
        {
          value: 'exclude',
          text: 'Exclude',
        },
      ],
    },
  }),
  components: {
    'filter-map': FilterMap,
    'filter-string': FilterString,
    'filter-date-range': FilterDateRange,
    'filter-context': FilterAbstractContext,
  },
  methods: {
    // test() {
    //   this.$emit('input');
    // },
  },
};
</script>

<style lang="css">
</style>
