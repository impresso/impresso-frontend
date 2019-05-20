<template lang="html">
  <section class="search-bar" v-ClickOutside="hideSuggestions">
    <b-input-group>
      <b-form-input
      class="border-primary"
      placeholder="search for ..."
      v-model.trim="q"
      v-on:input.native="search"
      v-on:keyup.native="keyup" />
      <b-input-group-append>
        <b-btn variant="outline-primary" class="px-2" v-on:click="submit(selected)">
          <div class="search-submit dripicons-search"></div>
        </b-btn>
      </b-input-group-append>
    </b-input-group>
    <div class="suggestions border-left border-right border-bottom border-primary drop-shadow" v-show="showSuggestions">
      <div v-if="suggestion" v-on:click="submit(suggestion)" v-on:mouseover="select(suggestion)" class="suggestion p-2" v-bind:class="{selected: selected === suggestion}">
        <div class="suggestion-string">
          {{suggestion.q}}
        </div>
      </div>
      <div v-for="s in suggestions" v-on:click="submit(s)"  v-on:mouseover="select(s)" class="suggestion p-2" v-bind:class="{selected: selected === s}">
        <div v-if="s.type === 'regex'" class="suggestion-regex">
          <span class="icon dripicons-rocket" :title="$t('regex')"></span>
          <span v-html="s.q" />
          <b-badge>{{$t('regex')}}</b-badge>
        </div>
        <div href="#" v-if="s.type === 'collection'" class="suggestion-collection">
          <span class="icon dripicons-archive" :title="$t(s.item.type)"></span>
          <span v-html="s.item.name" />
          <b-badge>{{$t('collection')}}</b-badge>
        </div>
        <div href="#" v-if="s.type === 'topic'" class="suggestion-topic">
          <span class="icon dripicons-message" :title="$t('topic')"></span>
          <span v-html="s.h" />
          <b-badge>{{$t('topic')}}</b-badge>
        </div>
        <div href="#" v-if="s.type === 'entity'" class="suggestion-entity">
          <span v-if="s.item.type === 'person'" class="icon dripicons-user" :title="$t(s.item.type)"></span>
          <span v-if="s.item.type === 'location'" class="icon dripicons-location" :title="$t(s.item.type)"></span>
          <span v-html="s.h" />
          <b-badge>{{$t(s.item.type)}}</b-badge>
        </div>
        <div href="#" v-if="s.type === 'daterange'" class="suggestion-daterange">
          {{$d(s.daterange.start, 'short')}} - {{$d(s.daterange.end, 'short')}}
          <b-badge>{{$t('daterange')}}</b-badge>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import SuggestionFactory from '@/models/SuggestionFactory';

export default {
  data: () => ({
    q: '',
    suggestions: [],
    suggestion: false, // first suggestion, either string or regex
    selected: false,
    showSuggestions: false,
  }),
  methods: {
    hideSuggestions() {
      this.selected = this.suggestion;
      this.showSuggestions = false;
    },
    search() {
      if (this.q.length > 1) {
        this.showSuggestions = true;
        this.suggestion = SuggestionFactory.create({
          type: 'string',
          q: this.q.trim(),
        });

        this.$store.dispatch('autocomplete/SEARCH', {
          q: this.q.trim(),
        }).then((res) => {
          this.suggestions = res;
        });
      } else {
        // if length of the query is 0 then we clear the suggestions
        this.suggestions = [];
        this.suggestion = false;
        this.selected = false;
        this.showSuggestions = false;
      }
    },
    submit(suggestion) {
      if (suggestion) {
        this.$emit('submit', suggestion);
      }
      this.suggestions = [];
      this.suggestion = false;
      this.selected = false;
      this.showSuggestions = false;
      this.q = '';
    },
    select(suggestion) {
      this.selected = suggestion;
    },
    keyup(event) {
      const index = this.suggestions.indexOf(this.selected);

      switch (event.key) {
        case 'Enter':
          if (this.selected) {
            this.submit(this.selected);
          }
          break;
        case 'ArrowDown':
          if (this.suggestions[index + 1]) {
            this.selected = this.suggestions[index + 1];
          } else {
            this.selected = this.suggestion;
          }
          event.target.select();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (index === 0) {
            this.selected = this.suggestion;
          } else if (this.suggestions[index - 1]) {
            this.selected = this.suggestions[index - 1];
          } else {
            this.selected = this.suggestions[this.suggestions.length - 1];
          }
          event.target.select();
          break;
        default:
          this.selected = this.suggestion;
          break;
      }
    },
  },
  components: {
  },
  directives: {
    ClickOutside,
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.search-bar{
  position: relative;
  .search-submit {
    line-height: 1;
    padding: 0.1em;
  }
  .suggestions {
    position: absolute;
    top:38px;
    width: 100%;
    background: white;
    z-index: 10;
    .suggestion {
      border: 1px solid transparent;
      cursor: pointer;
      > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        span {
          flex: 1;
          flex-grow: 8;
        }
        .icon {
          flex: 1;
          color: $clr-accent-secondary;
          line-height: 1;
        }
        .badge {
          flex: 1;
        }
      }
      &:hover,
      &.selected {
        background: rgba($clr-accent-secondary, 0.5);
        border-color: rgba($clr-accent-secondary, 0.75);
      }
    }
  }
}

.search-bar .input-group > .form-control{
  border-top-width: 0;
  border-left-width: 0;
}
</style>

<i18n>
  {
    "en": {
      "person": "Person",
      "location": "Location",
      "regex": "Regex",
      "daterange": "Date Range",
      "topic": "Topic",
      "collection": "Collection"
    },
    "nl": {
      "person": "Persoon",
      "location": "Locatie",
      "daterange": "Periode",
      "topic": "Onderwerp",
      "collection": "Collectie"
    }
  }
</i18n>
