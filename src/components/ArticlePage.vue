<template lang='html'>
  <main id='ArticlePage'>
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
import OpenSeadragon from 'openseadragon';

export default {
  mounted() {
    OpenSeadragon({
      // debugMode: true,
      collectionMode: true,
      collectionRows: 1,
      collectionTileSize: 1024,
      collectionTileMargin: 256,
      id: 'os-viewer',
      showNavigator: true,
      navigatorPosition: 'ABSOLUTE',
      navigatorTop: '90%',
      navigatorLeft: 0,
      navigatorHeight: '10%',
      navigatorWidth: '100%',
      // sequenceMode: true,
      // showReferenceStrip: true,
      tileSources: [
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
        'http://192.168.56.102/loris/bug.jpg',
        'http://192.168.56.102/loris/mt.jpg',
        'http://192.168.56.102/loris/hr_1.jpg',
      ],
    });
  },
};
</script>

<style scoped lang='less'>
#ArticlePage {
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
