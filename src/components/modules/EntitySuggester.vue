<template lang="html">
  <div class="entity-suggester">
    <b-input placeholder="filter entities" v-model.trim="suggestionQuery"/>
    <div class="d-flex flex-wrap">
      <div class="item-label-wrapper border border-tertiary m-1 px-1"
        v-for="(item, i) in items" :key="i"
        @click="toggleSelectedItem(item)"
        :class="{ active: selectedItemsIds.includes(item.uid) }">
        <item-label :item="item" :type="type"/>
      </div>
    </div>
    <pagination v-if="paginationTotalRows > paginationPerPage"
      :current-page="paginationCurrentPage"
      @change="$event => paginationCurrentPage = $event"
      :total-rows="paginationTotalRows"
      :per-page="paginationPerPage"
      size="sm"
      class="mt-1 justify-content-center"
    ></pagination>
  </div>
</template>

<script>
import Entity from '@/models/Entity'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import { entities as entitiesService } from '@/services'

export default {
  props: {
    filter: Object,
    type: String,
  },
  data: () => ({
    suggestionQuery: '',
    paginationPerPage: 10,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    items: [],
    selectedItems: [],
    isLoading: false,
  }),
  mounted() {
    if (this.filterItemsIds.length) {
      this.suggestionQuery = this.filter.items[this.filter.items.length - 1].name
    }
  },
  computed: {
    filterItemsIds() {
      const items = this.filter?.items ?? [];
      return items.map(({ uid }) => uid);
    },
    selectedItemsIds() {
      return this.selectedItems
        .map(({ uid }) => uid)
        .concat(this.filterItemsIds);
    },
    serviceQuery() {
      return {
        q: this.suggestionQuery,
        page: this.paginationCurrentPage,
        limit: this.paginationPerPage
      }
    }
  },
  methods: {
    toggleSelectedItem(item) {
      const idx = this.selectedItemsIds.indexOf(item.uid);
      if (idx === -1) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems.splice(idx, 1);
      }
      //
      // let items = [];
      // if (this.filterItemsIds.includes(item.uid)) {
      //   items = this.filter.items.filter(({ uid }) => uid !== item.uid)
      // } else {
      //   items = [].concat(this.filter.items, [item]);
      // }
      this.$emit('filter-changed', {
        ...this.filter,
        items: this.selectedItems,
        q: this.selectedItemsIds,
      });
    }
  },
  components: {
    ItemLabel,
  },
  watch: {
    serviceQuery: {
      handler(params) {
        const { q, limit, page } = params;
        const query = {
          page,
          limit,
          filters: [{ type: 'type', q: this.type }],
        };
        this.items = [];
        if (q.length) {
          query.q = q.split('*').concat(['*']).join('');
          this.isLoading = true;
          return entitiesService.find({
            query,
          }).then(({ data, total }) => {
            this.paginationTotalRows = total;
            this.items = data.map(d => new Entity(d));
            this.isLoading = false;
          });
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.item-label-wrapper{
  font-size: 0.9em;
  &.active{
    background: black;
    color: white;
  }
}
</style>
