<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right">
    <div class="px-4 py-4 border-bottom">
      <search-bar />
    </div>
  </i-layout-section>
  <i-layout-section>
  </i-layout-section>
</i-layout>
</template>

<script>
import SearchBar from './SearchBar';

export default {
  computed: {

  },
  methods: {

  },
  components: {

    'search-bar': SearchBar,
  },
  mounted() {

  },
  beforeDestroy() {

  },
};
</script>

<style lang="less">

</style>
