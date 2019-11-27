<template lang="html">
  <span class="dripicons-enter icon-link" v-on:click.prevent.stop="selectItem($event)"></span>
</template>
<script>
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
  },
  methods: {
    selectItem() {
      this.$store.dispatch('monitor/SET_ITEM', {
        item: {
          ...this.item,
          uid: this.uid,
        },
        type: this.type,
      });
    },
  },
};
</script>

<style lang="scss">
</style>
