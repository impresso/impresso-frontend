<template lang="html">
  <section class="search-bar" v-ClickOutside="hideSuggestions">
    <b-input-group>
      <b-form-input
      :class="`search-input ${showSuggestions ? 'has-suggestions' : ''}`"
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
            @mouseover="select(suggestion)" :class="{selected: selectedIndex === suggestion.idx}">
          <div class="suggestion-string" :class="`suggestion-${suggestion.type}`">
            <span class="small">... {{ q }}</span>
            <b-badge variant="light" class="small-caps border">{{ $t(`label.${suggestion.type}.title`) }}</b-badge>
          </div>
        </div>
      </div>
      <!-- <div class="suggestion-box border-bottom" v-if="suggestionIndex.mention">
        <div v-for="(s, index) in suggestionIndex.mention" :key="index"
            @click="submit(s)" @mouseover="select(s)"
            class="suggestion small px-2 mb-1" :class="{selected: selectedIndex === s.idx}">
            <div href="#" class="suggestion-entity">
              <span v-html="s.h" />
            </div>
        </div>
      </div> -->

          <div v-for="(type, i) in suggestionTypes" :key="type" class="suggestion-box border-bottom">
            <div class="row">
              <div class="col-1" v-if="type !== 'mention'">
                <span :class="`icon filter-icon dripicons-${typeIcon(type)} d-block p-2 accent`"></span>
              </div>
              <div class="col">
                <!-- <span v-if="type !== 'mention'" class="small-caps px-2">{{$t(`label.${type}.title`)}}</span> -->
                <div v-for="(s, index) in suggestionIndex[type]" :key="index"
                    @click="submit(s)" @mouseover="select(s)"
                    class="suggestion px-2 mb-1" :class="{selected: selectedIndex === s.idx}">
                  <div v-if="s.fake && type !== 'mention'">
                    <span class="small">... <b>{{ q }}</b></span>
                    <b-badge  variant="light" class="small-caps border">{{ $t(`label.${type}.moreLikeThis`) }}</b-badge>
                  </div>
                  <div v-else :class="`${type} small`">
                    <span v-if="['location', 'person'].indexOf(type) !== -1" v-html="s.h" />
                    <span v-if="['collection', 'newspaper'].indexOf(type) !== -1" v-html="s.item.name" />
                    <span v-if="['topic', 'mention'].indexOf(type) !== -1" v-html="s.h" />
                    <span v-if="s.type === 'daterange'">{{$d(s.daterange.start, 'short')}} - {{$d(s.daterange.end, 'short')}}</span>
                  </div>
              </div>
            </div>
          </div>

      </div>
    </div>
  </section>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import SuggestionFactory from '@/models/SuggestionFactory';

const AVAILABLE_TYPES = [
  'mention',
  'collection',
  'newspaper',
  'topic',
  'location',
  'person',
];

export default {
  data: () => ({
    q: '',
    initialSuggestions: [
      {
        type: 'string',
        idx: 0,
      },
      {
        type: 'title',
        idx: 1,
      },
    ],
    suggestions: [],
    suggestion: false, // first suggestion, either string or regex
    selected: false,
    selectedIndex: 0,
    maxSelectedIndex: 0,
    selectableSuggestions: [],
    showSuggestions: false,
  }),
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
  },
  computed: {
    suggestionIndex() {
      const index = this.$helpers.groupBy(this.suggestions, 'type');

      let idx = this.initialSuggestions.length - 1;
      let selectableSuggestions = [...this.initialSuggestions];

      AVAILABLE_TYPES.forEach((type) => {
        if (index[type]) {
          index[type] = index[type].map((d) => {
            idx += 1;
            // add correct index to choice
            return {
              ...d,
              idx,
            };
          });
          // exclude extra suggestions for mentions
          if (type !== 'mention') {
            // add custom one
            idx += 1;
            index[type].push({
              type,
              fake: true,
              idx,
            });
          }
        }
        selectableSuggestions = selectableSuggestions.concat(index[type]);
      });
      // update maximum index
      this.maxSelectedIndex = idx;
      this.selectableSuggestions = selectableSuggestions;
      return index;
    },
    suggestionTypes() {
      return AVAILABLE_TYPES.filter(d => !!this.suggestionIndex[d]);
    },
  },
  methods: {
    typeIcon(type) {
      switch (type) {
        case 'collection': return 'suitcase';
        case 'newspaper': return 'pamphlet';
        case 'topic': return 'message';
        case 'location': return 'location';
        case 'person': return 'user';
        default: return '';
      }
    },
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
        this.selectedIndex = 0;
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
      if (suggestion.fake) {
        // open explorer
        if (this.q.length) {
          this.$store.dispatch('explorer/SHOW', {
            mode: 'search',
            type: suggestion.type,
            q: this.q,
          });
        }
      } else if (['string', 'title'].indexOf(suggestion.type) !== -1) {
        if (this.q.length) {
          this.$emit('submit', {
            type: suggestion.type,
            q: this.q,
          });
        }
      } else {
        this.$emit('submit', suggestion);
        this.showSuggestions = false;
      }
    },
    select(suggestion) {
      this.selectedIndex = suggestion.idx;
    },
    keyup(event) {
      switch (event.key) {
        case 'Enter':
          console.info('submitting ...', this.selectedIndex);
          this.submit(this.selectableSuggestions[this.selectedIndex]);
          break;
        case 'ArrowDown':
          this.selectedIndex += 1;
          break;
        case 'ArrowUp':
          this.selectedIndex -= 1;
          break;
        default:
          // this.selected = this.suggestion;
          break;
      }
      if (this.selectedIndex > this.maxSelectedIndex) {
        this.selectedIndex = 0;
      } else if (this.selectedIndex < 0) {
        this.selectedIndex = this.maxSelectedIndex;
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
  input.form-control.search-input {
    &:focus {
      box-shadow: none;
      border: 1px solid $clr-secondary;
    }
    &.has-suggestions {
      border: 1px solid $clr-secondary;
      border-bottom: 0;
    }
  }
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
    .icon {
      color: $clr-accent-secondary;
    }
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
          "title": "in contents"
        },
        "mention": {
          "title": "in contents ..."
        },
        "title": {
          "title": "in article titles ..."
        },
        "topic": {
          "title": "suggested topics",
          "moreLikeThis": "More Topics ..."
        },
        "person": {
          "title": "suggested people",
          "moreLikeThis": "More Persons ..."
        },
        "location": {
          "title": "suggested locations",
          "moreLikeThis": "More Locations ..."
        },
        "collection": {
          "title": "suggested collections",
          "moreLikeThis": "More Collections ..."
        },
        "newspaper": {
          "title": "suggested newspaper",
          "moreLikeThis": "More Newspapers ..."
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
