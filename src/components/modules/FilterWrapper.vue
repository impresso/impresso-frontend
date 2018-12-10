<template lang="html">
  <div class="filter py-1 bb">
    <base-title-bar v-if="title" class="title">{{title}}</base-title-bar>
    <div class="content">
      <slot></slot>
    </div>
    <div class="controls">
      <b-button-group>
        <slot name="controls"></slot>
        <b-button v-on:click="remove" variant="link" size="sm"><icon name="times" /></b-button>
        <b-button v-if="this.$slots.settings" v-on:click="toggleExpanded" variant="link" size="sm">
          <icon v-bind:name="expanded ? 'chevron-up' : 'chevron-down'" />
        </b-button>
      </b-button-group>
    </div>
    <div v-show="expanded" class="settings py-2">
      <slot name="settings"></slot>
      <hr>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import Icon from 'vue-awesome/components/Icon';

import BaseTitleBar from './../base/BaseTitleBar';

export default {
  data: () => ({
    expanded: false,
  }),
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
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
    width: 100%;
    display: grid;
    grid-template-columns: auto min-content;
    grid-template-rows: auto;
    grid-template-areas: 'title title' 'content controls' 'settings settings';

    .title{
      grid-area: title;
      text-transform: capitalize;
    }

    .content{
      grid-area: content;
    }

    .controls{
      grid-area: controls;
      white-space: nowrap
    }

    .settings{
      grid-area: settings;
    }
}
</style>
