<template lang="html">
  <div class="filter mb-3">
    <div class="header">
      <div class="d-flex justify-content-end">
        <div class="mr-auto title px-2">{{title}}</div>
        <div>
          <b-button-group size="sm">
            <b-button v-on:click="toggle"><icon class="pt-1" name="bars" /></b-button>
            <b-button v-on:click="remove" variant="danger"><icon class="pt-1" name="times" /></b-button>
          </b-button-group>
        </div>
      </div>
    </div>
    <div v-show="expanded" class="context p-2">
      <slot name="context"/>
    </div>
    <div class="body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/times';

export default {
  data: () => ({
    expanded: false,
  }),
  props: {
    title: {
      required: false,
      type: String,
    },
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
    },
    remove() {
      this.$emit('remove');
    },
  },
  components: {
    Icon,
  },
};
</script>

<style scoped lang="less">
@import "./../../assets/less/style.less";

.filter {
    .header {
      background: @clr-grey-800;
      .title{
        color: @clr-white;
        margin-top: 8px;
        text-transform: capitalize;
      }
    }

    .context{
      background: @clr-grey-100;
    }

    .context,
    .body {
      border: 1px solid @clr-grey-500;
    }
}
</style>
