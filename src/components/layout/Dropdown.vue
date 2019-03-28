<template lang="html">
  <b-dropdown v-bind:text="selected.text" v-bind:size="size" v-bind:variant="variant">
    <b-dropdown-item
      v-for="option in options"
      v-bind:active="value === option.value"
      v-bind:key="option.value"
      v-on:click="select(option.value)"
      v-bind:disabled="option.disabled"
    >{{option.text}}</b-dropdown-item>
  </b-dropdown>
</template>

<script>
export default {
  model: {
    prop: 'value',
  },
  props: {
    value: {
      default: false,
    },
    options: {
      default: [],
    },
    size: {
      default: 'md',
    },
    variant: {
      default: 'primary',
    },
  },
  computed: {
    selected: {
      get() {
        return this.options.find(option => option.value === this.value);
      },
    },
  },
  methods: {
    select(option) {
      this.$emit('input', option);
    },
  },
};
</script>

<style scoped lang="less">
</style>
