<template>
  <i-layout-section main>
    <!-- slot:header -->
    <template v-slot:header>
      <cluster-page-header :cluster="cluster">
        <template v-slot:toolbar>
          <b-navbar type="light" variant="light" class="px-3 py-0 border-bottom">
            <b-navbar-nav>
              <li class="p-2 border-right form-inline">
                <form class="form-inline">
                  <label class="mr-2">{{ $t('order by') }}</label>
                  <i-dropdown v-model="orderByModel"
                    :options="orderByOptions"
                    size="sm"
                    variant="outline-primary" />
                </form>
              </li>
            </b-navbar-nav>
          </b-navbar>
        </template>
      </cluster-page-header>
    </template>

    <div v-if="!cluster" class="d-none" style="height: 100%">
      <div class="d-flex flex-row justify-content-center" style="height: 100%">
        <div class="d-flex flex-column justify-content-center">
          <span>[no cluster selected placeholder]</span>
        </div>
      </div>
    </div>
    <div v-else-if="clusterId">
      <section class="p-2">
        <passage-details-panel
          v-for="({ passage, newspaper, iiifUrls }) in passageItems"
          :key="passage.id"
          :passage="passage"
          :newspaper="newspaper"
          :iiif-url="iiifUrls[0]"
          class="p-2"/>
      </section>
      <div class="fixed-pagination-footer p-1 m-0"
         v-if="paginationTotalRows > paginationPerPage">
        <pagination
          :perPage="paginationPerPage"
          :currentPage="paginationCurrentPage"
          :totalRows="paginationTotalRows"
          v-on:change="handlePaginationPageChanged"
          class="float-left small-caps" />
      </div>
    </div>
  </i-layout-section>
</template>

<script>
import ClusterPageHeader from '@/components/modules/textReuse/ClusterPageHeader.vue'
import PassageDetailsPanel from '@/components/modules/textReuse/PassageDetailsPanel.vue'
import Pagination from '@/components/modules/Pagination.vue';

import { textReuseClusterPassages } from '@/services'
import Newspaper from '@/models/Newspaper'
import { Navigation } from '@/plugins/Navigation';


const QueryParameters = Object.freeze({
  Page: 'passagePage',
  OrderBy: 'passageOrderBy'
})

const SortingMethod = {
  Date: 'date'
}

export default {
  data: () => ({
    passageItems: /** @type {{ id: string, passage: any, newspaper: any, iiifUrls: string[] }[]} */ ([]),
    paginationInfo: {
      limit: 20,
      offset: 0,
      total: 0
    }
  }),
  props: {
    cluster: Object,
    paginationPerPage: {
      type: Number,
      default: 20
    }
  },
  components: {
    ClusterPageHeader,
    PassageDetailsPanel,
    Pagination
  },
  computed: {
    $navigation() {
      return new Navigation(this)
    },
    /** @returns {string|undefined} */
    clusterId() {
      return /** @type {string} */ (this.$route.query.clusterId)
    },
    /** @returns {number} */
    paginationCurrentPage() {
      const { [QueryParameters.Page]: passagePage = 0 } = this.$route.query
      return parseInt(/** @type {string} */ (passagePage), 10) + 1
    },
    /** @returns {number} */
    paginationTotalRows() {
      const { total } = this.paginationInfo
      return total
    },
    orderByModel: {
      /** @returns {string} */
      get() {
        return /** @type {string} */ (this.$route.query[QueryParameters.OrderBy]) || '';
      },
      /** @param {string} val */
      set(val) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.OrderBy]: val === '' ? undefined : val
        })
      },
    },
    /**
     * @typedef {{ value: string, text: string, disabled: boolean }} Option
     * @returns {Option[]}
     */
    orderByOptions() {
      return [
        {
          value: '',
          text: this.$t('sort.default').toString(),
          disabled: false,
        },
        {
          value: `-${SortingMethod.Date}`,
          text: `${this.$t('sort.date')} ${this.$t('sort.desc')}`,
          disabled: false,
        },
        {
          value: SortingMethod.Date,
          text: `${this.$t('sort.date')} ${this.$t('sort.asc')}`,
          disabled: false,
        }
      ];
    }
  },
  watch: {
    clusterId: {
      /**
       * @param {string} val
       * @returns {Promise<unknown>}
       */
      async handler(val) {
        if(val) {
          return this.executeSearch();
        }
      },
      immediate: true
    },
    paginationCurrentPage: {
      /**
       * @returns {Promise<unknown>}
       */
      async handler() {
        return this.executeSearch()
      },
      immediate: true
    },
    orderByModel: {
      /**
       * @returns {Promise<unknown>}
       */
      async handler() { return this.executeSearch() }
    }
  },
  methods: {
    /** @param {number} page */
    handlePaginationPageChanged(page) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.Page]: page - 1
      })
    },
    /** @returns {Promise<unknown>} */
    async executeSearch() {
      const pageNumber = this.paginationCurrentPage - 1;
      const orderBy = this.orderByModel;
      if (!this.clusterId) {
        return;
      }
      [this.passageItems, this.paginationInfo] = await textReuseClusterPassages
        .find({ query: {
          clusterId: this.clusterId,
          offset: this.paginationPerPage * pageNumber,
          limit: this.paginationPerPage,
          orderBy
        }})
        .then(({ passages, info }) => {
          return [
            passages.map(({ passage, newspaper, iiifUrls }) =>({
              passage,
              newspaper: new Newspaper(newspaper),
              iiifUrls
            })),
            info
          ]
        })
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "sort": {
      "default": "Default",
      "date": "Date",
      "asc": "↑",
      "desc": "↓"
    }
  }
}
</i18n>
