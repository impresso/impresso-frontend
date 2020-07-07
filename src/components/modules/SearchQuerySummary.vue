<template lang="html">
  <p class='search-query-summary'>
    <span v-html="reducedSummary"/>
    <!-- <span v-else v-html="$t('extendedSummary', summaryProps)"/> -->
  </p>
</template>

<script>
import Helpers from '../../plugins/Helpers';
import { namesService } from '../../services'

export default {
  props: {
    reduced: Boolean,
    searchQuery: Object,
    enumerables: {
      type: Array,
      default: () => ['type', 'collection', 'topic', 'person', 'location', 'language', 'country', 'year', 'accessRight'],
    },
  },
  data: () => ({
    newspaperLabels: undefined
  }),
  computed: {
    reducedSummary() {
      if (this.newspaperLabels == null) return '';
      if (!this.searchQuery) {
        console.error('No search query defined');
        return '';
      }
      const filtersIndex = Helpers.groupBy(this.searchQuery.filters, 'type');
      const enumerables = [];
      const translationTable = {};

      let isOnFront = false;
      let hasDaterange = false;

      // add translation if isFront is enabled
      if (filtersIndex.isFront) {
        isOnFront = true;
        translationTable.isFront = this.$t('isFront');
      }

      if (filtersIndex.daterange) {
        hasDaterange = true;
        translationTable.daterange = this.$t('isFront');
      }

      // add specific translation for newspapers
      if (filtersIndex.newspaper) {
        translationTable.newspaper = this.getTranslation({
          filters: filtersIndex.newspaper,
          type: 'newspaper',
          prefix: isOnFront || hasDaterange ? 'pubof.' : 'pub.',
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
      if (!enumerables.length && !Object.keys(translationTable).length) {
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
  watch: {
    searchQuery: {
      async handler() {
        // NOTE: This is an ugly workaround for cases when filters do not have labels.
        const newspaperLabels = {}
        for (const filter of this.searchQuery.filters.filter(({ type }) => type === 'newspaper')) {
          newspaperLabels[filter.q] = await namesService.getNewspaperLabel(filter.q)
        }
        this.newspaperLabels = newspaperLabels
      },
      immediate: true
    }
  },
  methods: {
    isEnumerable(type) {
      return this.enumerables.includes(type);
    },
    getLabel({ item, type, filter }) {
      let t = '';
      const [start, end] = [item.start, item.end].map(v => new Date(v))

      switch (type) {
      case 'daterange':
        t = `from <span class="date">${this.$d(start, 'compactUtc')}</span> to <span class="date">${this.$d(end, 'compactUtc')}</span>`;
        break;
      case 'location':
      case 'person':
      case 'collection':
        t = item.name;
        break;
      case 'newspaper':
        if (item.name) {
          t = item.name
        } else {
          t = (this.newspaperLabels || {})[filter.q] || filter.q
        }
        break;
      case 'title':
      case 'string':
        t = `<span class="highlight precision-${item.precision}">${item.uid || item.q}</span>${item.distance || ''}`;
        break;
      case 'topic':
        if (item.htmlExcerpt) {
          t = item.htmlExcerpt;
        } else if(item.excerpt.length) {
          t = item.excerpt.map(d => d.w).join(' · ');
        } else {
          t = item.uid;
        }
        break;
      case 'year':
        t = filter.q.join(", ");
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
        const { op = 'OR' } = filter
        const operator = this.$t(`op.${op.toLowerCase()}`);
        return filter.items.map(item => [
          `<span class="item ${filter.type}">`,
          this.getLabel({
            item,
            type: filter.type,
            filter
          }),
          '</span>',
        ].join('')).join(` <span class="operator">${operator}</span> `);
      } else if (filter.type === 'string') {
        return this.getLabel({
          item: filter,
          type: filter.type,
          filter
        });
      }
      console.warn('filter not valid:', filter);
      return '';
    },
    getContextSections(filters) {
      return filters.reduce((sections, d) => {
        const { context = 'include' } = d
        if (!sections[context]) {
          sections[context] = [];
        }
        sections[context].push(d);
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
  span.item.person, span.item.topic, span.item.location, span.item.daterange > span.date {
    font-family: "questa-sans", sans-serif;
    font-variant: small-caps;
    text-transform: lowercase;
  }
  span.item.collection {
    font-family: "questa-sans", sans-serif;
    color: #049dae;
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
  .precision-fuzzy::after {
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
        "accessRight": "available as",
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
        "year": "published on",
        "collection": "saved in",
        "language": "written in",
        "country": "printed in",
        "type": "- tagged as"
      },
      "exclude": {
        "accessRight": "not available as",
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
        "year": "not published on",
        "collection": "not saved in",
        "language": "not written in",
        "country": "not printed in",
        "type": "- not tagged as"
      }
    }
  }
</i18n>
