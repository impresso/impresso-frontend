<template lang="html">
  <b-dropdown
      size="sm" variant="outline-secondary"
      v-on:show="fetch"
      v-bind:text="text">
    <collection-add-to-list :item="item" :items="items" />
  </b-dropdown>
</template>

<script>
import CollectionAddToList from './CollectionAddToList';

export default {
  data: () => ({
    show: false,
  }),
  props: {
    text: String,
    item: Object,
    items: Array,
  },
  components: {
    CollectionAddToList,
  },
  methods: {
    fetch() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS');
    },
  },
};
</script>
