<template lang="html">
  <div class="bucket">
    <b-form-checkbox v-model="isChecked">
      <span v-if="type === 'topic'" v-html="bucket.item.htmlExcerpt"></span>
      <span v-if="type === 'newspaper'">{{ bucket.item.name }}</span>
      <span v-if="type === 'language'">{{ $t(`languages.${bucket.val}`) }}</span>
      <span v-if="type === 'collection'">
        <span v-if="bucket.item.name">
          <b>{{ bucket.item.name }}</b> @{{ bucket.item.creator.username }}<br/>
          {{ $t('dates.lastModifiedDate') }} {{ $d(bucket.item.lastModifiedDate, 'short') }}
        </span>
        <span v-else>{{ bucket.item.uid }}</span>
      </span>

      <span>({{ $t('numbers.results', { results: $n(bucket.count) }) }})</span>
    </b-form-checkbox>
    <!-- <b-dropdown v-if="isChecked" size="sm" variant="outline-primary">
      <template slot="button-content">{{ selectedOperator }}</template>
      <b-dropdown-item v-for="option in operators" :key="option"
          @click="selectOperator(option)">{{ $t(`operator.${option}`) }}
      </b-dropdown-item>
    </b-dropdown> -->
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
    "numbers": {
      "results": "Results"
    },
    "operator": {
      "or": "included (OR)",
      "not": "excluded",
      "and": "include (AND)"
    }
  }
}
</i18n>
