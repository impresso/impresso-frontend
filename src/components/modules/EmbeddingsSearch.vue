<template>
  <div>
    <div
      class="m-2"
      :class="{
        small: 'reduced'
      }"
      v-html="$t('embedding_howto')"
    />
    <form @submit.prevent="performSearch">
      <div class="input-group Autocomplete">
        <b-form-input
          type="text"
          class="search-input"
          name="inputEmbeddings"
          v-model.trim="query"
          :size="reduced ? 'sm' : 'md'"
          :debounce="250"
          @keydown.space.prevent
          @click.prevent.stop
        />
        <div class="input-group-append">
          <template v-if="reduced">
            <b-form-select
              v-model="languageEmbeddings"
              :options="languageEmbeddingsOptions"
              size="sm"
              :style="{ width: '50px' }"
              class="border-right-0 border-dark"
            />
            <b-form-select
              v-model="limitEmbeddings"
              v-bind:options="limitEmbeddingsOptions"
              size="sm"
              class="border-right-0 border-dark border-left"
            />
          </template>
          <template v-else>
            <i-dropdown
              v-model="languageEmbeddings"
              v-bind:options="languageEmbeddingsOptions"
              size="sm"
              variant="outline-secondary"
              right
              buttonClass="border-right-0"
            ></i-dropdown>
            <i-dropdown
              v-model="limitEmbeddings"
              v-bind:options="limitEmbeddingsOptions"
              size="sm"
              variant="outline-secondary"
              right
              buttonClass="border-right-0"
            ></i-dropdown>
          </template>
          <button
            class="btn btn-outline-secondary d-flex align-content-center"
            :disabled="!query.length"
            @click.prevent="performSearch"
            :class="{
              ['px-2 btn-sm']: reduced,
              ['px-3 ']: !reduced
            }"
          >
            {{ $t('actions.search') }}
          </button>
        </div>
      </div>
      <div v-if="reduced" class="mt-1 d-flex very-small"></div>
    </form>

    <div class="my-2">
      <div v-if="errorType" role="alert" v-html="$t(`error_${errorType}`, { query })" />
      <div v-else-if="words.length" class="text-muted very-small px-2">
        {{ $t('embeddings_words') }}
      </div>
    </div>

    <section style="min-height: 100px">
      <LoadingBlock v-if="isLoading" :height="100" />
      <div
        v-else-if="!isLoading && !words.length"
        class="text-muted font-italic d-flex align-items-center justify-content-center"
        style="min-height: 100px"
      >
        {{ $t('actions.typeMoreChars') }}
      </div>
      <div
        class="embeddings mt-2 d-flex flex-wrap"
        :class="{ 'gap-1': reduced, 'gap-2': !reduced }"
        v-if="!isLoading && words.length"
      >
        <button
          v-for="(word, i) in words"
          :key="i"
          @click.prevent.stop="updateFilter(word.word)"
          :title="$t('filter.add', { word: word.word })"
          class="text-decoration-none border px-2 py-1 bg-light shadow-sm rounded border"
          :class="{
            small: reduced
          }"
          :disabled="isInFilter(word.word)"
        >
          {{ word.word }}
        </button>
      </div>
    </section>
    <section
      v-if="withPreview"
      class="d-block border bg-light shadow-sm rounded-md mt-2 p-2"
      :class="{ 'border-dark': localFilter }"
    >
      <span
        class="small m-2"
        v-html="
          $tc('numbers.itemsGeneric', localFilter?.q.length || 0, {
            n: localFilter?.q.length || 0
          })
        "
      />

      <Ellipsis :initialHeight="70" v-if="localFilter">
        <div class="d-flex flex-wrap align-items-center bg-light">
          <template v-for="(word, index) in localFilter.q" :key="index">
            <div class="small-caps m-1">
              <span class="highlight p-1">"{{ word }}"</span>
              <button
                class="btn btn-transparent pt-0 px-1 pb-1 btn-pill"
                :style="{ lineHeight: '1em' }"
                @click="removeFilterWordAtIndex(index)"
              >
                <Icon name="cross" :scale="0.5" :strokeWidth="2"></Icon>
              </button>
            </div>
            <span class="m-1 very-small-caps" v-if="index < localFilter.q.length - 1">{{
              $t('op.' + localFilter.op.toLowerCase())
            }}</span>
          </template>
        </div>
      </Ellipsis>
      <div class="mt-2 p-2 pt-3 border-top">
        <button
          class="btn btn-sm btn-outline-primary"
          @click="emit('filters-changed', newFilters)"
          :disabled="!localFilter"
        >
          {{ $t('actions.addToCurrentFilters') }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { embeddings as embeddingsService } from '@/services'
import { useEmbeddingsStore } from '@/stores/embeddings'
import type { WordMatch } from '@/services/types/embeddings'
import Filter from '@/models/FilterBase'
import LoadingBlock from '../LoadingBlock.vue'
import FilterFactory from '@/models/FilterFactory'
import Ellipsis from './Ellipsis.vue'
import Icon from '../base/Icon.vue'

/**
 * Interface for the service query parameters
 */
export interface ServiceQuery {
  /** Search term for embeddings lookup */
  term: string
  /** Language code for embeddings (e.g., 'fr', 'de', 'lb') */
  language: string
  /** Maximum number of results to return */
  limit: number
}

/**
 * Interface for select dropdown options
 */
export interface SelectOption {
  /** The value of the option */
  value: string
  /** The display text of the option */
  text: string
}

/**
 * Props definition for the Embeddings component
 */
export interface Props {
  /** Filter object containing query parameters */
  filters?: Filter[]
  languageEmbeddingsOptions?: SelectOption[]
  limitEmbeddingsOptions?: SelectOption[]
  withPreview?: boolean
  reduced?: boolean
}
// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  languageEmbeddingsOptions: () => [
    { value: 'fr', text: 'French' },
    { value: 'de', text: 'German' },
    { value: 'lb', text: 'Luxembourgish' }
  ],
  limitEmbeddingsOptions: () => [
    { value: '10', text: '10' },
    { value: '25', text: '25' },
    { value: '50', text: '50' }
  ],
  withPreview: false,
  reduced: false
})

const emit = defineEmits<{
  (e: 'embdding-selected', embedding: string): void
  (e: 'filters-changed', filters: Filter[]): void
}>()

const embeddingsStore = useEmbeddingsStore()
const query = ref<string>('')
const localFilter = ref<Filter | null>(null)
const newFilters = computed<Filter[]>(() => {
  if (!props.filters && !localFilter.value) {
    return []
  }
  if (!localFilter.value) {
    return props.filters!
  }
  return [...props.filters, localFilter.value]
})
const words = ref<WordMatch[]>([])
const errorType = ref<string | null>(null)
const isLoading = ref<boolean>(false)

/**
 * Computed property that extracts the last word from the filter query
 * Used to initialize the search input on component mount
 */
const filterQuery = computed<string | undefined>(() => {
  if (props.filters && Array.isArray(props.filters)) {
    const lastFilter = props.filters.filter(({ type }) => type === 'string').pop()
    const q = (Array.isArray(lastFilter?.q) ? lastFilter?.q : [lastFilter.q])
      .join(' ')
      .split(' ')
      .pop()
      ?.replace(/(\s|-).*/, '')
    return q
  }
  return undefined
})

/**
 * Computed property for the embeddings result limit
 * Synced with the Pinia store
 */
const limitEmbeddings = computed<string>({
  get() {
    return String(embeddingsStore.limit)
  },
  set(value: string) {
    embeddingsStore.updateLimit(Number(value))
  }
})

/**
 * Computed property for the selected language
 * Synced with the Pinia store
 */
const languageEmbeddings = computed<string>({
  get() {
    return embeddingsStore.language
  },
  set(value: string) {
    embeddingsStore.updateLanguage(value)
  }
})

/**
 * Computed property that combines all service query parameters
 * Used to watch for changes and trigger new searches
 */
const serviceQuery = computed<ServiceQuery>(() => ({
  term: query.value,
  language: languageEmbeddings.value,
  limit: Number(limitEmbeddings.value)
}))

const isInFilter = (word: string): boolean => {
  if (!localFilter.value) {
    return false
  }
  const currentQ = Array.isArray(localFilter.value.q) ? localFilter.value.q : [localFilter.value.q]
  return currentQ.includes(word)
}

/**
 * Emits the selected embedding word to the parent component
 * @param embedding - The selected word to add to the filter
 */
const updateFilter = (embedding: string): void => {
  if (!localFilter.value) {
    localFilter.value = FilterFactory.create({ type: 'string', q: [] })
  }
  const newQ = [
    ...(Array.isArray(localFilter.value.q) ? localFilter.value.q : [localFilter.value.q]),
    embedding
  ].reduce((acc: string[], curr: string) => {
    if (!acc.includes(curr)) {
      acc.push(curr)
    }
    return acc
  }, [])
  localFilter.value.q = newQ
  localFilter.value.items = newQ.map(s => ({ uid: s }))
  emit('embdding-selected', embedding)
}

/**
 * Fetches embeddings from the service based on current query parameters
 * Handles loading states, errors, and filters out the search term itself from results
 */
const fetchEmbeddings = async ({ term, language, limit }: ServiceQuery): Promise<void> => {
  errorType.value = null
  words.value = []

  // Don't search for terms shorter than 2 characters
  if (term.length < 2) {
    return
  }

  isLoading.value = true

  try {
    const { data } = await embeddingsService.find({
      query: {
        limit,
        top_k: limit,
        term,
        language_code: language,
        offset: 0
      }
    })

    // Filter out the search term itself from the results
    words.value = data.filter(w => w.word !== term.toLowerCase())
  } catch (e) {
    console.warn('Error received from embeddings.find service:', e)
    errorType.value = (e as Error).name
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in service query and fetch new embeddings
// watch(
//   serviceQuery,
//   newQuery => {
//     fetchEmbeddings(newQuery)
//   },
//   { immediate: true }
// )
const performSearch = () => {
  console.log('Performing search with query:', serviceQuery.value)
  fetchEmbeddings(serviceQuery.value)
}

const removeFilterWordAtIndex = (index: number): void => {
  if (!localFilter.value) {
    return
  }
  const currentQ = Array.isArray(localFilter.value.q) ? localFilter.value.q : [localFilter.value.q]
  currentQ.splice(index, 1)
  localFilter.value.q = currentQ
  localFilter.value.items = currentQ.map(s => ({ uid: s }))
  if (currentQ.length === 0) {
    localFilter.value = null
  }
}
// Initialize query from filter on mount
onMounted(() => {
  if (filterQuery.value) {
    query.value = filterQuery.value
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "actions": {
      "typeMoreChars": "press search to find similar words"
    },
    "error_NotFound": "Ops, it looks like <b>{query}</b> is not available in our embeddings",
    "error_GeneralError": "Service not availble at the moment, try again in a couple of minutes",
    "error_BadRequest": "<b>{query}</b> contains invalid characters, only a-z A-Z and accented letters are allowed",
    "filter": {
      "add": "Add {word} to filter"
    },
    "embedding_howto": "Expand you search! Type <b>one word</b> and obtain a list of similar words",
    "embeddings_words": "Click on one of the following words to update your search"
  }
}
</i18n>
