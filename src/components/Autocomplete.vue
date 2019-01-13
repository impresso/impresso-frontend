<template lang="html">
  <section class="search-bar" v-ClickOutside="hideSuggestions">
    <b-input-group>
      <b-form-input
      class="border-primary"
      placeholder="search for ..."
      v-model="query"
      v-on:input.native="search"
      v-on:keyup.native="keyup" />
      <b-input-group-append>
        <b-btn variant="outline-primary" class="px-2" v-on:click="submit(selected)">
          <div class="search-submit dripicons-search"></div>
        </b-btn>
      </b-input-group-append>
    </b-input-group>
    <div class="suggestions border-left border-right border-bottom border-primary" v-show="showSuggestions">
      <div v-if="suggestion" v-on:click="submit(suggestion)" v-on:mouseover="select(suggestion)" class="suggestion" v-bind:class="{selected: selected === suggestion}">
        <div class="suggestion-string">
          {{suggestion.query}}
        </div>
      </div>
      <div v-for="s in suggestions" v-on:click="submit(s)"  v-on:mouseover="select(s)" class="suggestion" v-bind:class="{selected: selected === s}">
        <div v-if="s.type === 'regex'" class="suggestion-regex">
          <b-badge>{{$t('regex')}}</b-badge> {{s.query}}
        </div>
        <div href="#" v-if="s.type === 'collection'" class="suggestion-collection">
          <b-badge>{{$t('collection')}}</b-badge>
          <div>{{s.item.name}} &mdash; by @{{s.item.creator.username}}</div>
        </div>
        <div href="#" v-if="s.type === 'topic'" class="suggestion-topic">
          <b-badge>{{$t('topic')}}</b-badge> <span v-html="s.h" />
        </div>
        <div href="#" v-if="s.type === 'entity'" class="suggestion-entity">
          <b-badge>{{$t(s.item.type)}}</b-badge> <span v-html="s.h" />
        </div>
        <div href="#" v-if="s.type === 'daterange'" class="suggestion-daterange">
          <b-badge>{{$t('daterange')}}</b-badge> {{$d(s.daterange.start, 'short')}} - {{$d(s.daterange.end, 'short')}}
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
    query: '',
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
      if (this.query.trim().length > 1) {
        this.showSuggestions = true;
        this.suggestion = SuggestionFactory.create({
          type: 'string',
          query: this.query.trim(),
        });

        this.$store.dispatch('autocomplete/SEARCH', {
          query: this.query.trim(),
        }).then((res) => {
          console.log('suggestions', res);
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
      this.query = '';
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

<style lang="less">
.search-bar{
  position: relative;
  .suggestions {
    position: absolute;
    top:38px;
    width: 100%;
    background: white;
    z-index: 10;
    box-shadow: 0 10px 10px rgba(0,0,0,0.25);
    .suggestion {
      display: block;
      padding: 3px 3px 3px 12px;
      cursor: pointer;
      .badge {
        float: right;
        margin-top: 3px;
        margin-left: 7px;
      }
      &:hover,
      &.selected {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>

<i18n>
  {
    "en": {
      "person": "Person",
      "location": "Location",
      "regex": "Regex",
      "daterange": "Date Range",
      "topic": "Topic"
    },
    "nl": {
      "person": "Persoon",
      "location": "Locatie",
      "daterange": "Periode",
      "topic": "Onderwerp"
    }
  }
</i18n>
