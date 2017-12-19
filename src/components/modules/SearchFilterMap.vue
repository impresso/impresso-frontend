<template lang="html">
  <div class="filter">
    <v-map :zoom=13 :center="[49.609325, 6.129330]">
      <v-tilelayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"></v-tilelayer>
    </v-map>
  </div>
</template>

<script>
import Vue2Leaflet from 'vue2-leaflet';

export default {
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer': Vue2Leaflet.TileLayer,
  },
};
</script>

<style scoped lang="less">
@import "~leaflet/dist/leaflet.css";

.filter {
    height: 200px;
}
</style>
