<template>
  <div v-if="!detailed" class="ItemLabel d-inline">
    <template v-if="itemType === 'collection'">
      <b>{{ item.name }}</b
      >{{ ' ' }}
      <span class="date small">{{ $t('created', { date: $d(item.creationDate, 'short') }) }}</span>
    </template>
    <template v-else-if="itemType === 'topic'">
      <span class="small-caps">{{ item.language }}</span> {{ item.htmlExcerpt ?? item.label }}
    </template>
    <span v-else-if="['type', 'country', 'language', 'copyright', 'dataDomain'].includes(itemType)">
      {{ $t(`buckets.${itemType}.${item.id}`) }}
    </span>
    <span v-else v-html="computedLabel"></span>
  </div>
  <div v-else class="ItemLabel">
    <div v-if="type === 'topic'">
      <div><label className="small-caps">top words in topic</label></div>
      <div class="d-inline-block" v-if="item.label">{{ item.label }}</div>
      <div class="d-inline-block word" v-for="(word, idx) in topicItem.words" :key="idx">
        <span>{{ word.w }}</span>
        <span v-if="idx < topicItem.words.length - 1">&nbsp;&middot;&nbsp;</span>
      </div>
      <span class="small-caps"
        >&nbsp;({{ $t(`buckets.language.${item.language}`).toLowerCase() }})</span
      >
    </div>
  </div>
</template>

<script lang="ts">
import { FacetType } from '@/models/Facet'
import { Topic } from '@/models/generated/canonical'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'ItemLabel',
  props: {
    item: {
      type: Object,
      required: true
    },
    label: {
      type: String
    },
    type: {
      type: String as PropType<FacetType | string>,
      required: true
    },
    detailed: {
      type: Boolean
    },
    hideuser: {
      type: Boolean
    }
  },
  computed: {
    itemType() {
      return String(this.item.type ?? this.type)
    },
    computedLabel() {
      let t = ''
      if (this.type === 'textReuseCluster') {
        t = this.getTextReuseClusterSummary(this.item)
      } else if (this.type === 'textReusePassage') {
        t = this.getTextReusePassageSummary(this.item)
      } else if (this.type === 'year') {
        t = this.item ? this.item.y : this.item.val
      } else if (
        [
          'imageVisualContent',
          'imageTechnique',
          'imageCommunicationGoal',
          'imageContentType'
        ].includes(this.type)
      ) {
        t = this.item.label ?? this.item.id
      } else if (typeof this.item.name === 'string' && this.item.name.length) {
        t = this.item.name
      } else {
        t = this.item.id
      }
      return t != '' ? t : (this.label ?? '')
    },
    topicItem() {
      return this.item as Topic
    }
  },
  methods: {
    getTextReuseClusterSummary(item) {
      if (!item.clusterSize) {
        return item.id
      }
      const clusterSizeLabel =
        item.clusterSize != null
          ? this.$t('numbers.clusterSize', {
              n: this.$n(item.clusterSize)
            }, item.clusterSize)
          : 'size'
      const lexicalOverlapLabel =
        item.lexicalOverlap != null
          ? this.$t('numbers.lexicalOverlap', {
              n: this.$n(Math.round(item.lexicalOverlap * 100) / 100)
            }, item.lexicalOverlap)
          : ''
      let dates = []
      if (!item.maxDate || !item.minDate) {
        dates = []
      } else if (item.timeDifferenceDay === 0) {
        dates = [this.$d(item.maxDate, 'short')]
      } else if (item.timeDifferenceDay < 30) {
        // show time difference in days
        dates = [this.$d(item.minDate, 'short'), this.$d(item.maxDate, 'short')]
      } else if (item.timeDifferenceDay < 365) {
        //   // show time difference in months
        dates = [this.$d(item.minDate, 'month'), this.$d(item.maxDate, 'month')]
      } else {
        const minYear = item.minDate.getFullYear()
        const maxYear = item.maxDate.getFullYear()
        if (minYear === maxYear) {
          dates = [minYear]
        } else {
          dates = [minYear, maxYear]
        }
      }
      return this.$t('textReuseClusterSummary', {
        shortId: item.shortId,
        textSampleExcerpt: item.textSampleExcerpt,
        size: clusterSizeLabel,
        lexicalOverlap: lexicalOverlapLabel,
        timespan: this.$t('numbers.days', {
          n: this.$n(item.timeDifferenceDay)
        }, item.timeDifferenceDay),
        dates: dates.join(' - ')
      })
    },
    getTextReusePassageSummary(item) {
      const passageDate = item.date instanceof Date ? item.date : new Date(item.date)
      // generate excerpt with ellipsis at the end if needed
      const excerpt = item.content.length > 50 ? `${item.content.substring(0, 50)}…` : item.content
      return [
        `<span class='small-caps'>${this.$d(passageDate, 'long').toLowerCase()}</span>`,
        `"${excerpt}"`
      ].join(' ')
    }
  }
})
</script>

<style lang="css"></style>
<i18n lang="json">
{
  "en": {
    "created": "created on {date}",
    "numbers": {
      "days": "the same day|over <span class='number'>{n}</span> day|over <span class='number'>{n}</span> days"
    },
    "textReuseClusterSummary": "Cluster <b>{shortId}</b> - {size}.<br/><div>{lexicalOverlap} {timespan} ({dates}).</div><blockquote class='my-1 ml-0 border-left pl-2'>{textSampleExcerpt}</blockquote>"
  }
}
</i18n>
