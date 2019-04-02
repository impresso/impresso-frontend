:<template lang="html">
  <i-layout id="EntitiesPage">
    <i-layout-section width="300px" class="border-right">
      <div slot="header" class="border-bottom bg-light">
        <base-tabs v-model="tab" class="pl-3" v-bind:tabs="tabs"></base-tabs>
        <b-navbar class="border-bottom p-0 bg-white">
          <b-navbar-nav class="px-3 py-3">
            <label class="mr-1">{{$t("label_order")}}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </b-navbar-nav>
        </b-navbar>
        <div class="p-2">
          <input
            type="text"
            class="form-control"
            placeholder="... name or description "
            name=""
            value=""
            v-model.trim="query"/>
        </div>
      </div>
      <div v-for="n in entities" class="border-bottom">
        <router-link
          class="px-3 py-2 d-block small-caps"
          v-bind:class="{active: n.id === entityUid}"
          v-bind:to="{name: 'entity_metadata', params: {entity_uid: n.id}}">
          <strong>{{n.wikidata.labels[activeLanguageCode]}}</strong>
          <br>
          {{n.wikidata.descriptions[activeLanguageCode]}}
        </router-link>
      </div>
      <div v-if="paginationList.totalRows > paginationList.perPage" slot="footer" class="p-2 border-top">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPaginationList"
          v-bind:showDescription="true" />
      </div>
    </i-layout-section>
    <router-view></router-view>
  </i-layout>
</template>

<script>
import BaseTabs from './base/BaseTabs';
import Pagination from './modules/Pagination';

export default {
  data: () => ({
    tab: {},
    entities: [
      {
        id: 1,
        name: 'null',
        type: 'entity',
        wikidataId: 'Q159700',
        dbpediaURL: null,
        impressoId: null,
        wikidata: {
          id: 'Q159700',
          type: 'human',
          labels: {
            fr: 'Jean Monnet',
            it: 'Jean Monnet',
            de: 'Jean Monnet',
            en: 'Jean Monnet',
          },
          descriptions: {
            it: 'politico francese',
            fr: 'homme politique français',
            de: 'französischer Staatsmann und Politiker',
            en: 'French political economist regarded by many as a chief architect of European unity',
          },
          birthDate: '+1888-11-09T00:00:00Z',
          deathDate: '+1979-03-16T00:00:00Z',
          birthPlace: {
            id: 'Q285',
            type: 'location',
            labels: {
              fr: 'Cognac',
              en: 'Cognac',
              de: 'Cognac',
              it: 'Cognac',
            },
            descriptions: {
              fr: 'commune française du département de la Charente',
              de: 'französische Stadt im Département Charente',
              it: 'comune francese',
              en: 'commune in Charente, France',
            },
            coordinates: {
              latitude: 45.695833333333,
              longitude: -0.32916666666667,
              altitude: null,
              precision: 0.00027777777777778,
              globe: 'http://www.wikidata.org/entity/Q2',
            },
            country: {
              'entity-type': 'item',
              'numeric-id': 142,
              id: 'Q142',
            },
          },
          deathPlace: {
            id: 'Q83447',
            type: 'location',
            labels: {
              fr: 'Bazoches-sur-Guyonne',
              en: 'Bazoches-sur-Guyonne',
              it: 'Bazoches-sur-Guyonne',
              de: 'Bazoches-sur-Guyonne',
            },
            descriptions: {
              fr: 'commune française du département des Yvelines',
              it: 'comune francese',
              en: 'commune in Yvelines, France',
              de: 'französische Gemeinde',
            },
            coordinates: {
              latitude: 48.778333333333,
              longitude: 1.8602777777778,
              altitude: null,
              precision: 0.00027777777777778,
              globe: 'http://www.wikidata.org/entity/Q2',
            },
            country: {
              'entity-type': 'item',
              'numeric-id': 142,
              id: 'Q142',
            },
          },
        },
      },
    ],
  }),
  computed: {
    tabs() {
      return [
        {
          label: this.$t('label_list', { total: this.paginationList.totalRows }),
          name: 'list',
          active: true,
        },
      ];
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    paginationList() {
      return this.$store.state.entities.list.pagination;
    },
    paginationDetail() {
      return this.$store.state.entities.detail.pagination;
    },
    entities() {
      return this.$store.state.entities.list.entities;
    },
    entity: {
      get() {
        return this.$store.state.entities.detail.entity;
      },
      set(entity) {
        this.$store.commit('entities/UPDATE_DETAIL_ENTITY', entity);
      },
    },
    entityUid() {
      return this.$route.params.entity_uid;
    },
    issues() {
      return this.$store.state.entities.detail.issues;
    },
    query: {
      get() {
        return this.$store.state.entities.list.query || '';
      },
      set(val) {
        this.$store.commit('entities/UPDATE_LIST_QUERY', val);
        this.loadList(1);
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'name',
            text: `${this.$t('sort_name')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-name',
            text: `${this.$t('sort_name')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'startYear',
            text: `${this.$t('sort_start_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-startYear',
            text: `${this.$t('sort_start_date')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'endYear',
            text: `${this.$t('sort_end_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-endYear',
            text: `${this.$t('sort_end_date')} ${this.$t('sort_desc')}`,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.entities.list.orderBy;
      },
      set(val) {
        this.$store.commit('entities/UPDATE_LIST_ORDER_BY', val);
        this.loadList(1);
      },
    },
  },
  methods: {
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('entities/UPDATE_LIST_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      return this.$store.dispatch('entities/LOAD_LIST');
    },
    onInputPaginationList(page = 1) {
      this.loadList(page);
    },
  },
  mounted() {
    this.loadList().then((res) => {
      if (this.$route.params.entity_uid === undefined) {
        this.$router.push({
          params: {
            entity_uid: res.data[0].uid,
          },
        });
      }
      this.entity = this.entities.find(entity => entity.uid === this.entityUid);
    });
  },
  components: {
    Pagination,
    BaseTabs,
  },
  watch: {
    entityUid: {
      immediate: false,
      handler(val) {
        if (val !== undefined) {
          this.entity = this.entities.find(entity => entity.uid === this.entityUid);
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
    "label_list": "Explore ({total})",
    "label_order": "Order By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_start_date": "Date of first issue",
    "sort_end_date": "Date of last issue",
    "sort_name": "Alphabetical"
  },
  "nl": {
    "label_order": "Sorteer Op",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_start_date": "Datum",
    "sort_end_date": "Datum",
    "sort_name": "Alfabetisch"
  }
}
</i18n>
