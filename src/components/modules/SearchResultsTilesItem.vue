<template>
  <SearchResultsListItem class="SearchResultsTilesItem" :article="article" />
</template>

<script>
import SearchResultsListItem from './SearchResultsListItem.vue'

export default {
  model: {
    prop: 'article',
  },
  props: {
    article: {
      type: Object,
      required: true,
    },
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
