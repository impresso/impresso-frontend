<template>
  <div class="ItemSelector d-inline" v-on:click.prevent.stop="selectItem" title="See details">
    <slot></slot>
    <span v-if="label" class="ItemSelector_label underline">{{ label }}</span>
    <span v-else-if="!hideIcon" class="dripicons-enter icon-link"></span>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'

/**
 * Item selector component: given a specific item, display it on the Monitor component
 * <item-selector :uid="your-item.uid" :type="person" :search-index="search" >
 */
export default {
  name: 'ItemSelector',
  props: {
    uid: {
      type: String,
      required: true
    },
    item: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    defaultClickActionDisabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String
    },
    searchIndex: {
      type: String,
      default: 'search'
    },
    hideIcon: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    selectItem() {
      const params = {
        item: {
          ...this.item,
          uid: this.uid
        },
        type: this.type
      }
      if (!this.defaultClickActionDisabled) {
        this.selectionMonitorStore.show({
          item: this.item,
          searchIndex: this.searchIndex,
          type: this.type,
          applyCurrentSearchFilters: true,
          displayCurrentSearchFilters: true
        })
      }

      this.$emit('click', {
        params,
        defaultActionExecuted: !this.defaultClickActionDisabled
      })
    }
  },
  computed: {
    ...mapStores(useSelectionMonitorStore)
  }
}
</script>

<style lang="css">
.ItemSelector_label {
  cursor: pointer;
}
.ItemSelector_label:hover,
.ItemSelector_label.underline {
  box-shadow: 0 1px 0px 0 black;
}
</style>
