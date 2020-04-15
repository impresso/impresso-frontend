<template>
  <span class="dripicons-enter icon-link" v-on:click.prevent.stop="selectItem"></span>
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
    defaultClickActionDisabled: {
      type: Boolean,
      default: false
    }
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
      if (!this.defaultClickActionDisabled) this.$store.dispatch('monitor/SET_ITEM', params)

      this.$emit('click', {
        params,
        defaultActionExecuted: !this.defaultClickActionDisabled
      })
    },
  },
};
</script>

<style lang="scss">
</style>
