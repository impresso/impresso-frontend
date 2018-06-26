<template lang="html">
  <b-media>
    <div class="thumbnail" slot="aside" >
      <open-seadragon-viewer v-model="article.pages[0].iiif"></open-seadragon-viewer>
    </div>
    <h2><a href="#" v-on:click.prevent="click">{{article.title}}</a></h2>
    <div>
      <b-badge pill v-for="tag in article.tags" variant="secondary" v-bind:key="tag.uid">{{tag.name}}</b-badge>
    </div>
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
  model: {
    prop: 'article',
  },
  props: {
    article: {
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
