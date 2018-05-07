<template lang='html'>
  <main id='IssuePage'>
    <div class="sidebar">
      <!-- <button v-for="(page, index) in pages" v-on:click="gotoPage(index)" type="button" name="button" class="btn btn-info" v-bind:class="{active: index === activePage}">{{page.num}}</button> -->
      <div class="px-3 py-4">
        <h1 class="text-serif font-weight-bold">Le Temps</h1>
        <p class="text-muted">Lundi, 06 March 1920</p>
        <p><strong><i>Le Temps</i> is a Swiss French-language daily newspaper published in Berliner format in Geneva by Le Temaps SA.</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <hr>
      </div>
    </div>
    <div class="strip">
      <thumbnail-slider v-model="activePage" v-bind:pages="pages" v-bind:viewer="viewer"></thumbnail-slider>
    </div>
    <div class="viewer">
      <div id="os-viewer"></div>
    </div>
  </main>
</template>

<script>
import OpenSeadragon from 'openseadragon';
import ThumbnailSlider from './modules/ThumbnailSlider';

import * as services from '../services';

export default {
  data: () => ({
    activePage: 0,
    pages: [],
    viewer: false,
    bounds: [],
  }),
  mounted() {
    const issueUID = this.$route.params.issue_uid;

    if (this.$route.params.page_number !== undefined) {
      // TODO: here we assume that page number 5 has index 4 (starting at 0 in array)
      // but we could be missing pages, so page number 5 might have index 2 for example
      // We need to fix this so that the initial active page number corresponds with
      // the correct index in the array
      this.activePage = parseInt(this.$route.params.page_number, 10) - 1;
    }

    services.issues.get(issueUID, {}).then((response) => {
      this.pages = response.pages;

      this.viewer = OpenSeadragon({
        // debugMode: true,
        // collectionMode: true,
        sequenceMode: true,
        collectionRows: 1,
        id: 'os-viewer',
        showNavigator: false,
        showNavigationControl: false,
        showSequenceControl: false,
        initialPage: this.activePage,
        minZoomLevel: 0.3,
        defaultZoomLevel: 0,
        tileSources: response.pages.map(elm => elm.iiif),
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
@import "./../assets/less/style.less";

@sidebar_width: 25%;
@strip_width: 140px;

#IssuePage {
    position: absolute;
    width: 100%;
    bottom: 0;
    top: 43px;
    overflow: hidden;
    background: @clr-grey-200;
    .sidebar {
        position: absolute;
        left: 0;
        width: @sidebar_width;
        height: 100%;
        background: @clr-grey-300;
    }

    .viewer {
        position: absolute;
        right: 0;
        left: ~"calc(@{sidebar_width} + @{strip_width})"; // prevent less calc() overwrite
        height:100%;
        background: @clr-grey-200;
    }

    .strip {
        position: absolute;
        right: 0;
        left: @sidebar_width;
        width: @strip_width;
        height:100%;
    }
}

#os-viewer {
    width: 100%;
    height: 100%;
}
</style>
