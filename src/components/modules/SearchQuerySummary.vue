<template lang="html">
  <p class='search-query-summary'>
    <span v-html="reducedSummary"/>
    <!-- <span v-else v-html="$t('extendedSummary', summaryProps)"/> -->
  </p>
</template>

<script>
import Helpers from '../../plugins/Helpers';

export default {
  props: {
    reduced: Boolean,
    searchQuery: Object,
    enumerables: {
      type: Array,
      default: () => ['type', 'collection', 'topic', 'person', 'location', 'language', 'country'],
    },
  },
  data: () => ({
    isOnFront: false,
    hasDaterange: false,
  }),
  computed: {
    reducedSummary() {
      if (!this.searchQuery) {
        console.error('No search query defined');
        return '';
      }
      const filtersIndex = Helpers.groupBy(this.searchQuery.filters, 'type');
      const enumerables = [];
      const translationTable = {};

      // add translation if isFront is enabled
      if (filtersIndex.isFront) {
        this.isOnFront = true;
        translationTable.isFront = this.$t('isFront');
      }

      if (filtersIndex.daterange) {
        this.hasDaterange = true;
        translationTable.daterange = this.$t('isFront');
      }

      // add specific translation for newspapers
      if (filtersIndex.newspaper) {
        translationTable.newspaper = this.getTranslation({
          filters: filtersIndex.newspaper,
          type: 'newspaper',
          prefix: this.isOnFront || this.hasDaterange ? 'pubof.' : 'pub.',
        });
      }
      // other translations
      ['string', 'title', 'daterange'].concat(this.enumerables).forEach((type) => {
        if (filtersIndex[type]) {
          if (this.isEnumerable(type)) {
            enumerables.push(this.getTranslation({
              filters: filtersIndex[type],
              type,
            }));
          } else {
            translationTable[type] = this.getTranslation({
              filters: filtersIndex[type],
              type,
            });
          }
        }
      });

      // Return is here because of "hidden" filters, such as hasTextContents
      if (!Object.keys(translationTable).length) {
        return '';
      }

      translationTable.enumerable = enumerables.join('; ');

      const summary = this.$t('reducedSummary', translationTable);
      this.$emit('updated', summary.split(/\s+/).join(' '));
      return summary;
    },
    summaryProps() {
      return '';
    },
  },
  methods: {
    isEnumerable(type) {
      return this.enumerables.includes(type);
    },
    getLabel({ item, type }) {
      let t = '';
      switch (type) {
        case 'daterange':
          t = `from <span class="date">${this.$d(item.start, 'compact')}</span> to <span class="date">${this.$d(item.end, 'compact')}</span>`;
          break;
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
          t = `"${item.htmlExcerpt || ''}..."`;
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
        const operator = this.$t(`op.${filter.op.toLowerCase()}`);
        return filter.items.map(item => [
          `<span class="item ${filter.type}">`,
          this.getLabel({
            item,
            type: filter.type,
          }),
          '</span>',
        ].join('')).join(` <span class="operator">${operator}</span> `);
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
    getTranslation({ filters, type, prefix = '' }) {
      const sections = this.getContextSections(filters);
      return ['include', 'exclude'].reduce((results, context) => {
        if (sections[context]) {
          const mapped = sections[context].map(filter => this.getFilterAsLabel(filter));
          const last = mapped.pop();
          const terms = [this.$t(`${context}.${prefix}${type}`)];
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
<style lang="scss">
.search-query-summary{
  span.item.person, span.item.location, span.item.daterange > span.date {
    font-family: "questa-sans", sans-serif;
    font-variant: small-caps;
    text-transform: lowercase;
  }
  span.item.collection {
    font-family: "questa-sans", sans-serif;
    color: blue;
  }
  span.item.newspaper {
    color: black;
    font-weight: bold;
  }
  .precision-exact::before,
  .precision-exact::after{
    content: '"';
    font-weight: bold;
  }
  .precision-fuzzy::after,{
    content: '~';
    font-weight: bold;
  }
  .precision-soft::before{
    content: '[';
    font-weight: bold;
  }
  .precision-soft::after{
    content: ']';
    font-weight: bold;
  }
}
</style>
<i18n>
  {
    "en": {
      "reducedSummary": "{type} {string} {title} {isFront} {newspaper} {daterange} {collection} {enumerable}",
      "isFront": "appearing on the <em>front page</em>",
      "include": {
        "topic": "with topic",
        "pub": {
          "newspaper": "published in"
        },
        "pubof": {
          "newspaper": "of"
        },
        "newspaper": "published in",
        "person": "mentioning",
        "location": "mentioning",
        "string": "containing",
        "title": "where title includes",
        "daterange": "published",
        "collection": "saved in",
        "language": "written in",
        "country": "printed in",
        "type": "- tagged as"
      },
      "exclude": {
        "topic": "without topic",
        "pub": {
          "newspaper": "not published in"
        },
        "pubof": {
          "newspaper": "not published in"
        },
        "newspaper": "not published in",
        "person": "not mentioning",
        "location": "not mentioning",
        "string": "not containing",
        "title": "where title does not includes",
        "daterange": "not published",
        "collection": "not saved in",
        "language": "not written in",
        "country": "not printed in",
        "type": "- not tagged as"
      }
    }
  }
</i18n>
