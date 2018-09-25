<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right">

      <b-nav tabs class="bg-light pl-2 pt-2">
        <b-nav-item class="small-caps" href="#tab-1" active>Active <br>Tab</b-nav-item>
        <b-nav-item class="small-caps" href="#tab-2">Link <br>Tab</b-nav-item>
        <b-nav-item class="small-caps" href="#tab-3">Another <br>Link Tab</b-nav-item>
        <b-nav-item class="small-caps" disabled>Disabled <br>Tab</b-nav-item>
      </b-nav>

      <!-- Tab panes -->
      <div class="tab-content py-3">
        <div class="tab-pane active" id="tab-1" role="tabpanel"
          aria-labelledby="home-tab">home</div>
        <div class="tab-pane" id="tab2" role="tabpanel"
          aria-labelledby="profile-tab">Profile</div>
        <div class="tab-pane" id="tab-3" role="tabpanel"
          aria-labelledby="messages-tab">Messages</div>
      </div>

    <div class="px-4 py-4 border-bottom">
      <search-bar />
    </div>
  </i-layout-section>
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
      <b-navbar-nav class="section px-3 py-3 pr-auto border-right">
        <label class="mr-1">{{$t("label_group")}}</label>
        <i-dropdown v-model="groupBy" v-bind:options="groupByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 section border-right">
        <label class="mr-1">{{$t("label_order")}}</label>
        <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 section">
        <label class="mr-1">{{$t("label_display")}}</label>
        <b-nav-form>
          <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>

  </i-layout-section>
</i-layout>
</template>

<script>
import SearchBar from './SearchBar';

export default {
  computed: {

  },
  methods: {

  },
  components: {

    'search-bar': SearchBar,
  },
  mounted() {

  },
  beforeDestroy() {

  },
};
</script>

<style lang="less">
.navbar-nav {
    flex-direction: row;
    align-items: center;
    label {
      margin-bottom: 0;
      line-height: 1.5;
    }
}
</style>

<i18n>
{
  "en": {
    "label_display": "Display As",
    "label_order": "Order By",
    "label_group": "Group By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_date": "Date",
    "sort_relevance": "Relevance",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "order_issues": "Issue",
    "order_pages": "Page",
    "order_articles": "Article",
    "order_sentences": "Sentence"
  },
  "nl": {
    "label_display": "Toon Als",
    "label_order": "Sorteer Op",
    "label_group": "Rangschikken Per",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_date": "Datum",
    "sort_relevance": "Relavantie",
    "display_button_list": "Lijst",
    "display_button_tiles": "Tegels",
    "order_issues": "Uitgave",
    "order_pages": "Pagina",
    "order_articles": "Artikel",
    "order_sentences": "Zin"
  }
}
</i18n>
