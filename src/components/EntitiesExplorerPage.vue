<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light">
        <section v-if="observingList" class="top-section">
          <div class="label small-caps">
            {{ $t('entities') }}
          </div>
          <h3>{{ $t('title') }}</h3>
        </section>
      </b-navbar>
      <b-navbar class="pt-0 border-bottom">
        <b-navbar-nav>
          <!-- filters toggle -->
          <div class="current-search-panel">
            <form class="form-inline">
              <b-form-checkbox
                v-model="applyCurrentSearchFilters"
                :disabled="countActiveFilters === 0"
                switch>
                {{ $t('label.useCurrentSearch') }}
              </b-form-checkbox>
              <b-dropdown v-if="countActiveFilters > 0" class="ml-1" size="sm" variant="outline-primary" >
                <template v-slot:button-content>
                  ({{ $tc('counts.filters', countActiveFilters) }})
                </template>
                <search-query-explorer style="min-width:300px" class="px-2 pt-2" :search-query="searchQuery"/>
              </b-dropdown>
            </form>
          </div>
        </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <!-- scale -->
            <b-button-group size="sm">
              <b-button v-for="s in scales"
                variant="outline-primary"
                :key="s"
                :class="{active: s === scale}"
                @click="scale = s">
                {{$t(`scales.${s}`)}}
              </b-button>
            </b-button-group>
          </b-navbar-nav>
            <!-- <b-dropdown size="sm" variant="outline-primary" >
              <template v-slot:button-content>
                <span>{{$t('scale')}}: {{$t(`scales.${scale}`)}}</span>
              </template>
              <b-dropdown-item v-for="s in scales"
                              :key="s"
                              :active="s === scale"
                              @click="scale = s">
                {{$t(`scales.${s}`)}}
              </b-dropdown-item>
            </b-dropdown> -->
      </b-navbar>
    </template>
    <template v-slot:default>
      <section class="p-3">
        <base-title-bar>
          {{ $t('label.year.optionsTitle')}}
          <template v-slot:description>
            {{ $t('label.year.optionsDescription')}}
          </template>
        </base-title-bar>
        <timeline
          :class="{'loading': isTimelineLoading}"
          :values="timevalues"
          :domain="timelineSpan"
          :brush="currentTimelineSelectionSpan"
          height="120px"
          @brush-end="onTimelineBrushed"
          @clear-selection="handleTimelineCleared">
          <template v-slot="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w }}</b>
            </div>
          </template>
        </timeline>
      </section>
      <div v-if="$route.query.items" ref="visualisationWrapper">
        <section class="py-3 border-bottom">
          <time-punchcard-chart
            @punch-click="handlePunchClicked"
            :class="{loading: isPunchcardLoading}"
            :data="punchcardChartData" :options="punchcardOptions">
            <template v-slot:default="{ category, index }">
              <div :class="`${category.isSubcategory ? 'sublabel' : 'catlabel bg-light'}`">
                <div class="d-flex align-items-center h-100">
                  <img
                    v-if="entitiesList[index].thumbnailUrl"
                    class="thumb bg-light"
                    :src="getWikimediaUrl(entitiesList[index].thumbnailUrl)"
                    :width="thumbnailSize * 0.5"
                    :height="thumbnailSize * 0.5"
                    />
                  <div :class="`title px-2 ${category.isSubcategory? '' : 'bg-light'}`">
                    {{ category.label }}
                  </div>
                  <div v-if="!category.isSubcategory" class=" bg-light mr-1">
                    <button
                      class="btn dripicons-cross p-0 btn-outline-danger btn-sm rounded-pill btnclose"
                      @click="() => handleEntityLabelClicked(entitiesList[index])">
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:gutter="{ categoryIndex }">
              <div
                class="">
                <div
                  class="fixed-pagination-footer p-1 mt-1 mb-0"
                  style="top:-7px; height: 35px">
                  <pagination
                    size="sm"
                    v-bind:perPage="getPagination(getEntityIdForSlotIndex(categoryIndex)).perPage"
                    v-bind:currentPage="getPagination(getEntityIdForSlotIndex(categoryIndex)).currentPage"
                    v-bind:totalRows="getPagination(getEntityIdForSlotIndex(categoryIndex)).totalRows"
                    v-on:change="v => onInputPagination(getEntityIdForSlotIndex(categoryIndex), v)"
                    class="centered" />
                </div>
              </div>
            </template>
          </time-punchcard-chart>
        </section>
        <punch-explorer
          :style="punchModalStyle"
          :visible="!!(isPunchModalVisible && selectedEntity)"
          @close="isPunchModalVisible=false"
          dark-mode>
          <template v-slot:header>
            <span v-html="punchModalTitle"/>
          </template>
          <template v-slot:default>
            <form class="form-inline">
              <b-form-checkbox
                v-model="applyCurrentSearchFilters"
                :disabled="countActiveFilters === 0"
                switch>
                {{ $t('label.useCurrentSearch') }}
              </b-form-checkbox>
              <b-dropdown class="ml-1" v-if="countActiveFilters > 0" size="sm" variant="outline-primary" >
                <template v-slot:button-content>
                  ({{ $tc('counts.filters', countActiveFilters) }})
                </template>
                <search-query-explorer style="min-width:300px" class="px-2 pt-2" :search-query="searchQuery"/>
              </b-dropdown>
            </form>
            <div v-if="applyCurrentSearchFilters">{{ $t('label.useCurrentSearch') }}</div>
            <search-query-explorer dark-mode no-pagination no-label :search-query="selectedEntitySearchQuery"/>
          </template>
        </punch-explorer>
        <!-- <modal modal-class="modal-backdrop-disabled" content-class="drop-shadow"
          hide-backdrop
          no-fade no-close-on-backdrop
          title-class="sans"
          v-model="isPunchModalVisible"
          :style="punchModalStyle"
          :title-html="punchModalTitle">
          <div v-if="selectedEntity">
            <div v-if="applyCurrentSearchFilters">{{ $t('label.useCurrentSearch') }}</div>
            <search-query-explorer no-pagination no-label :search-query="selectedEntitySearchQuery"/>
          </div>
          <template v-slot:modal-footer>
            <b-button
                variant="outline-primary"
                size="sm"
                class="ml-auto"
                @click="isPunchModalVisible=false">
                Close
            </b-button>
          </template>
        </modal> -->
      </div>
      <div v-else>
        <div class="text-center p-5 m-5" v-html="$t('no-entities-selected')" />
      </div>
    </template>
  </i-layout-section>
</template>

<script>
import Timeline from '@/components/modules/Timeline'
import SearchQueryExplorer from '@/components/modals/SearchQueryExplorer'
import PunchExplorer from '@/components/modals/PunchExplorer'
import Pagination from '@/components/modules/Pagination.vue'
import { searchQueryGetter, mapApplyCurrentSearchFilters } from '@/logic/queryParams'
import TimePunchcardChart from '@/components/modules/vis/TimePunchcardChart.vue'
import BaseTitleBar from '@/components/base/BaseTitleBar.vue';
import {
  entityMentionsTimeline as entityMentionsTimelineService
} from '@/services'
import { getQueryParameter } from '@/router/util'
import { SupportedFiltersByContext } from '@/logic/filters'
import SearchQuery from '@/models/SearchQuery'
import { searchFacets as searchFacetsService } from '@/services'

/**
 * @typedef {import('@/models').Filter} Filter
 *
 * @typedef {{ val: string|number, count: number }} MentionFrequencyPoint
 * @typedef {{
 *   type: string,
 *   id: string,
 *   label: string,
 *   entityType: string,
 *   wikidataId: string,
 *   thumbnailUrl: string,
 *   mentionFrequencies: MentionFrequencyPoint[]
 * }} EntityOrMention
 * @typedef {{
 *   item: EntityOrMention,
 *   subitems: EntityOrMention[],
 *   totalSubitems: number
 * }} PunchcardResponse
 */

const QueryParameters = Object.freeze({
  ApplyCurrentSearchFilters: 'doFilter',
  SelectedEntitiesIds: 'items',
  TimelineSelectionStart: 'sels',
  TimelineSelectionEnd: 'sele',
  Scale: 'scale'
})


/**
 * @param {import('@/models').Filter} filter
 * @returns {boolean}
 */
const supportedSearchIndexFilters = filter => SupportedFiltersByContext.search.includes(filter.type)


/**
 * @param {EntityOrMention} item
 * @param {boolean} isSubcategory
 * @returns {import('@/d3-modules/TimePunchcardChart').ChartCategory}
 */
function mentionsFrequenciesResponseItemToPunchcardChartCategory(item, isSubcategory = false) {
  const dataPoints = item.mentionFrequencies.map(({ val, count }) => {
    return {
      value: count,
      time: new Date(String(val))
    };
  });

  return {
    label: item.label,
    isSubcategory,
    dataPoints
  }
}


/**
 * @param {PunchcardResponse} response
 * @returns {import('@/d3-modules/TimePunchcardChart').ChartCategory[]}
 */
function mentionsFrequenciesResponseToPunchcardChartCategories(response) {
  const { item, subitems = [] } = response

  return [mentionsFrequenciesResponseItemToPunchcardChartCategory(item)]
    .concat(subitems.map(i => mentionsFrequenciesResponseItemToPunchcardChartCategory(i, true)))
}

/**
 * @typedef {{perPage: number, currentPage: number, totalRows: number}} PaginationValuesContainer
 * @returns {PaginationValuesContainer}
 */
const getDefaultPagination = () => ({
  perPage: 4,
  currentPage: 1,
  totalRows: 0
})

export default {
  data: () => ({
    isTimelineLoading: false,
    isPunchcardLoading: false,
    isPunchModalVisible: false,
    useCurrentSearch: false,
    timevalues: [],
    mentionsFrequenciesResponses: /** @type {PunchcardResponse[]} */ ([]),
    timelineSpan: /** @type {Date[]} */ ([]),
    scales: ['linear', 'sqrt', 'symlog'],
    paginations: /** @type {{[key: string]: PaginationValuesContainer}} */ ({}),
    thumbnailSize: 60,
    punchData: {},
    punchModalPositions: {
      x: 0,
      y: 0,
    },
  }),
  components: {
    Timeline,
    SearchQueryExplorer,
    TimePunchcardChart,
    PunchExplorer,
    Pagination,
    BaseTitleBar
  },
  mounted() {
    // @ts-ignore
    let { firstDate } = window.impressoDocumentsDateSpan
    const lastDate = new Date()
    firstDate = new Date(firstDate)

    this.timelineSpan = [
      firstDate.getFullYear(),
      lastDate.getFullYear()
    ];
  },
  _computed: {
    $navigation() {
      return new Navigation(this)
    },
    punchModalStyle() {
      return {
        transform: `translate(${this.punchModalPositions.x}px,${this.punchModalPositions.y}px)`,
      }
    },
    applyCurrentSearchFilters: mapApplyCurrentSearchFilters(),
    timelineSelectionStart: {
      /** @returns {Date | undefined} */
      get() {
        const v = getQueryParameter(this, QueryParameters.TimelineSelectionStart)
        return v == null ? undefined : new Date(parseInt(v, 10))
      },
      /** @param {Date} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.TimelineSelectionStart]: value == null ? undefined : value.getTime()
        })
      }
    },
    timelineSelectionEnd: {
      /** @returns {Date | undefined} */
      get() {
        const v = getQueryParameter(this, QueryParameters.TimelineSelectionEnd)
        return v == null ? undefined : new Date(parseInt(v, 10))
      },
      /** @param {Date} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.TimelineSelectionEnd]: value == null ? undefined : value.getTime()
        })
      }
    },
    /** @return {Date[]} */
    currentTimelineSelectionSpan() {
      if (this.timelineSelectionStart != null && this.timelineSelectionEnd != null) {
        return [
          this.timelineSelectionStart,
          this.timelineSelectionEnd
        ]
      }
      return []
    },
    /** @return {string} */
    punchcardResolution() {
      if (this.currentTimelineSelectionSpan.length !== 2) return 'year'
      const spanMs = Math.abs(
        this.currentTimelineSelectionSpan[1].getTime() - this.currentTimelineSelectionSpan[0].getTime()
      )
      const spanThreshold = 1000 * 60 * 60 * 24 * 365 * 5 // 5 years
      return spanMs < spanThreshold ? 'month' : 'year'
    },
    /** @return {string} */
    punchModalTitle() {
      if (this.punchData.time && this.punchcardResolution === 'year') {
        return this.$t('entity-label-in-year', {
          label: this.punchData.label,
          year: this.punchData.time.getFullYear(),
        })
      }
      return ''
    },
    searchQuery: {
      get() {
        const searchQuery = searchQueryGetter().get.bind(this)()
        return new SearchQuery({
          filters: searchQuery.filters.filter(supportedSearchIndexFilters)
        })
      }
    },
    selectedEntitySearchQuery() {
      if (this.selectedEntity) {
        // add start and end span related to current punchcardResolution
        const filters = [
          {
            type: this.selectedEntity.entityType,
            q: [this.selectedEntity.id],
          }
        ]
        if (this.punchcardResolution === 'year') {
          filters.push({
            type: 'year',
            q: [String(this.punchData.time.getFullYear())],
          })
        } else if (this.punchcardResolution === 'month') {
          filters.push({
            type: 'year',
            q: this.punchData.time.getFullYear(),
          })
        }
        if (this.applyCurrentSearchFilters) {
          return {
            filters: this.searchQuery.filters.concat(filters)
          }
        }
        return { filters }
      }
      return this.searchQuery
    },
    /** @returns {number} */
    countActiveFilters() {
      return this.searchQuery.countActiveFilters()
    },
    observingList: {
      /** @returns {string[]} */
      get() {
        try {
          // @ts-ignore
          const items = /** @type {string} */ (window.atob(this.$route.query[QueryParameters.SelectedEntitiesIds]))
          return items != null ? items.split(',') : []
        } catch (e) {
          return []
        }
      },
      /** @param {string[]} items */
      set(items) {
        this.$navigation.updateQueryParameters({
          // @ts-ignore
          [QueryParameters.SelectedEntitiesIds]: items.length > 0 ? window.btoa(items.join(',')) : undefined
        })
      }
    },
    /** @returns {any} */
    timelineUpdateParameters() {
      return {
        entitiesIds: this.observingList,
        applyCurrentSearchFilters: this.applyCurrentSearchFilters
      }
    },
    /** @returns {any} */
    punchcardUpdateParameters() {
      return {
        entitiesIds: this.observingList,
        applyCurrentSearchFilters: this.applyCurrentSearchFilters,
        currentTimelineSelectionSpan: this.currentTimelineSelectionSpan,
        skipPerEntity: this.observingList.reduce((acc, id) => {
          const { perPage, currentPage } = this.paginations[id] ?? getDefaultPagination()
          acc[id] = perPage * (currentPage - 1)
          return acc
        }, {})
      }
    },
    /**
     * @returns {import('@/d3-modules/TimePunchcardChart').ChartData}
     */
    punchcardChartData() {
      const categories = this.mentionsFrequenciesResponses.reduce((acc, response) => {
        const items = mentionsFrequenciesResponseToPunchcardChartCategories(response)
        return acc.concat(items)
      }, /** @type {import('@/d3-modules/TimePunchcardChart').ChartCategory[]} */([]))

      return { categories }
    },
    selectedEntity() {
      if (this.mentionsFrequenciesResponses && this.punchData.categoryIndex > -1) {
        return this.mentionsFrequenciesResponses[this.punchData.categoryIndex].item
      }
      return null
    },
    /** @returns {EntityOrMention[]} */
    entitiesList() {
      return this.mentionsFrequenciesResponses.reduce((acc, response) => {
        const { item, subitems = [] } = response
        return acc.concat(item).concat(subitems)
      }, /** @type {EntityOrMention[]} */([]))
    },
    scale: {
      /** @returns {string} */
      get() {
        return getQueryParameter(this, QueryParameters.Scale) ?? 'linear'
      },
      /** @param {string} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.Scale]: value
        })
      }
    },
    /** @returns {any} */
    punchcardOptions() {
      return {
        circleScale: this.scale
      }
    }
  },
  get computed() {
    return this._computed
  },
  set computed(value) {
    this._computed = value
  },
  methods: {
    /**
     * @param {number} slotIndex
     * @returns {string|undefined}
     */
    getEntityIdForSlotIndex(slotIndex) {
      let lastEntity = undefined
      let chosenEntity = /** @type {EntityOrMention | undefined} */ (undefined)
      this.entitiesList.forEach((entity, index) => {
        if (index === slotIndex) chosenEntity = lastEntity
        if (entity.id != null) lastEntity = entity
      });
      return chosenEntity?.id
    },
    /**
     * @param {string | undefined} entityId
     * @returns {PaginationValuesContainer}
     */
    getPagination(entityId) {
      return this.paginations[entityId ?? ''] ?? getDefaultPagination()
    },
    /**
     * @param {string | undefined} entityId
     * @param {number} pageNumber
     */
    onInputPagination(entityId, pageNumber) {
      if (entityId == null) return
      const pagination = this.paginations[entityId] ?? getDefaultPagination()

      pagination.currentPage = pageNumber
      this.paginations[entityId] = pagination
    },
    async loadTimeline() {
      const observedItemsFilters = /** @type {Filter[]} */ (this.observingList.length > 0
        ? [{
          type: 'entity',
          op: 'OR',
          q: this.observingList
        }]
        : [])

      const currentSearchFilters = this.applyCurrentSearchFilters
        ? this.searchQuery.getFilters()
        : []

      const filters = observedItemsFilters.concat(currentSearchFilters)

      try {
        this.isTimelineLoading = true;
        this.timevalues = await searchFacetsService.get('year', {
          query: {
            filters,
            limit: 500,
          },
        }).then(res => Helpers.timeline.fromBuckets(res.buckets))
      } finally {
        this.isTimelineLoading = false;
      }
    },
    /** @param {any} data */
    onTimelineBrushed(data) {
      this.timelineSelectionStart = data.minDate
      this.timelineSelectionEnd = data.maxDate
    },
    handleTimelineCleared() {
      this.timelineSelectionStart = undefined
      this.timelineSelectionEnd = undefined
    },
    async loadPunchcardData({ skipPerEntity }) {
      const currentSearchFilters = this.applyCurrentSearchFilters
        ? this.searchQuery.getFilters()
        : []


      const timeFilter = /** @type {Filter[]} */ (this.currentTimelineSelectionSpan.length > 0
        ? [{
          type: 'daterange',
          // TODO: the daterange filter has a weird notion of ISO datetime format. It doesn't accept milliseconds.
          q: this.currentTimelineSelectionSpan.map(d => d.toISOString().replace(/\.\d+Z/, 'Z')).join(' TO ')
        }] : [])

      const filters = timeFilter.concat(currentSearchFilters)

      const payloads = this.observingList.map(entityId => ({
        entityId,
        filters,
        timeResolution: this.punchcardResolution,
        offset: skipPerEntity[entityId]
      }));

      try {
        this.isPunchcardLoading = true
        this.mentionsFrequenciesResponses = await Promise.all(
          payloads.map(payload => entityMentionsTimelineService.create(payload))
        )

        // update totals in pagination
        this.mentionsFrequenciesResponses.forEach(({ item, totalSubitems = 0 }) => {
          if (item.id == null) return
          const pagination = this.paginations[/** @type {string} */ (item.id)] ?? getDefaultPagination()
          pagination.totalRows = totalSubitems
          this.paginations[item.id] = pagination
        })
      } finally {
        this.isPunchcardLoading = false
      }
    },
    /** @param {EntityOrMention} entity */
    handleEntityLabelClicked(entity) {
      const items = this.observingList.filter(id => id !== entity.id);
      this.observingList = items;
    },
    handlePunchClicked({ datapoint, x, y, rect }) {
      const availableHeight = this.$refs?.visualisationWrapper?.parentNode?.offsetHeight;
      this.isPunchModalVisible = true;
      this.punchData = datapoint;
      const xmin = Math.min(rect.width - rect.x, Math.max(50, x - rect.x - 150));
      const ymin = Math.min(availableHeight / 2, y);
      console.info(y, availableHeight);
      this.punchModalPositions = { x: xmin, y: ymin };
      // console.log('@handlePunchClicked', x - window, y);
    },
    getWikimediaUrl(image) {
      return `http://commons.wikimedia.org/wiki/Special:FilePath/${image}?width=${this.thumbnailSize}px`;
    },
  },
  watch: {
    timelineUpdateParameters: {
      immediate: true,
      deep: true,
      async handler(newValues, oldValues) {
        if (JSON.stringify(newValues) === JSON.stringify(oldValues)) return;
        await this.loadTimeline();
      },
    },
    punchcardUpdateParameters: {
      immediate: true,
      deep: true,
      async handler(newValues, oldValues) {
        if (JSON.stringify(newValues) === JSON.stringify(oldValues)) return;
        await this.loadPunchcardData(newValues);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
  .top-section {
    width: 100%;
  }
  .current-search-panel {
    display: inline-flex;
  }
  .scale-selector {
    display: inline-flex;
  }
  .control-panel {
    justify-content: space-between;
  }
  .btnclose {
    width: 18px;
    height: 18px;
    top: -1px;
    position: relative;
  }
  .loading {
    opacity: 0.5;
  }
  .catlabel {
    width: 100vw;
    margin-top: -6px;
    height: 30px;
    overflow: hidden;
    pointer-events: none;
    .thumb {
      border-radius: 50%;
      object-fit: cover;
    }
  }
</style>

<i18n lang="json">
{
  "en": {
    "entity-label-in-year" : "<b>{label}</b> in <span class='date smallcaps'>{year}</span>",
    "no-entities-selected" : "Add named entities to the <span class='text-blue'>observing list</span> using the <span class='icon dripicons-preview text-muted'></span> icon.",
    "title": "Timeline of observed Named Entities",
    "scale": "Scale",
    "scales": {
      "linear": "Linear",
      "sqrt": "Square root",
      "symlog": "Bi-symmetric log"
    }
  }
}
</i18n>
