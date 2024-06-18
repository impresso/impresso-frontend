<template lang="html">
  <i-layout-section main v-on:scroll='onScroll'>
    <template v-slot:header>
      <b-navbar  type="light" variant="light" class="border-bottom">
        <section class='pt-2 pb-1'>
          <span class="label small-caps">{{$t('list_of_newspapers')}}</span>
          <small><info-button name="which-newspapers" class="text-muted" /></small>
          <h3 class='mb-1'>{{ $t('newspapers_lines') }}
          </h3>
        </section>
      </b-navbar>
      <b-navbar class='m-0 px-3 border-bottom'>
        <section class="d-flex w-100" style="position: relative; height: 80px;">
          <b-navbar-nav style='width: 150px'>
            <i-dropdown v-model="valueType"
            style="height:30px; margin-top:10px" v-bind:options="valueTypesOptions" size="sm" variant="outline-primary" />
          </b-navbar-nav>
          <b-navbar-nav style='position: absolute; left: 150px; right: 50px'>
              <timeline
                    :contrast="true"
                    :values="values"
                    :domain="[start, end]"
                    :highlight="highlightA"
                    v-on:highlight="onHighlight($event, 'A')">
                <template v-slot="tooltipScope">
                  <div v-if="tooltipScope.tooltip.item">
                    {{ tooltipScope.tooltip.item.t ? $d(tooltipScope.tooltip.item.t, 'year') : '' }}
                    <br />
                    <b>{{ tooltipScope.tooltip.item.w }}</b> {{ totalLabel }}
                    <br />
                    <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
                    &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
                    ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
                    </span>
                  </div>
                </template>
              </timeline>
          </b-navbar-nav>

      </section>

      </b-navbar>
    </template>
    <!--  newspaper lifespans -->
    <newspapers-lines class="m-3"
      :modelValue="newspapers"
      :margin="{left: 210, right:60}"
      :scrollTop="scrollTop"
      :highlight="highlightB" v-on:highlight="onHighlight($event, 'B')"
    />
  </i-layout-section>
</template>
<script>
import NewspapersLines from './NewspapersLines.vue';
import Timeline from './modules/Timeline.vue';
import InfoButton from './base/InfoButton.vue';
import { pagesTimelines, issuesTimeline } from '@/services';
import Helpers from '@/plugins/Helpers'

export default {
  props: {
    newspapers: Array,
  },
  data: () => ({
    start: 1738,
    end: 2018,
    highlights: ['A', 'B'],
    highlightA: null,
    highlightB: null,
    valueType: 'pages',
    scrollTop: 0,
    facets: [],
    facetTypes: ['newspaper', 'country', 'language', 'type', 'person', 'location', 'topic', 'partner', 'accessRight', 'collection'],
    timelinesValues: {
      pages: [],
      issues: [],
    }
  }),
  computed: {
    valueTypesOptions() {
      return ['pages', 'issues'].map(value => ({
        value,
        text: this.$t(`${value}.label`),
      }))
    },
    totalLabel() {
      return this.$t(`${this.valueType}.total`);
    },
    contrastLabel() {
      return this.$t(`${this.valueType}.contrast`);
    },
    values() {
      return this.timelinesValues[this.valueType];
    }
  },
  mounted() {
    return Promise.all([
      pagesTimelines.get('stats', {}),
      issuesTimeline.get('stats', {})
    ]).then(([ pages, issues ]) => {
      const pagesValues = pages.values.length
        ? Helpers.timeline.addEmptyIntervals(pages.values.sort((a, b) => a.t - b.t))
        : [];
      const issuesValues = issues.values.length
        ? Helpers.timeline.addEmptyIntervals(issues.values.sort((a, b) => a.t - b.t))
        : [];
      this.timelinesValues = {
        pages: pagesValues,
        issues: issuesValues,
      };
    });
  },
  methods: {
    percent(a, t) {
      return t > 0 ? Math.round(100 * (a / t)) : 0;
    },
    onScroll(e) {
      this.scrollTop = e.scrollTop;
    },
    onHighlight(event, origin) {
      // console.info(event, origin);
      this.highlights.forEach((vis) => {
        if (vis !== origin) {
          this[`highlight${vis}`] = event.datum;
        }
      });
    }
  },
  components: {
    // Tooltip,
    NewspapersLines,
    Timeline,
    InfoButton,
  },
};
</script>

<style scoped lang="scss">

  #d3-small-multiples{
    background-color: darkgrey;
  }

  .contrast{
    color: coral;
  }
  .mini {
    width: 120px;
  }

  input.form-control{
    width: 50px;
  }

  .input-group-text{
    background: transparent;
    border: 0px solid transparent;
    font-variant: small-caps;
    font-size: 0.9rem;
    width: 50px;
    text-align: right;
  }

</style>

<i18n lang="json">
{
  "en": {
    "label_order": "Order By",
    "list_of_newspapers": "Newspapers",
    "newspapers_lines": "Newspaper timelines",
    "pages": {
        "label": "pages per year",
        "total": "pages (all newspapers)",
        "contrast": "missing pages"
    },
    "issues": {
        "label": "issues per year",
        "total": "issues (all newspapers)",
        "contrast": "missing issues"
    }
  },
  "nl": {
    "label_order": "Sorteer Op",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_date": "Datum",
    "sort_alphabetical": "Alfabetisch"
  }
}
</i18n>
