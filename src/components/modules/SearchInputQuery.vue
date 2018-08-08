<template lang="html">
  <div class="wrapper" v-ClickOutside="hideSuggestions">
    <b-input-group>
      <input
      type="text"
      class="form-control"
      v-model="query"
      v-on:keyup="keyup"
      v-bind:placeholder="$t('search.query_placeholder')"
      autofocus
      />
      <b-input-group-append>
        <b-btn variant="danger" v-on:click="reset"><icon name="times" /></b-btn>
        <b-btn variant="success" v-on:click="submit"><icon name="search" /></b-btn>
      </b-input-group-append>
    </b-input-group>
    <div class="suggestions" v-show="(suggestions.length > 0) && showSuggestions">
      <div
        v-for="(elm, index) in suggestions"
        v-on:mouseover="select(elm)"
        class="suggestion"
        v-bind:class="{selected: elm === suggestion}"
        >
        <suggestion-location
          v-if="elm.entity.hasLabel('location')"
          v-model="suggestions[index]"
          v-on:click="submit" />
        <suggestion-person
          v-if="elm.entity.hasLabel('person')"
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
        <suggestion-test
          v-if="elm.entity.hasLabel('test')"
          v-model="suggestions[index]"
          v-on:click="submit" />
      </div>
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/times';
import 'vue-awesome/icons/search';

import Suggestion from '@/models/Suggestion';
import SuggestionLocation from './SearchInputQuerySuggestionLocation';
import SuggestionPerson from './SearchInputQuerySuggestionPerson';
import SuggestionString from './SearchInputQuerySuggestionString';
import SuggestionDaterange from './SearchInputQuerySuggestionDaterange';
import SuggestionTest from './SearchInputQuerySuggestionTest';


export default {
  data: () => ({
    showSuggestions: false,
    suggestion: new Suggestion(),
  }),
  props: {
    value: {
      default: '',
      type: String,
    },
    suggestions: {
      type: Array,
    },
    action: {
      default: 'submit', // either 'add' or 'submit'
    },
  },
  computed: {
    query: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  methods: {
    reset() {
      this.$emit('reset');
    },
    clear() {
      this.$emit('input', '');
    },
    submit(suggestion) {
      this.clear();
      if (suggestion instanceof Suggestion) {
        this.$emit(this.action, suggestion);
      } else {
        this.$emit(this.action, this.suggestion);
      }
    },
    select(suggestion) {
      this.suggestion = suggestion;
    },
    hideSuggestions() {
      this.showSuggestions = false;
      this.select(this.suggestions[0]);
    },
    keyup(event) {
      const index = this.suggestions.indexOf(this.suggestion);

      switch (event.key) {
        case 'Escape':
          this.hideSuggestions();
          break;
        case 'Enter':
          this.submit(this.suggestion);
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
    value: {
      handler() {
        this.showSuggestions = true;
      },
    },
    suggestions: {
      handler(val) {
        this.showSuggestions = true;
        this.suggestion = val[0];
      },
    },
  },
  directives: {
    ClickOutside,
  },
  components: {
    Icon,
    SuggestionLocation,
    SuggestionPerson,
    SuggestionString,
    SuggestionDaterange,
    SuggestionTest,
  },
};
</script>

<style scoped lang="less">
.wrapper {
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

<i18n>
{
  "en": {
    "search": {
      "query_button": "Go!",
      "query_placeholder": "Search"
    }
  },
  "fr": {
    "search": {
      "query_button": "Allez!",
      "query_placeholder": "Recherche"
    }
  },
  "nl": {
    "search": {
      "query_button": "Ga!",
      "query_placeholder": "Zoek"
    }
  }
}
</i18n>
