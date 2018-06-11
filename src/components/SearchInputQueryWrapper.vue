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
      this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
      this.query = '';
      this.$emit('reset');
    },
    submit(suggestion) {
      if (this.suggestions.length > 0) {
        this.$store.commit('search/CLEAR');
        this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
        this.query = '';
        this.add(suggestion);
      }
    },
    add(suggestion) {
      this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {});
      this.$store.commit('search/ADD_FILTER', new Filter({
        type: suggestion.type,
        query: suggestion.query,
        entity: suggestion.entity,
      }));

      this.$emit('add');
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
