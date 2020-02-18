<template lang="html">
  <div>
    <div class="mb-1 border-bottom">
      <!-- The Loop -->
      <b-form-checkbox-group v-model="selectedIds"
                             class="position-relative p-2"
                             style="min-height: 4em; max-height: 16em; overflow: scroll">
        <b-form-checkbox v-for="(bucket, idx) in buckets"
                         v-bind:key="idx"
                         :value="bucket.val"
                         class="d-block">
          <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
          <span v-if="bucket.count > -1">
            (<span v-html="$tc('numbers.results', bucket.count, { n : $n(bucket.count) })"/>)
          </span>
          <item-selector :uid="bucket.val" :item="bucket.item" :type="type"/>
          <div class="matches" v-if="bucket.item && bucket.item.matches">
            <span v-for="(match, i) in bucket.item.matches" v-html="match" :key="i"/>
          </div>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </div>
    <!-- Apply! -->
    <b-button v-if='selectedIdsChanged' @click="applyFilter()" class="w-100 my-2 btn btn-sm btn-outline-primary"
      v-html="$tc('actions.addToCurrentFiltersDetailed', selectedIds.length)"></b-button>

  </div>
</template>

<script>
// @ts-check

// @ts-ignore
import ItemLabel from './lists/ItemLabel'
// @ts-ignore
import ItemSelector from './ItemSelector'

export default {
  model: {
    prop: 'filter',
    event: 'change'
  },
  data: () => ({
    selectedIds: [],
  }),
  props: {
    filter: {
      type: Object
    },
    filterType: {
      type: String,
      required: true
    },
    buckets: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  mounted() {
    if (this.filter && this.filter.type && this.filterType !== this.filterType)
      throw new Error('"filter" type must be equal to "filterType"')
  },
  computed: {
    // Filter type https://github.com/impresso/impresso-jscommons/blob/master/proto/query.proto#L19-L45
    type() {
      return this.filter && this.filter.type
        ? this.filter.type
        : this.filterType
    },
    filterIds() {
      return this.filter && Array.isArray(this.filter.q)
        ? this.filter.q
        : []
    },
    selectedIdsChanged() {
      const a = JSON.stringify([...this.selectedIds].sort())
      // @ts-ignore
      const b = JSON.stringify([...this.filterIds].sort())
      return a !== b
    }
  },
  methods: {
    applyFilter() {
      const originalFilter = this.filter
        ? this.filter
        : { type: this.filterType }
      const updatedFilter = Object.assign({}, originalFilter, {
        q: this.selectedIds
      })

      this.$emit('change', updatedFilter)
    },
  },
  watch: {
    filter: {
      handler() {
        // @ts-ignore
        this.selectedIds = this.filterIds
      },
      immediate: true
    }
  },
  components: {
    ItemLabel,
    ItemSelector,
  },
};
</script>

<style scoped lang="less">

.fixed-pagination-footer {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #f2f2f2;
  max-width: 100%;
}
</style>
<i18n>
{
  "en": {
  }
}
</i18n>
