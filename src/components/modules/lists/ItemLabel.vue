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
}
</script>

<style lang="css"></style>
