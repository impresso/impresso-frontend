<template lang='html'>
  <main id='IssuePage'>
    <div class='table'>
      <div class='table-cell sidebar'>
        <b-container fluid>
          <b-row>
            <b-col><h1>sidebar</h1></b-col>
          </b-row>
        </b-container>
      </div>
      <div class='table-cell'>
        <div class='table'>
          <div class='table-row'>
            <div id='os-viewer' class='table-cell viewer'>
            </div>
          </div>
          <div class='table-row'>
            <div class='table-cell strip'>
              <h1>strip</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Vue from 'vue';
import VueResource from 'vue-resource';
import OpenSeadragon from 'openseadragon';

Vue.use(VueResource);

export default {
  mounted() {
    const resource = this.$resource(`${process.env.MIDDLELAYER_API}/issues{/issue_uid}`);
    const issueUID = this.$route.params.issue_uid;

    resource.get({
      issue_uid: issueUID,
    }).then((response) => {
      OpenSeadragon({
        // debugMode: true,
        collectionMode: true,
        collectionRows: 1,
        // collectionTileMargin: 20,
        id: 'os-viewer',
        showNavigator: false,
        showNavigationControl: false,
        initialPage: 0,
        // minZoomLevel: 0.001,
        defaultZoomLevel: 0.0005,
        tileSources: response.body[0].pages.map(elm => elm.iiif),
      });
    });
  },
};
</script>

<style scoped lang='less'>
#IssuePage {
    position: absolute;
    width: 100%;
    top: 47px;
    bottom: 0;
}

.table {
    display: table;
    height: 100%;
    margin: 0;
}

.table-row {
    display: table-row;
}

.table-cell {
    display: table-cell;
    vertical-align: top;
}

.table-col {
    display: table-column;
}

.sidebar {
    overflow-y: auto;
    width: 25%;
    border-right: 1px solid #ccc;
}

.viewer {
    background: #111;
}

.strip {
    height: 60px;
    border-top: 1px solid #ccc;
}
</style>
