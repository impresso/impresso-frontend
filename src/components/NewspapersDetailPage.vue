<template lang="html">
    <i-layout-section>

      <div slot="header" class="border-bottom border-tertiary">
        <b-navbar type="light" variant="light" class='border-bottom'>
          <section class='pt-2'>
            <span class="label small-caps">
              <router-link :to="{ name: 'newspapers' }">&larr; {{$t("newspapers")}}</router-link>
            </span>
            <h3 class='mb-1'>
              {{newspaper.name}}
              ({{newspaper.startYear}} - {{newspaper.endYear}})</h3>
            <p class='mb-0' v-if='genealogy || publication'>
              <span v-if='genealogy'>{{ genealogy }}</span>
              <span v-if='publication'>{{ publication }}</span>
            </p>
          </section>

        </b-navbar>
        <b-navbar type="light" variant="light">
        <b-navbar-nav class="p-0 small-caps">
          <b-tabs pills>
            <!-- Add your b-tab components here-->
            <template slot="tabs">
              <b-nav-item :to="{ name:'newspaper'}" exact >{{$t('route.newspaper')}}</b-nav-item>
              <b-nav-item :to="{ name:'newspaper_metadata'}" exact >{{$t('route.newspaper_metadata')}}</b-nav-item>
            </template>
          </b-tabs>
        </b-navbar-nav>
        </b-navbar>
      </div>
      <div class='p-3' v-if='$route.name == "newspaper_metadata"'>
        <b-table :striped="true" :items="newspaper.properties"
             :fields='["name", "property"]'>
          <template slot="name" slot-scope="row">{{row.item.name}}</template>
          <template slot="property" slot-scope="row">{{row.item.newspapers_metadata.value}}</template>
        </b-table>

      </div>
      <div v-else>
        <div class="p-4">
          <b-row>
            <b-col
              sm="12" lg="3"
              v-for="(issue, i) in issues"
              v-bind:key="i"
              class="mb-4">
              <div class="border">
                <div class="p-3 border-bottom">
                  {{issue.uid}}
                </div>
                <issue-viewer v-model="issues[i]" />
              </div>
            </b-col>
          </b-row>
        </div>
        <div slot="footer" class="p-2 border-top">
          <pagination
            v-bind:perPage="limit"
            v-bind:currentPage="page"
            v-bind:totalRows="total"
            v-on:change="onInputPagination"
            v-bind:showDescription="true" />
        </div>
      </div>
  </i-layout-section>
</template>

<script>
import Newspaper from '@/models/Newspaper';
import Pagination from './modules/Pagination';
import IssueViewer from './modules/IssueViewer';


export default {
  data: () => ({
    total: 0,
    page: 1,
    limit: 36,
    issues: [],
    newspaper: new Newspaper(),
    tab: 'issues',

  }),
  computed: {
    genealogy: {
      get() {
        const noteGenealogy = this.newspaper.properties.find(d => d.name === 'noteGenealogy');
        if (noteGenealogy) {
          return noteGenealogy.newspapers_metadata.value;
        }
        return false;
      },
    },
    publication: {
      get() {
        const notePublicationDates = this.newspaper.properties.find(d => d.name === 'notePublicationDates');
        if (notePublicationDates) {
          return notePublicationDates.newspapers_metadata.value;
        }
        return false;
      },
    },
  },
  methods: {
    async onInputPagination(page) {
      this.issues = await this.getIssues({
        page,
      });
    },
    async getIssues({
      page = 1,
    } = {}) {
      const response = await this.$store.dispatch('newspapers/LOAD_ISSUES', {
        page,
        limit: this.limit,
        filters: [{
          type: 'newspaper',
          q: this.$route.params.newspaper_uid,
          context: 'include',
        }],
      });
      this.total = response.total;
      return response.data;
    },

    async getNewspaper() {
      return this.$store.dispatch('newspapers/LOAD_DETAIL', this.$route.params.newspaper_uid);
    },
  },
  async mounted() {
    // get newspaper data;
    this.issues = await this.getIssues();
    this.newspaper = await this.getNewspaper();
  },
  components: {
    Pagination,
    IssueViewer,
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.navbar-light .navbar-nav .nav-link{
  padding: 0.125rem 0.5rem 0.25rem;

  &.active {
    color: white;
    background-color: $clr-primary;
  }
}
</style>
<i18n>
{
  "en": {
    "route": {
      "newspaper": "show all first pages",
      "newspaper_metadata": "show newspaper metadata"
    }
  }
}
</i18n>
