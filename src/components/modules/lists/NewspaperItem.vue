<template lang="html">
  <div class="newspaper-item">
    <router-link v-if="showLink"
      class="px-3 py-2 d-block"
      v-bind:class="{ active: active }"
      v-bind:to="{name: 'newspaper_metadata', params: {newspaper_uid: item.uid}}">
      <strong>{{ item.name}}</strong>
      <br>
      total pages: {{ $n(item.countArticles) }} <br>
      total issues: {{ $n(item.countIssues) }} <br>
      total extracted articles: {{ $n(item.countArticles) }};<br>
      first issue: <span v-if="item.firstIssue">{{ $d(item.firstIssue.date, 'short') }}</span> <br>
      last issue: <span v-if="item.lastIssue">{{ $d(item.lastIssue.date, 'short') }}</span>


    </router-link>
    <div v-else>
      <h2>{{ item.name}} ({{ item.startYear}} - {{ item.endYear}})</h2>
      <div class="small" v-html="stats"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
    },
    showLink: {
      type: Boolean,
    },
    item: {
      type: Object,
    },
  },
  computed: {
    stats() {
      if (this.item.countIssues > 0) {
        return [
          this.$tc('numbers.articles', this.item.countArticles, {
            n: this.$n(this.item.countArticles),
          }),
          this.$tc('numbers.pages', this.item.countPages, {
            n: this.$n(this.item.countPages),
          }),
          this.$tc('numbers.issues', this.item.countIssues, {
            n: this.$n(this.item.countIssues),
          }),
        ].join(', ');
      }
      return this.$t('unavailable');
    },
  },
};
</script>

<style lang="css">
.newspaper-item h2{
  font-size: inherit;
}
</style>
<i18n>
  {
    "en": {
      "unavailable": "(coming soon)"
    }
  }
</i18n>
