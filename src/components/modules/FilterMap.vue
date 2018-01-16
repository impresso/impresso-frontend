<template lang="html">
  <div class="filter">
    <div class="context">
      <b-form-select v-model="filter.context" v-bind:options="options" v-on:input="updateFilter" />
    </div>
    <div class="body">
      <v-map ref="map" >
        <v-tilelayer
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
        attribution='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>'
        ></v-tilelayer>
      </v-map>
    </div>
  </div>
</template>

<script>
import Vue2Leaflet from 'vue2-leaflet';

export default {
  data: () => ({
    options: [{
      value: 'include',
      text: 'Include',
    },
    {
      value: 'exclude',
      text: 'Exclude',
    },
    ],
  }),
  model: {
    prop: 'filter',
  },
  props: ['filter'],
  methods: {
    updateFilter() {
      this.$emit('input', this.filter);
    },
    onBounds() {
      const bounds = this.$refs.map.mapObject.getBounds();
      const NorthEast = bounds.getNorthEast();
      const SouthWest = bounds.getSouthWest();
      this.filter.NorthEast = NorthEast;
      this.filter.SouthWest = SouthWest;

      this.$emit('input', this.filter);
    },
  },
  mounted() {
    this.$refs.map.mapObject.fitBounds([
      this.filter.NorthEast,
      this.filter.SouthWest,
    ]);
    this.$refs.map.mapObject.on('moveend', this.onBounds);
  },
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer': Vue2Leaflet.TileLayer,
  },
};
</script>

<style scoped lang="less">
@import "~leaflet/dist/leaflet.css";

.filter .body {
    height: 200px;
}
</style>
