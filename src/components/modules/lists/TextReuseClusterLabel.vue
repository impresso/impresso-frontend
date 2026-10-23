<template>
  <span
    v-if="summary"
    v-html="
      $t('textReuseClusterSummary', {
        shortId: summary.shortId,
        textSampleExcerpt: summary.textSampleExcerpt,
        size: $t('numbers.clusterSize', { n: $n(summary.clusterSize) }, summary.clusterSize),
        lexicalOverlap:
          summary.lexicalOverlap != null
            ? $t(
                'numbers.lexicalOverlap',
                { n: $n(summary.lexicalOverlap) },
                summary.lexicalOverlap
              )
            : '',
        timespan: $t(
          'numbers.days',
          { n: $n(summary.timeDifferenceDay) },
          summary.timeDifferenceDay
        ),
        dates: summary.dates
          .map(({ value, format }) => (format ? $d(value, format) : value))
          .join(' - ')
      })
    "
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'TextReuseClusterLabel' })

const props = defineProps<{
  item: Record<string, any>
}>()

// raw data only, the template resolves the translations
const summary = computed(() => {
  const item = props.item
  let dates: { value: Date | number; format?: 'short' | 'month' }[]
  if (!item.maxDate || !item.minDate) {
    dates = []
  } else if (item.timeDifferenceDay === 0) {
    dates = [{ value: item.maxDate, format: 'short' }]
  } else if (item.timeDifferenceDay < 30) {
    // time difference in days
    dates = [
      { value: item.minDate, format: 'short' },
      { value: item.maxDate, format: 'short' }
    ]
  } else if (item.timeDifferenceDay < 365) {
    // time difference in months
    dates = [
      { value: item.minDate, format: 'month' },
      { value: item.maxDate, format: 'month' }
    ]
  } else {
    const minYear: number = item.minDate.getFullYear()
    const maxYear: number = item.maxDate.getFullYear()
    dates = minYear === maxYear ? [{ value: minYear }] : [{ value: minYear }, { value: maxYear }]
  }
  return {
    shortId: item.shortId,
    textSampleExcerpt: item.textSampleExcerpt,
    clusterSize: item.clusterSize,
    lexicalOverlap:
      item.lexicalOverlap != null ? Math.round(item.lexicalOverlap * 100) / 100 : null,
    timeDifferenceDay: item.timeDifferenceDay,
    dates
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "numbers": {
      "days": "the same day|over <span class='number'>{n}</span> day|over <span class='number'>{n}</span> days"
    },
    "textReuseClusterSummary": "Cluster <b>{shortId}</b> - {size}.<br/><div>{lexicalOverlap} {timespan} ({dates}).</div><blockquote class='my-1 ml-0 border-left pl-2'>{textSampleExcerpt}</blockquote>"
  }
}
</i18n>
