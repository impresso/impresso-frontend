<template lang="html">
  <search-bar
  v-model="query"
  v-bind:suggestions="suggestions"
  v-on:reset="reset"
  v-on:submit="submit"
  v-on:add="add"
  />
</template>

<script>
import Filter from '@/models/Filter';
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
      this.reset();
      this.add(suggestion);
    },
    add(suggestion) {
      this.$store.commit('search/ADD_FILTER', new Filter({
        type: suggestion.type,
        query: suggestion.query,
        entity: suggestion.entity,
      }));

      this.$router.push({
        name: 'search',
      });
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
          // if length of the query is 0 then we clear the suggestions
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
