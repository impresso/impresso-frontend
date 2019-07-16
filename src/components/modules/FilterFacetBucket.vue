<template lang="html">
  <div class="bucket">
    <b-form-checkbox v-model="isChecked">
      <span v-html="title"></span>
      <span>({{ $t('numbers.results', { results: $n(bucket.count) }) }})</span>
    </b-form-checkbox>
  </div>
</template>

<script>
export default {
  data: () => ({
    operators: ['or', 'and', 'not'],
    operator: 'or',
    checked: false,
  }),
  model: {
    prop: 'bucket',
  },
  props: {
    bucket: {
      type: Object,
    },
    type: {
      type: String,
    },
    isLoadingResults: {
      type: Boolean,
      deafult: true,
    },
  },
  computed: {
    title: {
      get() {
        let t;
        switch (this.type) {
          case 'newspaper':
          case 'person':
          case 'location':
            t = this.bucket.item.name;
            break;
          case 'language':
          case 'country':
            t = this.$t(`buckets.${this.type}.${this.bucket.val}`);
            break;
          case 'collection':
            if (this.bucket.item.name) {
              t = [
                `<b>${this.bucket.item.name}</b>`,
                `@${this.bucket.item.creator.username}<br/>`,
                this.$t('dates.lastModifiedDate'),
                this.$d(this.bucket.item.lastModifiedDate, 'short'),
              ].join(' ');
            } else {
              t = this.bucket.item.uid;
            }
            break;
          case 'topic':
            t = this.bucket.item.htmlExcerpt;
            break;
          default:
            t = this.bucket.item.uid;
        }
        return t;
      },
    },
    isChecked: {
      get() {
        return this.checked;
      },
      set(checked) {
        this.checked = checked;
        this.bucket.checked = checked;
        this.bucket.operator = this.operator;
        this.$emit('toggle-bucket', this.bucket);
      },
    },
    selectedOperator() {
      return this.$t(`operator.${this.operator}`);
    },
  },
  methods: {
    selectOperator(operator) {
      this.operator = operator;
    },
  },
  mounted() {
    this.checked = !!this.bucket.checked;
  },
};
</script>

<style lang="scss">
.bucket span{
  font-variant: normal;
}
</style>

<i18n>
{
  "en": {
    "dates": {
      "lastModifiedDate": "Last-Modified-Date"
    },
    "operator": {
      "or": "included (OR)",
      "not": "excluded",
      "and": "include (AND)"
    }
  }
}
</i18n>
