<template lang="html">
  <section class="search-results-summary textbox-fancy">
    <span class="label">{{$t("summary")}}</span>
    <div class="text-serif" v-html="message"></div>
  </section>
</template>

<script>
export default {
  data: () => ({
    isOnFront: false,
    message: '',
  }),
  props: ['queryComponents', 'totalRows'],
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

    getFormattedSection({
      type = 'string',
      mapper = d => d,
      keyFn = (d, t) => [d, t],
      onExist = null,
    } = {}) {
      const sections = this.getSections(type);
      const results = [];
      let itExists = false;

      sections.sequence.forEach((d) => {
        if (sections[d].length) {
          itExists = true;
          const mapped = sections[d].map(mapper);
          const key = keyFn(d, type).join('.');
          const last = mapped.pop();
          const terms = [this.$t(key)];
          if (mapped.length) {
            terms.push([mapped.join(', '), last].join(' <span class="operator">and</span> '));
          } else {
            terms.push(last);
          }
          results.push(terms.join(' '));
        }
      });

      if (itExists && onExist) {
        onExist();
      }
      return results;
    },

    isFront() {
      this.isOnFront = this.queryComponents.find(d => d.type === 'isFront');
      return this.isOnFront ? this.$t('isFront') : '';
    },

    getNewspapers() {
      // console.log('getNewspapers', this.queryComponents);
      const mapper = (d) => {
        let results = [];
        if (d.items) {
          results = d.items.map(item => `<strong>"${item.name}"</strong>`);
        } else {
          results = d.q.map(item => `<strong>"${item}"</strong>`);
        }
        return results.join(`<span class="operator">${this.$t('op.or')}</span>`);
      };

      return this.getFormattedSection({
        type: 'newspaper',
        mapper,
        keyFn: (d, t) => {
          if (this.isOnFront || this.hasDaterange) {
            return [d, 'pubof', t];
          }
          return [d, 'pub', t];
        },
      }).join('; ');
    },

    getTopics() {
      const mapper = d => d.items
        .map(item => `<span class="item">"${item.getHtmlExcerpt()}"</span>`)
        .join(`<span class="operator">&nbsp;${this.$t('op.or')}&nbsp;</span>`);

      return this.getFormattedSection({
        type: 'topic',
        mapper,
      }).join('; ');
    },

    getDateranges() {
      const mapper = d => d.items
          .map((item) => {
            const label = this.$t('filters.daterange.item', {
              start: this.$d(item.start, 'compact'),
              end: this.$d(item.end, 'compact'),
            });
            return `<span class="item">${label}</span>`;
          })
          .join(`<span class="operator">&nbsp;${this.$t('op.or')}&nbsp;</span>`);

      this.hasDaterange = false;
      return this.getFormattedSection({
        type: 'daterange',
        mapper,
        onExist: () => {
          this.hasDaterange = true;
        },
      }).join('; ');
    },

    getStrings() {
      // later, this mapper will take into account
      // the property `precision`
      const mapper = d => `<span>"${d.q}"</span>`;
      return this.getFormattedSection({
        type: 'string',
        mapper,
      }).join('; ');
    },
  },
  watch: {
    queryComponents: {
      immediate: true,
      handler() {
        this.message = this.$t('message', {
          count: this.$n(this.totalRows),
          front: this.isFront(),
          ranges: this.getDateranges(),
          newspapers: this.getNewspapers(),
          terms: this.getStrings(),
          topics: this.getTopics(),
        });
        this.$emit('onSummary', this.message);
      },
    },
  },
};
</script>

<style scoped lang="scss">
  span.item, span.date {
    font-family: "questa-sans", sans-serif;
    font-weight: bold;
  }
</style>

<i18n>
{
  "en": {
    "summary": "summary",
    "include": {
      "topic": "with topic",
      "pub": {
        "newspaper": "published in"
      },
      "pubof": {
        "newspaper": "of"
      },
      "string": "containing",
      "daterange": "published"
    },
    "exclude": {
      "topic": "without topic",
      "pub": {
        "newspaper": "not published in"
      },
      "pubof": {
        "newspaper": "not published in"
      },
      "daterange": "not published"
    },
    "isFront": "appearing on the <em>front page</em>",
    "message": "Found <span class='number'>{count}</span> articles {front} {newspapers} {ranges} {terms} {topics}",
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
