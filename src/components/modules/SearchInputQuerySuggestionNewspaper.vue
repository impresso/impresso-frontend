<template lang="html">
  <section v-on:click.prevent="click">
    <span class="suggestion-icon text-accent-secondary" />
    <label>newspaper:</label>
    <span class="serif">{{suggestion.newspaper.name}}
      (<span class='sans'>{{suggestion.newspaper.startYear}}</span>
       &mdash;
      <span class='sans'>{{suggestion.newspaper.endYear}}</span>)
    </span>

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
