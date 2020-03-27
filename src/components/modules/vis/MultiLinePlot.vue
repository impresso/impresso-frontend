<template>
  <div :style="{ border: '1px solid #777', height: '200px', 'overflow-y': 'scroll' }">
    <pre>{{JSON.stringify(itemsSets, null, 2)}}</pre>
  </div>
</template>

<script>
// import Tooltip from '../tooltips/Tooltip'

/**
 * @typedef {{ value: number, time: Date }} Item
 * @typedef {{ items: Item[], label: string }} ItemsSet
 */

export default {
  props: {
    /** @type {import('vue').PropOptions<ItemsSet[]>} */
    itemsSets: {
      type: Array,
      default: () => []
    }
  },
  components: {
    // Tooltip
  },
  computed: {
    /** @returns {any} */
    tooltip() {
      return {
        x: 0,
        y: 0,
        isActive: false,
        item: {},
      }
    }
  }
}
</script>