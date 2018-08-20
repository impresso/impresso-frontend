<template lang="html">
  <search-bar
  v-model="query"
  v-bind:suggestions="suggestions"
  v-on:reset="reset"
  v-on:submit="submit"
  v-on:add="add"
  v-on:search="search"
  v-bind:action="action"
  />
</template>

<script>
import FilterFactory from '@/models/FilterFactory';
import SearchBar from './modules/SearchInputQuery';

export default {
  data: () => ({
    query: '',
  }),
  props: {
    action: {
      default: 'submit', // either 'add' or 'submit'
    },
  },
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
      this.$store.commit('search/ADD_FILTER', FilterFactory.create(suggestion));

      this.$emit('search');
    },
    search() {
      this.$emit('search');
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
