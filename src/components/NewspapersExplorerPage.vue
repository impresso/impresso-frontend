<template lang="html">
  <i-layout-section class="bg-light">
    <div slot="header">
      <b-navbar  type="light" variant="light" class="border-bottom">
        <section class='pt-2 pb-1'>
          <span class="label small-caps">{{$t('summary')}}</span>
          <h3 class='mb-1'>{{ $t('list_of_newspapers') }}</h3>
        </section>
      </b-navbar>
    </div>

    <!--  newspqper lifespans -->

    <!--  newspqper lifespans -->
    <newspapers-lines class="mx-5" v-model="newspapers"/>


    <pre>{{ pagesTimeline }}</pre>
  </i-layout-section>
</template>
<script>
import NewspapersLines from './NewspapersLines';

export default {
  data: () => ({
    pagesTimeline: {
      name: '',
      values: [],
    },
  }),
  computed: {
    newspapers() {
      return this.$store.state.newspapers.list.newspapers;
    },
  },
  async mounted() {
    // global timeline per year, with n. of pages, n. of empty pages, n.of corrupted pages.
    this.pagesTimeline = await this.$store.dispatch('newspapers/LOAD_PAGES_TIMELINE');
  },
  components: {
    // Tooltip,
    NewspapersLines,
  },
};
</script>

<style lang="scss">

  #d3-small-multiples{
    background-color: darkgrey;
  }



</style>

<i18n>
{
  "en": {
    "label_order": "Order By",
    "list_of_newspapers": "Newspapers"
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
