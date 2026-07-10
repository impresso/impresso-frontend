<template>
  <div class="d-inline" ref="summaryRef">
    <template v-for="(itemKey, idx) in translatableFilterTypes" :key="itemKey">
      <template v-if="translationTable[itemKey]">
        <template v-for="(filter, j) in translationTable[itemKey]" :key="filter.type">
          <FilterLabel :filter="filter"></FilterLabel>
          <span class="small-caps" v-if="j < translationTable[itemKey].length - 1"> AND </span>
        </template>
      </template>
      <template v-if="idx < translatableFilterTypes.length - 1"
        >{{ ' ' }}&middot;{{ ' ' }}</template
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import FilterLabel from './lists/FilterLabel.vue'
import { Filter } from '@/models'

export interface SearchQuerySummaryProps {
  searchQuery: {
    filters: Filter[]
  }
  reduced?: boolean
  limitNumberOfFilterItems?: number
}

const AvailableFilterTypes = [
  'type',
  'string',
  'title',
  'isFront',
  'contentLength',
  'ocrQuality',
  'source',
  'sourceType',
  'sourceMedium',
  'newspaper',
  'mediaSource',
  'partner',
  'daterange',
  'year',
  'collection',
  'person',
  'location',
  'language',
  'country',
  'copyright',
  'nag',
  'organisation',
  'page',
  'textReuseCluster',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'topic'
]

const summaryRef = ref<HTMLElement | null>(null)
const summaryTextContent = ref('')

const emit = defineEmits<{
  (e: 'updated', summary: string): void
}>()

const props = withDefaults(defineProps<SearchQuerySummaryProps>(), {
  searchQuery: () => ({
    filters: []
  }),
  reduced: false,
  limitNumberOfFilterItems: -1,
  enumerables: () => [
    'type',
    'collection',
    'topic',
    'person',
    'location',
    'language',
    'country',
    'year',
    'copyright',
    'nag'
  ]
})
const isAlive = ref(true)

onBeforeUnmount(() => {
  isAlive.value = false
})

const translationTable = computed(() => {
  const table = props.searchQuery.filters.reduce(
    (acc, filter) => {
      const filterType = filter.type
      if (AvailableFilterTypes.includes(filterType)) {
        if (!acc[filterType]) {
          acc[filterType] = []
        }
        acc[filterType].push(filter)
      } else {
        console.warn(`Filter type "${filterType}" is not supported for translation.`)
      }
      return acc
    },
    {} as Record<string, Filter[]>
  )
  return table
})

const translatableFilterTypes = computed(() => {
  return AvailableFilterTypes.filter(type => Object.keys(translationTable.value).includes(type))
})

watch(
  translationTable,
  async () => {
    await nextTick()
    if (!isAlive.value) return
    if (summaryRef.value) {
      const finalHtml = summaryRef.value.textContent?.trim().replace(/\s+/g, ' ') || ''
      if (summaryTextContent.value !== finalHtml) {
        summaryTextContent.value = finalHtml
        emit('updated', finalHtml)
      }
    }
  },
  { deep: false, immediate: true }
)
</script>
