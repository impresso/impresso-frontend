<template>
  <filter-wrapper
    v-bind:id="filter.key"
    v-on:remove="remove"
    icon="message"
    v-bind:title="filter.item.getHtmlExcerpt()"
  >
    <div slot="settings">
      <filter-setting-context v-model="filter" />
    </div>
  </filter-wrapper>
</template>

<script>
import FilterWrapper from './FilterWrapper'
import FilterSettingContext from './FilterSettingContext'

export default {
  data: () => ({
    disabled: true,
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    remove() {
      this.$emit('remove')
    },
  },
  components: {
    FilterWrapper,
    FilterSettingContext,
  },
}
</script>
