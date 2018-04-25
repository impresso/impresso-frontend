<template lang='html'>
  <main id='IssuePage'>
    <div class="sidebar">
      <button v-for="(page, index) in pages" v-on:click="gotoPage(index)" type="button" name="button" class="btn btn-info" v-bind:class="{active: index === activePage}">{{page.num}}</button>
    </div>
      <div class="viewer">
        <div id="os-viewer"></div>
      </div>
      <div class="strip">
        <thumbnail-slider v-model="activePage" v-bind:pages="pages" v-bind:viewer="viewer"></thumbnail-slider>
      </div>
  </main>
</template>

<script>
import Vue from 'vue';
import VueResource from 'vue-resource';
import OpenSeadragon from 'openseadragon';
import ThumbnailSlider from './modules/ThumbnailSlider';

Vue.use(VueResource);

export default {
  data: () => ({
    activePage: 0,
    pages: [],
    viewer: false,
    bounds: [],
  }),
  mounted() {
    const resource = this.$resource(`${process.env.MIDDLELAYER_API}/issues{/issue_uid}`);
    const issueUID = this.$route.params.issue_uid;
    // const articleUID = this.$route.params.article_uid;

    if (this.$route.params.page_number !== undefined) {
      // TODO: here we assume that page number 5 has index 4 (starting at 0 in array)
      // but we could be missing pages, so page number 5 might have index 2 for example
      // We need to fix this so that the initial active page number corresponds with
      // the correct index in the array
      this.activePage = parseInt(this.$route.params.page_number, 10) - 1;
    }

    resource.get({
      issue_uid: issueUID,
    }).then((response) => {
      this.pages = response.body[0].pages;

      this.viewer = OpenSeadragon({
        // debugMode: true,
        // collectionMode: true,
        sequenceMode: true,
        collectionRows: 1,
        // collectionTileMargin: 20,
        id: 'os-viewer',
        showNavigator: false,
        showNavigationControl: false,
        showSequenceControl: false,
        initialPage: this.activePage,
        minZoomLevel: 0.3,
        defaultZoomLevel: 0,
        tileSources: response.body[0].pages.map(elm => elm.iiif),
      });
    });
  },
  methods: {
    gotoPage(num) {
      this.activePage = num;
    },
  },
  components: {
    ThumbnailSlider,
  },
  watch: {
    activePage: {
      handler(val) {
        if (this.viewer) {
          this.viewer.goToPage(val);
        }
      },
    },
  },
};
</script>

<style scoped lang='less'>
@sidebar_width: 250px;
@strip_height: 120px;

#IssuePage {
    position: absolute;
    width: 100%;
    bottom: 0;
    top: 54px;
    overflow: hidden;

    .sidebar {
        position: absolute;
        left: 0;
        width: @sidebar_width;
        height: 100%;
    }

    .viewer {
        position: absolute;
        top: 0;
        right: 0;
        left: @sidebar_width;
        bottom: @strip_height;
        background: #111;
        box-shadow: 5px -5px 20px rgba(0,0,0,0.8) inset;
    }

    .strip {
        position: absolute;
        right: 0;
        bottom: 0;
        left: @sidebar_width;
        height: @strip_height;
    }
}

#os-viewer {
    width: 100%;
    height: 100%;
}
</style>
