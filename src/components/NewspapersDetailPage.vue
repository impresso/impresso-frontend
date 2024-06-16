<template>
  <i-layout-section main class="newspaper-page">
    <!-- slot:header  -->
    <template v-slot:header>
      <BNavbar>
        <section>
          <span class="label small-caps">
            <router-link :to="getRoute({ name: 'newspapers' })">&larr; {{ $t('newspapers') }}</router-link>
          </span>
          <h3>
            {{ newspaper.name }}
            ({{ newspaper.startYear }} - {{ newspaper.endYear }})
          </h3>
          <p class="mt-1" v-if="genealogy || publication">
            <span v-if="genealogy">{{ genealogy }}</span>
            <span v-if="publication">{{ publication }}</span>
          </p>
        </section>
      </BNavbar>

      <BTabs pills class="mx-3">
        <template v-slot:tabs-end>
          <BNavItem :to="getRoute({ name: 'newspaper_metadata' })" exact active-class="active" class="pl-2">
            <span>{{ $t('route.newspaper_metadata') }}</span>
          </BNavItem>
          <BNavItem :to="getRoute({ name: 'newspaper' })" exact active-class="active" class="pl-2">
            <span>{{ $t('route.newspaper', { total: $n(total) }) }}</span>
          </BNavItem>
        </template>
      </BTabs>
      <!--  order by -->
      <BNavbar class="px-3 py-1 border-bottom">
        <BNavbarNav class="p-2" v-if="$route.name !== 'newspaper'">
          <BNavItem class="px-2">
            <b-button size="sm" variant="outline-primary" v-on:click="applyFilter()">
              {{ $t('actions.addToCurrentFilters') }}
            </b-button>
          </BNavItem>
          <BNavItem class="px-2">
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </BNavItem>
        </BNavbarNav>
        <BNavbarNav v-if="$route.name === 'newspaper'" class="p-2">
          <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm"
            variant="outline-primary"></i-dropdown>
        </BNavbarNav>
      </BNavbar>
    </template>
    <!-- eof:header  -->

    <div class="px-3 py-2 " v-if="$route.name == 'newspaper_metadata'">
      <div class="pt-3">
        <h3 class="mx-2 tb-title small-caps font-weight-bold">articles per year</h3>
        <p class="mx-2 description small">
          number of articles extracted which are available in impresso
        </p>
      </div>
      <timeline :domain="[startYear, endYear]" :contrast="false" :values="timevalues">
        <template v-slot="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t ?? 0, 'year') }} &middot;
            <b>{{ tooltipScope.tooltip.item.w ?? 0 }}</b>
          </div>
        </template>
      </timeline>

      <div class="row my-3 mx-2">
        <div class="col-lg-12 col-xl-6">
          <h3 class="my-3 small-caps font-weight-bold">
            List of known metadata for this newspaper
          </h3>
          <table class="table border rounded">
            <thead class="small-caps font-weight-bold">
              <tr>
                <th>metadata</th>
                <th>value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prop in newspaper.properties" v-bind:key="prop.name">
                <td>{{ prop.label }}</td>
                <td>
                  <a :href="prop.value" target="_blank" v-if="prop.isUrl">{{ prop.value }}</a>
                  <span v-else>
                    {{ prop.value }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-lg-12 col-xl-6">
          <div class="row">
            <div class="col-lg-12 col-xl-6" v-for="(facet, idx) in facets" v-bind:key="idx">
              <stacked-bars-panel class="" :label="facet.type" :buckets="facet.buckets" :facet-type="facet.type" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="$route.name !== 'newspaper_metadata'">
      <div class="p-4">
        <div class="row">
          <div class="col-sm-12 col-md-6 col-lg-4 col-xl-2 mb-4" v-for="(issue, i) in issues" :key="i">
            <issue-item :item="issue" />
          </div>
        </div>
      </div>
      <div class="fixed-pagination-footer p-1 mb-2 m-0">
        <pagination v-bind:perPage="limit" v-bind:currentPage="page" v-bind:totalRows="total"
          v-on:change="onInputPagination" v-bind:showDescription="false" />
      </div>
    </div>
  </i-layout-section>
</template>

<script>
import Newspaper from '@/models/Newspaper'
import Issue from '@/models/Issue'
import Facet from '@/models/Facet'
import SearchQuery from '@/models/SearchQuery'
import Pagination from './modules/Pagination.vue'
import Timeline from './modules/Timeline.vue'
import IssueItem from './modules/lists/IssueItem.vue'
import StackedBarsPanel from './modules/vis/StackedBarsPanel.vue'
import { mapFilters } from '@/logic/queryParams'
import { containsFilter } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import BButton from './legacy/bootstrap/BButton.vue'
import BNavbar from './legacy/bootstrap/BNavbar.vue'
import BNavItem from './legacy/bootstrap/BNavItem.vue'
import BNavbarNav from './legacy/bootstrap/BNavbarNav.vue'
import BTabs from './legacy/bootstrap/BTabs.vue'
import {
  issues as IssuesService,
  searchFacets as searchFacetsService,
  newspapers as newspapersService,
} from '@/services'
import Helpers from '@/plugins/Helpers';
import { Navigation } from '@/plugins/Navigation'


const OrderByOptions = ['-date', 'date']
const OrderByDefault = '-date'

export default {
  data: () => ({
    total: 0,
    page: 1,
    limit: 36,
    issues: [],
    newspaper: new Newspaper(),
    tab: 'issues',
    timevalues: [],
    facets: [],
    facetTypes: [
      'country',
      'language',
      'type',
      'person',
      'location',
      'topic',
      'partner',
      'accessRight',
      'collection',
    ],
  }),
  computed: {
    filters: mapFilters(),
    $navigation() {
      return new Navigation(this)
    },
    searchPageLink() {
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: 'newspaper', q: this.newspaper.uid }],
        }),
      }
    },
    orderByOptions() {
      return OrderByOptions.map(value => ({
        value,
        text: this.$t(`sort_${value}`),
      }))
    },
    orderBy: {
      get() {
        const { [CommonQueryParameters.OrderBy]: orderBy } = this.$route?.query ?? {}
        return OrderByOptions.includes(orderBy) ? orderBy : OrderByDefault
      },
      set(orderBy) {
        this.$navigation.updateQueryParametersWithHistory({
          [CommonQueryParameters.OrderBy]: orderBy,
        })
      },
    },
    institution: {
      get() {
        const institutionNames = this.newspaper.properties.find(d => d.name === 'institutionNames')
        const institutionLinks = this.newspaper.properties.find(d => d.name === 'institutionLinks')
        const institutionLogos = this.newspaper.properties.find(d => d.name === 'institutionLogos')
        // const institutionPortal = this.newspaper.properties.find(d => d.name === 'institutionPortal');
        let ret = ''
        let links = []
        let logos = []
        if (institutionLogos) {
          const regex = /([\w-_ ])+\.(svg|png|jpg|jpeg|gif|bmp)/gi
          logos = institutionLogos.value.match(regex)
        }
        logos.forEach((item, i) => {
          let tag = `<img src="https://impresso-project.ch/assets/images/${item}" class="logo d-block my-3" />`
          ret +=
            links.length === logos.length ? `<a href="${links[i]}" target="_blank">${tag}</a>` : tag
        })
        if (institutionNames) {
          ret += `${institutionNames.value}`
        }
        if (institutionLinks) {
          const regex = /.+?(?=https*:\/\/|$)/gi
          links = institutionLinks.value.match(regex)
        }
        if (ret !== '') return ret
        return false
      },
    },
    genealogy: {
      get() {
        const noteGenealogy = this.newspaper.properties.find(d => d.name === 'noteGenealogy')
        if (noteGenealogy) {
          return noteGenealogy.value
        }
        return false
      },
    },
    publication: {
      get() {
        const notePublicationDates = this.newspaper.properties.find(
          d => d.name === 'notePublicationDates',
        )
        if (notePublicationDates) {
          return notePublicationDates.value
        }
        return false
      },
    },
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear
    },
    newspaperUid() {
      return this.$route.params.newspaper_uid
    },
    issuesServiceQuery() {
      return {
        filters: [{ type: 'newspaper', q: [this.newspaperUid] }],
        page: this.page,
        order_by: this.orderBy,
        limit: this.limit,
      }
    },
  },
  methods: {
    applyFilter() {
      const newFilter = {
        type: 'newspaper',
        q: this.newspaper.uid,
      }

      this.filters = this.filters.filter(f => !containsFilter(newFilter)(f)).concat([newFilter])
    },
    getRoute(route) {
      return {
        ...route,
        query: {
          ...this.$route.query,
          ...route.query,
        },
      }
    },
    onInputPagination(page) {
      this.page = page
    },
    loadTimeline() {
      return searchFacetsService.get('year', {
        query: {
          filters: [{ type: 'newspaper', q: [this.newspaperUid] }],
          limit: 500,
        },
      })
        .then(res => Helpers.timeline.fromBuckets(res.buckets))
        .then(values => {
          this.timevalues = values
        })
    },
    async loadFacets() {
      this.facets = []
      const query = {
        facets: this.facetTypes,
        filters: [{ type: 'newspaper', q: [this.newspaperUid] }],
        // group_by: 'articles',
      }

      this.facets = await searchFacetsService
        .find({ query })
        .then(result => result.data.map(item => new Facet(item)))
    },
  },
  watch: {
    newspaperUid: {
      async handler(uid) {
        this.newspaper = await newspapersService.get(uid, {}).then(d => new Newspaper(d))
        this.total = this.newspaper.countIssues
        if (this.$route.name === 'newspaper_metadata') {
          await this.loadTimeline()
          await this.loadFacets()
        }
      },
      immediate: true,
    },
    issuesServiceQuery: {
      handler(query) {
        this.issues = []

        IssuesService.find({ query })
          .then(({ total, data }) => {
            this.total = total
            this.issues = data.map(d => new Issue(d))
          })
          .catch(console.error)
      },
      immediate: true,
    },
  },
  components: {
    Pagination,
    Timeline,
    StackedBarsPanel,
    IssueItem,
    BNavbar,
    BNavItem,
    BNavbarNav,
  },
}
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';

.newspaper-page {
  img.logo {
    width: 15em;
    max-width: 100%;
  }

  .tabs {
    margin-bottom: -1px;
  }

  .card {
    border: 0px solid;
    background: transparent;
  }

  .card-body {
    padding: 0;
  }

  .navbar-light .navbar-nav .nav-link {
    padding: 0.125rem 0.5rem 0.25rem;
    border: 1px solid transparent;

    &.router-link-exact-active {
      color: $clr-primary;
      border-color: #dee2e6;
      border-bottom-color: #f8f9fa;
      background-color: #f8f9fa;
    }
  }

  .b-table {
    background-color: white;

    th {}

    td[aria-colindex='2'] {
      overflow-wrap: anywhere;
      font-size: smaller;
    }
  }
}
</style>
<i18n lang="json">{
  "en": {
    "sort_date": "order by date ↑",
    "sort_-date": "order by date ↓",
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
}</i18n>
