<template>
  <section
    :class="`search-bar Autocomplete ${bodyClass} ${showSuggestions ? 'show' : ''}`"
    ref="autocomplete"
  >
    <div class="input-group">
      <b-form-input
        class="search-input"
        :placeholder="$tc('placeholder.search', filterCount)"
        v-model.trim="q"
        @update:modelValue="search"
        @focus="selectInput"
        @blur="blurHandler"
        @keyup="keyup"
        data-testid="autocomplete-input"
      />
      <div class="input-group-append">
        <button
          type="button pt-1"
          class="btn btn-outline-primary"
          ref="searchButton"
          :title="$tc('placeholder.search', filterCount)"
          @click="submit({ type: 'string', q })"
          data-testid="add-keyword-button"
        >
          <Icon name="search" :stroke-width="2.5" :height="16" :width="16" />
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          :title="$t('actions.addFilter')"
          @click="showExplorer"
          data-testid="add-filter-button"
        >
          <div class="d-flex dripicons-experiment"></div>
        </button>
      </div>
    </div>

    <div class="suggestions position-absolute" v-show="showSuggestions">
      <div>
        <div
          class="suggestion p-1"
          v-for="(suggestion, index) in staticSuggestions"
          v-bind:key="index"
          @click="submitStaticSuggestion(suggestion)"
          :data-idx="suggestion.idx"
          @mouseover="select(suggestion)"
          :class="{ selected: selectedIndex === suggestion.idx }"
        >
          <div :class="`suggestion-${suggestion.type}`">
            <span class="small" v-if="suggestion.h" v-html="suggestion.h" />
            <span class="small" v-else
              >...<b>{{ q }}</b></span
            >
            <b-badge variant="light" class="border border-medium ml-2">
              {{ $t(`label.${suggestion.type}.title`) }}
            </b-badge>
          </div>
        </div>
      </div>
      <div v-for="(type, i) in suggestionTypes" :key="i" class="suggestion-box">
        <div :title="$t(`label.${type}.title`)">
          <div class="small font-style-italic p-3" v-if="type !== 'mention'">
            {{ $tc('label.' + type + '.title', suggestionIndex[type].length) }}
          </div>
          <div
            v-for="(s, j) in suggestionIndex[type]"
            :key="j"
            @click="submit(s)"
            @mouseover="select(s)"
            :data-idx="s.idx"
            class="suggestion pr-1 pl-2 py-1"
            :class="{
              selected: selectedIndex === s.idx
            }"
          >
            <div v-if="s.fake && type !== 'mention'" :title="$t(`label.${type}.moreLikeThis`)">
              <span class="small"
                >... <b>{{ q }}</b></span
              >
              <b-badge variant="light" class="border border-medium">
                {{ $t(`label.${type}.moreLikeThis`) }}</b-badge
              >
            </div>
            <div v-else :class="`${type} small`">
              <span v-if="['location', 'person'].indexOf(type) !== -1" v-html="s.h" />
              <span v-if="['collection', 'newspaper'].indexOf(type) !== -1" v-html="s.item.name" />
              <span v-if="['topic', 'mention'].indexOf(type) !== -1" v-html="s.h" />
              <span v-if="s.type === 'daterange'"
                >{{ $d(s.daterange.start, 'short') }} - {{ $d(s.daterange.end, 'short') }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <explorer
    v-model="explorerFilters"
    :is-visible="explorerVisible"
    @onHide="handleExplorerHide"
    :searching-enabled="true"
    :initial-search-query="q"
    :initial-type="explorerInitialType"
    :included-types="explorerIncludedTypes"
  />
</template>

<script>
import { ref } from 'vue'
import { mapStores } from 'pinia'
import FilterFactory from '@/models/FilterFactory'
import { useAutocompleteStore } from '@/stores/autocomplete'
import { useUserStore } from '@/stores/user'
import Explorer from './Explorer.vue'
import { useClickOutside } from '@/composables/useClickOutside'
import Icon from './base/Icon.vue'

const AVAILABLE_TYPES = ['newspaper', 'topic', 'location', 'person', 'collection']

export default {
  data: () => ({
    q: '',
    initialSuggestions: [
      {
        type: 'string'
      },
      {
        type: 'title'
      }
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
    explorerVisible: false
  }),
  emits: ['submit', 'submitEmpty', 'input-focus'],
  props: {
    bodyClass: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'primary'
    },
    explorerIncludedTypes: {
      type: Array,
      default: () => ['newspaper', 'topic', 'location', 'person', 'collection']
    },
    /** @type {import('vue').PropOptions<Filter[]>} */
    filters: {
      type: Array,
      default: () => []
    }
  },
  beforeMount() {
    const autocomplete = ref(this.$refs.autocomplete)
    const button = ref(this.$refs.searchButton)
    useClickOutside(
      autocomplete,
      e => {
        if (e.target.classList.contains('search-input')) {
          this.showSuggestions = true
        } else {
          this.hideSuggestions()
        }
      },
      button
    )
  },
  computed: {
    ...mapStores(useAutocompleteStore, useUserStore),
    user() {
      return this.userStore.user
    },
    staticSuggestions() {
      return this.initialSuggestions.concat(this.recentSuggestions).map((d, idx) => ({
        ...d,
        idx
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
        ;(reduced[item[key]] = reduced[item[key]] || []).push(item)
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
              idx
            }
          })
          // exclude extra suggestions for mentions
          if (type !== 'mention') {
            // add custom one
            idx += 1
            index[type].push({
              type,
              fake: true,
              idx
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
      }
    },
    filterCount() {
      return typeof this.filters === 'undefined'
        ? 1
        : this.filters.filter(d => d.type !== 'hasTextContents').length + 1
    }
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
      // console.log('searching')
      this.showSuggestions = this.q.length > 0
      // debugger;
      if (this.q.length) {
        const res = this.autocompleteStore.suggestRecentQuery(this.q)
        this.recentSuggestions = res.map(d => ({
          ...d,
          type: 'string'
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
          q: sq
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
              op: 'OR'
            })
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
            items: [item]
          })
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
            this.selectableSuggestions[this.selectedIndex]
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
    }
  },
  components: {
    Explorer,
    Icon
  }
}
</script>
<style lang="css">
.Autocomplete {
  position: relative;
}
.Autocomplete .search-input {
  border: 1px solid var(--impresso-color-black);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
  background-color: transparent;
  box-shadow: var(--bs-box-shadow-sm);
  color: var(--impresso-color-black);
}

.Autocomplete .search-input:focus {
  background-color: var(--clr-white-rgba-90);
}
.Autocomplete .search-input::placeholder {
  color: var(--clr-grey-500);
}
.Autocomplete.show .search-input {
  border-bottom-left-radius: 0;
}

.Autocomplete .suggestions {
  width: 100%;
  z-index: 10;
  background: var(--clr-white-rgba-90);
  border-bottom-right-radius: var(--border-radius-md);
  border-bottom-left-radius: var(--border-radius-md);
  padding-bottom: var(--spacing-2);
  border: 1px solid var(--impresso-color-black);
  border-top: 0px solid transparent;
}
.bg-dark.Autocomplete .suggestion .badge-light {
  background: transparent;
  color: var(--clr-grey-500);
  border-color: var(--clr-grey-500) !important;
}
.Autocomplete .suggestion.selected {
  background: var(--clr-grey-200);
  cursor: pointer;
  color: white;
}
.Autocomplete .input-group-append button:first-child {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}

.bg-dark.Autocomplete .suggestions {
  background: #3e454c;
  border: 1px solid var(--impresso-color-yellow);
  border-top: 0px solid transparent;
}
.bg-dark.Autocomplete.show .search-input,
.bg-dark.Autocomplete.show .search-input:focus {
  border-color: var(--impresso-color-yellow) !important;
  background-color: #3e454c !important;
  color: var(--impresso-color-white);
}
.bg-dark.Autocomplete .search-input:hover::placeholder {
  color: var(--impresso-color-white);
}
.bg-dark.Autocomplete .search-input {
  color: var(--impresso-color-white);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
  border-color: var(--clr-grey-500);
}

.bg-dark.Autocomplete .input-group-append button {
  border-color: var(--clr-grey-500) !important;
  color: var(--clr-grey-500);
  background-color: transparent;
}
.bg-dark.Autocomplete .input-group-append button:hover {
  color: var(--impresso-color-white);
}
.bg-dark.Autocomplete.show,
.bg-dark.Autocomplete.show .suggestions {
  box-shadow: var(--bs-box-shadow-md-darker);
}
.bg-dark.Autocomplete.show .input-group-append button {
  border-color: var(--impresso-color-yellow) !important;
  color: var(--impresso-color-yellow);
}
.Autocomplete.show .input-group-append button:last-child {
  border-bottom-right-radius: 0;
}
</style>

<i18n lang="json">
{
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
        "title": "suggested newspapers",
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
