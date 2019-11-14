<template lang="html">
  <div class="d-flex wrapper mx-0">
    <!-- label -->
    <div class="tb-title label small-caps font-weight-bold my-2">{{label}}</div>

    <!-- bars -->
    <div class="row mx-0">
      <div class="col bg-light">

        <div :class="`bar-container row my-1 small ${hoverId === bucket.item.uid ? 'hilight' : ''}`"
          v-for="(bucket, idx) in buckets"
          v-on:mouseover="onHover(bucket.item.uid)"
          v-bind:key="idx">

          <viz-bar
            :percent="toScaledValue(bucket.count) * 100"
            :count="bucket.count"
            :uid="bucket.item.uid"
            :item="bucket.item"
            :type="facetType" />

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import VizBar from '../../base/VizBar';
import Bucket from '../../../models/Bucket';

export default {
  data: () => ({}),
  props: {
    label: String, // label of the chart
    hoverId: {
      type: String,
    },
    buckets: {
      type: Array,
      default: [],
      validator: buckets => buckets.map(b => b instanceof Bucket),
    },
    valueSuffix: String, // suffix appended to the value label
    facetType: String, // type of facet to render
  },
  components: {
    VizBar,
  },
  computed: {
    maxValue() {
      return Math.max(...this.buckets.map(b => b.count));
    },
  },
  methods: {
    toScaledValue(val) {
      return val / this.maxValue;
    },
    onHover(val) {
      this.$emit('hovered', String(val));
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "impresso-theme/src/scss/variables.sass";

  .wrapper {
    flex-direction: column;
    flex-grow: 1;
  }

  .tb-title {
  }

  .bar-container {

    &.hilight {
      background-color: transparentize($clr-accent, 0);
    }

  }
</style>
