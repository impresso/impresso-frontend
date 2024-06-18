<template>
  <SearchResultsListItem class="SearchResultsTilesItem" v-model="article" />
</template>

<script>
import SearchResultsListItem from './SearchResultsListItem.vue'

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  computed: {
    article() { return this.modelValue }
  },
  methods: {
    click() {
      this.$emit('click')
    },
    toggleSelected() {
      this.$emit('toggleSelected')
    },
  },
  components: {
    SearchResultsListItem,
  },
}
</script>
