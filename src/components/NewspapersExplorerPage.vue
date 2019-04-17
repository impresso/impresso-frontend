<template lang="html">
  <i-layout-section class="bg-light" v-on:scroll='onScroll'>
    <div slot="header">
      <b-navbar  type="light" variant="light" class="border-bottom">
        <section class='pt-2 pb-1'>
          <span class="label small-caps">{{$t('list_of_newspapers')}}</span>
          <h3 class='mb-1'>{{ $t('newspapers_lines') }}</h3>
        </section>
      </b-navbar>
      <b-navbar class='m-0 px-3 border-bottom'>
        <section class="d-flex w-100" style="position: relative; height: 80px;">
          <b-navbar-nav style='width: 200px'>
            <label>timeline of</label>
            <i-dropdown v-model="valueType" v-bind:options="valueTypesOptions" size="sm" variant="outline-primary" />
          </b-navbar-nav>
          <b-navbar-nav style='position: absolute; left: 200px; right: 50px'>
              <timeline
                    contrast="true"
                    :values="values"
                    :domain="[start, end]"
                    :highlight="highlightA"
                    v-on:highlight="onHighlight($event, 'A')">
                <div slot-scope="tooltipScope">
                  <div v-if="tooltipScope.tooltip.item">
                    {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
                    <b>{{ tooltipScope.tooltip.item.w }}</b> {{ totalLabel }}
                    <br />
                    <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
                    &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
                    ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
                    </span>
                  </div>
                </div>
              </timeline>
          </b-navbar-nav>

      </section>

      </b-navbar>
      <!-- <b-navbar  type="light" variant="light" class="border-bottom">
        <b-input-group class="mini" :prepend="$t('from')">
          <b-form-input  v-model='start' />
        </b-input-group>

        <b-input-group class="mini" prepend="to">
          <b-form-input v-model='end' />
        </b-input-group>
      </b-navbar> -->
    </div>

    <!--  newspaper lifespans -->
    <newspapers-lines class="m-3"
      v-model="newspapers"
      :margin="{left: 210, right:60}"
      :scrollTop="scrollTop"
      :highlight="highlightB" v-on:highlight="onHighlight($event, 'B')"
    />
  </i-layout-section>
</template>
<script>
import NewspapersLines from './NewspapersLines';
import Timeline from './modules/Timeline';

export default {
  data: () => ({
    values: [],
    start: 1738,
    end: 2018,
    highlights: ['A', 'B'],
    highlightA: null,
    highlightB: null,
    valueType: 'pages',
    scrollTop: 0,
  }),
  computed: {
    newspapers() {
      return this.$store.state.newspapers.list.newspapers;
    },
    valueTypesOptions() {
      return [
        {
          value: 'pages',
          text: this.$t('pages.label'),
        },
        {
          value: 'issues',
          text: this.$t('issues.label'),
        },
      ];
    },
    totalLabel() {
      return this.$t(`${this.valueType}.total`);
    },
    contrastLabel() {
      return this.$t(`${this.valueType}.contrast`);
    },
  },
  async mounted() {
    // global timeline per year, with n. of pages, n. of empty pages, n.of corrupted pages.
    const timelines = await this.$store.dispatch('newspapers/LOAD_TIMELINES');
    this.timelines = {
      pages: timelines[0],
      issues: timelines[1],
    };
    this.values = this.timelines[this.valueType].values;
    // this.issuesTimeline = await this.$store.dispatch('newspapers/LOAD_ISSUES_TIMELINE');
  },
  methods: {
    percent(a, t) {
      return t > 0 ? Math.round(100 * (a / t)) : 0;
    },
    onScroll(e) {
      this.scrollTop = e.scrollTop;
    },
    onHighlight(event, origin) {
      // console.log(event, origin);
      this.highlights.forEach((vis) => {
        if (vis !== origin) {
          this[`highlight${vis}`] = event.datum;
        }
      });
    },
  },
  watch: {
    valueType: {
      immediate: false,
      handler(val) {
        if (this.timelines[val]) {
          this.values = this.timelines[val].values;
        }
      },
    },

  },
  components: {
    // Tooltip,
    NewspapersLines,
    Timeline,
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

<i18n>
{
  "en": {
    "label_order": "Order By",
    "list_of_newspapers": "Newspapers",
    "newspapers_lines": "List of newspapers timelines",
    "pages": {
        "label": "pages per year",
        "total": "pages in total",
        "contrast": "missing pages"
    },
    "issues": {
        "label": "issues per year",
        "total": "issues in total",
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
