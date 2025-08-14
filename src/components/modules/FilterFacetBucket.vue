<template>
  <div class="FilterFacetBucket d-flex text-small">
    <b-form-checkbox v-model="isChecked" data-testid="filter-facet-bucket-checkbox">
    </b-form-checkbox>

    <item-selector
      v-if="bucket.item"
      hide-icon
      :uid="bucket.val"
      :item="bucket.item"
      :type="type"
      :searchIndex="searchIndex"
    >
      <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
      <span class="FilterFacetBucket__label" v-else>{{ item }}</span>
      <span v-if="bucket.count > -1">
        (<span
          v-html="
            $tc(
              type === 'collection' ? 'numbers.articlesMatchingSearchFilters' : 'numbers.results',
              bucket.count,
              { n: $n(bucket.count) }
            )
          "
        />)
        <!-- {{ type }}-->
      </span>
    </item-selector>
  </div>
</template>

<script>
import ItemSelector from './ItemSelector.vue'
import ItemLabel from './lists/ItemLabel.vue'

export default {
  name: 'FilterFacetBucket',
  data: () => ({
    operators: ['or', 'and', 'not'],
    operator: 'or',
    checked: false
  }),
  props: {
    bucket: {
      type: Object
    },
    type: {
      type: String
    },
    isLoadingResults: {
      type: Boolean,
      default: true
    },
    searchIndex: {
      type: String,
      default: 'search'
    }
  },
  computed: {
    isChecked: {
      get() {
        return this.checked
      },
      set(checked) {
        this.checked = checked
        this.bucket.checked = checked // eslint-disable-line
        this.bucket.operator = this.operator // eslint-disable-line
        this.$emit('toggle-bucket', this.bucket)
      }
    },
    selectedOperator() {
      return this.$t(`operator.${this.operator}`)
    }
  },
  methods: {
    selectOperator(operator) {
      this.operator = operator
    }
  },
  components: {
    ItemSelector,
    ItemLabel
  },
  mounted() {
    this.checked = !!this.bucket.checked
  }
}
</script>

<style>
.FilterFacetBucket span,
.FilterFacetBucket label {
  font-variant: normal;
}

.FilterFacetBucket .ItemSelector {
  cursor: pointer;
}

.FilterFacetBucket .ItemSelector:hover {
  text-decoration: underline;
}
</style>

<i18n lang="json">
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
