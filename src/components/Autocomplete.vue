<template>
  <section class="search-bar" ref="autocomplete">
    <div class="input-group">
      <b-form-input :class="`search-input ${showSuggestions ? 'has-suggestions' : ''}`"
        :placeholder="$tc('placeholder.search', filterCount)" v-model.trim="q" @update:modelValue="search"
        @focus="selectInput" @blur="blurHandler" @keyup="keyup" data-testid="autocomplete-input" />
      <div class="input-group-append">
        <button type="button" class="btn btn-outline-primary" ref="searchButton"
          :title="$tc('placeholder.search', filterCount)" @click="submit({ type: 'string', q })"
          data-testid="add-keyword-button">
          <div v-if="filterCount > 1" class="d-flex search-submit dripicons-search"></div>
          <div v-else class="d-flex search-submit dripicons-search"></div>
        </button>
        <button type="button" class="btn btn-outline-primary" :title="$t('actions.addFilter')" @click="showExplorer"
          data-testid="add-filter-button">
          <div class="d-flex dripicons-experiment"></div>
        </button>
      </div>
    </div>

    <div class="suggestions border-left border-right border-bottom border-primary drop-shadow" v-show="showSuggestions">
      <div class="border-bottom">
        <div class="suggestion p-1" v-for="(suggestion, index) in staticSuggestions" v-bind:key="index"
          @click="submitStaticSuggestion(suggestion)" :data-idx="suggestion.idx" @mouseover="select(suggestion)"
          :class="{ selected: selectedIndex === suggestion.idx }">
          <div :class="`suggestion-${suggestion.type}`">
            <span class="small" v-if="suggestion.h" v-html="suggestion.h" />
            <span class="small" v-else>...<b>{{ q }}</b></span>
            <b-badge variant="light" class="border border-medium">
              {{ $t(`label.${suggestion.type}.title`) }}
            </b-badge>
          </div>
        </div>
      </div>
      <div v-for="(type, i) in suggestionTypes" :key="i" class="suggestion-box border-bottom">
        <div class="row no-gutters" :title="$t(`label.${type}.title`)">
          <div class="col-1 border-right" v-if="type !== 'mention'">
            <div class="icon filter-icon" :class="`dripicons-${typeIcon(type)}`"></div>
          </div>
          <div class="col">
            <!-- <span v-if="type !== 'mention'" class="small-caps px-2">{{$t(`label.${type}.title`)}}</span> -->
            <div v-for="(s, j) in suggestionIndex[type]" :key="j" @click="submit(s)" @mouseover="select(s)"
              :data-idx="s.idx" class="suggestion pr-1 pl-2 py-1" :class="{
                selected: selectedIndex === s.idx,
              }">
              <div v-if="s.fake && type !== 'mention'" :title="$t(`label.${type}.moreLikeThis`)">
                <span class="small">... <b>{{ q }}</b></span>
                <b-badge variant="light" class="border border-medium">
                  {{ $t(`label.${type}.moreLikeThis`) }}</b-badge>
              </div>
              <div v-else :class="`${type} small`">
                <span v-if="['location', 'person'].indexOf(type) !== -1" v-html="s.h" />
                <span v-if="['collection', 'newspaper'].indexOf(type) !== -1" v-html="s.item.name" />
                <span v-if="['topic', 'mention'].indexOf(type) !== -1" v-html="s.h" />
                <span v-if="s.type === 'daterange'">{{ $d(s.daterange.start, 'short') }} - {{ $d(s.daterange.end,
                  'short') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <explorer v-model="explorerFilters" :is-visible="explorerVisible" @onHide="handleExplorerHide"
      :searching-enabled="true" :initial-search-query="q" :initial-type="explorerInitialType"
      :included-types="explorerIncludedTypes" />
  </section>
</template>

<script>
import { ref } from 'vue'
import { mapStores } from 'pinia'
import FilterFactory from '@/models/FilterFactory'
import { useAutocompleteStore } from '@/stores/autocomplete'
import { useUserStore } from '@/stores/user'
import Explorer from './Explorer.vue'
import { useClickOutside } from '@/composables/useClickOutside'

const AVAILABLE_TYPES = ['mention', 'newspaper', 'topic', 'location', 'person', 'collection']

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
    recentSuggestions: [],
    collectionSuggestions: [],
    suggestions: [],
    suggestion: false, // first suggestion, either string or regex
    selected: false,
    selectedIndex: 0,
    maxSelectedIndex: 0,
    selectableSuggestions: [],
    showSuggestions: false,
    explorerVisible: false,
  }),
  emits: ['submit', 'submitEmpty', 'input-focus'],
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
    explorerIncludedTypes: {
      type: Array,
      default: () => ['newspaper', 'topic', 'location', 'person', 'collection'],
    },
    /** @type {import('vue').PropOptions<Filter[]>} */
    filters: {
      type: Array,
      default: () => [],
    },
  },
  beforeMount() {
    const autocomplete = ref(this.$refs.autocomplete)
    const button = ref(this.$refs.searchButton)
    useClickOutside(autocomplete, () => this.hideSuggestions(), button)
  },
  computed: {
    ...mapStores(useAutocompleteStore, useUserStore),
    user() {
      return this.userStore.user
    },
    staticSuggestions() {
      return this.initialSuggestions.concat(this.recentSuggestions).map((d, idx) => ({
        ...d,
        idx,
      }))
    },
    explorerInitialType() {
      if (this.explorerIncludedTypes.includes(this.suggestionType)) {
        return this.suggestionType
      }
      return this.explorerIncludedTypes[0]
    },
    suggestionType() {
      if (!this.selectableSuggestions[this.selectedIndex]) {
        return 'string'
      }
      return this.selectableSuggestions[this.selectedIndex].type
    },
    suggestionIndex() {
      const key = 'type'
      const index = this.suggestions.reduce((reduced, item) => {
        ; (reduced[item[key]] = reduced[item[key]] || []).push(item)
        return reduced
      }, {})

      let idx = this.staticSuggestions.length - 1
      let selectableSuggestions = [...this.staticSuggestions]

      AVAILABLE_TYPES.forEach(type => {
        if (index[type]) {
          index[type] = index[type].map(d => {
            idx += 1
            // add correct index to choice
            return {
              ...d,
              idx,
            }
          })
          // exclude extra suggestions for mentions
          if (type !== 'mention') {
            // add custom one
            idx += 1
            index[type].push({
              type,
              fake: true,
              idx,
            })
          }
        }
        selectableSuggestions = selectableSuggestions.concat(index[type])
      })
      // update maximum index
      // TODO: Remove side effect from computed property.
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.maxSelectedIndex = idx
      // TODO: Remove side effect from computed property.
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.selectableSuggestions = selectableSuggestions
      return index
    },
    suggestionTypes() {
      return AVAILABLE_TYPES.filter(d => !!this.suggestionIndex[d])
    },
    explorerFilters: {
      get() {
        return []
      },
      set(filters) {
        const filter = filters[0]
        this.$emit('submit', filter)
        this.q = ''
      },
    },
    filterCount() {
      return typeof this.filters === 'undefined'
        ? 1
        : this.filters.filter(d => d.type !== 'hasTextContents').length + 1
    },
  },
  methods: {
    showExplorer() {
      this.explorerVisible = true
    },
    handleExplorerHide() {
      this.explorerVisible = false
    },
    typeIcon(type) {
      switch (type) {
        case 'collection':
          return 'suitcase'
        case 'newspaper':
          return 'pamphlet'
        case 'topic':
          return 'message'
        case 'location':
          return 'location'
        case 'person':
          return 'user'
        default:
          return ''
      }
    },
    hideSuggestions() {
      this.selected = this.suggestion
      this.showSuggestions = false
    },
    search() {
      console.log('searching')
      this.showSuggestions = this.q.length > 0
      // debugger;
      if (this.q.length) {
        const res = this.autocompleteStore.suggestRecentQuery(this.q)
        this.recentSuggestions = res.map(d => ({
          ...d,
          type: 'string',
        }))
      }

      if (this.q.length > 1) {
        this.autocompleteStore.search(this.q.trim()).then(res => {
          this.suggestions = [...res, ...this.collectionSuggestions]
        })
        if (this.user) {
          this.autocompleteStore.suggestCollections(this.q.trim()).then(res => {
            this.collectionSuggestions = res
            this.suggestions = [...res, ...this.suggestions]
          })
        }
      } else {
        // if length of the query is 0 then we clear the suggestions
        this.suggestions = []
        this.selectedIndex = 0
      }
    },
    submitStaticSuggestion({ type, q }) {
      const sq = String(q || this.q || '').trim()
      if (sq.length) {
        console.info('submitStaticSuggestion', type, sq)
        this.submit({
          type,
          q: sq,
        })
        this.q = ''
      }
    },
    submit({ type, item = {}, q, fake = false } = {}) {
      if (fake) {
        // select one item from the explorer
        this.showExplorer()
      } else if (['string', 'title', 'mention'].includes(type)) {
        const sq = String(q || item.name || this.q || '').trim()
        if (sq.length) {
          this.autocompleteStore.saveRecentQuery(sq)
          this.$emit(
            'submit',
            FilterFactory.create({
              type,
              q: [sq],
              op: 'OR',
            }),
          )
          this.q = ''
        } else {
          this.$emit('submitEmpty')
        }
      } else {
        this.$emit(
          'submit',
          FilterFactory.create({
            type,
            q: [item.uid],
            items: [item],
          }),
        )
        this.q = ''
      }
    },
    select(suggestion) {
      this.selectedIndex = suggestion.idx
    },
    selectInput(e) {
      this.showSuggestions = this.q.length > 0
      e.target.select()
      this.$emit('input-focus', true)
    },
    blurHandler() {
      this.$emit('input-focus', false)
    },
    keyup(event) {
      switch (event.key) {
        case 'Enter':
          console.info(
            '@keyup ENTER',
            this.selectedIndex,
            this.selectableSuggestions[this.selectedIndex],
          )
          this.submit(this.selectableSuggestions[this.selectedIndex])
          this.selectInput(event)
          break
        case 'ArrowDown':
          this.selectedIndex += 1
          break
        case 'ArrowUp':
          this.selectedIndex -= 1
          break
        case 'Escape':
          this.hideSuggestions()
          break
        default:
          // this.selected = this.suggestion;
          break
      }
      if (this.selectedIndex > this.maxSelectedIndex) {
        this.selectedIndex = 0
      } else if (this.selectedIndex < 0) {
        this.selectedIndex = this.maxSelectedIndex
      }
    },
  },
  components: {
    Explorer,
  },
}
</script>

<style scoped lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

.search-bar {
  position: relative;

  input.form-control.search-input {
    border-color: $clr-primary;
    background: transparent;
    position: relative;
    color: black;

    &:focus {
      box-shadow: none;
      background: white;
      border: 1px solid $clr-secondary;
    }

    &:focus.has-suggestions {
      // border: 1px solid $clr-secondary;
      border-bottom: 0;
    }
  }

  .suggestions {
    position: absolute;
    top: 38px;
    width: 100%;
    background: white;
    z-index: 10;

    .icon {
      color: $clr-primary;
      // border: 1px solid $clr-secondary;
      text-align: center;
      font-size: 14px;
      height: 24px;
      width: 24px;
      line-height: 20px;
      padding-top: 4px;
      // border-radius: 50%;
      top: 50%;
      left: 0.25rem;
      margin-top: -12px;
      position: absolute;
    }

    .suggestion {
      border: 1px solid transparent;
      cursor: pointer;

      >div {
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

      &.selected {
        background: rgba($clr-accent-secondary, 0.5);
        border-color: rgba($clr-accent-secondary, 0.75);
      }
    }
  }
}

.search-bar .input-group>.form-control {
  border-top-width: 0;
  border-left-width: 0;
  border-right-width: 0;
  z-index: 1;
}

.search-box .search-bar .input-group>.form-control {
  background: white;

  &:focus {
    border-width: 0;
  }
}

.bg-dark {
  .search-bar .input-group>.form-control {
    border-top-width: 0;
    border-left-width: 0;
    border-right-width: 0;
    background: transparent;

    &:focus {
      background: transparent;
    }
  }
}

// .search-bar .input-group > .form-control {
//   color: white;
// }
// .bg-dark .search-bar.search-box .input-group > .form-control {
//   color: white;
//   border-left: 1px solid #aaa;
//   border-color: #aaa !important;
//
//   &:focus{
//       background-color: transparent;
//       border-top-width: 0;
//       outline: 0;
//   }
// }
// .search-bar .input-group-append::before {
//   content: '';
//   position: absolute;
//   left: 0.125rem;
//   bottom: 0.25rem;
//   top: 0.25rem;
//   z-index: 0;
//   background: rgb(253,233,119);
//   background: linear-gradient(90deg, rgba(253,233,119,1) 0%, rgba(253,233,119,0) 100%);
//   width: 100px;
// }</style>

<i18n lang="json">{
  "en": {
    "placeholder": {
      "search": "search for ... | add keyword to search"
    },
    "label": {
      "string": {
        "title": "Search in article contents"
      },
      "mention": {
        "title": "in contents ..."
      },
      "title": {
        "title": "Search in article titles"
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
}</i18n>
