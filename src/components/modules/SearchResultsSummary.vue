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
    } = {}) {
      const sections = this.getSections(type);
      const results = [];

      sections.sequence.forEach((d) => {
        if (sections[d].length) {
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
      return results;
    },

    isFront() {
      this.isOnFront = this.queryComponents.find(d => d.type === 'isFront');
      return this.isOnFront ? this.$t('isFront') : '';
    },

    getNewspapers() {
      const mapper = d => `<strong>"${d.item.name}"</strong>`;
      return this.getFormattedSection({
        type: 'newspaper',
        mapper,
        keyFn: (d, t) => {
          if (this.isOnFront) {
            return [d, 'pubof', t];
          }
          return [d, 'pub', t];
        },
      }).join('; ');
    },

    getTopics() {
      const mapper = d => `<span class="item">"${d.item.getHtmlExcerpt()}"</span>`;
      return this.getFormattedSection({
        type: 'topic',
        mapper,
      }).join('; ');
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
      const mapper = d => `<span>"${d.query}"</span>`;
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
          newspapers: this.getNewspapers(),
          terms: this.getStrings(),
          ranges: this.getDateranges(),
          topics: this.getTopics(),
        });
        this.$emit('gotMessage', this.message);
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
      "string": "containing"
    },
    "exclude": {
      "topic": "without topic",
      "pub": {
        "newspaper": "not published in"
      },
      "pubof": {
        "newspaper": "not published in"
      }
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
