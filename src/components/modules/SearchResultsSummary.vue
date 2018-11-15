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
        return this.$t('message', {
          count: this.totalRows,
          terms: this.getStrings(),
          ranges: this.getDateranges(),
        });
      },
    },
  },
  methods: {
    getSections(type) {
      // regroup querycomponents based on include / exclude
      const sections = {
        include: [],
        exclude: [],
        sequence: ['include', 'exclude'],
      };

      this.queryComponents.filter(d => d.type === type).forEach((d) => {
        sections[d.context].push(d);
      });

      return sections;
    },

    getFormattedSection(type, mapper) {
      const sections = this.getSections(type);
      const results = [];

      sections.sequence.forEach((d) => {
        if (sections[d].length) {
          results.push(`${this.$t(d)} ${sections[d].map(mapper).join(' <span class="operator">and</span> ')}`);
        }
      });

      return results.join('; ');
    },

    getDateranges() {
      const sections = this.getSections('daterange');
      const mapper = d => this.$t('daterange', {
        start: this.$d(d.daterange.start, 'short'),
        end: this.$d(d.daterange.end, 'short'),
      });
      const results = [];

      sections.sequence.forEach((d) => {
        if (sections[d].length) {
          results.push(`${sections[d].map(mapper).join(' <span class="operator">and</span> ')}`);
        }
      });

      return results.join('; ');
    },

    getStrings() {
      // later, this mapper will take into account
      // the property `precision`
      const mapper = d => `<strong>"${d.query}"</strong>`;
      return this.getFormattedSection('string', mapper);
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
    "include": "including",
    "exclude": "excluding",
    "message": "Found <strong class='number'>{count}</strong> articles {terms} {ranges}",
    "daterange": "from <strong class='date'>{start}</strong> to <strong class='date'>{end}</strong>"
  },
  "fr": {
  },
  "it": {
  },
  "nl": {
    "summary": "SAMENVATTING",
    "include": "inclusief",
    "exclude": "exclusief",
    "message": "<strong class='number'>{count}</strong> artikelen gevonden {terms} {ranges}"
  }
}
</i18n>
