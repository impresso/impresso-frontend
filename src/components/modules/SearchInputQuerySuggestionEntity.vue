<template lang="html">
  <section v-on:click.prevent="click">
    <div class="suggestion-icon text-accent-secondary" v-bind:class="[icon]" />
    <div class="suggestion-text">
      {{suggestion.entity.name}}<br>
      <small class="text-muted">this is a description</small>
    </div>
    <div class="text-right text-accent-secondary font-weight-bold">
      {{ Math.round(Math.random(1) * 28) }}<br>
      <small class="text-accent-secondary">occurrences</small>
    </div>
  </section>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

export default {
  model: {
    prop: 'suggestion',
  },
  props: ['suggestion'],
  computed: {
    icon: {
      get() {
        if (this.suggestion.entity.hasLabel('location')) {
          return 'dripicons-location';
        }
        return 'dripicons-user';
      },
    },
  },
  components: {
    Icon,
  },
  methods: {
    click() {
      this.$emit('click', this.suggestion);
    },
  },
};
</script>

<style scoped lang="less">
</style>
