<template lang="html">
  <div class="filter pr-1 mb-2">

    <b-btn size="sm" variant="secondary" :id="id" class="px-1">
      <span v-if="icon" :class="'filter-icon dripicons-'+icon"></span>
      <span class="filter-text" v-html="title"></span>
      <span class="filter-btn dripicons-chevron-down" />
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

<style scoped lang="scss">
.filter {
  .filter-icon {
    opacity: 0.65;
    display: inline-block;
    height: 1.2em;
    width: 1.2em;
    vertical-align: sub;
  }
  .filter-text {
    max-width: 296px;
    display: inline-block;
    vertical-align: bottom;
    text-overflow: ellipsis;
    overflow: hidden;
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
