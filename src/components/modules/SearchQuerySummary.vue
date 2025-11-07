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
import { computed, nextTick, ref, watch } from 'vue'
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
  'year',
  'accessRight',
  'copyright',
  'nag',
  'organisation',
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
    'accessRight',
    'nag'
  ]
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
  async _value => {
    await nextTick()
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

<i18n lang="json">
{
  "en": {
    "reducedSummary": "{type} {string} {title} {isFront} {newspaper} {daterange} {year} {collection} {enumerable} {textReuseCluster} {textReuseClusterSize} {textReuseClusterLexicalOverlap} {textReuseClusterDayDelta} {contentLength}",
    "isFront": "appearing on the <em>front page</em>",
    "include": {
      "accessRight": "available as",
      "contentLength": "<span class='number'>{min}</span> to <span class='number'>{max}</span> tokens long",
      "copyright": "available as",
      "topic": "with topic",
      "pub": {
        "newspaper": "published in",
        "textReuseCluster": "appearing in clusters"
      },
      "pubof": {
        "newspaper": "in",
        "textReuseCluster": "clustered in"
      },
      "newspaper": "published in",
      "mediaSource": "published in",
      "person": "mentioning",
      "location": "mentioning",
      "newsagency": "mentioning",
      "organisation": "mentioning",
      "string": "containing",
      "title": "where title includes",
      "daterange": "published",
      "year": "published in",
      "collection": "saved in",
      "language": "written in",
      "country": "printed in",
      "type": "- tagged as",
      "textReuseCluster": "showing up in clusters",
      "textReuseClusterSize": "in clusters of size <span class='number'>{min}</span> to <span class='number'>{max}</span>",
      "textReuseClusterLexicalOverlap": "where lexical overlap spans from <span class='number'>{min}%</span> to <span class='number'>{max}%</span>",
      "textReuseClusterDayDelta": "where time spans <span class='number'>{min}</span> to <span class='number'>{max}</span> days"
    },
    "exclude": {
      "accessRight": "not available as",
      "contentLength": "not <span class='number'>{min}</span> to <span class='number'>{max}</span> tokens long",

      "copyright": "not available as",
      "topic": "without topic",
      "pub": {
        "newspaper": "not published in",
        "textReuseCluster": "not in clusters"
      },
      "pubof": {
        "newspaper": "not published in"
      },
      "newspaper": "not published in",
      "mediaSource": "not published in",
      "person": "not mentioning",
      "location": "not mentioning",
      "newsagency": "not mentioning",
      "organisation": "not mentioning",
      "string": "not containing",
      "title": "where title does not include",
      "daterange": "not published",
      "year": "not published in",
      "collection": "not saved in",
      "language": "not written in",
      "country": "not printed in",
      "type": "- not tagged as",
      "textReuseCluster": "not in clusters",
      "textReuseClusterSize": "not in clusters of size <span class='number'>{min}</span> to <span class='number'>{max}</span>",
      "textReuseClusterLexicalOverlap": "where lexical overlap does not span from <span class='number'>{min}</span> to <span class='number'>{max}</span>",
      "textReuseClusterDayDelta": "where time does not span <span class='number'>{min}</span> to <span class='number'>{max}</span> days"
    }
  }
}
</i18n>
