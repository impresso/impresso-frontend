<template>
  <div v-if="!detailed" class="ItemLabel d-inline" v-html="label" />
  <div v-else class="ItemLabel">
    <div v-if="type === 'newspaper'">
      <div><label className="small-caps">newspaper's metadata</label></div>
      <p v-html="newspaperDetailedLabel"></p>
    </div>
    <div v-if="type === 'topic'">
      <div><label className="small-caps">top words in topic</label></div>
      <div class="d-inline-block word" v-for="(word, idx) in item.words" :key="idx">
        <span :style="{ opacity: word.l }">{{ word.w }}</span>
        <span v-if="idx < item.words.length - 1">&nbsp;&middot;&nbsp;</span>
      </div>
      <span class="small-caps"
        >&nbsp;({{ $t(`buckets.language.${item.language}`).toLowerCase() }})</span
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemLabel',
  props: {
    item: {
      type: Object,
      required: true
    },
    type: {
      type: String,
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
    label() {
      let t = ''
      if (this.type === 'topic') {
        t = `<span class="small-caps">${this.item.language}</span> ${this.item.htmlExcerpt}`
      } else if (this.type === 'textReuseCluster') {
        t = this.getTextReuseClusterSummary(this.item)
      } else if (this.type === 'textReusePassage') {
        t = this.getTextReusePassageSummary(this.item)
      } else if (this.type === 'collection') {
        if (this.item.name) {
          const usernameValue = this.item.creator ? this.item.creator.username : 'unknown'
          const username = this.hideuser ? '' : `@${usernameValue}<br/>`
          t = [
            `<b>${this.item.name}</b><br/>`,
            username,
            '<span class="small-caps">',
            this.$t('dates.lastModifiedDate'),
            this.item.lastModifiedDate ? this.$d(this.item.lastModifiedDate, 'short') : '(unknown)',
            '</span><br/>',
            this.item.countItems
              ? this.$tc('numbers.articles', this.item.countItems, {
                  n: this.$n(this.item.countItems)
                })
              : '(empty)'
          ].join(' ')
        } else {
          t = this.item.uid
        }
      } else if (this.type === 'year') {
        t = this.item ? this.item.y : this.val
      } else if (['type', 'country', 'language', 'partner'].includes(this.type)) {
        t = this.$t(`buckets.${this.type}.${this.item.uid}`)
        if (t.startsWith('buckets.')) {
          t = `"${this.item.uid}"`
        }
      } else if (typeof this.item.name === 'string' && this.item.name.length) {
        t = this.item.name
      } else {
        t = this.item.uid ?? this.item.id
      }
      return t
    },
    newspaperDetailedLabel() {
      const firstIssueDate =
        this.item?.firstIssue?.date instanceof Date
          ? this.$d(this.item?.firstIssue?.date ?? 0, 'short')
          : this.$d(new Date(this.item?.firstIssue?.date ?? 0), 'short')
      const lastIssueDate =
        this.item?.lastIssue?.date instanceof Date
          ? this.$d(this.item?.lastIssue?.date ?? 0, 'short')
          : this.$d(new Date(this.item?.lastIssue?.date ?? 0), 'short')
      return [
        `<span class="number"> ${this.$n(this.item.countArticles)}</span> articles,`,
        `<span class="number">${this.$n(this.item.countPages)}</span> pages,`,
        `<span class="number">${this.$n(this.item.countIssues)}</span> issues. <br/>`,
        `Published from: ${firstIssueDate} to ${lastIssueDate}.`
      ].join(' ')
    }
  },
  methods: {
    getTextReuseClusterSummary(item) {
      const clusterSizeLabel =
        item.clusterSize != null
          ? this.$tc('numbers.clusterSize', item.clusterSize, {
              n: this.$n(item.clusterSize)
            })
          : 'size'
      const lexicalOverlapLabel =
        item.lexicalOverlap != null
          ? this.$tc('numbers.lexicalOverlap', item.lexicalOverlap, {
              n: this.$n(Math.round(item.lexicalOverlap * 100) / 100)
            })
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
        timespan: this.$tc('numbers.days', item.timeDifferenceDay, {
          n: item.timeDifferenceDay
        }),
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
}
</script>

<style lang="css"></style>
<i18n lang="json">
{
  "en": {
    "numbers": {
      "days": "the same day|over <span class='number'>{n}</span> day|over <span class='number'>{n}</span> days"
    },
    "textReuseClusterSummary": "cluster <b>{shortId}</b> ({size})<br/><div>{lexicalOverlap} {timespan} ({dates}).</div><blockquote class='my-1 ml-0 border-left pl-2'>{textSampleExcerpt}</blockquote>"
  }
}
</i18n>
