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
      <div v-for="n in newspapers" class="border-bottom">
        <router-link
          class="px-3 py-2 d-block"
          v-bind:class="{active: n.uid === newspaperUid}"
          v-bind:to="{name: 'newspapers', params: {newspaper_uid: n.uid}}">
          <strong>{{n.name}}</strong>
          <br>
          ({{n.startYear}} - {{n.endYear}})
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
          {{newspaper.name}}
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
        <p>Year of first issue<br>{{newspaper.startYear}}</p>
        <p>Year of last issue<br>{{newspaper.endYear}}</p>
        <p>Years running<br>{{newspaper.deltaYear}}</p>

        <p v-show="newspaper.countArticles">Articles<br>{{newspaper.countArticles}}</p>
        <p v-show="newspaper.countIssues">Issues<br>{{newspaper.countIssues}}</p>
        <p v-show="newspaper.countPages">Pages<br>{{newspaper.countPages}}</p>
      </div>
      <div class="p-4">
        <p v-for="property in newspaper.properties">{{property.name}}<br>{{property.newspapers_metadata.value}}</p>
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
      return this.$store.state.newspapers.list.pagination;
    },
    paginationDetail() {
      return this.$store.state.newspapers.detail.pagination;
    },
    newspapers() {
      return this.$store.state.newspapers.list.newspapers;
    },
    newspaper: {
      get() {
        return this.$store.state.newspapers.detail.newspaper;
      },
      set(newspaper) {
        this.$store.commit('newspapers/UPDATE_DETAIL_NEWSPAPER', newspaper);
        this.$store.dispatch('newspapers/LOAD_NEWSPAPER_ISSUES');
      },
    },
    newspaperUid() {
      return this.$route.params.newspaper_uid;
    },
    issues() {
      return this.$store.state.newspapers.detail.issues;
    },
    query: {
      get() {
        return this.$store.state.newspapers.list.query;
      },
      set(val) {
        this.$store.commit('newspapers/UPDATE_LIST_QUERY', val);
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
        return this.$store.state.newspapers.list.orderBy;
      },
      set(val) {
        this.$store.commit('newspapers/UPDATE_LIST_ORDER_BY', val);
        this.loadList(1);
      },
    },
  },
  methods: {
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('newspapers/UPDATE_LIST_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }

      return this.$store.dispatch('newspapers/LOAD_LIST');
    },
    onInputPaginationList(page = 1) {
      this.loadList(page);
    },
    loadIssues(page) {
      if (page !== undefined) {
        this.$store.commit('newspapers/UPDATE_DETAIL_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }

      return this.$store.dispatch('newspapers/LOAD_NEWSPAPER_ISSUES');
    },
    onInputPaginationDetail(page = 1) {
      this.loadIssues(page);
    },
  },
  mounted() {
    this.loadList().then((res) => {
      if (this.$route.params.newspaper_uid === undefined) {
        this.$router.push({
          params: {
            newspaper_uid: res.data[0].uid,
          },
        });
      }
      this.newspaper = this.newspapers.find(newspaper => newspaper.uid === this.newspaperUid);
    });
  },
  components: {
    Pagination,
    IssueViewer,
  },
  watch: {
    newspaperUid: {
      immediate: false,
      handler(val) {
        if (val !== undefined) {
          this.newspaper = this.newspapers.find(newspaper => newspaper.uid === this.newspaperUid);
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
