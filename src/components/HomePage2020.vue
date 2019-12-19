<template>
<i-layout id="HomePage2020">
  <i-layout-section width="400px" class="">
    <!--  header -->
    <div slot="header" class="border-bottom border-secondary bg-dark">
      <search-tabs />
      <div class="py-3 px-3">
        <autocomplete v-on:submit="onSuggestion" />
      </div>
    </div>
    <!--  body -->

    <div class="bg-dark text-tertiary p-3 stats">

      <br>

      <viz-bar2 items="[
        {name: 'FR', count: 13},
        {name: 'DE', count: 23}]" />

      <br>

      <p>The impresso database is growing day-by-day. Currently there are </p>
      <p class="small-caps mt-3">Impresso data rundown</p>
      <b-row>
        <b-col>
          <i>29<span>newspapers collected</span></i>
          <i>1.2<span>billion pages scanned</span></i>
          <i>137<span>million articles identified</span></i>
        </b-col>
        <b-col>
          <i>5<span>languages <br>written</span></i>
          <i>6<span>countries <br>covered</span></i>
          <i>5.2<span>million entities disambiguated</span></i>
        </b-col>
      </b-row>

    </div>

  </i-layout-section>
  <i-layout-section>
    <div class="bg-dark text-tertiary p-3">
      <h1 class="text-white huge">Media Monitoring of the Past</h1>
      <h1 class="text-white">Today, 50 years ago.</h1>
      This section would need to be limited to registred users.
      <h1 class="text-white">Queries</h1>
    </div>
  </i-layout-section>
</i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';
import SearchTabs from './modules/SearchTabs';
import VizBar2 from './base/VizBar2';

export default {
  methods: {
    onSuggestion(suggestion) {
      this.$store.commit('search/ADD_FILTER', suggestion);
      this.search(1);
    },
    search(page) {
      if (page !== undefined) {
        this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
    },
  },
  components: {
    Autocomplete,
    SearchTabs,
    VizBar2,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";
.bg-dark {
  ul.nav.nav-pills .nav-item.active .nav-link {
    color: $clr-white;
    border-color: $clr-secondary;
    border-bottom-color: #343a40; // theme-color("dark")
  }

  .btn-primary,
  .input-group > .form-control, .input-group > .custom-select, .input-group > .custom-file {
    color: $clr-white;
    background-color: $clr-secondary;
    border-color: $clr-tertiary !important;
    &::placeholder {
      color: $clr-tertiary;
    }
  }
  .btn-primary {
    border-width: 0 0 1px 0;
  }
  ul.nav.nav-pills {
    border-color: $clr-secondary;
  }
}

  .stats {
    i {
      line-height: 1.05;
      font-style: normal;
      align-items: baseline;
      color: $clr-white;
      font-size: 500%;
      padding-bottom: 0.25rem;
      span {
        display: block;
        font-size: 22%;
        line-height: 1;
        font-variant: small-caps;
        text-transform: lowercase;
        color: $clr-tertiary;
      }
    }
  }

  .huge {
    font-size: 800%;
  }


  // .col {
  // }
  // div:first-child {
  //   text-align: right;
  //   color: $clr-white;
  //   font-size: 500%;
  //   span {
  //     font-size: 30%;
  //   }
  // }


//   p {
//     float: right;
//     width: 50%;
//   }
//   span {
//     float: left;
//     display: block;
//     width: 50%;
//     text-align: right;
//     margin-right: 0.5rem;
//     color: $clr-white;
//     font-size: 200%;
//   }
// }

</style>

<i18n>
{
  "en": {

  }
}
</i18n>
