<template>
  <div class="FilterFacetBucket d-flex text-small">
    <b-form-checkbox v-model="isChecked" data-testid="filter-facet-bucket-checkbox">
    </b-form-checkbox>
    <item-selector
      v-if="bucket.item"
      hide-icon
      :id="bucketId"
      :item="bucket.item"
      :type="type"
      :searchIndex="searchIndex"
    >
      <item-label v-if="bucket.item" :item="bucket.item" :type="type" :label="bucket.label" />
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
    <item-label
      v-else
      :item="{ ...bucket.item, id: bucket.value }"
      :type="type"
      :label="bucket.label"
    />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import ItemSelector from './ItemSelector.vue'
import ItemLabel from './lists/ItemLabel.vue'
import type { Bucket as IBucket } from '@/models'
import Bucket from '@/models/Bucket'

export default {
  name: 'FilterFacetBucket',
  data: () => ({
    operators: ['or', 'and', 'not'],
    operator: 'or',
    checked: false
  }),
  props: {
    bucket: {
      type: Object as PropType<
        IBucket & { checked?: boolean; operator?: string; item?: Bucket['item'] }
      >,
      required: true
    },
    type: {
      type: String as PropType<string>
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
    },
    bucketId() {
      return String(this.bucket.value)
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
