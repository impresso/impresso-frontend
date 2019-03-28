<template lang="html">
  <i-layout-section class="bg-light">
    <div slot="header">
      <b-navbar  type="light" variant="light" class="border-bottom">
        <section class='pt-2 pb-1'>
          <span class="label small-caps">{{$t('list_of_newspapers')}}</span>
          <h3 class='mb-1'>{{ $t('newspapers_lines') }}</h3>
        </section>
      </b-navbar>
      <b-navbar class='m-0 p-0'>
        <!--
          <li class="p-2 border-right"><label >{{ $t('color by') }}</label>
            <i-dropdown v-model="colorBy" v-bind:options="colorByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li> -->

        <timeline class='ml-4'
          :values="pagesTimeline.values"
          :domain="[start, end]"
          :highlight="highlightA"
          v-on:highlight="onHighlight($event, 'A')"/>

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

    <!--  newspqper lifespans -->

    <!--  newspqper lifespans -->
    <newspapers-lines class="mx-5" v-model="newspapers" v-on:highlight="onHighlight($event, 'B')"/>



  </i-layout-section>
</template>
<script>
import NewspapersLines from './NewspapersLines';
import Timeline from './modules/Timeline';

export default {
  data: () => ({
    pagesTimeline: {
      name: '',
      values: [],
    },
    start: 1738,
    end: 2018,
    highlights: ['A', 'B'],
    highlightA: null,
    highlightB: null,
    domainType: 'absolute',
  }),
  computed: {
    newspapers() {
      return this.$store.state.newspapers.list.newspapers;
    },
    domainTypeOptions() {
      return [
        {
          value: 'absolute',
          text: this.$t('topicmodel'),
        },
        {
          value: 'relative',
          text: this.$t('language'),
        },
      ];
    },
  },
  async mounted() {
    // global timeline per year, with n. of pages, n. of empty pages, n.of corrupted pages.
    this.pagesTimeline = await this.$store.dispatch('newspapers/LOAD_PAGES_TIMELINE');
  },
  methods: {
    onHighlight(event, origin) {
      // console.log(event, origin);
      this.highlights.forEach((vis) => {
        if (vis !== origin) {
          this[`highlight${vis}`] = event.datum;
        }
      });
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
    "newspapers_lines": "List of newspapers timelines"
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
