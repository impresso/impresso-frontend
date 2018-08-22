<template lang="html">
  <div class="">
    <b-input-group prepend="Search">
      <b-form-input
      v-model="query"
      v-on:input="search"
      v-on:keyup.native="keyup"></b-form-input>
      <b-input-group-append>
        <b-btn variant="outline-success" v-on:click="submit">Go</b-btn>
      </b-input-group-append>
    </b-input-group>
    <pre>{{suggestion}}</pre>
    <pre>{{suggestions}}</pre>
  </div>
</template>

<script>
import Suggestion from '@/models/Suggestion';

export default {
  data: () => ({
    query: '',
    suggestion: new Suggestion(),
  }),
  computed: {
    suggestions: {
      get() {
        return this.$store.state.autocomplete.suggestions;
      },
    },
  },
  methods: {
    search() {
      if (this.query.trim().length > 1) {
        this.$store.dispatch('autocomplete/SEARCH', {
          query: this.query.trim(),
        });
      } else {
        // if length of the query is 0 then we clear the suggestions
        this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
      }
    },
    submit() {
      this.$emit('submit', this.suggestion);
    },
    keyup(event) {
      const index = this.suggestions.indexOf(this.suggestion);

      switch (event.key) {
        case 'Escape':
          // this.hideSuggestions();
          break;
        case 'Enter':
          this.submit();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (this.suggestions[index + 1]) {
            this.suggestion = this.suggestions[index + 1];
          } else {
            this.suggestion = this.suggestions[0];
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (this.suggestions[index - 1]) {
            this.suggestion = this.suggestions[index - 1];
          } else {
            this.suggestion = this.suggestions[this.suggestions.length - 1];
          }
          break;
        default:
          break;
      }
    },
  },
  watch: {
    suggestions: {
      handler(val) {
        if (val[0] instanceof Suggestion) {
          this.suggestion = val[0];
        } else {
          this.suggestion = new Suggestion();
        }
      },
    },
  },
};
</script>

<style lang="less">
</style>
