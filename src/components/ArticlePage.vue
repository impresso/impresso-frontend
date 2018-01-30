<template lang="html">
  <main id="ArticlePage">
    <div id="openseadragon1"></div>
  </main>

</template>

<script>
import OpenSeadragon from 'openseadragon';

export default {
  mounted() {
    OpenSeadragon({
      id: 'openseadragon1',
      tileSources: {
        type: 'image',
        url: 'http://www.jump.com.br/wp-content/uploads/2013/09/IMG_48161.jpg',
      },
    });
  },
};
</script>

<style scoped lang="less">
#ArticlePage{
  position: absolute;
  top:47px;
  bottom: 0;
  width: 100%;
  background: #e4e5e6;
}

#openseadragon1{
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
}
</style>
