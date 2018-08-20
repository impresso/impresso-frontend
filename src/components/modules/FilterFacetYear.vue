<template lang="html">
  <section class="filter-facet-year">
    <p>Put here the skyline component with v-model="data" </p>
    <!-- <skyline v-model="data"></skyline> -->
    <pre>{{data}}</pre>
  </section>
</template>

<script>
import Facet from '@/models/Facet';

export default {
  props: {
    data: {
      type: Facet,
    },
  },
};
</script>

<style lang="less">
</style>
