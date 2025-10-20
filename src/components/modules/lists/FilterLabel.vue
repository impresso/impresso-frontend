<template>
  <span v-html="$t(contextTranslationKey, contextTranslationOptions)" />
  <template v-if="filterItems.length"
    >{{ ' ' }}
    <template v-for="(item, index) in filterItems" :key="index">
      <ItemSelector
        v-if="showItemSelector"
        hideIcon
        :uid="item.uid"
        :item="item"
        :type="filter.type"
        class="position-relative"
      >
        <span
          v-if="filter.type !== 'string'"
          class="position-absolute sans very-small-caps text-muted"
          :style="{
            top: '-4px',
            fontSize: '7px'
          }"
          >{{ filter.type }}</span
        >
        <span v-if="filter.type === 'string'" class="highlight precision-{{ item.precision }}">
          {{ item.uid }}
        </span>
        <span
          class="small-caps"
          v-else-if="
            ['type', 'language', 'country', 'copyright', 'sourceType', 'sourceMedium'].includes(
              filter.type
            )
          "
          >{{ $t(`buckets.${filter.type}.${item.uid}`) }}</span
        >
        <span v-else-if="['contentLength'].includes(filter.type)"> </span>
        <span v-else>{{ item.name ?? item.uid }}</span>
      </ItemSelector>
      <span
        v-else-if="['daterange'].includes(filter.type)"
        v-html="
          $t('dates.fromTo', {
            from: $d(daterangeTranslationOptions.from, 'short'),
            to: $d(daterangeTranslationOptions.to, 'short')
          })
        "
      >
      </span>

      <template v-if="index < filterItems.length - 1">
        <span class="separator m-1">{{ ' ' }}{{ $t(operatorTranslationKey) }}{{ ' ' }}</span>
      </template>
    </template>
  </template>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import ItemSelector from '../ItemSelector.vue'

interface FilterAsLabelProps {
  filter: {
    type: string
    items?: {
      uid: string
      name?: string
      precision?: number
      start?: string | number
      end?: string | number
    }[]
    q?: string | string[]
    op?: string
    [key: string]: any
  }
  limitNumberOfFilterItems?: number
}

const props = withDefaults(defineProps<FilterAsLabelProps>(), {
  limitNumberOfFilterItems: 5
})

const contextTranslationKey = computed(() => {
  return `${props.filter.context ?? 'include'}.${props.filter.type}`
})

const contextTranslationOptions = computed(() => {
  const options: { [key: string]: any } = {}
  if (
    [
      'contentLength',
      'textReuseClusterSize',
      'textReuseClusterLexicalOverlap',
      'textReuseClusterDayDelta'
    ].includes(props.filter.type)
  ) {
    options.min = props.filter.q[0]
    options.max = props.filter.q[1]
  }
  return options
})

const daterangeTranslationOptions = computed(() => {
  const options: { [key: string]: any } = {}
  if (
    props.filter.type === 'daterange' &&
    Array.isArray(props.filter.items) &&
    props.filter.items.length > 0
  ) {
    options.from = new Date(props.filter.items[0].start)
    options.to = new Date(props.filter.items[0].end)
  }
  return options
})

const operatorTranslationKey = computed(() => {
  const op = props.filter.op || 'AND'
  return `op.${op.toLowerCase()}`
})

const showItemSelector = computed(() => {
  return (
    Array.isArray(props.filter.items) &&
    props.filter.items.length > 0 &&
    props.filter.items.some(item => item.uid)
  )
})

const filterItems = computed(() => {
  if (!props.filter?.items && Array.isArray(props.filter.q)) {
    return props.filter.q.map(q => ({ uid: q, name: q }))
  }
  return props.filter?.items || []
})

// getFilterAsLabel(filter) {
//       if (filter.items) {
//         const { op = 'OR' } = filter
//         const operator = this.$t(`op.${op.toLowerCase()}`)
//         if (
//           this.limitNumberOfFilterItems > 0 &&
//           filter.items.length > this.limitNumberOfFilterItems
//         ) {
//           return (
//             filter.items
//               .slice(0, this.limitNumberOfFilterItems)
//               .map(item =>
//                 [
//                   `<span class="item ${filter.type}">`,
//                   this.getLabel({
//                     item,
//                     type: filter.type,
//                     filter
//                   }),
//                   '</span>'
//                 ].join('')
//               )
//               .join(` <span class="operator">${operator}</span> `) +
//             ` [... ${
//               filter.items.length - this.limitNumberOfFilterItems
//             } additional options]</span>`
//           )
//         }
//         return filter.items
//           .map(item =>
//             [
//               `<span class="item ${filter.type}">`,
//               this.getLabel({
//                 item,
//                 type: filter.type,
//                 filter
//               }),
//               '</span>'
//             ].join('')
//           )
//           .join(` <span class="operator">${operator}</span> `)
//       } else if (filter.type === 'string') {
//         return this.getLabel({
//           item: filter,
//           type: filter.type,
//           filter
//         })
//       }
//       console.warn('filter not valid:', filter)
//       return ''
//     },
</script>
<i18n lang="json">
{
  "en": {
    "include": {
      "sourceType": "in",
      "sourceMedium": "only",
      "accessRight": "available as",
      "contentLength": "textual content <span class='number'>{min}</span> to <span class='number'>{max}</span> tokens long",
      "copyright": "&copy;",
      "topic": "with topic",
      "isFront": "appearing on the <em>front page</em>",
      "pub": {
        "newspaper": "published in",
        "textReuseCluster": "appearing in clusters"
      },
      "pubof": {
        "newspaper": "in",
        "textReuseCluster": "clustered in"
      },
      "nag": "released by",
      "newspaper": "published in",
      "partner": "from",
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
      "sourceMedium": "not",
      "sourceType": "not in",
      "accessRight": "not available as",
      "contentLength": "textual content not <span class='number'>{min}</span> to <span class='number'>{max}</span> tokens long",
      "isFront": "not appearing on the <em>front page</em>",
      "copyright": "not available as",
      "topic": "without topic",
      "pub": {
        "newspaper": "not published in",
        "textReuseCluster": "not in clusters"
      },
      "pubof": {
        "newspaper": "not published in"
      },
      "nag": "not released by",
      "newspaper": "not published in",
      "partner": "not from",
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
