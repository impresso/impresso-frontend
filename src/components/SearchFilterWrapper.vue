<template lang="html">
  <div>
    <filter-date-range />
    <b-button variant="primary" block>Submit</b-button>
  </div>
</template>

<script>
import FilterDateRange from './modules/SearchFilterDateRange';

export default {
  components: {
    'filter-date-range': FilterDateRange,
  },
};
</script>

<style lang="css">
</style>
