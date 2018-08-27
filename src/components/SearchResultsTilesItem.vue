<template lang="html">
  <div class="mb-4">
    <div class="thumbnail">
      <open-seadragon-viewer v-model="article.pages[0].iiif"></open-seadragon-viewer>
    </div>
    <a href="#" class="btn btn-primary btn-sm btn-block" v-on:click.prevent="click">View</a>
  </div>
</template>

<script>
import OpenSeadragonViewer from './modules/OpenSeadragonViewer';

export default {
  model: {
    prop: 'article',
  },
  props: ['article'],
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
// @import "./../assets/less/style.less";

.thumbnail {
    width: 100%;
    height: 180px;
    cursor: move;
    border: 1px solid #ccc;
    margin-bottom: 10px;
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
