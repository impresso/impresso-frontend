<template lang="html">
  <div class="filter py-1 bb">
    <base-title-bar v-if="title" class="title">{{title}}</base-title-bar>
    <div class="context pr-2">
      <slot name="context"/>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="controls">
      <b-button-group>
        <slot name="controls"></slot>
        <b-button v-on:click="remove" variant="link" size="sm"><icon name="times" /></b-button>
      </b-button-group>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import Icon from 'vue-awesome/components/Icon';

import BaseTitleBar from './../base/BaseTitleBar';

export default {
  methods: {
    remove() {
      this.$emit('remove');
    },
  },
  props: ['title'],
  components: {
    Icon,
    BaseTitleBar,
  },
};
</script>

<style scoped lang="less">
.filter {
    display: grid;
    grid-template-columns: max-content auto max-content;
    grid-template-rows: auto;
    grid-template-areas: 'title title title' 'context content controls';

    .title{
      grid-area: title;
    }

    .context{
      grid-area: context;
    }

    .content{
      grid-area: content;
    }

    .controls{
      grid-area: controls;
    }
}
</style>
