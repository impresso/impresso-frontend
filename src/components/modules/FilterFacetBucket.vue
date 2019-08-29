<template lang="html">
  <div class="bucket">
    <b-form-checkbox v-model="isChecked">
      <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
      <span v-else>{{ item }}</span>
      <span v-if="bucket.count > -1">({{ $t('numbers.results', { results: $n(bucket.count) }) }})</span>
      <item-selector :uid="bucket.val" :item="bucket.item" :type="type"/>
      <span v-if="type === 'collection'" class="">
        <collection-item :item="bucket" />
  <!-- {{collections}} {{bucket.val}} -->
      </span>
    </b-form-checkbox>
  </div>
</template>

<script>
import ItemSelector from './ItemSelector';
import ItemLabel from './lists/ItemLabel';
import CollectionItem from './lists/CollectionItem';

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
      default: true,
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
  components: {
    ItemSelector,
    ItemLabel,
    CollectionItem,
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
.bucket label{
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
