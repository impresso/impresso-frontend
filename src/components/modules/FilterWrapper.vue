<template lang="html">
  <div class="filter pr-1 mb-2">

    <b-btn size="sm" variant="outline-primary" :id="id" class="pr-1">
      <span v-if="icon" :class="'filter-icon dripicons-'+icon"></span>
      <span class="filter-btn dripicons-chevron-down" />
      <span v-html="title"></span>
      <a v-on:click="remove" class="filter-btn dripicons-cross" />
    </b-btn>

    <b-tooltip :target="id" triggers="click blur">
      <b-button-group>
        <slot name="controls"></slot>
      </b-button-group>
      <slot name="settings"></slot>
    </b-tooltip>
  </div>
</template>

<script>

export default {
  methods: {
    remove() {
      this.$emit('remove');
    },
  },
  props: ['id', 'title', 'icon'],
};
</script>

<style lang="scss">
.filter {
  .filter-icon {
    opacity: 0.5;
  }
  .filter-btn {
    background: rgba(200, 200, 200, 0.2);
    opacity: 0.5;
    border-radius: 50%;
    width: 1.2em;
    height: 1.2em;
    padding-top: 0.1em;
    display: inline-block;
    vertical-align: sub;
  }
  button:hover > .filter-btn {
    opacity: 1;
  }
}
</style>
