<template lang="html">
  <search-bar
  v-model="query"
  v-bind:showAddButton="showAddButton"
  v-bind:suggestions="suggestions"
  v-on:reset="reset"
  v-on:submit="submit"
  v-on:add="add"
  />
</template>

<script>
import FilterEntity from '@/models/filters/Entity';
import FilterString from '@/models/filters/String';

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
  props: {
    showAddButton: {
      type: Boolean,
      default: false,
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
      if (suggestion.type === 'entity') {
        this.$store.commit('search/ADD_FILTER', new FilterEntity({
          entity: suggestion.entity,
        }));
      } else if (suggestion.type === 'string') {
        this.$store.commit('search/ADD_FILTER', new FilterString({
          query: suggestion.query,
        }));
      }

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
