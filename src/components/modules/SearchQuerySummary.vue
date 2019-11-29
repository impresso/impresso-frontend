<template lang="html">
  <p>
    <span v-if="reduced" v-html="$t('reducedSummary', reducedSummaryProps)"/>
    <span v-else v-html="$t('extendedSummary', summaryProps)"/>
  </p>
</template>

<script>
import Helpers from '../../plugins/Helpers';

export default {
  props: {
    reduced: Boolean,
    searchQuery: Object,
    groupBy: {
      type: String,
      default: 'contents',
    },
  },
  data: () => ({
    isOnFront: false,
    hasDaterange: false,
  }),
  computed: {
    reducedSummaryProps() {
      const filtersIndex = Helpers.groupBy(this.searchQuery.filters, 'type');
      const translationTable = {
        groupBy: this.$t(`groupBy.${this.groupBy}`),
      };

      // add translation if isFront is enabled
      if (!filtersIndex.isFront) {
        this.isOnFront = true;
        translationTable.isFront = this.$t('isFront');
      }

      ['topic', 'newspaper', 'string'].forEach((type) => {
        if (filtersIndex[type]) {
          translationTable[type] = this.getTranslationWithItems({
            filters: filtersIndex[type],
            type,
          });
        }
      });
      return translationTable;
    },
    summaryProps() {
      return '';
    },
  },
  methods: {
    // filterMapper = (filter) => {
    //   if (reduced) {
    //
    //   }
    //   let results = [];
    //   if (filter.items) {
    //     results = d.items.map(item => `<strong>"${item.name}"</strong>`);
    //   } else {
    //     results = d.q.map(item => `<strong>"${item}"</strong>`);
    //   }
    //   return results.join(`<span class="operator">${this.$t('op.or')}</span>`);
    // },
    getTranslationWithItems({ filters, type }) {
      console.info(filters);
      const results = [];
      const sections = {};

      filters.forEach((d) => {
        if (!sections[d.context]) {
          sections[d.context] = [];
        }
        sections[d.context].push(d);
      });

      ['include', 'exclude'].forEach((context) => {
        if (sections[context]) {
          if (this.reduced) {
            results.push(this.$tc(
              `${context}.${type}.reduced`,
              // number of items in total, as it is reduced
              sections[context].reduce((sum, d) => sum + d.items.length, 0),
            ));
          } else {
            const parts = [];
            results.push(parts.join(' '));
          }
        }
      });
      return results.join('; ');
    },
    // getSections(type) {
    //   // regroup searchQuery filters based on include / exclude
    //   const sections = {
    //     include: [],
    //     exclude: [],
    //     sequence: ['include', 'exclude'],
    //   };
    //
    //   this.searchQuery.filter(d => d.type === type).forEach((d) => {
    //     sections[d.context].push(d);
    //   });
    //
    //   return sections;
    // },
  },
};
</script>

<style lang="css" scoped>
</style>
<i18n>
  {
    "en": {
      "reducedSummary": "{groupBy} {terms} {type} {topic} {isFront} {newspapers} {countries} {ranges}",
      "extendedSummary": "{type} {front} {newspapers} {countries} {ranges} {collections} {terms} {title} {languages} {topics} {people} {locations}",
      "isFront": "appearing on the <em>front page</em>",
      "include": {
        "topic": {
          "reduced": "no topic | with <span class='number'>1</span> topic | with <span class='number'>{n}</span> topics",
          "extended": "with topic | with topics"
        }
      },
      "exclude": {
        "topic": {
          "reduced": "without <span class='number'>1</span> topic | without <span class='number'>{n}</span> topics",
          "extended": "with topic | with topics"
        }
      }
    }
  }
</i18n>
