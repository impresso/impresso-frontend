<template lang="html">
  <section class="search-bar" v-ClickOutside="hideSuggestions">
    <b-input-group>
      <b-form-input
      placeholder="search for ..."
      v-model.trim="q"
      v-on:input.native="search"
      v-on:keyup.native="keyup" />
      <b-input-group-append>
        <b-btn v-bind:variant="variant" class="px-2"
          v-on:click="submitInitialSuggestion({type: 'string'})">
          <div class="search-submit dripicons-search"></div>
        </b-btn>
      </b-input-group-append>
    </b-input-group>
    <div class="suggestions border-left border-right border-bottom border-primary drop-shadow" v-show="showSuggestions">
      <div class="border-bottom">
        <div class="suggestion px-2 py-1"  v-for="(suggestion, index) in initialSuggestions" v-bind:key="index"
            @click="submitInitialSuggestion(suggestion)"
            @mouseover="select(suggestion)" :class="{selected: selected === suggestion}">
          <div class="suggestion-string" :class="`suggestion-${suggestion.type}`">
            <span class="small">{{ q }}</span>
            <b-badge>{{ $t(`label.${suggestion.type}.title`) }}</b-badge>
          </div>
        </div>
      </div>
      <div class="suggestion-box border-bottom" v-if="suggestionIndex.mention">
        <div v-for="(s, index) in suggestionIndex.mention" :key="index"
            @click="submit(s)" @mouseover="select(s)"
            class="suggestion small px-2 mb-1" :class="{selected: selected === s}">
            <div href="#" class="suggestion-entity">
              <span v-html="s.h" />
            </div>
        </div>
      </div>
      <div v-for="(type, i) in suggestionTypes" :key="type" class="suggestion-box border-bottom">
        <span class="small-caps px-2 smaller">{{$t(`label.${type}.title`)}}</span>
        <div v-for="(s, index) in suggestionIndex[type]" :key="index"
            @click="submit(s)" @mouseover="select(s)"
            class="suggestion small px-2 mb-1" :class="{selected: selected === s}">
            <div href="#" v-if="['location', 'person'].indexOf(type) !== -1" class="suggestion-entity">
              <span v-html="s.h" />
            </div>
            <div href="#" v-if="['collection', 'newspaper'].indexOf(type) !== -1" class="suggestion-collection">
              <span v-html="s.item.name" />
            </div>
            <div href="#" v-if="s.type === 'topic'" class="suggestion-topic">
              <span v-html="s.h" />
            </div>
            <div href="#" v-if="s.type === 'daterange'" class="suggestion-daterange">
              {{$d(s.daterange.start, 'short')}} - {{$d(s.daterange.end, 'short')}}
            </div>
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
    initialSuggestions: [
      {
        type: 'string',
      },
      {
        type: 'title',
      },
    ],
    suggestions: [],
    suggestion: false, // first suggestion, either string or regex
    selected: false,
    showSuggestions: false,
  }),
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
  },
  computed: {
    allSuggestions() {
      return this.initialSuggestions.concat(this.suggestions);
    },
    suggestionIndex() {
      return this.$helpers.groupBy(this.suggestions, 'type');
    },
    suggestionTypes() {
      return Object.keys(this.suggestionIndex).filter(d => d !== 'mention');
    },
  },
  methods: {
    hideSuggestions() {
      this.selected = this.suggestion;
      this.showSuggestions = false;
    },
    search() {
      this.showSuggestions = this.q.length > 0;

      if (this.q.length > 1) {
        this.$store.dispatch('autocomplete/SEARCH', {
          q: this.q.trim(),
        }).then((res) => {
          this.suggestions = res;
        });
      } else {
        // if length of the query is 0 then we clear the suggestions
        this.suggestions = [];
        this.selected = false;
      }
    },
    submitInitialSuggestion({ type }) {
      if (this.q.length) {
        this.submit(SuggestionFactory.create({
          type,
          q: this.q,
        }));
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
      this.selected = this.selected || this.allSuggestions[0];
      const index = this.allSuggestions.indexOf(this.selected);

      switch (event.key) {
        case 'Enter':
          if (['string', 'title'].indexOf(this.selected.type) !== -1) {
            this.submitInitialSuggestion(this.selected);
          } else {
            this.submit(this.selected);
          }
          break;
        case 'ArrowDown':
          if (this.allSuggestions[index + 1]) {
            this.selected = this.allSuggestions[index + 1];
          } else {
            this.selected = this.allSuggestions[0];
          }
          event.target.select();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (index > 0) {
            this.selected = this.allSuggestions[index - 1];
          } else {
            this.selected = this.allSuggestions[this.allSuggestions.length - 1];
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
      "label": {
        "string": {
          "title": "in contents ..."
        },
        "title": {
          "title": "in article titles ..."
        },
        "topic": {
          "title": "suggested topics"
        },
        "person": {
          "title": "suggested people"
        },
        "location": {
          "title": "suggested locations"
        },
        "collection": {
          "title": "suggested collections"
        },
        "newspaper": {
          "title": "suggested newspaper"
        },
        "daterange": {
          "title": "filter by date of publication",
          "item": "From {start} to {end}"
        }
      }
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
