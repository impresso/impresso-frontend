<template>
  <div>
    <!-- timeline type -->
    <div v-if="type === 'timeline'">
      <span class="row tb-title small-caps font-weight-bold">{{title}}</span>
      <div class="row mt-5">
        <timeline
              :contrast="false"
              :values="timelineValues"
              @highlight="onHighlight"
              @highlight-off="onHighlightOff"
              :highlight="timelineHighlightValue"
              :highlight-enabled-state="timelineHighlightEnabled"
              :brushable="false">
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
        :label="title"
        :buckets="values"
        :facet-type="facet"/>
    </div>

    <hr/>
  </div>
</template>

<script>
import StackedBarsPanel from '../vis/StackedBarsPanel';
import Timeline from '../Timeline';
import Bucket from '../../../models/Bucket';

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
  data: () => ({}),
  props: {
    facet: String, // any of the common facet types: newspaper, language, etc.
    type: {
      type: String, // type of the visualisation component
      validator: t => ['timeline', 'bars'].includes(t),
    },
    title: String,
    values: {
      type: Array, // array of `Bucket` objects.
      default: [],
      validator: v => v.map(i => i instanceof Bucket),
    },
    timelineHighlightValue: Object, // a `{ w, t }` object (see Timeline.js)
    timelineHighlightEnabled: Boolean,
    timelineDomain: {
      // a tuple of the extent of the timeline in time values (e.g. years): `[1904, 1925]`
      type: Array,
      validator: v => v.length === 2,
    },
  },
  components: {
    StackedBarsPanel,
    Timeline,
  },
  computed: {
    timelineValues() {
      const v = this.values
        .map(({ val, count }) => ({ t: parseInt(val, 10), w: count }))
        .sort(timelineValuesSorter);
      return fillEmptyYearsWithZeros(v, this.timelineDomainRange);
    },
    timelineDomainRange() {
      if (this.timelineDomain) {
        return this.timelineDomain;
      }
      const keys = this.values.map(({ val }) => val).sort();
      return keys.length > 0 ? [keys[0], keys[keys.length - 1]] : [];
    },
  },
  methods: {
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