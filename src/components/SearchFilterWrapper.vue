<template lang="html">
  <div>
    <filter-date-range />
    <filter-map />
    <b-button id="button-filter" variant="primary" block>Filter</b-button>
  </div>
</template>

<script>
import FilterDateRange from './modules/SearchFilterDateRange';
import FilterMap from './modules/SearchFilterMap';

export default {
  components: {
    'filter-date-range': FilterDateRange,
    'filter-map': FilterMap,
  },
};
</script>

<style scoped lang="less">
.filter{
  margin-bottom: 15px;
}
</style>
