<template lang="html">
  <div>
    <div v-if="title">{{ title }}</div>
    <div
      v-for="(item, index) in items"
      :key="index"
      :variant="compact"
      :class="`${styleVariant} viz-bar-bar border-right small-caps pl-1`"
      :style="`width:${percent(item.count)}%; background:rgba(200, 200, 200, ${alpha(item.count)})`"
    >
      <div :title="`${item.name} — ${item.count}`">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @deprecated not used anywhere
 */
export default {
  props: [
    'title', // opt: label
    'variant', // opt: 'compact' or 'multiline'
    'items' // array of [{'name' : String, count : Number}]
  ],
  methods: {
    percent(count) {
      return Math.round((count * 100) / this.total)
    },
    alpha(count) {
      return count / this.total + 0.6
    }
  },
  components: {},
  computed: {
    styleVariant() {
      return this.variant === 'compact' ? 'd-inline-block' : 'mb-1'
    },
    total() {
      let t = 0
      this.items.forEach(i => {
        t += i.count
      })
      return t
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

.viz-bar-bar {
  line-height: 0.9;
  height: 16px;
  overflow: hidden;

  color: $clr-secondary;
  background-color: #eee;
  border-bottom: 1px solid $clr-secondary;
  border-right-color: $clr-bg-secondary !important;

  &:last-child {
    border-right: none !important;
  }
  div {
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: default;
  }
}
.bg-dark .viz-bar-bar {
  background-color: #ddd;
  border-right-color: $clr-secondary !important;
}
</style>
