<template lang="html">
  <section class="search-results-summary textbox-fancy">
    <span class="label">{{$t("summary")}}</span>
    <div class="text-serif" v-html="getMessage"></div>
  </section>
</template>

<script>
export default {
  props: ['queryComponents', 'totalRows'],
  computed: {
    getMessage: {
      get() {
        return this.$t('message', { count: this.totalRows, terms: this.getTerms() });
      },
    },
  },
  methods: {
    getTerms() {
      return this.queryComponents.filter(d => d.type === 'string').map((d) => {
        if (d.context === 'exclude') {
          return `${this.$t('excluding')} <strong>${d.query}</strong>`;
        }
        return `${this.$t('including')} <strong>${d.query}</strong>`;
      }).join(', ');
    },
  },
};
</script>

<style scoped lang="less">
</style>

<i18n>
{
  "en": {
    "summary": "summary",
    "including": "including",
    "excluding": "excluding",
    "message": "Found <strong>{count}</strong> articles {terms}"
  },
  "fr": {
  },
  "it": {
  },
  "nl": {
    "summary": "SAMENVATTING",
    "including": "inclusief",
    "excluding": "exclusief",
    "message": "<strong>{count}</strong> artikelen gevonden {terms}"
  }
}
</i18n>
