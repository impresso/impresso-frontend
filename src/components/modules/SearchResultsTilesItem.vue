<template>
  <SearchResultsListItem class="SearchResultsTilesItem" v-model="modelValueReactive" />
</template>

<script lang="ts">
import { PropType } from 'vue'
import SearchResultsListItem from './SearchResultsListItem.vue'
import { ContentItem } from '@/models/generated/schemas/contentItem'

export default {
  props: {
    modelValue: {
      type: Object as PropType<ContentItem>,
      required: true
    }
  },
  computed: {
    // This is to ensure that the modelValue is reactive
    modelValueReactive: {
      get() {
        return this.modelValue
      },
      set() {
        /* noop */
      }
    }
  },
  emits: ['click', 'toggleSelected'],
  methods: {
    click() {
      this.$emit('click')
    },
    toggleSelected() {
      this.$emit('toggleSelected')
    }
  },
  components: {
    SearchResultsListItem
  }
}
</script>
