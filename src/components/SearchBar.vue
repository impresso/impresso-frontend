<template lang="html">
  <section class="search-bar" v-ClickOutside="hideSuggestions">
    <b-input-group prepend="Search">
      <b-form-input
      v-model="query"
      v-on:input.native="search"
      v-on:keyup.native="keyup"></b-form-input>
      <b-input-group-append>
        <b-btn variant="outline-success" v-on:click="submit">Go</b-btn>
      </b-input-group-append>
    </b-input-group>
    <div class="suggestions" v-show="(suggestions.length > 0) && showSuggestions">
      <div
        v-for="(elm, index) in suggestions"
        v-on:mouseover="select(elm)"
        class="suggestion"
        v-bind:class="{selected: elm === suggestion}"
        >
        <suggestion-entity
          v-if="elm.entity.hasLabel('person') || elm.entity.hasLabel('location')"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-string
          v-if="elm.type === 'string'"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-daterange
          v-if="elm.type === 'daterange'"
          v-model="suggestions[index]"
          v-on:click="submit" />
      </div>
    </div>
  </section>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import FilterFactory from '@/models/FilterFactory';
import Suggestion from '@/models/Suggestion';
import SuggestionEntity from './modules/SearchInputQuerySuggestionEntity';
import SuggestionString from './modules/SearchInputQuerySuggestionString';
import SuggestionDaterange from './modules/SearchInputQuerySuggestionDaterange';

export default {
  data: () => ({
    query: '',
    showSuggestions: false,
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
    hideSuggestions() {
      this.showSuggestions = false;
    },
    search() {
      if (this.query.trim().length > 1) {
        this.$store.dispatch('autocomplete/SEARCH', {
          query: this.query.trim(),
        }).then(() => {
          this.showSuggestions = true;
        });
      } else {
        // if length of the query is 0 then we clear the suggestions
        this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
      }
    },
    submit() {
      this.$store.commit('search/ADD_FILTER', FilterFactory.create(this.suggestion));

      this.$store.dispatch('search/SEARCH', {
        page: 1,
      }).then(() => {
        this.$emit('submit');
      });

      this.query = '';
      this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
    },
    select(suggestion) {
      this.suggestion = suggestion;
    },
    keyup(event) {
      const index = this.suggestions.indexOf(this.suggestion);

      switch (event.key) {
        case 'Escape':
          this.hideSuggestions();
          break;
        case 'Enter':
          this.submit();
          break;
        case 'ArrowDown':
          if (this.suggestions[index + 1]) {
            this.select(this.suggestions[index + 1]);
          } else {
            this.select(this.suggestions[0]);
          }
          break;
        case 'ArrowUp':
          if (this.suggestions[index - 1]) {
            this.select(this.suggestions[index - 1]);
          } else {
            this.select(this.suggestions[this.suggestions.length - 1]);
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
          this.select(val[0]);
        } else {
          this.select(new Suggestion());
        }
      },
    },
  },
  directives: {
    ClickOutside,
  },
  components: {
    SuggestionEntity,
    SuggestionString,
    SuggestionDaterange,
  },
};
</script>

<style lang="less">
.search-bar {
    position: relative;
    .suggestions {
        position: absolute;
        z-index: 10;
        width: 100%;
        background: white;
        .suggestion {
            & > section {
                cursor: pointer;
                padding: 7px;
            }
            &.selected {
                background: #eee;
            }
        }
    }
}
</style>
