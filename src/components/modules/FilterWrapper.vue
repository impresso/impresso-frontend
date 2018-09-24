<template lang="html">
  <div class="filter border-top border-left border-right bg-light p-2">
    <div class="context pr-2">
      <slot name="context"/>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="controls">
      <b-button-group>
        <slot name="controls"></slot>
        <b-button v-on:click="remove" variant="link" size="sm"><div class="dripicons-cross icon-link"></div></b-button>
      </b-button-group>
    </div>
  </div>
</template>

<script>

export default {
  methods: {
    remove() {
      this.$emit('remove');
    },
  },
};
</script>

<style scoped lang="less">
.filter {
    display: grid;
    grid-template-columns: max-content auto max-content;
    grid-template-rows: auto;
    grid-template-areas: 'context content controls';

    .context{
      grid-area: context;
    }

    .content{
      grid-area: content;
    }

    .controls{
      grid-area: controls;
    }

    .btn-link {
      &:hover {
        text-decoration: none;
        background: #ddd;
      }
      width: 2em;
      height: 2em;
      margin: 0;
      padding: 0.3em;
      div {
        // display: inline-block;
        font-size: 1.3em;
        padding: 0;
        margin: 0;
        vertical-align: bottom;
        text-decoration: none;
      }
    }
}
</style>
