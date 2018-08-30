<template lang="html">
  <i-layout id="TestPage">
    <i-layout-section width="400px" class="br">
      <search-bar v-on:submit="search" />
    </i-layout-section>
    <i-layout-section>
      <h1>results</h1>
      <pre>{{searchResults}}</pre>
    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchBar from './SearchBar';

export default {
  data: () => ({
  }),
  computed: {
    searchResults: {
      get() {
        return this.$store.getters['search/results'];
      },
    },
  },
  methods: {
  },
  components: {
    SearchBar,
  },
};
</script>

<style scoped lang="less">
</style>
