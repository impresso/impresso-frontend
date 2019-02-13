<template lang="html">
  <div class="filter mr-1 mb-2">
    <div class="content">
      <b-input-group
      v-bind:prepend="icon ? icon : null">
        <b-button size="sm" v-on:click="toggleExpanded" v-bind:variant="expanded ? 'success' : 'primary'" >{{title}}</b-button>
        <b-button v-on:click="remove" size="sm"><icon name="times" /></b-button>
      </b-input-group>
    </div>
    <div v-show="expanded" class="settings px-3">
      <b-button-group>
        <slot name="controls"></slot>
      </b-button-group>
      <slot name="settings"></slot>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';

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
  props: ['title', 'icon'],
  components: {
    Icon,
    BaseTitleBar,
  },
};
</script>

<style scoped lang="less">
// .filter {
//     width: 100%;
//     display: grid;
//     grid-template-columns: auto min-content;
//     grid-template-rows: auto;
//     grid-template-areas: 'title title' 'content controls' 'settings settings';
//
//     .title{
//       grid-area: title;
//       text-transform: capitalize;
//     }
//
//     .content{
//       grid-area: content;
//     }
//
//     .controls{
//       grid-area: controls;
//       white-space: nowrap
//     }
//
//     .settings{
//       grid-area: settings;
//     }
// }
.filter{
  position: relative;
  .settings{
    background: white;
    border-width: 2px 0 4px;
    border-color: black;
    border-style: solid;
    position: absolute;
    top:30px;
    left:0;
    width:300px;
    z-index: 1000;
  }
}
</style>
