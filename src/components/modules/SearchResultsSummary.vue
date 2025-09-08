<template lang="html">
  <section
    class="SearchResultsSummary search-results-summary text-serif textbox-fancy border-tertiary"
    :class="{ loading: isLoading }"
  >
    <span v-html="incipit" />
    <search-query-summary
      class="d-inline"
      :search-query="searchQuery"
      v-on:updated="onSummaryUpdated"
    />
  </section>
</template>

<script>
import SearchQuerySummary from './SearchQuerySummary.vue'

export default {
  props: {
    totalRows: Number,
    groupBy: String,
    searchQuery: Object,
    isLoading: Boolean
  },
  computed: {
    incipit() {
      if (this.isLoading) {
        return this.$t(`loading.${this.groupBy}`)
      }
      const n = this.$n(this.totalRows)
      return this.$tc('incipit', this.totalRows, {
        n,
        groupByLabel: this.$tc(`numbers.${this.groupBy}`, this.totalRows, { n })
      })
    }
  },
  methods: {
    onSummaryUpdated(summary) {
      this.$emit('onSummary', summary)
    }
  },
  components: {
    SearchQuerySummary
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "incipit": "Sorry, {groupByLabel} found | {groupByLabel} found | {groupByLabel} found",
    "loading": { "articles": "... loading matching content items" }
  }
}
</i18n>

<style lang="css">
.SearchResultsSummary {
  transition: opacity 0.5s;
}
.SearchResultsSummary.loading {
  opacity: 0.5;
}
</style>
