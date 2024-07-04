<template>
  <div class="facet-explorer" data-testid="facet-explorer">
    <div>
      <!-- The Loop -->
      <div class="position-relative">
        <div
          role="group"
          tabindex="-1"
          class="position-relative px-3 pt-2 pb-5 bv-no-focus-ring"
          style="min-height: 4em; max-height: 16em; overflow: scroll"
          data-testid="facet-explorer-list"
        >
          <b-form-checkbox
            v-for="(bucket, idx) in buckets"
            v-bind:key="idx"
            :modelValue="selectedIds.includes(bucket.val)"
            class="d-block"
            @update:modelValue="handleChecked($event, bucket.val)"
            data-testid="facet-explorer-list-item-checkbox"
          >
            <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
            <span v-if="bucket.count > -1">
              (<span v-html="$tc('numbers.results', bucket.count, { n: $n(bucket.count) })" />)
            </span>
            <item-selector :uid="bucket.val" :item="bucket.item" :type="type" />
            <div class="matches" v-if="bucket.item && bucket.item.matches">
              <span v-for="(match, i) in bucket.item.matches" v-html="match" :key="i" />
            </div>
          </b-form-checkbox>
        </div>
        <div class="fixed-pagination-footer p-1 mb-2 small">
          <slot name="pagination"> </slot>
        </div>
      </div>
    </div>
    <!-- Apply! -->
    <div class="p-2 border-top text-center" v-if="selectedIdsChanged">
      <b-button
        @click="applyFilter()"
        size="sm"
        variant="success"
        v-html="$tc('actions.addToCurrentFiltersDetailed', selectedIds.length)"
      ></b-button>
    </div>
  </div>
</template>

<script>
import ItemLabel from './lists/ItemLabel.vue'
import ItemSelector from './ItemSelector.vue'

function getEntitiesForIds(ids, entities = []) {
  return ids.map(id => entities.find(entity => entity && entity.uid === id))
}

export default {
  emits: ['update:modelValue'],
  data: () => ({
    /** @type {string[]} */
    selectedIds: [],
    selectedIdsEntities: []
  }),
  props: {
    modelValue: {
      /** @type {import('vue').PropType<import('../../models/models').Filter>} */
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
    filter() {
      return this.modelValue
    },
    // Filter type https://github.com/impresso/impresso-jscommons/blob/master/proto/query.proto#L19-L45
    type() {
      return this.filter && this.filter.type ? this.filter.type : this.filterType
    },
    filterIds() {
      return this.filter && Array.isArray(this.filter.q) ? this.filter.q : []
    },
    selectedIdsChanged() {
      const a = JSON.stringify([...this.selectedIds].sort())
      const b = JSON.stringify([...this.filterIds].sort())
      return a !== b
    }
  },
  methods: {
    handleChecked(isSet, val) {
      if (!isSet) {
        this.selectedIds.forEach((id, idx) => {
          if (id === val) this.selectedIds.splice(idx, 1)
        })
      } else this.selectedIds.push(val)
    },
    applyFilter() {
      const entities = getEntitiesForIds(
        this.selectedIds,
        this.selectedIdsEntities.concat(this.buckets.map(({ item }) => item))
      )

      const originalFilter = this.filter ? this.filter : { type: this.filterType }
      const updatedFilter = Object.assign({}, originalFilter, {
        q: this.selectedIds,
        items: entities
      })
      this.$emit('update:modelValue', updatedFilter)
    }
  },
  watch: {
    filter: {
      handler() {
        const entities = this.filter ? this.filter.items : []
        this.selectedIds = [...this.filterIds]
        this.selectedIdsEntities = getEntitiesForIds(this.filterIds, entities)
      },
      immediate: true
    }
  },
  components: {
    ItemLabel,
    ItemSelector
  }
}
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
<i18n lang="json">
{
  "en": {}
}
</i18n>
