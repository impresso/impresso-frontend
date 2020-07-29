<template lang="html">
    <i-layout-section main class="newspaper-page">
      <!-- slot:header  -->
      <div slot="header" >
        <b-navbar>
          <section>
            <span class="label small-caps">
              <router-link :to="getRoute({ name: 'newspapers'})">&larr; {{$t("newspapers")}}</router-link>
            </span>
            <h3>
              {{newspaper.name}}
              ({{newspaper.startYear}} - {{newspaper.endYear}})
            </h3>
            <p class='mt-1' v-if='genealogy || publication'>
              <span v-if='genealogy'>{{ genealogy }}</span>
              <span v-if='publication'>{{ publication }}</span>
            </p>
          </section>
        </b-navbar>

        <b-tabs pills class="mx-3">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name:'newspaper_metadata'}" exact active-class='active' class="pl-2">
              <span>{{$t('route.newspaper_metadata')}}</span>
            </b-nav-item>
            <b-nav-item :to="{ name:'newspaper'}" exact active-class='active' class="pl-2">
              <span>{{$t('route.newspaper', { total: $n(total) })}}</span>
            </b-nav-item>
          </template>
        </b-tabs>
        <!--  order by -->
        <b-navbar class="px-3 py-0 border-bottom">

          <b-nav-form class="p-2 border-right">
            <b-button size="sm" variant="outline-primary" v-on:click='applyFilter()'>
              {{ $t('actions.addToCurrentFilters') }}
            </b-button>
          </b-nav-form>
          <b-nav-form class="p-2 border-right">
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </b-nav-form>

          <b-navbar-nav v-if="$route.name === 'newspaper'"
          class="pl-3 pr-2 py-2 pr-auto">
            <li><label >{{ $t('order by') }}</label>
              <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
            </li>
          </b-navbar-nav>
        </b-navbar>
        <!-- <b-navbar v-else type="light" variant="light">
          <newspaper-item :item="newspaper" :show-name="false" show-date/>
        </b-navbar> -->
      </div>
      <!-- eof:header  -->

      <div class='px-3 py-2 ' v-if='$route.name == "newspaper_metadata"'>
        <div class="pt-3">
          <h3 class="mx-2 tb-title small-caps font-weight-bold">articles per year</h3>
          <p class="mx-2 description small">number of articles extracted which are available in impresso</p>
        </div>
        <timeline
              :domain="[startYear, endYear]"
              :contrast="false"
              :values="timevalues">
          <div slot-scope="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w }}</b>
            </div>
          </div>
        </timeline>

        <div class="my-3 mx-2">
          <b-row>
            <b-col lg="12" xl="6" class="">
              <b-table bordered borderless caption-top :items="newspaper.properties"
                   :fields='["name", "property"]'>
                <template slot="table-caption">
                  <h3 class="m-0 tb-title small-caps font-weight-bold">
                    List of known metadata for this newspaper
                  </h3>
                </template>
                <template v-slot:cell(name)="row">
                  <span v-if="row.item.name === 'institutionNames'">
                    <p class="small-caps">Institution</p>
                  </span>
                  <span v-else-if="row.item.name === 'institutionLinks'" />
                  <span v-else-if="row.item.name === 'institutionLogos'" />

                  <p v-else class="small-caps">{{row.item.label}}</p>
                  <!-- {{row.item.name}} -->
                </template>
                <template v-slot:cell(property)="row">

                  <div v-if="row.item.name === 'institutionNames'" v-html="institution" />
                  <div v-else-if="row.item.name === 'institutionLinks'" />
                  <div v-else-if="row.item.name === 'institutionLogos'" />
                  <div v-else-if="row.item.isUrl">
                    <a :href="row.item.value" target="_blank">&rarr; {{row.item.value}}</a>
                  </div>
                  <div v-else class="bold">
                    {{row.item.value}}
                  </div>
                </template>
              </b-table>
            </b-col>
            <b-col lg="12" xl="6" class="">
              <b-row>
                <b-col sm="12" md="12" lg="12" xl="6" v-for="(facet, idx) in facets" v-bind:key="idx">
                  <stacked-bars-panel
                    class=""
                    :label="facet.type"
                    :buckets="facet.buckets"
                    :facet-type="facet.type"/>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </div>
        <!-- <pre>
          {{newspaper.properties}}
        </pre> -->
      </div>
      <div v-else>
        <div class="p-4">
          <b-row>
            <b-col
              sm="12" md="4" lg="3"
              v-for="(issue, i) in issues"
              v-bind:key="i"
              class="mb-4">
              <b-card class="mb-2">
                <router-link v-bind:to="{ name: 'page', params: {
                  issue_uid: issue.uid,
                  page_uid: issue.frontPage.uid,
                }}">
                  <b-card-img-lazy
                    :src="issue.frontPage.iiifThumbnail"
                    :alt="$d(issue.date, 'long')" top />
                </router-link>
                <b-card-body>
                  <router-link
                    class='small-caps'
                    v-bind:to="{ name: 'issue', params: { issue_uid: issue.uid } }">
                      {{$d(new Date(issue.date), "long")}}
                  </router-link>
                </b-card-body>
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
import Issue from '@/models/Issue';
import Facet from '@/models/Facet';
import SearchQuery from '@/models/SearchQuery';
import Pagination from './modules/Pagination';
import Timeline from './modules/Timeline';
import StackedBarsPanel from './modules/vis/StackedBarsPanel';
import { mapFilters } from '@/logic/queryParams'
import { containsFilter } from '@/logic/filters'
import {
  issues as IssuesService,
  searchFacets as searchFacetsService,
  newspapers as newspapersService,
} from '@/services';

export default {
  data: () => ({
    total: 0,
    page: 1,
    limit: 36,
    issues: [],
    newspaper: new Newspaper(),
    tab: 'issues',
    orderBy: '-date',
    timevalues: [],
    facets: [],
    facetTypes: ['country', 'language', 'type', 'person', 'location', 'topic', 'partner', 'accessRight', 'collection'],
  }),
  computed: {
    filters: mapFilters(),
    searchPageLink() {
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: 'newspaper', q: this.newspaper.uid }],
        }),
      };
    },
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
    institution: {
      get() {
        const institutionNames = this.newspaper.properties.find(d => d.name === 'institutionNames');
        const institutionLinks = this.newspaper.properties.find(d => d.name === 'institutionLinks');
        const institutionLogos = this.newspaper.properties.find(d => d.name === 'institutionLogos');
        // const institutionPortal = this.newspaper.properties.find(d => d.name === 'institutionPortal');
        let ret = '';
        let links = [];
        let logos = [];
        if (institutionLogos) {
          const regex = /([\w-_ ])+\.(svg|png|jpg|jpeg|gif|bmp)/gi;
          logos = institutionLogos.value.match(regex);
        }
        logos.forEach((item, i) => {
          let tag = `<img src="https://impresso-project.ch/assets/images/${item}" class="logo d-block my-3" />`;
          ret += links.length === logos.length ? `<a href="${links[i]}" target="_blank">${tag}</a>` : tag;
        });
        if (institutionNames) {
          ret += `${institutionNames.value}`;
        }
        if (institutionLinks) {
          const regex = /.+?(?=https*:\/\/|$)/gi;
          links = institutionLinks.value.match(regex);
        }
        if (ret !== '') return ret;
        return false;
      },
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
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear;
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear;
    },
    newspaperUid() {
      return this.$route.params.newspaper_uid;
    }
  },
  methods: {
    applyFilter() {
      const newFilter = {
        type: 'newspaper',
        q: this.newspaper.uid,
      }

      this.filters = this.filters
        .filter(f => !containsFilter(newFilter)(f))
        .concat([newFilter]);
    },
    getRoute(route) {
      return {
        ...route,
        query: {
          ...this.$route.query,
          ...route.query,
        },
      };
    },
    onInputPagination(page) {
      return this.loadIssues({ page })
    },
    loadTimeline() {
      return this.$store.dispatch('search/LOAD_TIMELINE', {
        filters: [{ type: 'newspaper', q: [this.newspaperUid] }],
      }).then((values) => {
        this.timevalues = values;
      });
    },
    async loadFacets() {
      this.facets = [];
      const query = {
        filters: [{ type: 'newspaper', q: [this.newspaperUid] }],
        group_by: 'articles',
      };
      for (let facetType of this.facetTypes) {
        const results = await searchFacetsService.get(facetType, {
          query,
        }).then(([facetType]) => new Facet(facetType));
        this.facets = this.facets.concat(results);
      }
    },
    async loadIssues({ page = 1 } = {}) {
      this.issues = []
      const {total, issues} = await IssuesService.find({
        query: {
          filters: [{ type: 'newspaper', q: [this.newspaperUid] }],
          page,
          orderBy: this.orderBy,
          limit: this.limit
        },
      }).then(({ total, data }) => {
        return { total, issues: data.map(d => new Issue(d)) };
      })
      this.page = page;
      this.total = total;
      this.issues = issues;
    },
    async loadNewspaper() {
      this.newspaper = await newspapersService.get(this.newspaperUid, {}).then(d => new Newspaper(d));
      this.total = this.newspaper.countIssues;
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ name }) {
        await this.loadNewspaper();
        if (name === 'newspaper_metadata') {
          await this.loadTimeline();
          await this.loadFacets();
        } else {
          await this.loadIssues();
        }
      },
    },
    orderBy: {
      handler() {
        return this.loadIssues();
      },
    },
  },
  components: {
    Pagination,
    Timeline,
    StackedBarsPanel,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.newspaper-page {

  img.logo {
    width: 15em;
    max-width: 100%;
  }

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
    }
    td[aria-colindex="2"] {
     overflow-wrap: anywhere;
     font-size: smaller;
   }
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
    }
  }
}
</i18n>
