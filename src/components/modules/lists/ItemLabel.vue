<template lang="html">
  <div v-if="!detailed" class="d-inline" v-html="label" />
  <div v-else>
    <div v-if="type === 'newspaper'">
      total pages: {{ $n(item.countArticles) }} <br />
      total issues: {{ $n(item.countIssues) }} <br />
      total extracted articles: {{ $n(item.countArticles) }};<br />
      first issue: <span v-if="item.firstIssue">{{ $d(item.firstIssue.date, 'short') }}</span>
      <br />
      last issue: <span v-if="item.lastIssue">{{ $d(item.lastIssue.date, 'short') }}</span>
    </div>
    <div v-if="type === 'topic'">
      <div class="d-inline-block word" v-for="(word, idx) in item.words" :key="idx">
        <span :style="{ opacity: word.l }">{{ word.w }}</span>
        <span v-if="idx < item.words.length - 1">&middot;&nbsp;</span>
      </div>
      <span class="small-caps">({{ $t(`buckets.language.${item.language}`) }})</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    detailed: {
      type: Boolean,
    },
    hideuser: {
      type: Boolean,
    },
  },
  computed: {
    label() {
      let t = ''
      if (this.type === 'topic') {
        t = `<span class="small-caps">${this.item.language}</span> ${this.item.htmlExcerpt}`
      } else if (this.type === 'textReuseCluster') {
        t = this.getTextReuseClusterSummary(this.item)
      } else if (this.type === 'collection') {
        if (this.item.name) {
          const usernameValue = this.item.creator ? this.item.creator.username : 'unknown'
          const username = this.hideuser ? '' : `@${usernameValue}<br/>`
          t = [
            `<b>${this.item.name}</b><br/>`,
            username,
            '<span class="small-caps">',
            this.$t('dates.lastModifiedDate'),
            this.$d(this.item.lastModifiedDate, 'short'),
            '</span>',
          ].join(' ')
        } else {
          t = this.item.uid
        }
      } else if (this.type === 'year') {
        t = this.item ? this.item.y : this.val
      } else if (typeof this.item.name === 'string' && this.item.name.length) {
        t = this.item.name
      } else {
        t = this.item.uid ?? this.item.id
      }
      return t
    },
  },
  methods: {
    getTextReuseClusterSummary(item) {
      const clusterSizeLabel = this.$tc('numbers.clusterSize', item.clusterSize, {
        n: this.$n(item.clusterSize),
      })
      const lexicalOverlapLabel = this.$tc('numbers.lexicalOverlap', item.lexicalOverlap, {
        n: this.$n(Math.round(item.lexicalOverlap * 100) / 100),
      })
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
        clusterSize: clusterSizeLabel,
        lexicalOverlap: lexicalOverlapLabel,
        timespan: this.$tc('numbers.days', item.timeDifferenceDay, {
          n: item.timeDifferenceDay,
        }),
        dates: dates.join(' - '),
      })
    },
  },
}
</script>

<style lang="css"></style>
<i18n>
{
  "en": {
    "numbers": {
      "days": "the same day|over <span class='number'>{n}</span> day|over <span class='number'>{n}</span> days"
    },
    "textReuseClusterSummary": "<b>{shortId}</b><br/><div>{clusterSize} with {lexicalOverlap} {timespan} ({dates}).</div><blockquote class='my-1 ml-0 border-left pl-2'>{textSampleExcerpt}</blockquote>"
  }
}
</i18n>
