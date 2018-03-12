<template lang="html">
  <div class="mb-4">
    <div class="thumbnail">
      <open-seadragon-viewer v-model="value.iiif"></open-seadragon-viewer>
    </div>
    <a href="#" class="btn btn-primary btn-sm btn-block" v-on:click.prevent="click">View</a>
  </div>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

import OpenSeadragonViewer from './OpenSeadragonViewer';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  props: ['value'],
  methods: {
    click() {
      this.$emit('click');
    },
  },
  components: {
    OpenSeadragonViewer,
  },
};
</script>

<style scoped lang="less">
.thumbnail {
    width: 100%;
    height: 180px;
    cursor: move;
}
</style>

<i18n>
{
  "en": {
  },
  "nl": {
  }
}
</i18n>
