<template lang="html">
  <div class="my-3">
    <div class="thumbnail">
      <open-seadragon-viewer
        v-model="article.pages[0].iiif"
        v-bind:bbox="article.regions[0].coords">
      </open-seadragon-viewer>
    </div>
    <a href="#" class="btn btn-outline-primary btn-sm btn-block" v-on:click.prevent="click">View</a>
  </div>
</template>

<script>
import OpenSeadragonViewer from './OpenSeadragonViewer';

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
.thumbnail {
    width: 100%;
    height: 280px;
    cursor: move;
    border-top:1px solid black;
    border-left:1px solid black;
    border-right:1px solid black;
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
