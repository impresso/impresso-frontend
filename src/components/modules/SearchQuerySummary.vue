<template>
  <p class="search-query-summary">
    <span v-html="reducedSummary" />
  </p>
</template>

<script>
import Helpers from '../../plugins/Helpers'
import { namesService } from '../../services'

function getStarAndEndDates(item) {
  return [item.start, item.end].map(v => new Date(v))
}

export default {
  props: {
    reduced: Boolean,
    searchQuery: Object,
    limitNumberOfFilterItems: {
      type: Number,
      default: -1
    },
    enumerables: {
      type: Array,
      default: () => [
        'type',
        'collection',
        'topic',
        'person',
        'location',
        'language',
        'country',
        'year',
        'accessRight'
      ]
    }
  },
  data: () => ({
    newspaperLabels: undefined
  }),
  computed: {
    reducedSummary() {
      if (this.newspaperLabels == null) return ''
      if (!this.searchQuery) {
        console.error('No search query defined')
        return ''
      }
      const filtersIndex = Helpers.groupBy(this.searchQuery.filters, 'type')
      const enumerables = []
      const translationTable = {}

      console.debug('[SearchQuerySummary] filtersIndex', filtersIndex)

      let isOnFront = false
      let hasDaterange = false

      // add translation if isFront is enabled
      if (filtersIndex.isFront) {
        isOnFront = true
        translationTable.isFront = this.$t('isFront')
      }

      if (filtersIndex.daterange) {
        hasDaterange = true
        translationTable.daterange = this.$t('isFront')
      }

      // add specific translation for newspapers
      if (filtersIndex.newspaper) {
        translationTable.newspaper = this.getTranslation({
          filters: filtersIndex.newspaper,
          type: 'newspaper',
          prefix: isOnFront || hasDaterange ? 'pubof.' : 'pub.'
        })
      }

      if (filtersIndex.textReuseCluster) {
        translationTable.textReuseCluster = this.getTranslation({
          filters: filtersIndex.textReuseCluster,
          type: 'textReuseCluster',
          prefix: isOnFront || hasDaterange ? 'pubof.' : 'pub.'
        })
      }

      ;[
        'textReuseClusterSize',
        'textReuseClusterLexicalOverlap',
        'textReuseClusterDayDelta'
      ].forEach(type => {
        if (filtersIndex[type]) {
          translationTable[type] = this.getRangeTranslation({
            filters: filtersIndex[type],
            type
          })
        }
      })
      // other translations
      ;['string', 'title', 'daterange'].concat(this.enumerables).forEach(type => {
        if (filtersIndex[type]) {
          if (this.isEnumerable(type)) {
            enumerables.push(
              this.getTranslation({
                filters: filtersIndex[type],
                type
              })
            )
          } else {
            translationTable[type] = this.getTranslation({
              filters: filtersIndex[type],
              type
            })
          }
        }
      })

      // Return is here because of "hidden" filters, such as hasTextContents
      if (!enumerables.length && !Object.keys(translationTable).length) {
        return ''
      }

      translationTable.enumerable = enumerables.join('; ')
      const summary = this.$t('reducedSummary', translationTable)
      this.$emit('updated', summary.split(/\s+/).join(' '))
      return summary
    },
    summaryProps() {
      return ''
    }
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
      return this.enumerables.includes(type)
    },
    getLabel({ item, type, filter }) {
      let t = ''
      switch (type) {
        case 'daterange':
          {
            const [start, end] = getStarAndEndDates(item)
            t = `from <span class="date">${this.$d(
              start,
              'compactUtc'
            )}</span> to <span class="date">${this.$d(end, 'compactUtc')}</span>`
          }
          break
        case 'location':
        case 'person':
        case 'collection':
          t = item.name
          break
        case 'newspaper':
          if (item.name) {
            t = item.name
          } else {
            t = (this.newspaperLabels || {})[filter.q] || filter.q
          }
          break
        case 'textReuseCluster':
          t = (item.id || item.uid || '').split('-').pop()
          t = `<span class="number">${t}</span>`
          break
        case 'title':
        case 'string':
          t = `<span class="highlight precision-${item.precision}">${
            item.uid || item.q
          }</span>${item.distance || ''}`
          break
        case 'topic':
          if (item.htmlExcerpt) {
            t = item.htmlExcerpt
          } else if (item.excerpt.length) {
            t = item.excerpt.map(d => d.w).join(' · ')
          } else {
            t = item.uid
          }
          break
        case 'year':
          // console.log('____', item, type, filter);
          t = Array.isArray(filter.q) ? filter.q.join(', ') : filter.q
          break
        default:
          t = this.$t(`buckets.${type}.${item.uid}`)
          break
      }
      if (!t && item.uid) {
        t = item.uid
      }
      return t
    },
    getFilterAsLabel(filter) {
      if (filter.items) {
        const { op = 'OR' } = filter
        const operator = this.$t(`op.${op.toLowerCase()}`)
        if (
          this.limitNumberOfFilterItems > 0 &&
          filter.items.length > this.limitNumberOfFilterItems
        ) {
          return (
            filter.items
              .slice(0, this.limitNumberOfFilterItems)
              .map(item =>
                [
                  `<span class="item ${filter.type}">`,
                  this.getLabel({
                    item,
                    type: filter.type,
                    filter
                  }),
                  '</span>'
                ].join('')
              )
              .join(` <span class="operator">${operator}</span> `) +
            ` [... ${
              filter.items.length - this.limitNumberOfFilterItems
            } additional options]</span>`
          )
        }
        return filter.items
          .map(item =>
            [
              `<span class="item ${filter.type}">`,
              this.getLabel({
                item,
                type: filter.type,
                filter
              }),
              '</span>'
            ].join('')
          )
          .join(` <span class="operator">${operator}</span> `)
      } else if (filter.type === 'string') {
        return this.getLabel({
          item: filter,
          type: filter.type,
          filter
        })
      }
      console.warn('filter not valid:', filter)
      return ''
    },
    getContextSections(filters) {
      return filters.reduce((sections, d) => {
        const { context = 'include' } = d
        if (!sections[context]) {
          sections[context] = []
        }
        sections[context].push(d)
        return sections
      }, {})
    },
    getRangeTranslation({ filters, type }) {
      const sections = this.getContextSections(filters)
      return Object.keys(sections)
        .reduce((acc, context) => {
          acc.push(
            this.$t(`${context}.${type}`, {
              min: sections[context][0].q[0],
              max: sections[context][0].q[1]
            })
          )
          return acc
        }, [])
        .join('; ')
    },
    getTranslation({ filters, type, prefix = '' }) {
      const sections = this.getContextSections(filters)
      return ['include', 'exclude']
        .reduce((results, context) => {
          if (sections[context]) {
            const mapped = sections[context].map(filter => this.getFilterAsLabel(filter))
            const last = mapped.pop()
            const terms = [this.$t(`${context}.${prefix}${type}`)]
            if (mapped.length) {
              terms.push([mapped.join(', '), last].join(' <span class="operator">AND</span> '))
            } else {
              terms.push(last)
            }
            results.push(terms.join(' '))
          }
          return results
        }, [])
        .join('; ')
    },
    getTranslationWithItems({ filters, type }) {
      const results = []
      const sections = {}

      filters.forEach(d => {
        if (!sections[d.context]) {
          sections[d.context] = []
        }
        sections[d.context].push(d)
      })
      ;['include', 'exclude'].forEach(context => {
        if (sections[context]) {
          if (this.reduced) {
            results.push(
              this.$tc(
                `${context}.${type}.reduced`,
                // number of items in total, as it is reduced
                sections[context].reduce((sum, d) => sum + d.items.length, 0)
              )
            )
          } else {
            const parts = []
            results.push(parts.join(' '))
          }
        }
      })
      return results.join('; ')
    }
  }
}
</script>
<style lang="scss">
.search-query-summary {
  span.item.person,
  span.item.topic,
  span.item.location,
  span.item.daterange > span.date {
    text-transform: uppercase;
    font-family: var(--bs-font-sans-serif);
    font-size: var(--impresso-font-size-smallcaps);
    font-variant: normal;
    letter-spacing: var(--impresso-letter-spacing-smallcaps);
    font-weight: var(--impresso-wght-smallcaps);
    font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
  }

  span.item.collection {
    font-family: var(--bs-font-sans-serif);
    color: #049dae;
  }

  span.item.newspaper,
  span.item.country {
    font-family: var(--bs-font-serif);
    font-weight: bold;
    font-weight: var(--impresso-wght-bold);
    font-variation-settings: 'wght' var(--impresso-wght-bold);
  }

  .precision-exact::before,
  .precision-exact::after {
    content: '"';
    font-weight: bold;
  }

  .precision-fuzzy::after {
    content: '~';
    font-weight: bold;
  }

  .precision-soft::before {
    content: '[';
    font-weight: bold;
  }

  .precision-soft::after {
    content: ']';
    font-weight: bold;
  }
}
</style>
<i18n lang="json">
{
  "en": {
    "reducedSummary": "{type} {string} {title} {isFront} {newspaper} {daterange} {year} {collection} {enumerable} {textReuseCluster} {textReuseClusterSize} {textReuseClusterLexicalOverlap} {textReuseClusterDayDelta} ",
    "isFront": "appearing on the <em>front page</em>",
    "include": {
      "accessRight": "available as",
      "topic": "with topic",
      "pub": {
        "newspaper": "published in",
        "textReuseCluster": "appearing in clusters"
      },
      "pubof": {
        "newspaper": "in",
        "textReuseCluster": "clustered in"
      },
      "newspaper": "published in",
      "person": "mentioning",
      "location": "mentioning",
      "string": "containing",
      "title": "where title includes",
      "daterange": "published",
      "year": "published in",
      "collection": "saved in",
      "language": "written in",
      "country": "printed in",
      "type": "- tagged as",
      "year": "in year",
      "textReuseCluster": "showing up in clusters",
      "textReuseClusterSize": "in clusters of size <span class='number'>{min}</span> to <span class='number'>{max}</span>",
      "textReuseClusterLexicalOverlap": "where lexical overlap spans from <span class='number'>{min}%</span> to <span class='number'>{max}%</span>",
      "textReuseClusterDayDelta": "where time spans <span class='number'>{min}</span> to <span class='number'>{max}</span> days"
    },
    "exclude": {
      "accessRight": "not available as",
      "topic": "without topic",
      "pub": {
        "newspaper": "not published in",
        "textReuseCluster": "not in clusters"
      },
      "pubof": {
        "newspaper": "not published in"
      },
      "newspaper": "not published in",
      "person": "not mentioning",
      "location": "not mentioning",
      "string": "not containing",
      "title": "where title does not include",
      "daterange": "not published",
      "year": "not published in",
      "collection": "not saved in",
      "language": "not written in",
      "country": "not printed in",
      "type": "- not tagged as",
      "year": "not in year",
      "textReuseCluster": "not in clusters",
      "textReuseClusterSize": "not in clusters of size <span class='number'>{min}</span> to <span class='number'>{max}</span>",
      "textReuseClusterLexicalOverlap": "where lexical overlap does not span from <span class='number'>{min}</span> to <span class='number'>{max}</span>",
      "textReuseClusterDayDelta": "where time does not span <span class='number'>{min}</span> to <span class='number'>{max}</span> days"
    }
  }
}
</i18n>
