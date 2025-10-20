<template>
  <div class="d-inline" ref="summaryRef">
    <template v-for="(itemKey, idx) in translatableFilterTypes" :key="itemKey">
      <template v-if="translationTable[itemKey]">
        <FilterLabel v-for="filter in translationTable[itemKey]" :filter="filter"></FilterLabel>
      </template>
      <template v-if="idx < translatableFilterTypes.length - 1"
        >{{ ' ' }}&middot;{{ ' ' }}</template
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import Filter from '@/models/FilterBase'
import Helpers from '../../plugins/Helpers'
import { computed, nextTick, ref, watch } from 'vue'
import FilterLabel from './lists/FilterLabel.vue'

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
  async value => {
    console.log('Computed content changed. Now updating DOM...')
    // Just to trigger recomputation
    console.log('Search query updated:', value)
    await nextTick()
    if (summaryRef.value) {
      const finalHtml = summaryRef.value.textContent?.trim() || ''
      if (summaryTextContent.value !== finalHtml) {
        summaryTextContent.value = finalHtml
        console.log('Emitting updated summary:', finalHtml)
      }
    }
  },
  { deep: false, immediate: true }
)

// const getLabel = ({ item, type, filter }) => {
//       let t = ''
//       switch (type) {
//         case 'daterange':
//           {
//             const [start, end] = [item.start, item.end].map(v => new Date(v))
//             t = `from <span class="date">${this.$d(
//               start,
//               'compactUtc'
//             )}</span> to <span class="date">${this.$d(end, 'compactUtc')}</span>`
//           }
//           break
//         case 'location':
//         case 'person':
//         case 'collection':
//           t = item.name
//           break
//         case 'newspaper':
//           if (item.name) {
//             t = item.name
//           } else {
//             t = (this.newspaperLabels || {})[filter.q] || filter.q
//           }
//           break
//         case 'textReuseCluster':
//           t = (item.id || item.uid || '').split('-').pop()
//           t = `<span class="number">${t}</span>`
//           break
//         case 'title':
//         case 'string':
//           t = `<span class="highlight precision-${item.precision}">${
//             item.uid || item.q
//           }</span>${item.distance || ''}`
//           break
//         case 'topic':
//           if (item.htmlExcerpt) {
//             t = item.htmlExcerpt
//           } else if (item.excerpt.length) {
//             t = item.excerpt.map(d => d.w).join(' · ')
//           } else {
//             t = item.uid
//           }
//           break
//         case 'year':
//           // console.log('____', item, type, filter);
//           t = Array.isArray(filter.q) ? filter.q.join(', ') : filter.q
//           break
//         default:
//           t = this.$t(`buckets.${type}.${item.uid}`)
//           break
//       }
//       if (!t && item.uid) {
//         t = item.uid
//       }
//       return t
//     },
</script>
<style lang="scss">
.search-query-summary {
  span.item.person,
  span.item.topic,
  span.item.location,
  span.item.copyright,
  span.item.daterange > span.date {
    text-transform: uppercase;
    font-family: var(--bs-font-sans-serif);
    font-size: var(--impresso-font-size-smallcaps);
    font-variant: normal;
    letter-spacing: var(--impresso-letter-spacing-smallcaps);
    font-weight: var(--impresso-wght-smallcaps);
    font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
  }
  span.item.collection {
    font-family: var(--bs-font-sans-serif);
    color: #049dae;
  }

  span.item.newspaper,
  span.item.country {
    font-weight: var(--impresso-wght-bold);
    font-variation-settings: 'wght' var(--impresso-wght-bold);
  }

  .precision-exact::before,
  .precision-exact::after {
    content: '"';
    font-weight: bold;
  }

  .precision-fuzzy::after {
    content: '~';
    font-weight: bold;
  }

  .precision-soft::before {
    content: '[';
    font-weight: bold;
  }

  .precision-soft::after {
    content: ']';
    font-weight: bold;
  }
}
</style>
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
      "person": "mentioning",
      "location": "mentioning",
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
      "person": "not mentioning",
      "location": "not mentioning",
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
