<template lang="html">
  <section class="search-bar" v-ClickOutside="hideSuggestions">
    <b-input-group>
      <b-form-input
      class="border-primary"
      placeholder="search for ..."
      v-model="query"
      v-on:input.native="search"
      v-on:keyup.native="keyup"></b-form-input>
      <b-input-group-append>
        <b-btn variant="outline-primary" class="px-2" v-on:click="submit">
          <div class="search-submit dripicons-search"></div>
        </b-btn>
      </b-input-group-append>
    </b-input-group>
    <div class="suggestions border-left border-right border-bottom border-primary"
      v-show="(suggestions.length > 0) && showSuggestions">
      <div
        v-for="(elm, index) in suggestions"
        v-on:mouseover="select(elm)"
        class="suggestion border-bottom"
        v-bind:class="{selected: elm === suggestion}"
        >
        <suggestion-newspaper
          v-if="elm.type === 'newspaper'"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-mention
          v-if="elm.type === 'mention'"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-entity
          v-if="elm.entity.hasLabel('person') || elm.entity.hasLabel('location')"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-string
          v-if="elm.type === 'string'"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-regex
          v-if="elm.type === 'regex'"
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

import SuggestionMention from './modules/SearchInputQuerySuggestionMention';
import SuggestionNewspaper from './modules/SearchInputQuerySuggestionNewspaper';
import SuggestionEntity from './modules/SearchInputQuerySuggestionEntity';
import SuggestionRegex from './modules/SearchInputQuerySuggestionRegex';
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
        return this.$store.getters['autocomplete/suggestions'];
      },
    },
  },
  methods: {
    hideSuggestions() {
      this.showSuggestions = false;
    },
    search() {
      if (this.query.trim().charAt(0) === '/') {
        this.showSuggestions = true;
        this.$store.commit('autocomplete/SET_SUGGESTION', new Suggestion({
          type: 'regex',
          query: this.query.trim(),
        }));
      } else if (this.query.trim().length > 1) {
        this.$store.dispatch('autocomplete/SEARCH', {
          query: this.query.trim(),
        }).then(() => {
          this.showSuggestions = true;
        });
      } else {
        // if length of the query is 0 then we clear the suggestions
        this.$store.commit('autocomplete/CLEAR_SUGGESTIONS');
        this.hideSuggestions();
      }
    },
    submit() {
      this.$store.commit('search/ADD_FILTER', FilterFactory.create(this.suggestion));

      this.$store.dispatch('search/SEARCH').then(() => {
        this.$emit('submit');
        this.query = '';
      });

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
          if (this.suggestions.length > 0) {
            this.submit();
          }
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
    SuggestionRegex,
    SuggestionString,
    SuggestionDaterange,
    SuggestionMention,
    SuggestionNewspaper,
  },
};
</script>

<style lang="scss">

@import "impresso-theme/src/scss/variables.sass";

.search-bar {
    position: relative;
    input {
      font-style: italic;
    }
    .search-submit {
      font-size: 1.2em;
      line-height: 1;
      padding-top: 0.1em;
    }
    .suggestions {

        position: absolute;
        top: 100%;
        z-index: 10;
        width: 100%;
        background: $clr-bg-primary;
        box-shadow: 0.3em 0.3em 0 fade-out($clr-primary, 0.8);
        .suggestion {

            & > section {
                cursor: pointer;
                padding: 0.6em;
            }
            &.selected {
              background: $link-hover-bg;
              &:active {
                background: $link-active-bg;
                .text-right,
                .suggestion-icon {
                  color: white;
                }
              }
            }
            .suggestion-icon {
              float: left;
              width: 1.6em;
            }
            .suggestion-text {
              float: left;
              line-height: 1;
            }
            .text-right {
              line-height: 1;
            }
        }
    }
}
</style>
