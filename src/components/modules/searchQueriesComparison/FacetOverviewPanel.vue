<template>
  <div class="facet-overview-panel">
    <!-- timeline type -->
    <div v-if="type === 'timeline'">
      <div class="tb-title m-0 mt-2 label small-caps font-weight-bold">
        {{
          $tc(`label.${facet}.optionsTitle`)
        }}
      </div>
      <span class="small">
      {{
        $tc(`label.${facet}.optionsDescription`)
      }}
      </span>
      <div class="row mb-3">
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
              {{ $d(tooltipScope.tooltip.item.t, 'year', 'en') }} &middot;
              <b v-html="$tc('numbers.results', tooltipScope.tooltip.item.w, {
                n: $n(tooltipScope.tooltip.item.w),
              })"/>
            </div>
          </div>
        </timeline>
      </div>
    </div>

    <!-- bar type -->
    <div v-if="type === 'bars'">
      <stacked-bars-panel
        @hovered="onHoverBar"
        :hover-id="hoverId"
        :search-query-id="searchQueryId"
        class="row"
        :label="$tc(`label.${facet}.title`, 1)"
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
  if (isNaN(rangeSize)) return timelineValues;

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
  }),
  props: {
    hoverId: {
      type: String,
    },
    searchQueryId: String,
    facet: String, // any of the common facet types: newspaper, language, etc.
    type: {
      type: String, // type of the visualisation component
      validator: t => ['timeline', 'bars'].includes(t),
    },
    values: {
      type: Array, // array of `Bucket` objects.
      default: () => [],
      validator: v => v.map(i => i instanceof Bucket),
    },
    timelineHighlightValue: Object, // a `{ w, t }` object (see Timeline.js)
    timelineHighlightEnabled: Boolean,
    timelineDomain: {
      // a tuple of the extent of the timeline in time values (e.g. years): `[1904, 1925]`
      type: Array,
      validator: v => v.length === 0 || v.length === 2,
    },
  },
  components: {
    StackedBarsPanel,
    Timeline,
  },
  computed: {
    title() {
      return this.$tc(`label.${this.facet}.title`, this.values.length || 1);
    },
    timelineValues() {
      const v = this.values
        .map(({ val, count }) => ({ t: parseInt(val, 10), w: count }))
        .sort(timelineValuesSorter);
      return fillEmptyYearsWithZeros(v, this.timelineDomainRange);
    },
    timelineDomainRange() {
      if (this.timelineDomain.length === 2) {
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
    onHoverBar(val) {
      this.$emit('hovered', String(val));
    },
  },
};
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";
  @import "@/styles/variables.sass";

  .facet-overview-panel{
    &.left {
      .viz-bar{
        background-color: $inspect-compare-left-panel-color;
      }
      .d3-timeline g.context path.curve{
        stroke: $inspect-compare-left-panel-color;
      }
    }
    &.right {
      .viz-bar{
        background-color: $inspect-compare-right-panel-color;
      }
      .d3-timeline g.context path.curve{
        stroke: $inspect-compare-right-panel-color;
      }
    }
    &.middle {
      .viz-bar{
        background-color: $inspect-compare-middle-panel-color;
      }
      .d3-timeline g.context path.curve{
        stroke: $inspect-compare-middle-panel-color;
      }
    }
  }
</style>
