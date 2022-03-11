<template>
  <span v-if="label" class="ItemSelector_label" v-on:click.prevent.stop="selectItem">{{ label }}</span>
  <span v-else class="dripicons-enter icon-link" v-on:click.prevent.stop="selectItem"></span>
</template>

<script>
import { mapFilters } from '@/logic/queryParams'

/**
 * Item selector component: given a specific item, display it on the Monitor component
 * <item-selector :uid="your-item.uid" :type="person" >
 */
export default {
  props: {
    uid: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    defaultClickActionDisabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String
    },
  },
  methods: {
    selectItem() {
      const params = {
        item: {
          ...this.item,
          uid: this.uid,
        },
        type: this.type,
      }
      if (!this.defaultClickActionDisabled) {
        this.$store.dispatch('monitor/ACTIVATE', {
          ...params,
          filters: this.filters,
          filtersUpdatedCallback: filters => {
            this.filters = filters
          }
        })
      }

      this.$emit('click', {
        params,
        defaultActionExecuted: !this.defaultClickActionDisabled
      })
    },
  },
  computed: {
    filters: mapFilters()
  }
};
</script>

<style lang="css">
.ItemSelector_label{
  cursor: pointer;
}
.ItemSelector_label:hover{
  box-shadow: 0 1px 0px 0 black;
}
</style>
