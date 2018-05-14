<template lang='html'>
  <main id='IssuePage'>
    <div class="metadata">
      <div class="px-3 py-4">
        <!-- <button v-for="(page, index) in issue.pages" v-on:click="gotoPage(index)" type="button" name="button" class="btn btn-info" v-bind:class="{active: index === activePage}">{{page.num}}</button> -->
        <h1 class="text-serif font-weight-bold">{{issue.newspaper['name']}}</h1>
        <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        <p><strong><i>Le Temps</i> is a Swiss French-language daily newspaper published in Berliner format in Geneva by Le Temaps SA.</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <hr>
        <named-entity-explorer></named-entity-explorer>
        <hr>
        <pre>{{issue}}</pre>
      </div>
    </div>
    <div class="strip">
      <thumbnail-slider v-model="activePage" v-bind:pages="issue.pages" v-bind:viewer="viewer"></thumbnail-slider>
    </div>
    <div class="viewer">
      <div id="os-viewer"></div>
    </div>
    <div class="userdata">

    </div>
  </main>
</template>

<script>
import OpenSeadragon from 'openseadragon';
import ThumbnailSlider from './modules/ThumbnailSlider';
import NamedEntityExplorer from './modules/NamedEntityExplorer';

import * as services from '../services';

export default {
  data: () => ({
    activePage: 0,
    issue: {
      date: '',
      newspaper: {
        name: '',
      },
    },
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
      this.issue = response;

      this.viewer = OpenSeadragon({
        // debugMode: true,
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
    NamedEntityExplorer,
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

@sidebar_metadata_width: 350px;
@sidebar_userdata_width: 200px;
@strip_width: 140px;

#IssuePage {
    display: flex;
    .metadata {
        width: @sidebar_metadata_width;
    }

    .strip {
        position: relative;
        width: @strip_width;
    }

    .viewer {
        width: 500px;
        flex: 1;
    }

    .userdata {
        width: 80px;
        background: orange;
    }
    // position: absolute;
    // width: 100%;
    // bottom: 0;
    // top: 43px;
    // overflow: hidden;
    // background: @clr-grey-200;
    // .sidebar {
    //     position: absolute;
    //
    //     height: 100%;
    //     overflow-y: auto;
    //     &.metadata {
    //         left: 0;
    //         width: @sidebar_metadata_width;
    //         background: @clr-grey-300;
    //     }
    //     &.userdata {
    //         right: 0;
    //         width: @sidebar_userdata_width;
    //         background: orange;
    //     }
    // }
    //
    // .viewer {
    //     position: absolute;
    //     right: @sidebar_userdata_width;
    //     left: ~"calc(@{sidebar_metadata_width} + @{strip_width})"; // prevent less calc() overwrite
    //     height: 100%;
    //     background: @clr-grey-200;
    // }
    //
    // .strip {
    //     position: absolute;
    //     right: 0;
    //     left: @sidebar_metadata_width;
    //     width: @strip_width;
    //     height: 100%;
    // }
}

#os-viewer {
    width: 100%;
    height: 100%;
}
</style>
