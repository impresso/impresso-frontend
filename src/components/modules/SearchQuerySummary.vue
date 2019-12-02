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
      const translationTable = {};

      // add translation if isFront is enabled
      if (filtersIndex.isFront) {
        this.isOnFront = true;
        translationTable.isFront = this.$t('isFront');
      }

      ['topic', 'newspaper', 'person', 'location', 'language', 'country'].forEach((type) => {
        if (filtersIndex[type]) {
          translationTable[type] = this.getTranslationWithItems({
            filters: filtersIndex[type],
            type,
          });
        }
      });

      ['string', 'title'].forEach((type) => {
        if (filtersIndex[type]) {
          translationTable[type] = this.getTranslation({
            filters: filtersIndex[type],
            type,
          });
        }
      });

      if (!Object.keys(translationTable).length) {
        return {};
      }
      // add group by
      translationTable.groupBy = this.$t(`groupBy.${this.groupBy}`);
      return translationTable;
    },
    summaryProps() {
      return '';
    },
  },
  methods: {
    getLabel({ item, type }) {
      let t = '';
      switch (type) {
        case 'location':
        case 'person':
        case 'newspaper':
        case 'collection':
          t = item.name;
          break;
        case 'title':
        case 'string':
          t = `<span class="highlight precision-${item.precision}">${item.q}</span>${item.distance || ''}`;
          break;
        case 'topic':
          t = `<span class="small-caps">${item.language}</span> ${item.htmlExcerpt}`;
          break;
        case 'year':
          t = item.y;
          break;
        default:
          t = this.$t(`buckets.${type}.${item.uid}`);
          break;
      }
      if (!t && item.uid) {
        t = item.uid;
      }
      return t;
    },
    getFilterAsLabel(filter) {
      if (filter.items) {
        return '';
      } else if (filter.type === 'string') {
        return this.getLabel({
          item: filter,
          type: filter.type,
        });
      }
      console.warn('filter not valid:', filter);
      return '';
    },
    getContextSections(filters) {
      return filters.reduce((sections, d) => {
        if (!sections[d.context]) {
          sections[d.context] = [];
        }
        sections[d.context].push(d);
        return sections;
      }, {});
    },
    getTranslation({ filters, type }) {
      const sections = this.getContextSections(filters);
      return ['include', 'exclude'].reduce((results, context) => {
        if (sections[context]) {
          const mapped = sections[context].map(filter => this.getFilterAsLabel(filter));
          const last = mapped.pop();
          const terms = [this.$t(`${context}.${type}`)];
          if (mapped.length) {
            terms.push([mapped.join(', '), last].join(' <span class="operator">AND</span> '));
          } else {
            terms.push(last);
          }
          results.push(terms.join(' '));
        }
        return results;
      }, []).join('; ');
    },
    getTranslationWithItems({ filters, type }) {
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
  },
};
</script>

<style lang="css" scoped>
</style>
<i18n>
  {
    "en": {
      "reducedSummary": "{groupBy} {string} {type} {topic} {isFront} {newspaper} {person} {location} {countries} {ranges}",
      "extendedSummary": "{type} {front} {newspapers} {countries} {ranges} {collections} {terms} {title} {languages} {topics} {people} {locations}",
      "isFront": "appearing on the <em>front page</em>",
      "include": {
        "string": "containing",
        "topic": {
          "reduced": "no topic | with <span class='number'>1</span> topic | with <span class='number'>{n}</span> topics",
          "extended": "with topic | with topics"
        },
        "person": {
          "reduced": "mentioning <span class='number'>1</span> person | mentioning <span class='number'>{n}</span> persons",
          "extended": "mentioning"
        },
        "location": {
          "reduced": "mentioning <span class='number'>1</span> location | mentioning <span class='number'>{n}</span> locations",
          "extended": "mentioning"
        }
      },
      "exclude": {
        "string": "not containing",
        "person": {
          "reduced": "not mentioning <span class='number'>1</span> person|<span class='number'>{n}</span> persons",
          "extended": "not mentioning"
        },
        "location": {
          "reduced": "not mentioning",
          "extended": "not mentioning"
        },
        "topic": {
          "reduced": "without <span class='number'>1</span> topic | without <span class='number'>{n}</span> topics",
          "extended": "with topic | with topics"
        }
      }
    }
  }
</i18n>
