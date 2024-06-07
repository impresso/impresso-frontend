<template lang="html">
  <section class="search-results-summary text-serif textbox-fancy border-tertiary">
    <span v-html="incipit" />
    <search-query-summary class="d-inline" :search-query='searchQuery' v-on:updated='onSummaryUpdated' />
  </section>
</template>

<script>
import SearchQuerySummary from './SearchQuerySummary.vue';

export default {
  props: {
    totalRows: Number,
    groupBy: String,
    searchQuery: Object,
  },
  computed: {
    incipit() {
      const n = this.$n(this.totalRows);
      return this.$tc('incipit', this.totalRows, {
        n,
        groupByLabel: this.$tc(`numbers.${this.groupBy}`, this.totalRows, { n }),
      });
    },
  },
  methods: {
    onSummaryUpdated(summary) {
      this.$emit('onSummary', summary);
    },
  },
  components: {
    SearchQuerySummary,
  },
};
</script>

<i18n lang="json">
{
  "en": {
    "incipit": "Sorry, {groupByLabel} found | {groupByLabel} found | {groupByLabel} found"
  },
  "fr":{
    "summary": "summary",
    "include": {
      "topic": "with topic",
      "pub": {
        "newspaper": "published in"
      },
      "pubof": {
        "newspaper": "of"
      },
      "person": "mentioning",
      "location": "mentioning",
      "string": "containing",
      "title": "where title includes",
      "daterange": "published",
      "collection": "saved in",
      "language": "written in",
      "country": "printed in",
      "type": "tagged as"
    },
    "exclude": {
      "topic": "without topic",
      "pub": {
        "newspaper": "not published in"
      },
      "pubof": {
        "newspaper": "not published in"
      },
      "person": "not mentioning",
      "location": "not mentioning",
      "daterange": "not published",
      "collection": "not yet saved in",
      "language": "not written in",
      "string": "not containing",
      "country": "not printed in",
      "type": "not tagged as"
    },
    "isFront": "appearing on the <em>front page</em>",
    "message": "Found <span class='number'>{count}</span> {groupByLabel} {type} {front} {newspapers} {countries} {ranges} {collections} {terms} {title} {languages} {topics} {people} {locations}",
    "daterange": "from <span class='date'>{start}</span> to <span class='date'>{end}</span>"
  },
  "fr": {
  },
  "it": {
  },
  "nl": {
    "summary": "SAMENVATTING",
    "include": "inclusief",
    "exclude": "exclusief",
    "message": "<span class='number'>{count}</span> artikelen gevonden {terms} {ranges}"
  }
}
</i18n>
