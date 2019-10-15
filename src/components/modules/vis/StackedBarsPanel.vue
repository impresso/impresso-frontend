<template lang="html">
  <div class="d-flex wrapper">
    <!-- label -->
    <div class="row">
      <div class="col">
        <span class="tb-title small-caps font-weight-bold">{{label}}</span>
      </div>
    </div>
    <!-- bars -->
    <div class="row">
      <div class="col">
        
        <!-- bar -->
        <div class="row bar-container" 
             v-for="(bucket, idx) in buckets"
             v-bind:key="idx">
          <div class="col">
            <div class="bar">
              <div class="px-1">
                <item-label :item="bucket.item" :type="facetType"/>
              </div>
              <div class="px-1">{{formatValue(toScaledValue(bucket.count))}}{{valueSuffix}}</div>
            </div>
            <div class="scale" v-bind:style="`width: ${toScaledValue(bucket.count) * 100}%`"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ItemLabel from '../lists/ItemLabel';
import Bucket from '../../../models/Bucket';

export default {
  data: () => ({}),
  props: {
    label: String, // label of the chart
    buckets: {
      type: Array,
      default: [],
      validator: buckets => buckets.map(b => b instanceof Bucket),
    },
    valueSuffix: String, // suffix appended to the value label
    facetType: String, // type of facet to render
  },
  components: {
    ItemLabel,
  },
  computed: {
    maxValue() {
      return Math.max(...this.buckets.map(b => b.count));
    },
  },
  methods: {
    formatValue(val) {
      return this.$helpers.numbers.toFixedOptional(val, 2);
    },
    toScaledValue(val) {
      return val / this.maxValue;
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
    font-size: .95em;
  }

  .bar-container {
    margin: .3em 0;

    .col {
      position: relative;
      border-bottom: 1px solid scale-color($clr-grey-800, $lightness: 50%);
      padding: 0;
    }

    .bar {
      display: flex;
      justify-content: space-between;
      div {
        white-space: nowrap;
        overflow: hidden;
        font-size: .75em;
      }
    }
    .scale {
      background: scale-color($clr-grey-800, $lightness: 30%);
      position: absolute;
      height: 100%;
      top: 0;
      z-index: -1;
    }
  }
</style>
