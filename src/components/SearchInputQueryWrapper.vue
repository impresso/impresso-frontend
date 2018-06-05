<template lang="html">
  <search-bar
  v-model="query"
  v-bind:suggestions="suggestions"
  v-on:reset="reset"
  v-on:submit="submit"
  />
</template>

<script>
import SearchBar from './modules/SearchInputQuery';

export default {
  data: () => ({
    query: '',
  }),
  computed: {
    suggestions: {
      get() {
        return this.$store.state.autocomplete.suggestions;
      },
    },
  },
  methods: {
    reset() {
      this.$store.commit('search/CLEAR');
      this.query = '';
    },
    submit(suggestion) {
      console.log(suggestion);
    },
  },
  watch: {
    query: {
      handler(val) {
        if (val.trim().length > 1) {
          this.query = val;
          this.$store.dispatch('autocomplete/SEARCH', {
            query: val.trim(),
          });
        } else {
          this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
        }
      },
    },
  },
  components: {
    'search-bar': SearchBar,
  },
};
</script>

<style scoped lang="less">
</style>
