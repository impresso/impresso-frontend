<template lang="html">
  <div class="filter">
    <v-map ref="map" :zoom=13 :center="[49.609325, 6.129330]" >
      <v-tilelayer
      url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
      attribution='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>'
      ></v-tilelayer>
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
  data: () => ({
    boundingbox: [],
  }),
  mounted() {
    this.onBounds();
    this.$refs.map.mapObject.on('zoomend', this.onBounds);
    this.$refs.map.mapObject.on('moveend', this.onBounds);
  },
  methods: {
    onBounds() {
      this.$emit('changeBounds', this.$refs.map.mapObject.getBounds());
    },
  },
};
</script>

<style scoped lang="less">
@import "~leaflet/dist/leaflet.css";

.filter {
    height: 200px;
}
</style>
