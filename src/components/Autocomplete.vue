<template>
  <section
    :class="`search-bar Autocomplete ${bodyClass} ${showSuggestions ? 'show' : ''}`"
    ref="autocomplete"
  >
    <div class="input-group">
      <b-form-input
        ref="input"
        class="search-input"
        :placeholder="$tc('placeholder.search', filterCount)"
        v-model.trim="q"
        @update:modelValue="search"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @keyup="keyup"
        data-testid="autocomplete-input"
      />
      <div class="input-group-append">
        <button
          type="button"
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
          class="btn btn-outline-primary d-flex align-content-center px-2"
          :title="$t('actions.addFilter')"
          @click="showExplorer"
          data-testid="add-filter-button"
        >
          <Icon name="arrowEnlargeTag" :stroke-width="1.25" :scale="1" />
        </button>
        <AuthGate v-if="isBaristaEnabled">
          <template #authenticated>
            <BaristaButton
              :filters="filters.map(toCanonicalFilter)"
              @filtersChanged="handleFiltersChanged"
              class="btn btn-outline-primary px-2"
            />
          </template>
        </AuthGate>
      </div>
    </div>

    <div class="suggestions position-absolute" v-show="showSuggestions">
      <div>
        <div
          class="suggestion p-1"
          v-for="(suggestion, index) in staticSuggestions"
          :key="index"
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
            {{ $tc('label.' + type + '.title', suggestionIndex[type]?.length || 0) }}
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
              <span v-if="['location', 'person'].includes(type)" v-html="s.h" />
              <span v-if="['collection', 'newspaper'].includes(type)" v-html="s.item.name" />
              <span v-if="['topic', 'mention'].includes(type)" v-html="s.h" />
              <span v-if="s.type === 'daterange'">
                {{ $d(s.daterange.start, 'short') }} - {{ $d(s.daterange.end, 'short') }}
              </span>
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
    :initial-q="q"
    :initial-type="explorerInitialType"
    :included-types="explorerIncludedTypes"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FilterFactory from '@/models/FilterFactory'
import { useAutocompleteStore } from '@/stores/autocomplete'
import { useUserStore } from '@/stores/user'
import type { Filter } from '@/models'
import type { Features } from '@/init'
import Explorer from './Explorer.vue'
import { useClickOutside } from '@/composables/useClickOutside'
import Icon from './base/Icon.vue'
import BaristaButton from './barista/BaristaButton.vue'
import AuthGate from './AuthGate.vue'
import { FacetType } from '@/models/Facet'
import { toCanonicalFilter } from '@/logic/filters'

const AVAILABLE_TYPES = [
  'newspaper',
  'topic',
  'location',
  'person',
  'collection',
  'mention'
] as const

type AvailableType = (typeof AVAILABLE_TYPES)[number]

interface InitialSuggestion {
  type: string
  h?: string
  idx?: number
}

interface Suggestion extends Record<string, any> {
  type: string
  idx: number
  fake?: boolean
  h?: string
  item?: Record<string, any>
  daterange?: {
    start: Date
    end: Date
  }
}

interface SubmitPayload {
  type?: string
  item?: Record<string, any>
  q?: string
  fake?: boolean
  idx?: number
}

export interface AutocompleteProps {
  bodyClass?: string
  variant?: string
  explorerIncludedTypes?: FacetType[]
  filters?: Filter[]
}

const props = withDefaults(defineProps<AutocompleteProps>(), {
  bodyClass: '',
  variant: 'primary',
  explorerIncludedTypes: () =>
    [
      'mediaSource',
      'topic',
      'location',
      'person',
      'organisation',
      'nag',
      'collection'
    ] as FacetType[],
  filters: () => []
})

const emit = defineEmits<{
  (e: 'submit', filter: unknown): void
  (e: 'submitEmpty'): void
  (e: 'input-focus', focused: boolean): void
  (e: 'filtersChanged', filters: Filter[]): void
}>()

// Stores
const autocompleteStore = useAutocompleteStore()
const userStore = useUserStore()

// Refs
const q = ref('')
const showSuggestions = ref(false)
const explorerVisible = ref(false)
const selectedIndex = ref(0)
const maxSelectedIndex = ref(0)
const selectableSuggestions = ref<Suggestion[]>([])
const recentSuggestions = ref<InitialSuggestion[]>([])
const collectionSuggestions = ref<Suggestion[]>([])
const suggestions = ref<Suggestion[]>([])

const autocomplete = ref<HTMLElement>()
const input = ref<any>()
const searchButton = ref<HTMLElement>()

const initialSuggestions: InitialSuggestion[] = [{ type: 'string' }, { type: 'title' }]

// Computed
const staticSuggestions = computed(() => {
  return initialSuggestions.concat(recentSuggestions.value).map(
    (d, idx) =>
      ({
        ...d,
        idx
      }) as Suggestion
  )
})

const isBaristaEnabled = computed(() => {
  const features = (window as any)?.impressoFeatures as Features | undefined
  return features?.barista?.enabled ?? false
})

const filterCount = computed(() => {
  return props.filters.length === 0
    ? 1
    : props.filters.filter(d => d.type !== 'hasTextContents').length + 1
})

const suggestionIndex = computed(() => {
  const index: Record<string, Suggestion[]> = {}

  // Group suggestions by type
  suggestions.value.forEach(item => {
    const type = item.type as string
    if (!index[type]) {
      index[type] = []
    }
    index[type].push(item)
  })

  let idx = staticSuggestions.value.length - 1
  let selectableSuggestionsList: Suggestion[] = [...staticSuggestions.value]

  AVAILABLE_TYPES.forEach(type => {
    if (index[type]) {
      index[type] = index[type].map(d => {
        idx += 1
        return {
          ...d,
          idx
        }
      })

      if (type !== 'mention') {
        idx += 1
        index[type].push({
          type,
          fake: true,
          idx
        } as Suggestion)
      }
    }

    selectableSuggestionsList = selectableSuggestionsList.concat(index[type] || [])
  })

  maxSelectedIndex.value = idx
  selectableSuggestions.value = selectableSuggestionsList

  return index
})

const suggestionTypes = computed(() => {
  return AVAILABLE_TYPES.filter(type => !!suggestionIndex.value[type])
})

const suggestionType = computed<FacetType>(() => {
  if (!selectableSuggestions.value[selectedIndex.value]) {
    return 'string' as FacetType
  }
  return (selectableSuggestions.value[selectedIndex.value].type || 'string') as FacetType
})

const explorerInitialType = computed(() => {
  if (props.explorerIncludedTypes.includes(suggestionType.value)) {
    return suggestionType.value
  }
  return props.explorerIncludedTypes[0] || 'mediaSource'
})

const explorerFilters = computed({
  get: () => [],
  set: (filters: unknown[]) => {
    const filter = filters[0]
    emit('submit', filter)
    q.value = ''
  }
})

// Methods
const search = () => {
  showSuggestions.value = q.value.length > 0

  if (q.value.length) {
    const res = autocompleteStore.suggestRecentQuery(q.value)
    recentSuggestions.value = res.map(d => ({
      ...d,
      type: 'string'
    }))
  }

  if (q.value.length > 1) {
    autocompleteStore.search(q.value.trim()).then(res => {
      suggestions.value = [...res, ...collectionSuggestions.value]
    })

    if (userStore.user) {
      autocompleteStore.suggestCollections(q.value.trim()).then(res => {
        collectionSuggestions.value = res
        suggestions.value = [...res, ...suggestions.value]
      })
    }
  } else {
    suggestions.value = []
    selectedIndex.value = 0
  }
}

const submitStaticSuggestion = (suggestion: Suggestion) => {
  const sq = String(suggestion.q || q.value || '').trim()
  if (sq.length) {
    submit({
      type: suggestion.type,
      q: sq
    })
    q.value = ''
  }
}

const submit = (payload?: SubmitPayload) => {
  if (!payload) return

  const { type, item = {}, q: queryStr, fake = false } = payload

  if (fake) {
    showExplorer()
  } else if (['string', 'title', 'mention'].includes(type || '')) {
    const sq = String(queryStr || (item as any).name || q.value || '').trim()
    if (sq.length) {
      autocompleteStore.saveRecentQuery(sq)
      emit(
        'submit',
        FilterFactory.create({
          type,
          q: [sq],
          op: 'OR'
        })
      )
      q.value = ''
    } else {
      emit('submitEmpty')
    }
  } else {
    emit(
      'submit',
      FilterFactory.create({
        type,
        q: [(item as any).uid],
        items: [item]
      })
    )
    q.value = ''
  }
}

const select = (suggestion: Suggestion) => {
  selectedIndex.value = suggestion.idx
}

const handleInputFocus = (e: FocusEvent) => {
  showSuggestions.value = q.value.length > 0
  ;(e.target as HTMLInputElement)?.select?.()
  emit('input-focus', true)
}

const focusInputAfterEnter = () => {
  input.value?.focus?.()
  const el = (input.value as any)?.inputRef?.value as HTMLInputElement | undefined
  el?.select?.()
  emit('input-focus', true)
}

const handleInputBlur = () => {
  emit('input-focus', false)
}

const handleFiltersChanged = (filters: Filter[]) => {
  console.debug('[Autocomplete] @handleFiltersChanged')
  emit('filtersChanged', filters)
}
const hideSuggestions = () => {
  showSuggestions.value = false
}

const showExplorer = () => {
  explorerVisible.value = true
}

const handleExplorerHide = () => {
  explorerVisible.value = false
}

const keyup = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      submit(selectableSuggestions.value[selectedIndex.value])
      focusInputAfterEnter()
      break
    case 'ArrowDown':
      selectedIndex.value += 1
      break
    case 'ArrowUp':
      selectedIndex.value -= 1
      break
    case 'Escape':
      hideSuggestions()
      break
    default:
      break
  }

  if (selectedIndex.value > maxSelectedIndex.value) {
    selectedIndex.value = 0
  } else if (selectedIndex.value < 0) {
    selectedIndex.value = maxSelectedIndex.value
  }
}

// Lifecycle
onMounted(() => {
  useClickOutside(
    autocomplete,
    (e: MouseEvent) => {
      if (e.target === input.value?.$el) {
        showSuggestions.value = true
      } else {
        hideSuggestions()
      }
    },
    searchButton
  )
})
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
  }
}
</i18n>
