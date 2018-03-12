<template lang="html">
  <b-media>
    <div class="thumbnail" slot="aside" >
      <open-seadragon-viewer v-model="value.iiif"></open-seadragon-viewer>
    </div>
    <h2><a href="#" v-on:click.prevent="click">{{value.title}}</a></h2>
    <p>{{value.extract}}</p>
    <b-table small :items="value.details"></b-table>
  </b-media>
</template>

<script>
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

import OpenSeadragonViewer from './OpenSeadragonViewer';

Vue.use(BootstrapVue);
Vue.use(VueI18n);

export default {
  props: {
    value: {
      required: true,
    },
  },
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
    width: 240px;
    height: 180px;
    position: relative;
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
