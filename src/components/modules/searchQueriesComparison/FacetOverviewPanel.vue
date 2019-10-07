<template>
  <div>
    <!-- timeline type -->
    <div v-if="type === 'timeline'">
      <span class="row tb-title small-caps font-weight-bold">{{title}}</span>
      <div class="row mt-3">
        <timeline
              :key="timelineValuesChangeCounter"
              :contrast="false"
              :values="timelineValues"
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
    <div v-if="type === 'bars'">
      <stacked-bars-panel
        class="row"
        v-bind:label="title"
        v-bind:items="barValues"/>
    </div>

    <hr/>
  </div>
</template>

<script>
import StackedBarsPanel from '../vis/StackedBarsPanel';
import Timeline from '../Timeline';

const timelineValuesSorter = (a, b) => a.t - b.t;

function fillEmptyYearsWithZeros(timelineValues, timelineRange) {
  if (!timelineRange) return timelineValues;
  const [rangeMin, rangeMax] = timelineRange;
  const presentYears = timelineValues.map(({ t }) => t);

  const rangeSize = rangeMax - rangeMin;
  const range = [...Array(rangeSize).keys()].map(i => rangeMin + i);

  return range.reduce((values, year) => {
    if (presentYears.indexOf(year) === -1) {
      values.push({ t: year, w: 0 });
    }
    return values;
  }, timelineValues).sort(timelineValuesSorter);
}

export default {
  data: () => ({
    timelineValuesChangeCounter: 0,
  }),
  props: [
    'facet',
    'type',
    'title',
    'values',
    'timelineHighlightValue',
    'timelineHighlightEnabled',
    'timelineDomain',
  ],
  components: {
    StackedBarsPanel,
    Timeline,
  },
  watch: {
    values: {
      handler() {
        this.updateDomainRange();
        this.updateValues();
      },
      immediate: true,
    },
    timelineDomain: {
      handler() {
        this.updateDomainRange();
        this.updateValues();
      },
      immediate: true,
    },
  },
  methods: {
    updateValues() {
      if (this.type === 'timeline') {
        const v = this.values
          .map(({ val, count }) => ({ t: val, w: count }))
          .sort(timelineValuesSorter);
        this.timelineValues = fillEmptyYearsWithZeros(v, this.timelineDomainRange);
        this.timelineValuesChangeCounter += 1;
      }

      if (this.type === 'bars') {
        const getVal = this.facet === 'newspaper'
          ? val => val
          : val => this.$t(`buckets.${this.facet}.${val}`, val);
        this.barValues = this.values
          .map(({ val, count }) => [getVal(val), count]);
      }
    },
    updateDomainRange() {
      if (this.type !== 'timeline') return;

      if (this.timelineDomain) {
        this.timelineDomainRange = this.timelineDomain;
      } else {
        const keys = this.values.map(({ val }) => val).sort();
        this.timelineDomainRange = keys.length > 0 ? [keys[0], keys[keys.length - 1]] : [];
      }
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
