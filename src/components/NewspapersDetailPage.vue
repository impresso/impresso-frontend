<template lang="html">
    <i-layout-section main>
      <!-- slot:header  -->
      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light" >
          <section class='pt-2'>
            <span class="label small-caps">
              <router-link :to="{ name: 'newspapers' }">&larr; {{$t("newspapers")}}</router-link>
            </span>
            <h3 class='mb-1'>
              {{newspaper.name}}
              ({{newspaper.startYear}} - {{newspaper.endYear}})
            </h3>
            <p class='mb-0' v-if='genealogy || publication'>
              <span v-if='genealogy'>{{ genealogy }}</span>
              <span v-if='publication'>{{ publication }}</span>
            </p>
          </section>

        </b-navbar>
        <b-navbar type="light" variant="light" class="p-0 border-bottom ">
          <b-navbar-nav class="px-2 pt-2 small-caps">
            <b-tabs pills>
              <template v-slot:tabs-end>
                <b-nav-item :to="{ name:'newspaper_metadata'}" exact >{{$t('route.newspaper_metadata')}}</b-nav-item>
                <b-nav-item :to="{ name:'newspaper'}" exact >{{$t('route.newspaper', { total: $n(total) })}}</b-nav-item>
              </template>
            </b-tabs>
          </b-navbar-nav>
        </b-navbar>
        <!--  order by -->
        <b-navbar type="light" variant="light"
          v-if="$route.name != 'newspaper_metadata'"
          class="border-bottom p-0">
          <b-navbar-nav class="pl-3 pr-2 py-2 pr-auto">
            <li><label >{{ $t('order by') }}</label>
              <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
            </li>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar v-else type="light" variant="light">
          <newspaper-item :item="newspaper" :show-name="false" show-date/>
        </b-navbar>
      </div>
      <!-- eof:header  -->

      <div class='px-3 py-2 ' v-if='$route.name == "newspaper_metadata"'>
        <b-table bordered borderless caption-top :items="newspaper.properties"
             :fields='["name", "property"]'>
          <template slot="table-caption">List of known metadata for this newspaper</template>
          <template v-slot:cell(name)="row">
            <p class="small-caps">{{ $t(`metadata.property.${row.item.name}`) }}</p>
          </template>
          <template v-slot:cell(property)="row">
            <div v-if="row.item.isUrl">
              <a :href="row.item.value" target="_blank">&rarr; {{row.item.value}}</a>
            </div>
            <div v-else-if="row.item.name === 'logoFilename'">
              <img :src="`https://impresso-project.ch/assets/images/${row.item.value}`" />
            </div>
            <div v-else class="bold">
              {{row.item.value}}
            </div>
          </template>
        </b-table>
      </div>
      <div v-else>
        <div class="p-4">
          <b-row>
            <b-col
              sm="12" md="4" lg="3"
              v-for="(issue, i) in issues"
              v-bind:key="i"
              class="mb-4">

              <b-card
                :img-src="issue.iiifThumbnail"
                :img-alt="$d(new Date(issue.date), 'long')"
                img-top
                class="mb-2"
              >

              <div class="card-text p-0">
                <router-link
                  class='small-caps'
                  v-bind:to="{ name: 'issue', params: { issue_uid:issue.uid } }">
                    {{$d(new Date(issue.date), "long")}}
                </router-link>
              </div>
              </b-card>
            </b-col>
          </b-row>
        </div>
          <div class="fixed-pagination-footer p-1 mb-2 m-0">
          <pagination
            v-bind:perPage="limit"
            v-bind:currentPage="page"
            v-bind:totalRows="total"
            v-on:change="onInputPagination"
            v-bind:showDescription="false" />
          </div>

      </div>
  </i-layout-section>
</template>

<script>
import Newspaper from '@/models/Newspaper';
import Pagination from './modules/Pagination';
import ImageViewer from './modules/ImageViewer';
import NewspaperItem from './modules/lists/NewspaperItem';

export default {
  data: () => ({
    total: 0,
    page: 1,
    limit: 36,
    issues: [],
    newspaper: new Newspaper(),
    tab: 'issues',
    orderBy: '-date',
  }),
  computed: {
    orderByOptions() {
      return [
        {
          value: '-date',
          text: this.$t('order by date - most recent first'),
        },
        {
          value: 'date',
          text: this.$t('order by date'),
        },
      ];
    },
    genealogy: {
      get() {
        const noteGenealogy = this.newspaper.properties.find(d => d.name === 'noteGenealogy');
        if (noteGenealogy) {
          return noteGenealogy.value;
        }
        return false;
      },
    },
    publication: {
      get() {
        const notePublicationDates = this.newspaper.properties.find(d => d.name === 'notePublicationDates');
        if (notePublicationDates) {
          return notePublicationDates.value;
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
        orderBy: this.orderBy,
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
  watch: {
    '$route.params.newspaper_uid': {
      immediate: true,
      async handler() {
        this.issues = await this.getIssues();
        this.newspaper = await this.getNewspaper();
      },
    },
    orderBy: {
      async handler() {
        this.issues = await this.getIssues();
      },
    },
  },
  components: {
    Pagination,
    ImageViewer,
    NewspaperItem,
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.tabs{
  margin-bottom: -1px;
}
.card {
  border: 0px solid;
  background: transparent;
}

.card-body {
  padding: 0;
}

.navbar-light .navbar-nav .nav-link{
  padding: 0.125rem 0.5rem 0.25rem;
  border: 1px solid transparent;
  &.router-link-exact-active {
    color: $clr-primary;
    border-color: #dee2e6;
    border-bottom-color: #f8f9fa;
    background-color: #f8f9fa;
  }
}

.b-table{
  background-color: white;
  th{
    background-color: red;
  }
}
</style>
<i18n>
{
  "en": {
    "route": {
      "newspaper": "list of {total} first pages",
      "newspaper_metadata": "newspaper metadata"
    },
    "imeta": {
      "daterange": "Impresso Daterange: ",
      "countPages": "Pages: ",
      "countIssues": "Issues: ",
      "countArticles": "Articles: "
    },
    "metadata": {
      "property": {
        "provenanceId": "Provenance identifier",
        "provenanceSource": "Provenance",
        "countryCode": "Country of publication",
        "provinceCode": "Province of publication",
        "periodicity": "Periodicity",
        "provenanceUri": "Source permalink",
        "longTitle": "Full title",
        "noteGenealogy": "Related titles",
        "notePublicationDates": "Remarks on publication dates",
        "publicationPlace": "Publication place",
        "publicationDates": "First publication",
        "relatedUrl": "Other links",
        "logoFilename": "Source logo",
        "availabilityEta": "Publication date on impresso",
        "variantTitle": "Alternative title",
        "otherTitle": "Alternative title"
      },
      "description": {

      }
    }
  }
}
</i18n>
