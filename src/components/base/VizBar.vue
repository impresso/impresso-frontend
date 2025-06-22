<template>
  <div>
    <div class="d-flex align-items-center">
      <div class="mr-2 small-caps" v-if="showPercent">{{ toolTitle }}</div>
      <div class="flex-grow-1">
        <ItemLabel :item="item" :type="type" class="mr-1" />
        <ItemSelector
          :uid="uid"
          :item="item"
          :type="type"
          :search-index="searchIndex"
          :default-click-action-disabled="defaultClickActionDisabled"
          @click="param => $emit('click', param)"
        />
      </div>
      <div v-if="count">{{ $n(count) }}</div>
    </div>
    <div class="bg-white w-100" :class="{ 'border-bottom border-dark': showBorder }">
      <div class="bg-dark viz-bar" :style="`width:${percent}%;`" />
    </div>
  </div>
</template>

<script lang="ts">
import ItemLabel from '../modules/lists/ItemLabel.vue'
import ItemSelector from '../modules/ItemSelector.vue'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    showBorder: {
      type: Boolean,
      default: false
    },
    showPercent: {
      type: Boolean,
      default: false
    },
    percent: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    uid: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<
        | 'topic'
        | 'textReuseCluster'
        | 'textReusePassage'
        | 'collection'
        | 'year'
        | 'type'
        | 'country'
        | 'language'
        | 'newspaper'
      >
    },
    item: {
      type: Object,
      default: () => ({})
    },
    defaultClickActionDisabled: {
      type: Boolean,
      default: false
    },
    searchIndex: {
      type: String,
      default: 'search'
    }
  },
  components: {
    ItemSelector,
    ItemLabel
  },
  computed: {
    toolTitle(): string {
      return this.percent ? `${this.$n(this.percent)}%` : ''
    }
  }
})
</script>
