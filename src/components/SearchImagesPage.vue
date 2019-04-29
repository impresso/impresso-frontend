<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right border-tertiary">
      <div slot="header" class="border-bottom border-tertiary bg-light">
          <b-tabs pills class="border-bottom border-tertiary">
            <template slot="tabs">
              <b-nav-item :to="{ name:'search'}"  ><span v-html="$t('tabs.text')"/></b-nav-item>
              <b-nav-item :to="{ name:'searchImages'}" exact><span v-html="$t('tabs.images')"/></b-nav-item>
            </template>
          </b-tabs>
          <div class="py-3 px-3">
            [IMAGES-AUTOCOMPLETE]
          </div>
        </div>
        <div class="p-3">
          [IMAGES-FILTERS]
        </div>
      </div>
    </i-layout-section>
    <i-layout-section>
      <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
        <b-navbar-nav class="px-3 pt-3 pb-2 border-right">
          <label class="mr-1">{{$t("label_order")}}
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary" class="pl-1"></i-dropdown>
          </label>
        </b-navbar-nav>
      </b-navbar>

      <div class="p-1">
        <b-container fluid>
          <b-row class="pb-5">
            <b-col cols="6" sm="12" md="6" lg="4" v-for="(searchResult, index) in searchResultsImages" v-bind:key="searchResult.uid">
              <search-results-image-item
              v-bind:searchResult="searchResult"
              checkbox=false />
            </b-col>
          </b-row>
        </b-container>
      </div>

    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchResultsImageItem from './modules/SearchResultsImageItem';


export default {
  components: {
    SearchResultsImageItem,
  },
  data: () => ({
    searchResultsImages: [],
    dataURL: 'https://impresso-project.ch/api/images/',
  }),
  mounted() {
    // this.searchResultsImages = JSON.stringify(this.dataURL);
    // console.log(this.searchResultsImages);
    fetch(this.dataURL)
      .then(response => response.text())
      .then((data) => {
        this.searchResultsImages = JSON.parse(data).data;
      });
  },
  computed: {
    orderByOptions: {
      get() {
        return [
          {
            value: 'relevance',
            text: `${this.$t('sort_relevance')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-relevance',
            text: `${this.$t('sort_relevance')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'date',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-date',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.search.orderBy;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_ORDER_BY', val);
        this.search(1);
      },
    },
  },
  methods: {
  },
};
</script>

<style lang="scss">
</style>

<i18n>
  {
    "en": {
      "tabs": {
        "text": "search articles",
        "images": "search images"
      },
      "label_order": "Order By",
      "sort_asc": "Ascending",
      "sort_desc": "Descending",
      "sort_date": "Date",
      "sort_relevance": "Relevance"
    }
  }
</i18n>
