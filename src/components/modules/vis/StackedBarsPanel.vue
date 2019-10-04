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
             v-for="([label, value, scaledValue], idx) in scaledItems"
             v-bind:key="idx">
          <div class="col">
            <div class="bar">
              <div class="px-1">{{label}}</div>
              <div class="px-1">{{formatValue(value)}}{{valueSuffix}}</div>
            </div>
            <div class="scale" v-bind:style="`width: ${scaledValue * 100}%`"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helpers from '@/plugins/Helpers';

export default {
  data: () => ({
    scaledItems: [],
  }),
  props: ['label', 'items', 'valueSuffix'],
  watch: {
    items: {
      handler(items) {
        const maxValue = Math.max(...(items || []).map(([, value]) => value));
        this.scaledItems = (items || [])
          .map(([label, value]) => [label, value, value / maxValue]);
      },
      immediate: true,
    },
  },
  methods: {
    formatValue: val => Helpers.numbers.toFixedOptional(val, 2),
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
