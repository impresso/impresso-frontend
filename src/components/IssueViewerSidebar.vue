<template>
  <List
    :hide-pagination="!displayOnlyMatchingArticles"
    :paginationList="paginationList"
    @change-page="paginationCurrentPage = $event"
    width="300px"
  >
    <template v-slot:header v-if="issue">
      <b-tabs pills class="mx-2 pt-2">
        <template v-slot:tabs-start>
          <b-nav-item active-class="active" active>
            <a aria-current="page" class="none router-link-exact-active nav-link active">
              <span v-html="$t('table_of_contents')"></span>
            </a>
          </b-nav-item>
        </template>
        <template v-slot:default>
          <div class="p-2 px-3 mb-1">
            <form class="pb-1 form-inline">
              <b-form-checkbox
                :disabled="currentFilters.length === 0"
                v-model="applyCurrentSearchFilters"
                switch
              >
                {{ $t('actions.addCurrentSearch') }}
                {{ applyCurrentSearchFilters ? '✓' : '' }}
              </b-form-checkbox>
            </form>
            <b-alert
              variant="transparent"
              class="pb-1 small"
              show
              v-if="currentFilters.length === 0 || ignoredFilters.length"
            >
              <div v-if="currentFilters.length === 0">
                {{ $t('applyCurrentSearchFiltersDisabled') }}
              </div>
              <span
                v-if="ignoredFilters.length"
                v-html="$tc('numbers.ignoredFilters', ignoredFilters.length)"
              >
              </span>
            </b-alert>
            <SearchPills
              disable-reset
              v-if="applyCurrentSearchFilters"
              :filters="allowedFilters"
              @changed="handleFiltersChanged"
              class="pb-1"
            />
            <b-input
              class="mb-2"
              v-model.trim="suggestionQuery"
              debounce="500"
              :placeholder="$t('label_filter_articles')"
            />
            <div class="mb-2 IssueViewerPage_matchingContentItems" v-if="serviceQuery.enabled">
              <div v-if="isLoadingServiceQuery">{{ $t('actions.loading') }}</div>
              <div
                v-else-if="applyCurrentSearchFilters && !suggestionQuery.length"
                v-html="
                  $tc('numbers.articlesMatchingSearchFilters', paginationTotalRows, {
                    n: $n(paginationTotalRows),
                    q: suggestionQuery
                  })
                "
              ></div>
              <div
                v-else-if="applyCurrentSearchFilters"
                v-html="
                  $tc('numbers.articlesMatchingWithinSearch', paginationTotalRows, {
                    n: $n(paginationTotalRows),
                    q: suggestionQuery
                  })
                "
              ></div>
              <div
                v-else
                v-html="
                  $tc('numbers.articlesMatching', paginationTotalRows, {
                    n: $n(paginationTotalRows),
                    q: suggestionQuery
                  })
                "
              ></div>
            </div>
          </div>
        </template>
      </b-tabs>
    </template>
    <template v-slot:default>
      <IssueViewerTableOfContents
        :items="serviceQuery.enabled ? matchingContentItems : contentItems"
        :selected-article-id="selectedContentItemUid"
        @article-selected="$emit('content-item-selected', $event)"
      />
    </template>
  </List>
</template>

<script setup lang="ts">
import type { Issue, Filter } from '@/models'
import IssueViewerTableOfContents from './IssueViewerTableOfContents.vue'
import List from './modules/lists/List.vue'
import ArticleBase from '@/models/ArticleBase'
import { CommonQueryParameters } from '@/router/util'
import { useRoute, useRouter } from 'vue-router'
import { computed, onUnmounted } from 'vue'
import { ref } from 'vue'
import SearchPills from './SearchPills.vue'
import { watch } from 'vue'
import { getFilterQuery } from '@/models/SearchQuery'
import { search } from '@/services'

export interface IssueViewerSidebarProps {
  issue: Issue | null
  selectedContentItemUid: string
  contentItems: ArticleBase[]
  allowedFilters: Filter[]
  ignoredFilters: Filter[]
  currentFilters: Filter[]
}

const props = defineProps<IssueViewerSidebarProps>()

const emit = defineEmits<{
  'content-item-selected': [selectedContentItemUid: string]
  'change-page': [page: number]
  'filters-changed': [filters: Filter[]]
}>()

const displayOnlyMatchingArticles = ref(false)
const applyCurrentSearchFilters = ref(false)
const matchingContentItems = ref<ArticleBase[]>([])
const paginationPerPage = ref(10)
const paginationCurrentPage = ref(1)
const paginationTotalRows = ref(0)
const isLoadingServiceQuery = ref(false)
const suggestionQuery = ref('')

const paginationList = computed<{
  perPage: number
  currentPage: number
  totalRows: number
}>(() => ({
  perPage: paginationPerPage.value,
  currentPage: paginationCurrentPage.value,
  totalRows: paginationTotalRows.value
}))

const serviceQuery = computed<{
  limit: number
  offset: number
  filters: Filter[]
  enabled: boolean
}>(() => {
  const sq = {
    limit: paginationPerPage.value,
    offset: (paginationCurrentPage.value - 1) * paginationPerPage.value,
    filters: applyCurrentSearchFilters.value ? props.allowedFilters.map(getFilterQuery) : [],
    enabled: (props.issue && applyCurrentSearchFilters.value) || suggestionQuery.value.length > 0
  }
  if (suggestionQuery.value.length > 0) {
    sq.filters.push({
      type: 'string',
      q: suggestionQuery.value
    })
  }
  if (props.issue) {
    sq.filters.push({ type: 'issue', q: props.issue.uid })
  } // eslint-disable-next-line
  console.debug(
    '[IssueViewerPage] computed serviceQuery enabled:',
    sq.enabled,
    'filters:',
    sq.filters
  )
  return sq
})

function handleFiltersChanged(filters: Filter[]) {
  console.debug('[IssueViewerSidebar] handleFiltersChanged:', filters)
  emit('filters-changed', filters)
}

async function fetchMatchingContentItems({
  filters,
  limit,
  offset
}: {
  filters: Filter[]
  limit: number
  offset: number
}): Promise<ArticleBase[]> {
  console.debug('[IssueViewerSidebar] fetchMatchingContentItems')
  return search
    .find({
      query: {
        // legacy parameter
        filters,
        limit,
        offset,
        group_by: 'articles'
      }
    })
    .then(({ data, total }) => {
      paginationTotalRows.value = total
      return data.map(article => new ArticleBase(article))
    })
    .catch(err => {
      console.warn('[IssueViewerPage] @serviceQuery Error', err)
      return []
    })
}

/**
 * Fetch matching content items based on the current service query.
 * This function performs an API call to fetch articles based on the provided filters and query.
 */
let debounceTimeout: ReturnType<typeof setTimeout>
watch(serviceQuery, sq => {
  console.debug('[IssueViewerSidebar] serviceQuery changed:', sq)
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    if (sq.enabled) {
      // Simulate fetching data from a service
      isLoadingServiceQuery.value = true
      matchingContentItems.value = await fetchMatchingContentItems({
        filters: sq.filters,
        limit: sq.limit,
        offset: sq.offset
      }) // Update total rows based on fetched data
    } else {
      matchingContentItems.value = []
      paginationTotalRows.value = 0
    }
    isLoadingServiceQuery.value = false
  }, 500) // Adjust debounce time as needed
})
onUnmounted(() => {
  clearTimeout(debounceTimeout)
})
</script>
<i18n lang="json">
{
  "en": {
    "table_of_contents": "Table of Contents",
    "actions.addCurrentSearch": "Add Current Search Filters",
    "applyCurrentSearchFiltersDisabled": "Apply current search filters is disabled because no filters are active.",
    "numbers.ignoredFilters": "{n} ignored filter(s)",
    "label_filter_articles": "... search in current issue",
    "actions.loading": "Loading...",
    "numbers.articlesMatchingSearchFilters": "No content item found. | 1 content item  matching search filters | {n} articles matching search filters",
    "numbers.articlesMatchingWithinSearch": "{n} article(s) matching within search: {q}",
    "numbers.articlesMatching": "{n} article(s) matching: {q}"
  }
}
</i18n>
