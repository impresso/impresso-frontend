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
      // regroup querycomponents based on include / exclude
      const strings = {
        include: [],
        exclude: [],
      };
      const terms = [];

      this.queryComponents.filter(d => d.type === 'string').forEach((d) => {
        strings[d.context].push(d);
      });

      const m = d => `<strong>"${d.query}"</strong>`;

      // maintain the order of include/exclude
      ['include', 'exclude'].forEach((d) => {
        if (strings[d].length) {
          terms.push(`${this.$t(d)} ${strings[d].map(m).join(' <span class="operator">and</span> ')}`);
        }
      });

      return terms.join('; ');
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
    "include": "include",
    "exclude": "exclude",
    "message": "Found <strong>{count}</strong> articles {terms}"
  },
  "fr": {
  },
  "it": {
  },
  "nl": {
    "summary": "SAMENVATTING",
    "include": "inclusief",
    "exclude": "exclusief",
    "message": "<strong>{count}</strong> artikelen gevonden {terms}"
  }
}
</i18n>
