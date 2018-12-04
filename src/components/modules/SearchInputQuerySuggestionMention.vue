<template lang="html">
  <section v-on:click.prevent="click">
    <span class="suggestion-icon text-accent-secondary" />
    "{{suggestion.query}}"
  </section>
</template>

<script>

export default {
  model: {
    prop: 'suggestion',
  },
  props: ['suggestion'],
  methods: {
    click() {
      this.$emit('click', this.suggestion);
    },
  },
};
</script>

<style scoped lang="less">
</style>
