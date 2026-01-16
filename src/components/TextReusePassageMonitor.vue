<template>
  <div class="TextReusePassageMonitor d-flex flex-column">
    <div class="flex-shrink-1 px-2">
      <!-- add pagination for startPassage and endPassage -->
      <div class="my-2 py-2 container border-bottom">
        <div class="row d-flex align-items-center">
          <div class="col-6 text-white">
            <ItemLabel v-if="textReuseCluster" type="textReuseCluster" :item="textReuseCluster" />
          </div>
          <div class="col-6 text-small">
            <p
              class="m-0"
              v-html="
                $tc('passages_in_same_cluster', totalPassages, {
                  offset: endPassageOffset + 1,
                  n: totalPassages,
                  diffn: $n(diff.length - 1)
                })
              "
            />
            <div class="d-flex flex-row flex-wrap align-items-center gap-2">
              <i-dropdown
                v-model="endPassageOrderBy"
                :options="
                  orderByOptions.map(value => ({
                    value,
                    text: $t(`sort_${value}`)
                  }))
                "
                class="d-inline-block my-2"
                size="sm"
                variant="outline-tertiary"
              />
              <pagination
                :total-rows="totalPassages"
                :per-page="1"
                :current-page="endPassageOffset + 1"
                @change="handlePaginationChange"
                class="mr-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid TextReusePassageMonitor_header">
        <div class="row">
          <div class="col-6">
            <TextReusePassageItemLabel v-if="startPassage" :item="startPassage" />
          </div>
          <div class="col-6 text-end">
            <TextReusePassageItemLabel v-if="endPassage" :item="endPassage" />
          </div>
        </div>
      </div>
    </div>
    <div class="position-relative flex-grow-1 mb-1">
      <div class="left w-50 position-absolute h-100">
        <p class="m-3 border-top border-tertiary pt-3" v-if="diff.length">
          <span v-for="(part, i) in diff" :key="i">
            <span v-if="part.added" class="added">{{ part.value }}</span>
            <span v-else-if="part.removed" class="removed">{{ part.value }}</span>
            <span v-else-if="part.value">{{ part.value }}</span>
          </span>
        </p>
        <p class="m-3 border-top border-tertiary pt-3" v-else>
          {{ item.content }}
        </p>
      </div>
      <div class="right w-50 position-absolute h-100 bg-dark">
        <p class="m-3 border-top border-tertiary pt-3">
          <span v-for="(part, i) in diff" :key="i">
            <span v-if="part.added" class="added">{{ part.value }}</span>
            <span v-else-if="part.removed" class="removed">{{ part.value }}</span>
            <span v-else-if="part.value">{{ part.value }}</span>
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { diffChars } from 'diff'
import type { Change } from 'diff'
import TextReusePassage from '@/models/TextReusePassage'
import TextReusePassageItemLabel from './modules/lists/TextReusePassageItemLabel.vue'
import Pagination from './modules/Pagination.vue'
import {
  textReusePassages as textReusePassagesService,
  textReuseClusters as textReuseClustersService
} from '@/services'
import ItemLabel from './modules/lists/ItemLabel.vue'
import TextReuseCluster from '@/models/TextReuseCluster'

interface TextReuseItem {
  id: string
  content: string
  textReuseCluster: TextReuseCluster
}

export interface Filter {
  type: string
  q: string
  context?: string
}

interface DropdownOption {
  value: string
  text: string
}

interface SearchQuery {
  offset: number
  limit: number
  order_by: string
  filters: Filter[]
  addons: {
    newspaper: string
  }
}

interface SearchQueryParameters {
  query: SearchQuery
  hash: string
}

interface ApiResponse {
  data: any[]
  total: number
}

// Props
export interface Props {
  item: TextReuseItem
  filters?: Filter[]
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => []
})

// Constants
const OrderByOptions = ['date', '-date', 'size', '-size'] as const
type OrderByOption = (typeof OrderByOptions)[number]

// Reactive data
const totalPassages = ref<number>(-1)
const textReuseCluster = ref<TextReuseCluster | null>(null)
const endPassage = ref<TextReusePassage | null>(null)
const endPassageOrderBy = ref<OrderByOption>('-date')
const endPassageOffset = ref<number>(0)
const endPassageIsLoading = ref<boolean>(true)
const startPassage = ref<TextReusePassage | null>(null)
const startPassageIsLoading = ref<boolean>(true)
const orderByOptions = ref<readonly OrderByOption[]>(OrderByOptions)

// Methods data fetch
const fetchTextReuseCluster = async (id: string): Promise<TextReuseCluster | null> => {
  const response = await textReuseClustersService
    .get(id)
    .then(
      ({
        cluster
      }: {
        cluster: {
          id: string
          lexicalOverlap: number
          clusterSize: number
          timeCoverage: {
            from: string
            to: string
          }
        }
      }) => {
        return new TextReuseCluster({
          id: cluster.id,
          lexicalOverlap: cluster.lexicalOverlap,
          clusterSize: cluster.clusterSize,
          minDate: new Date(cluster.timeCoverage.from),
          maxDate: new Date(cluster.timeCoverage.to)
        })
      }
    )
    .catch(error => {
      console.error('[TextReusePassageMonitor] fetchTextReuseCluster', error)
      return null
    })
  return response
}
const fetchStartPassage = async ({ query }: { query: SearchQuery }): Promise<ApiResponse> => {
  console.debug(
    '[TextReusePassageMonitor] fetchStartPassage',
    JSON.stringify(query.filters, null, 2)
  )
  startPassageIsLoading.value = true

  try {
    const res = await textReusePassagesService.find({ query })

    if (!res.data.length) {
      startPassage.value = null
      startPassageIsLoading.value = false
      return res
    }

    startPassage.value = new TextReusePassage(res.data[0])
    totalPassages.value = res.total
    startPassageIsLoading.value = false
    console.debug(
      '[TextReusePassageMonitor] fetchStartPassage success!\n - id:',
      startPassage.value.id
    )
    return res
  } catch (err) {
    console.error('[TextReusePassageMonitor] fetchStartPassage', err)
    startPassageIsLoading.value = false
    return { data: [], total: 0 }
  }
}

const fetchEndPassage = async ({ query }: { query: SearchQuery }): Promise<ApiResponse> => {
  console.debug('[TextReusePassageMonitor] fetchEndPassage', JSON.stringify(query.filters, null, 2))
  endPassageIsLoading.value = true

  try {
    const res = await textReusePassagesService.find({ query })

    if (!res.data.length) {
      endPassage.value = null
      endPassageIsLoading.value = false
      return res
    }

    endPassage.value = new TextReusePassage(res.data[0])
    totalPassages.value = res.total
    endPassageIsLoading.value = false
    console.debug('[TextReusePassageMonitor] fetchEndPassage success!\n - id:', endPassage.value.id)
    return res
  } catch (err) {
    console.error('[TextReusePassageMonitor] loadPassages', err)
    endPassageIsLoading.value = false
    return { data: [], total: 0 }
  }
}

const handlePaginationChange = (page: number): void => {
  endPassageOffset.value = page - 1
}

// Computed properties
const textReuseClusterId = computed((): string => {
  return props.item?.textReuseCluster.id
})
const diff = computed((): Change[] => {
  if (endPassage.value) {
    return diffChars(props.item.content, endPassage.value.content)
  }
  return []
})

const searchApiEndPassageQueryParameters = computed((): SearchQueryParameters | null => {
  if (!startPassage.value) {
    return null
  }
  const query: SearchQuery = {
    offset: parseInt(endPassageOffset.value.toString(), 10),
    limit: 1,
    order_by: endPassageOrderBy.value,
    filters: [{ type: 'textReuseCluster', q: props.item.textReuseCluster.id }],
    addons: { newspaper: 'text' }
  }

  return {
    query,
    hash: JSON.stringify(query).split('').sort().join('')
  }
})

// Watchers
watch(
  searchApiEndPassageQueryParameters,
  async (newValue: SearchQueryParameters | null, oldValue: SearchQueryParameters | null) => {
    if (!newValue) {
      return false
    }
    if (oldValue && oldValue.hash === newValue.hash) {
      return false
    }
    await fetchEndPassage({ query: newValue.query })
  }
)

watch(
  textReuseClusterId,
  async (newId: string, previousId: string | undefined) => {
    if (newId === previousId) {
      return false
    }
    startPassage.value = null
    totalPassages.value = -1
    endPassageOffset.value = 0
    endPassage.value = null
    textReuseCluster.value = await fetchTextReuseCluster(newId)
    await fetchStartPassage({
      query: {
        offset: 0,
        limit: 1,
        order_by: '-date',
        filters: [{ type: 'textReuseCluster', q: newId }],
        addons: { newspaper: 'text' }
      }
    })
  },
  { immediate: true }
)
</script>
<style lang="scss">
.TextReusePassageMonitor .left,
.TextReusePassageMonitor .right {
  overflow: scroll;
  width: 50%;
}

.TextReusePassageMonitor .right {
  left: 50%;
}

.TextReusePassageMonitor .left p .added,
.TextReusePassageMonitor .right p .removed {
  display: none;
}

.TextReusePassageMonitor p .removed {
  color: inherit;
  opacity: 1;
}

.TextReusePassageMonitor p .added {
  color: inherit;
  font-weight: bold;
}

.TextReusePassageMonitor p .removed,
.TextReusePassageMonitor p .added {
  background-color: white;
}

.TextReusePassageMonitor p {
  color: var(--clr-grey-800);
}

.TextReusePassageMonitor p .added {
  background-color: #0c7bdc;
  color: white;
}

.TextReusePassageMonitor p .removed {
  background-color: #ffc20a;
  color: black;
}

.TextReusePassageMonitor_pagination {
  color: var(--clr-grey-800);
}
</style>

<i18n lang="json">
{
  "en": {
    "sort_date": "sort by date",
    "sort_-date": "sort by date (desc)",
    "sort_size": "sort by size",
    "sort_-size": "sort by size (desc)",
    "passages_in_same_cluster": "Compare the passage on the left side with passage <b>#{offset}</b> of <b>{ n }</b> in the same cluster (<b>{ diffn }</b> chars changes)."
  }
}
</i18n>
