<template lang="html">
  <div class="filter pr-1 mb-2">

    <b-badge size="sm" variant="secondary" class="px-1">
      <span v-if="icon" :class="'filter-icon dripicons-'+icon"></span>
      <span class="filter-text" v-html="title"></span>
      <span v-bind:id="id" class="btn-pill btn-context dripicons-chevron-down" />
      <span v-on:click="remove" class="btn-pill dripicons-cross" />
    </b-badge>

    <div v-bind:target="id" triggers="click blur">
      <b-button-group>
        <slot name="controls"></slot>
      </b-button-group>
      <slot name="settings"></slot>
    </div>

  </div>
</template>

<script>
/**
 * @deprecated Used in Filter*.vue components which are not used anywhere.
 */
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
  cursor: default;
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
  .btn-pill {
    cursor: pointer;
    background: rgba(200, 200, 200, 0.2);
    opacity: 0.5;
    border-radius: 50%;
    width: 1.2em;
    height: 1.2em;
    padding-top: 0.1em;
    display: inline-block;
    vertical-align: sub;
  }
  .btn-context {
    cursor: context-menu;
  }
  .filter-btn:hover {
    opacity: 1;
  }
}
</style>
