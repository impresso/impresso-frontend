<template lang="html">
  <section class="filter-facet-year">
    <!-- uncomment this -->
    <!-- <skyline v-model="data"></skyline> -->
  </section>
</template>

<script>
import Facet from '@/models/Facet';
// uncomment this
// import Skyline from './Skyline';

export default {
  props: {
    data: {
      type: Facet,
    },
  },
  components: {
    // uncomment this
    // Skyline,
  },
};
</script>

<style lang="less">
</style>
