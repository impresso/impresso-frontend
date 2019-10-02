<template>
  <div class="d-flex">
    <div class="col">

      <!-- timeline type -->
      <div v-if="type === 'timeline'">
        <span class="row tb-title small-caps font-weight-bold">{{title}}</span>
        <div class="row mt-3">
          <timeline
                :contrast="false"
                :values="getTimelineValues()"
                :domain="getDomainRange()"
                @highlight="onHighlight"
                @highlight-off="onHighlightOff"
                :highlight="timelineHighlightValue"
                :highlight-enabled-state="timelineHighlightEnabled">
            <div slot-scope="tooltipScope">
              <div v-if="tooltipScope.tooltip.item">
                {{ $d(tooltipScope.tooltip.item.t, 'short', 'en') }} &middot;
                <b>{{ tooltipScope.tooltip.item.w }}</b>
              </div>
            </div>
          </timeline>
        </div>
      </div>

      <!-- bar type -->
      <div v-if="type === 'bars'" class="row">
        <stacked-bars-panel
          v-bind:label="title"
          v-bind:items="getBarsItems()"/>
      </div>
    </div>
  </div>
</template>

<script>
import StackedBarsPanel from '../vis/StackedBarsPanel';
import Timeline from '../Timeline';

export default {
  data: () => ({}),
  props: [
    'facet',
    'type',
    'title',
    'values',
    'timelineHighlightValue',
    'timelineHighlightEnabled',
  ],
  components: {
    StackedBarsPanel,
    Timeline,
  },
  methods: {
    getDomainRange() {
      const keys = this.values.map(({ val }) => val).sort();
      return keys.length > 0 ? [keys[0], keys[keys.length - 1]] : [];
    },
    getTimelineValues() {
      return this.values.map(({ val, count }) => ({ t: val, w: count })).sort((a, b) => a.t - b.t);
    },
    getBarsItems() {
      return this.values.map(({ val, count }) => [val, count]);
    },
    onHighlight(data) {
      this.$emit('timeline-highlight', { facetId: this.facet, data });
    },
    onHighlightOff() {
      this.$emit('timeline-highlight-off', { facetId: this.facet });
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "impresso-theme/src/scss/variables.sass";

  .tb-title {
    font-size: .95em;
  }

</style>
