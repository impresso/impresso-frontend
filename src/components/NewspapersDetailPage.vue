<template lang="html">
    <i-layout-section>

      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light">
          <section class='pt-2'>
            <span class="label small-caps">{{$t('newspaper')}}</span>
            <h3 class='mb-1'>
              {{newspaper.name}}
              ({{newspaper.startYear}} - {{newspaper.endYear}})</h3>
            <p class='mb-0' v-if='genealogy || publication'>
              <span v-if='genealogy'>{{ genealogy }}</span>
              <span v-if='publication'>{{ publication }}</span>
            </p>
          </section>

        </b-navbar>

      </div>
      <div class="p-4">
        <b-row>
          <b-col
            sm="12" lg="3"
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
          v-bind:perPage="limit"
          v-bind:currentPage="page"
          v-bind:totalRows="total"
          v-on:change="onInputPagination"
          v-bind:showDescription="true" />
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
      console.log('page', page);
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

<style lang="css">
</style>
