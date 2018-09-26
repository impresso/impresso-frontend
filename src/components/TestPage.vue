<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right">

      <tabbed-nav v-model="tabs"></tabbed-nav>
      <!-- Tab panes -->
      <div class="tab-content py-3">
        <div class="tab-pane active" id="tab-1" role="tabpanel"
          aria-labelledby="home-tab">home</div>
        <div class="tab-pane" id="tab-2" role="tabpanel"
          aria-labelledby="profile-tab">Profile</div>
        <div class="tab-pane" id="tab-3" role="tabpanel"
          aria-labelledby="messages-tab">Messages</div>
      </div>

    </i-layout-section>
    <i-layout-section>
      <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
        <b-navbar-nav class="section px-3 py-3 pr-auto border-right">
          <label class="mr-1">hey</label>
        </b-navbar-nav>
      </b-navbar>
    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchBar from './SearchBar';
import TabbedNav from './modules/TabbedNav';

export default {
  data: () => ({
    tabs: [
      {
        label: 'thijs',
      },
      {
        label: 'daniele',
        disabled: true,
      },
      {
        label: 'paul',
        active: true,
      },
    ],
  }),
  methods: {
    getActiveTab() {
      return this.tabs.find(t => t.active === true);
    },
  },
  components: {
    'tabbed-nav': TabbedNav,
    'search-bar': SearchBar,
  },
  computed: {

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
