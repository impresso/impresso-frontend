<template lang="html">
  <div class="filter mr-1 mb-2">
    <!-- <div class="content">
      <b-input-group
      v-bind:prepend="icon ? icon : null">
        <b-button size="sm" v-on:click="toggleExpanded" v-bind:variant="expanded ? 'success' : 'primary'" >{{title}}</b-button>
        <b-button v-on:click="remove" size="sm"><icon name="times" /></b-button>
      </b-input-group>
    </div> -->

    <b-badge
      v-bind:prepend="icon ? icon : null"
      v-b-toggle="id"
      class="mr-1 w-100 btn btn-info border">
        {{title}}
      <a v-on:click="remove" class="dripicons dripicons-cross" />
    </b-badge>

    <b-collapse v-bind:id="id" accordion="filter-pills" class="settings px-3 bg-white border">
      <b-button-group>
        <slot name="controls"></slot>
      </b-button-group>
      <slot name="settings"></slot>
    </b-collapse>
  </div>
</template>

<script>
// import 'vue-awesome/icons/times';
// import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/user-circle';
import 'vue-awesome/icons/map-marker';
import Icon from 'vue-awesome/components/Icon';

export default {
  data: () => ({
  }),
  methods: {
    remove() {
      this.$emit('remove');
    },
  },
  props: ['id', 'title', 'icon'],
  components: {
    Icon,
  },
};
</script>

<style scoped lang="scss">
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
  // display: flex;
  .settings{
    // background: red;
    // width: 100%;
    // flex: 100%;
    position: fixed;
    // left: 0;
    // width: 100%;
    // background: white;
    z-index: 1030;
    // display: flex;
    // display: block;
    // position: absolute;
    // border-width: 2px 0 4px;
    // border-color: black;
    // border-style: solid;
    // position: absolute;
    // top:30px;
    // left:0;
    // width:300px;
    // z-index: 1000;
  }
}
</style>
