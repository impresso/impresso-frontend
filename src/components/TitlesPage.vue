<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="300px" class="border-right">
      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="px-3 py-3">
            <label class="mr-1">{{$t("label_order")}}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </b-navbar-nav>
        </b-navbar>
        <div class="p-2">
          <input
            type="text"
            class="form-control"
            placeholder="Search"
            name=""
            value=""
            v-model="query"
            v-on:keyup.enter="loadList(1)" />
        </div>
      </div>
      <div v-for="t in titles" class="border-bottom">
        <router-link
          class="px-3 py-2 d-block"
          v-bind:class="{active: t.uid === titleUid}"
          v-bind:to="{name: 'titles', params: {title_uid: t.uid}}">
          <strong>{{t.name}}</strong>
          <br>
          ({{t.startYear}} - {{t.endYear}})
        </router-link>
      </div>
      <div slot="footer" class="p-2 border-top">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPaginationList"
          v-bind:showDescription="true" />
      </div>
    </i-layout-section>
    <i-layout-section>
      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light">
          {{title.name}}
        </b-navbar>
      </div>
      <div class="p-4">
        <b-row>
          <b-col
            sm="12" lg="6"
            v-for="(issue, index) in issues"
            class="mb-4">
            <div class="border">
              <div class="p-3 border-bottom">
                {{issue.uid}}
              </div>
              <issue-viewer v-model="issues[index]" />
            </div>
          </b-col>
        </b-row>
      </div>
      <div slot="footer" class="p-2 border-top">
        <pagination
          v-bind:perPage="paginationDetail.perPage"
          v-bind:currentPage="paginationDetail.currentPage"
          v-bind:totalRows="paginationDetail.totalRows"
          v-on:change="onInputPaginationDetail"
          v-bind:showDescription="true" />
      </div>
    </i-layout-section>
    <i-layout-section width="250px" class="border-left">
      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light" >
          metadata
        </b-navbar>
      </div>
      <div class="p-4 border-bottom">
        <p>Year of first issue<br>{{title.startYear}}</p>
        <p>Year of last issue<br>{{title.endYear}}</p>
        <p>Years running<br>{{title.deltaYear}}</p>

        <p v-show="title.countArticles">Articles<br>{{title.countArticles}}</p>
        <p v-show="title.countIssues">Issues<br>{{title.countIssues}}</p>
        <p v-show="title.countPages">Pages<br>{{title.countPages}}</p>
      </div>
      <div class="p-4">
        <p v-for="property in title.properties">{{property.name}}<br>{{property.newspapers_metadata.value}}</p>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import Pagination from './modules/Pagination';
import IssueViewer from './modules/IssueViewer';

export default {
  data: () => ({
  }),
  computed: {
    paginationList() {
      return this.$store.state.titles.list.pagination;
    },
    paginationDetail() {
      return this.$store.state.titles.detail.pagination;
    },
    titles() {
      return this.$store.state.titles.list.titles;
    },
    title: {
      get() {
        return this.$store.state.titles.detail.title;
      },
      set(title) {
        this.$store.commit('titles/UPDATE_DETAIL_TITLE', title);
        this.$store.dispatch('titles/LOAD_TITLE_ISSUES');
      },
    },
    titleUid() {
      return this.$route.params.title_uid;
    },
    issues() {
      return this.$store.state.titles.detail.issues;
    },
    query: {
      get() {
        return this.$store.state.titles.list.query;
      },
      set(val) {
        this.$store.commit('titles/UPDATE_LIST_QUERY', val);
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'alphabetical',
            text: `${this.$t('sort_alphabetical')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-alphabetical',
            text: `${this.$t('sort_alphabetical')} ${this.$t('sort_desc')}`,
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
        // return 'date';
        return this.$store.state.titles.list.orderBy;
      },
      set(val) {
        this.$store.commit('titles/UPDATE_LIST_ORDER_BY', val);
        this.loadList(1);
      },
    },
  },
  methods: {
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('titles/UPDATE_LIST_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }

      return this.$store.dispatch('titles/LOAD_LIST');
    },
    onInputPaginationList(page = 1) {
      this.loadList(page);
    },
    loadIssues(page) {
      if (page !== undefined) {
        this.$store.commit('titles/UPDATE_DETAIL_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }

      return this.$store.dispatch('titles/LOAD_TITLE_ISSUES');
    },
    onInputPaginationDetail(page = 1) {
      this.loadIssues(page);
    },
  },
  mounted() {
    this.loadList().then((res) => {
      if (this.$route.params.title_uid === undefined) {
        this.$router.push({
          params: {
            title_uid: res.data[0].uid,
          },
        });
      }
      this.loadIssues(1);
    });
  },
  components: {
    Pagination,
    IssueViewer,
  },
  watch: {
    titleUid: {
      immediate: true,
      handler(val) {
        if (val !== undefined) {
          this.title = this.titles.find(title => title.uid === this.titleUid);
        }
      },
    },
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.active {
    background: $clr-accent-secondary;
}
</style>

<i18n>
{
  "en": {
    "label_order": "Order By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_date": "Date",
    "sort_alphabetical": "Alphabetical"
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
