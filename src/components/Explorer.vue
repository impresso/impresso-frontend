<template>
  <Modal
    class="Explorer"
    :id="id"
    :show="isVisible"
    body-class="p-0"
    :title="$t('explore')"
    @close="emit(events.Hide)"
  >
    <template v-slot:modal-header-extra>
      <div class="p-3 border-bottom">
        <b-button
          v-for="(availableType, i) in typeOptions"
          :key="i"
          class="mr-1 mt-1"
          variant="outline-primary"
          size="sm"
          @click="handleTypeChange(availableType)"
          :class="{ active: currentType === availableType }"
        >
          {{ $t(`labels.${availableType}`) }}
        </b-button>
        <div class="small mt-2">
          <span v-if="isLoading">{{ $t('actions.loading') }}</span>
          <span
            v-else-if="searchQueryModel.length === 0"
            v-html="
              $tc(`description.${searchingEnabled ? 'search' : 'facets'}`, totalResults, {
                searchQuery: searchQueryModel
              })
            "
          />
          <span
            v-else
            v-html="
              $tc(`description.${searchingEnabled ? 'search' : 'facets'}`, totalResults, {
                searchQuery: searchQueryModel
              })
            "
          ></span>
        </div>
        <form v-if="searchingEnabled" @submit.prevent="search" class="mt-2">
          <div class="input-group">
            <b-form-input
              :placeholder="$tc('searchField.placeholder', totalResults)"
              v-model.trim="searchQueryModel"
              autofocus
              data-testid="search-field"
            />
            <div class="input-group-append">
              <button type="button" class="btn btn-outline-primary pt-2 pb-1 px-2" @click="search">
                <div class="search-submit dripicons-search"></div>
              </button>
            </div>
          </div>
        </form>
        {{ searchParameters }}
      </div>
    </template>
    <div class="bg-light">
      <LoadingBlock v-if="isLoading" :label="$t('actions.loading')" :height="50" class="m-3" />
      <FacetExplorer
        v-if="!RangeFacets.includes(currentType)"
        :filter-type="currentType"
        :buckets="buckets"
        v-model="filter"
      >
        <template v-slot:pagination>
          <pagination
            :current-page="currentPage"
            @change="handlePageChange"
            :perPage="pageSize"
            :totalRows="totalResults"
            :showDescription="false"
          />
        </template>
      </FacetExplorer>
      <range-facet-explorer
        class="p-3"
        v-if="NumericRangeFacets.includes(currentType)"
        :filter-type="currentType"
        :buckets="buckets"
        :range="range"
        v-model="filter"
      />
      <time-facet-explorer
        v-if="TimeRangeFacets.includes(currentType)"
        v-model="filter"
        :filter-type="currentType"
        :buckets="buckets"
      />
    </div>
    <template v-slot:modal-footer="{ close }">
      <b-button @click="close()" size="sm" variant="outline-primary">{{
        $t('actions.close')
      }}</b-button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { v4 } from 'uuid'
// Assuming these imports are available and correctly typed
import { entities, topics, newspapers, collections, getSearchFacetsService } from '@/services'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import FacetExplorer from './modules/FacetExplorer.vue'
import TimeFacetExplorer from './modules/TimeFacetExplorer.vue'
import RangeFacetExplorer from './modules/RangeFacetExplorer.vue'
import Pagination from './modules/Pagination.vue'
import Bucket from '@/models/Bucket'
import { NumericRangeFacets, RangeFacets, TimeRangeFacets } from '@/logic/filters'
import type { Filter } from '@/models'
import { useUserStore } from '@/stores/user'
import LoadingBlock from './LoadingBlock.vue'

const userStore = useUserStore()
// --- Constants ---
const TypeToServiceMap = Object.freeze({
  person: entities,
  location: entities,
  topic: topics,
  newspaper: newspapers,
  collection: collections
}) as Readonly<
  Record<
    string,
    typeof entities | typeof topics | typeof newspapers | typeof collections | undefined
  >
>

const PageSize = 20

const Events = Object.freeze({
  Hide: 'onHide'
})

const AllSupportedFilterTypes = [
  'location',
  'country',
  'person',
  'language',
  'topic',
  'newspaper',
  'year',
  'month',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'daterange'
] as const // Use 'as const' for literal types

type FilterType = (typeof AllSupportedFilterTypes)[number]

// --- Props & Emits ---
export interface ExplorerProps {
  modelValue: Filter[]
  searchingEnabled: boolean
  initialQ?: string
  isVisible: boolean
  initialType?: string
  includedTypes?: FilterType[]
  index?: string
}

const props = withDefaults(defineProps<ExplorerProps>(), {
  modelValue: () => [],
  searchingEnabled: false,
  index: 'search'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filter[]): void
  (e: 'hide'): void
  (e: 'onHide'): void
}>()

// --- State ---
const id = ref<string | undefined>(undefined)
const uid = ref<string | undefined>(undefined)
const events = Events
const currentType = ref<FilterType>('newspaper')
const currentPage = ref(1)
const totalResults = ref(0)
const buckets = ref<any[]>([]) // Use your actual Bucket type
const range = ref<number[]>([])
const isLoading = ref(false)
// const isTimelineLoading = ref(false) // Not used in the original component, removed
const pageSize = ref(PageSize)

// --- Helper Functions ---
function buildServiceQueryParam(page: number, limit: number, type: FilterType, q?: string) {
  const query: Record<string, any> = {
    offset: (page - 1) * limit,
    limit
  }

  if (type === 'person') {
    query.filters = [
      {
        type: 'type',
        q: 'Person'
      }
    ]
  } else if (type === 'location') {
    query.filters = [
      {
        type: 'type',
        q: 'Location'
      }
    ]
  }
  if (q != null && q.length > 0) {
    query.q = q
  }
  return query
}

interface SearchParams {
  filters: Filter[]
  searchingEnabled: boolean
  type: FilterType
  searchQuery?: string
  currentPage: number
  pageSize: number
}
/**
 * Modality: refine existing search quereies using facets
 */
async function searchWithFacetService(searchParams: SearchParams): Promise<{
  totalResults: number
  buckets: Bucket[]
  range?: [number, number]
}> {
  const query = {
    filters: searchParams.filters,
    offset: (searchParams.currentPage - 1) * searchParams.pageSize,
    limit: searchParams.pageSize
  }
  const result = await getSearchFacetsService(props.index).get(searchParams.type, {
    query
  })
  return {
    totalResults: result.numBuckets,
    buckets: result.buckets.map(
      (d: any) =>
        new Bucket({
          ...d,
          type: searchParams.type
        })
    ) as any[],
    range:
      Number.isFinite(result.min) && Number.isFinite(result.max)
        ? ([result.min, result.max] as [number, number])
        : undefined
  }
}

async function searchWithService(searchParams: SearchParams): Promise<{
  totalResults: number
  buckets: Bucket[]
  range?: [number, number]
}> {
  const service = TypeToServiceMap[searchParams.type]
  if (!service) {
    console.warn(
      `[Explorer] No service found for filter type: ${searchParams.type}. Returning empty results.`
    )
  }
  const query = buildServiceQueryParam(
    searchParams.currentPage,
    searchParams.pageSize,
    searchParams.type,
    searchParams.searchQuery
  )
  // await 500ms delay to wait for loading spinner to be visible
  await new Promise(resolve => setTimeout(resolve, 500))
  console.info(`[Explorer] Fetching data from service  ${searchParams.type} with query:`, query)
  const response = await service
    .find({
      query
    })
    .catch(err => {
      console.error(
        `[Explorer] Error fetching data from service  ${searchParams.type} with query:`,
        query,
        '\nError:',
        err
      )
      return {
        total: 0,
        data: []
      }
    })

  return {
    totalResults: response.total,
    buckets: response.data.map(
      (item: any) =>
        new Bucket({
          val: item.uid,
          item,
          type: searchParams.type
        })
    ) as any[],
    range: undefined
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  search()
}

// --- Methods ---
const handleTypeChange = (type: FilterType) => {
  currentType.value = type
}

/**
 * Triggers a search based on the current search parameters.
 */
async function search(): Promise<void> {
  if (!props.isVisible) return
  if (isLoading.value) return

  buckets.value = []
  isLoading.value = true

  if (props.searchingEnabled) {
    await searchWithService(searchParameters.value).then(result => {
      totalResults.value = result.totalResults
      buckets.value = result.buckets
    })
  } else {
    await searchWithFacetService(searchParameters.value).then(result => {
      totalResults.value = result.totalResults
      buckets.value = result.buckets
    })
  }
  isLoading.value = false
}

const searchParameters = computed<SearchParams>(() => {
  return {
    filters: props.modelValue,
    searchingEnabled: props.searchingEnabled,
    type: currentType.value,
    searchQuery: searchQueryModel.value,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  }
})

const typeOptions = computed<FilterType[]>(() => {
  let types = [] as FilterType[]
  if (props.includedTypes) {
    types = props.includedTypes.filter(type =>
      (AllSupportedFilterTypes as readonly string[]).includes(type)
    )
  } else if (props.searchingEnabled) {
    types = ['newspaper', 'person', 'location', 'topic'] as FilterType[]
  }
  if (userStore.isLoggedIn) {
    types.push('collection' as FilterType)
  }
  return types
})

// Two-way binding for `v-model` on child components
const filter = computed({
  get() {
    return props.modelValue.find(({ type }) => type === currentType.value)
  },
  set(filterToSet) {
    if (!filterToSet) return

    const index = props.modelValue.findIndex(({ type }) => type === filterToSet.type)
    const updatedFilters = [...props.modelValue]
    if (index >= 0) updatedFilters[index] = filterToSet
    else updatedFilters.push(filterToSet)

    emit('update:modelValue', updatedFilters)
    emit(events.Hide)
  }
})

const searchQueryModel = ref<string>(props.initialQ || '')

// --- Lifecycle & Watchers ---
onMounted(() => {
  uid.value = v4()
  id.value = `facet-explorer-modal-${uid.value}`
})

// Watch initialType to set currentType
watch(
  () => props.initialType,
  () => {
    if (props.initialType == null) {
      // Must check if typeOptions has data before accessing index 0
      if (typeOptions.value.length > 0) {
        currentType.value = typeOptions.value[0]
      }
    } else {
      currentType.value = props.initialType as FilterType
    }
  },
  { immediate: true }
)

// Watch currentType to reset pagination
watch(currentType, () => {
  currentPage.value = 1
  search()
})

// Watch searchParameters to trigger search
// watch(
//   searchParameters,
//   async val => {
//     console.debug('@watch searchParameters', val)
//     await search()
//   },
//   { deep: true, immediate: false }
// )

watch(
  () => props.isVisible,
  isVisible => {
    if (isVisible) {
      search()
    }
  }
)
</script>

<style lang="css">
.Explorer {
  color: var(--impresso-color-black);
}
.Explorer .input-group input {
  border-color: var(--impresso-color-black);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
}
</style>

<i18n lang="json">
{
  "en": {
    "explore": "Refine your search query",
    "description": {
      "search": "It looks like there are <b>no available options</b> matching '{searchQuery}' | ... Just <b>one</b> option matching '{searchQuery}' | Select among <b>{count}</b> options matching '{searchQuery}'",
      "facets": "It looks like there are <b>no available options</b> using current search  | ... Just <b>one</b> option to refine your search | Select among <b>{count}</b> options to refine your search "
    },
    "searchField": {
      "placeholder": "...|There is only one choice...|Search one of {n} available choices",
      "notAvailable": "...|There is only one choice:|Pick one of the <span class='number'>{n}</span> available choiches:"
    },
    "labels": {
      "daterange": "by date",
      "location": "location",
      "country": "country",
      "person": "person",
      "language": "language",
      "topic": "topic",
      "newspaper": "newspaper",
      "collection": "collection",
      "year": "year",
      "month": "month",
      "textReuseClusterSize": "cluster size",
      "textReuseClusterLexicalOverlap": "cluster lexical overlap",
      "textReuseClusterDayDelta": "cluster span in days"
    }
  }
}
</i18n>
