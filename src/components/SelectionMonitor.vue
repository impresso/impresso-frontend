<template>
  <div
    v-if="isActive"
    class="SelectionMonitor rounded drop-shadow bg-light"
    :class="monitor.type"
    v-on:click.stop
  >
    <div class="d-flex flex-column h-100">
      <!-- top -->
      <section>
        <!-- header -->
        <div class="d-flex my-2 ml-2 ms-2 align-items-center">
          <b-tabs pills class="px-2 pb-2 pt-1 small-caps" style="flex-grow: 1">
            <template v-slot:tabs-end>
              <b-nav-item class="active">
                <span v-html="$t(`tabs_${monitor.type}_${monitor.scope}`)" />
              </b-nav-item>
            </template>
          </b-tabs>
          <div class="pr-3 SelectionMonitor_close">
            <span class="dripicons-cross" v-on:click="hide" />
          </div>
        </div>
        <!-- end header -->
        <!-- title -->
        <!-- if this is a range filter, allow to modify it with input text fields -->
        <SelectionMonitorFilter
          v-if="
            [
              'textReuseClusterLexicalOverlap',
              'textReuseClusterDayDelta',
              'textReuseClusterSize'
            ].includes(monitor.type)
          "
          :filter="additionalFilters.length ? additionalFilters[0] : monitorFilter"
          @changeFilter="handleChangeFilter"
          class="border p-2 rounded"
        />
        <h2 class="mx-3" v-if="monitor.item">
          <ItemLabel :item="monitor.item" :type="monitor.type" />
          <!-- <span class="small-caps pl-2">{{ $t('types_' + monitor.type) }}</span> -->
        </h2>

        <!-- end title -->
        <!-- timeline -->
        <div v-if="monitor.displayTimeline" class="mx-2">
          <timeline
            class="bg-light"
            :domain="[startYear, endYear]"
            :contrast="false"
            :values="timelineValues"
          >
            <template v-slot="{ tooltip }">
              <div v-if="tooltip.item">
                {{ $d(tooltip.item?.t ?? 0, 'year') }} &middot;
                <div
                  class="d-inline"
                  v-if="tooltip.item?.w"
                  v-html="$tc('numbers.contentItems', tooltip.item.w, { n: $n(tooltip.item.w) })"
                />
              </div>
            </template>
          </timeline>
        </div>
        <!-- end timeline -->
        <!-- filters -->
        <div class="mx-3" v-if="monitor.displayCurrentSearchFilters">
          <b-form-group class="m-0">
            <b-form-checkbox v-model="applyCurrentSearchFilters">
              <span
                v-html="
                  $t('labels.applyCurrentSearchFilters', { count: this.supportedFilters.length })
                "
              />
            </b-form-checkbox>
          </b-form-group>
          <p class="ml-1 SelectionMonitor_summary">
            <span v-html="statsLabel" />{{ ' ' }}

            <SearchQuerySummary
              class="d-inline"
              :search-query="{
                filters: additionalFilters.length ? additionalFilters : [monitorFilter]
              }"
            />
            <span v-if="monitor.displayTimeline && this.total">
              <br />
              <span
                v-html="
                  $t('dates.allResultsFallBetween', {
                    from: minDate.getFullYear(),
                    to: maxDate.getFullYear()
                  })
                "
              />
            </span>
          </p>
        </div>
        <!-- end filters -->
      </section>
      <!-- end top -->
      <!-- bottom -->
      <TextReuseClusterMonitor
        :filters="applyCurrentSearchFilters ? monitorFilters : []"
        :item="monitor.item"
        v-if="monitor.type === 'textReuseCluster'"
        class="flex-grow-1"
      />
      <TextReusePassageMonitor
        :filters="applyCurrentSearchFilters ? monitorFilters : []"
        :item="monitor.item"
        v-if="monitor.type === 'textReusePassage'"
        class="flex-grow-1 bg-dark mt-2"
      ></TextReusePassageMonitor>
      <!-- range closeup view-->
      <ListOfItems
        v-if="
          [
            'textReuseClusterLexicalOverlap',
            'textReuseClusterDayDelta',
            'textReuseClusterSize'
          ].includes(monitor.type)
        "
        :params="{ addons: { newspaper: 'text' } }"
        :filters="applyCurrentSearchFilters ? monitorFilters : []"
        :searchIndex="monitor.searchIndex"
      >
        <template v-slot:default="props">
          <div class="d-flex justify-content-center">
            <TextReusePassageItem v-for="match in props.items" :key="match.id" :item="match" />
          </div>
        </template>
      </ListOfItems>
      <!-- detailed label -->
      <EntityMonitor
        v-else-if="['person', 'location', 'organisation'].includes(monitor.type)"
        :filters="applyCurrentSearchFilters ? monitorFilters : []"
        :id="monitor.item.id || monitor.item.uid || ''"
        :type="monitor.type"
        :search-index="monitor.searchIndex"
        @close="hide"
      />
      <div
        v-else-if="['topic', 'newspaper'].includes(monitor.type)"
        class="mx-3 border-top border-bottom"
        style="max-height: 150px; overflow: scroll"
      >
        <ItemLabel :item="monitor.item" :type="monitor.type" detailed />
      </div>

      <!-- button url  -->
      <router-link
        v-if="detailsUrl"
        class="btn btn-outline-secondary m-3 btn-sm d-block"
        :to="detailsUrl"
        @click="hide"
      >
        {{ $t('actions.detail') }}
      </router-link>
      <!-- end bottom -->
      <!-- actions -->
      <div
        class="p-2 border-tertiary border-top d-flex justify-content-between"
        v-if="monitor.displayActionButtons"
      >
        <button v-on:click.prevent.stop="applyFilter" class="btn btn-sm btn-outline-primary">
          {{
            $t(monitorFilterExists ? 'actions.updateCurrentFilters' : 'actions.addToCurrentFilters')
          }}
        </button>
        <button v-on:click.prevent.stop="hide" class="btn btn-sm btn-outline-primary">
          {{ $t('actions.close') }}
        </button>
      </div>
      <!-- end actions -->
      <pre v-if="monitor.debug">{{ JSON.stringify(monitor, null, 2) }}</pre>
      <!-- <pre v-if="monitor.item" class="text-small">{{
        JSON.stringify(
          monitorFilters.map(d => ({ type: d.type, q: d.q })),
          null,
          2,
        )
      }}</pre> -->
    </div>
  </div>
</template>

<script>
import Helpers from '@/plugins/Helpers'
import ItemLabel from './modules/lists/ItemLabel.vue'
import SearchQuerySummary from './modules/SearchQuerySummary.vue'
import { SupportedFiltersByIndex } from '@/logic/filters'
import { getSearchFacetsService } from '@/services'
import Timeline from '@/components/modules/Timeline.vue'
import FilterFactory from '@/models/FilterFactory'
import TextReuseClusterMonitor from './TextReuseClusterMonitor.vue'
import SelectionMonitorFilter from './SelectionMonitorFilter.vue'
import ListOfItems from './ListOfItems.vue'
import TextReusePassageItem from './modules/lists/TextReusePassageItem.vue'
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'
import EntityMonitor from '@/components/EntityMonitor.vue'
import TextReusePassageMonitor from '@/components/TextReusePassageMonitor.vue'
/**
 * SelectionMonitor component is initialized in App.vue and it is always available.
 * The filters props is kept in sync with the current search filters.
 */
export default defineComponent({
  name: 'SelectionMonitor',
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    startYear: {
      type: Number
    },
    endYear: {
      type: Number
    }
  },
  components: {
    Timeline,
    SearchQuerySummary,
    ItemLabel,
    TextReuseClusterMonitor,
    SelectionMonitorFilter,
    TextReusePassageMonitor,
    EntityMonitor,
    ListOfItems,
    TextReusePassageItem
  },
  beforeMount() {
    const store = useSelectionMonitorStore()
    this.applyCurrentSearchFilters = store.applyCurrentSearchFilters
  },
  computed: {
    ...mapStores(useSelectionMonitorStore),
    supportedFilters() {
      return this.filters.filter(filter =>
        SupportedFiltersByIndex[this.monitor.searchIndex].includes(filter.type)
      )
    },
    monitorFilter() {
      return FilterFactory.create({
        type: this.monitor.type,
        q: Array.isArray(this.monitor.item?.q)
          ? this.monitor.item?.q?.map(d => String(d))
          : [this.monitor.item?.id ?? this.monitor.item?.uid],
        items: this.monitor.item ? [this.monitor.item] : []
      })
    },
    isMonitorFilterChanged() {
      return !this.additionalFilters.length
    },
    monitorFilters() {
      const otherFilters = this.supportedFilters.filter(filter => filter.type !== this.monitor.type)
      if (this.additionalFilters.length) {
        return otherFilters.concat(...this.additionalFilters)
      }
      return otherFilters.concat(this.monitorFilter)
    },
    monitorFilterExists() {
      return this.filters.some(filter => filter.type === this.monitor.type)
    },
    /** @returns {object} */
    detailsUrl() {
      if (!this.monitor.item) {
        return null
      } else if (this.monitor.type === 'newspaper') {
        return {
          name: 'newspaper_metadata',
          params: {
            newspaper_uid: this.monitor.item.uid
          }
        }
      } else if (this.monitor.type === 'topic') {
        return {
          name: 'topic',
          params: {
            topic_uid: this.monitor.item.uid
          }
        }
        // @ts-ignore
      }
      return null
    },
    /** @returns {{ query: any, hash: string }} */
    timelineApiQueryParams() {
      const query = {
        index: this.monitor.searchIndex,
        limit: 500,
        filters: []
      }
      console.debug(
        '[SelectionMonitor] timelineApiQueryParams',
        this.displayCurrentSearchFilters,
        this.applyCurrentSearchFilters,
        query
      )
      if (this.monitor.displayCurrentSearchFilters && this.applyCurrentSearchFilters) {
        query.filters = [...this.monitorFilters]
      } else if (!this.applyCurrentSearchFilters && this.monitor.item) {
        query.filters = [{ ...this.monitorFilter }]
      }
      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    },
    isActive() {
      return this.selectionMonitorStore.isActive
    },
    monitor() {
      return this.selectionMonitorStore
    },
    /** @returns {string} */
    statsLabel() {
      if (this.isLoading) {
        return this.$t('actions.loading')
      }
      let key = 'itemStats'

      if (this.applyCurrentSearchFilters && this.filters.length) {
        key = 'itemStatsFiltered'
      }
      return this.$t(key, {
        count: this.$n(this.total),
        searchIndex: this.$t('searchIndexes.' + this.monitor.searchIndex)
      })
    },
    /** @returns {Date} */
    minDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (min, d) => (d.t < min ? d.t : min),
          this.timelineValues[0].t
        )
        return new Date(`${y}-01-01`)
      }
      return new Date(`${this.startYear}-01-01`)
    },
    /** @returns {Date} */
    maxDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (max, d) => (d.t > max ? d.t : max),
          this.timelineValues[0].t
        )
        return new Date(`${y}-12-31`)
      }
      return new Date(`${this.endYear}-12-31`)
    },
    monitorType() {
      return this.monitor.type
    }
  },
  data: () => ({
    total: 0,
    timelineValues: [],
    applyCurrentSearchFilters: false,
    isLoading: false,
    additionalFilters: []
  }),
  methods: {
    handleChangeFilter(newFilter) {
      // eslint-disable-next-line
      console.debug('[SelectionMonitor] handleChangeFilter', newFilter)
      this.additionalFilters = [newFilter]
    },
    hide() {
      this.selectionMonitorStore.hide()
    },
    applyFilter() {
      if (!this.monitorFilterExists) {
        this.$emit('change', this.monitorFilters)
      } else if (this.additionalFilters.length) {
        // additionalFilters are the edited version of the monitorFilter filter.
        // if they're present we substitute the current filter with the edited version.
        this.$emit(
          'change',
          this.filters
            .filter(f => f.type !== this.monitorFilter.type)
            .concat(this.additionalFilters)
        )
      } else {
        // we replace the current filter with the monitorFilter
        this.$emit(
          'change',
          this.filters.filter(f => f.type !== this.monitorFilter.type).concat(this.monitorFilter)
        )
      }
    },
    loadTimeline() {
      // eslint-disable-next-line
      console.debug(
        '[SelectionMonitor] loadTimeline index:',
        this.timelineApiQueryParams.query.index
      )
      const searchFacets = getSearchFacetsService(this.timelineApiQueryParams.query.index)
      searchFacets
        .get(
          'year',
          {
            query: this.timelineApiQueryParams.query
          },
          { ignoreErrors: true }
        )
        .then(response => {
          // eslint-disable-next-line no-console
          console.debug('[SelectionMonitor] loadTimeline success', response)
          this.timelineValues = Helpers.timeline.fromBuckets(response.buckets)
          this.total = response.buckets.reduce((acc, bucket) => acc + bucket.count, 0)
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('[SelectionMonitor] loadTimeline error', error)
        })
    }
  },
  watch: {
    monitorType: {
      handler() {
        this.additionalFilters = []
      }
    },
    timelineApiQueryParams: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[ItemSelector] @searchApiQueryParameters \n query:', query)
        if (this.isActive && this.monitor.displayTimeline) {
          this.loadTimeline()
        }
      },
      immediate: true,
      deep: false
    }
  },
  emits: ['change']
})
</script>

<style lang="css">
.SelectionMonitor {
  border: 1px solid #343a40;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  margin-left: -200px;
  margin-top: -175px;
  pointer-events: auto;
}

.SelectionMonitor.textReuseCluster,
.SelectionMonitor.textReusePassage {
  width: 800px;
  top: 100px;
  height: calc(100% - 200px);
  margin-top: auto;
  margin-left: -400px;
}
.SelectionMonitor.textReuseClusterSize,
.SelectionMonitor.textReusePassageSize,
.SelectionMonitor.textReuseClusterDayDelta,
.SelectionMonitor.textReuseClusterLexicalOverlap {
  /** pu the  */
  top: 100px;
  width: 400px;
  margin-top: auto;
}

.SelectionMonitor_body {
  max-height: 300px;
  overflow-y: scroll;
}
.SelectionMonitor_close {
  cursor: pointer;
}
.SelectionMonitor_close:hover {
  color: var(--primary);
}
.SelectionMonitor h2 {
  font-size: inherit;
}

.SelectionMonitor_summary .date {
  font-weight: bold;
  /* all-small-caps */
  text-transform: lowercase;
  font-variant: small-caps;
}

/** for lg screen,increase selectionMonitorWidth */
@media (min-width: 992px) {
  .SelectionMonitor.textReuseCluster,
  .SelectionMonitor.textReusePassage {
    width: 800px;
    margin-left: -400px;
  }
  .SelectionMonitor.textReuseClusterSize,
  .SelectionMonitor.textReusePassageSize,
  .SelectionMonitor.textReuseClusterDayDelta,
  .SelectionMonitor.textReuseClusterLexicalOverlap {
    width: 600px;
    margin-left: -300px;
  }
  .SelectionMonitor .TextReusePassageItem {
    max-width: initial;
    margin: 0 var(--spacing-3);
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "labels": {
      "applyCurrentSearchFilters": "Apply current search filters (<span class='number'>{count}</span>)"
    },
    "searchIndexes": {
      "search": "articles",
      "tr_passages": "text reuse passages",
      "textReuse": "Text Reuse"
    },
    "types_country": "country of publication",
    "types_language": "language",
    "types_accessRight": "access right",
    "types_partner": "archive / partner institution",
    "types_topic": "topic",
    "types_collection": "collection",
    "types_newspaper": "newspaper",
    "types_person": "person",
    "types_location": "location",
    "types_type": "article type",
    "types_textReuseCluster": "cluster of text reuse",
    "types_textReuseClusterSize": "cluster size",
    "types_textReuseClusterDayDelta": "time span in days",
    "types_textReuseClusterLexicalOverlap": "lexical overlap",
    "tabs_collection_overview": "collection",
    "tabs_string_overview": "Text search",
    "tabs_textReuseCluster_overview": "cluster of text reuse",
    "tabs_textReuseCluster_comparePassages": "compare text reuse passages in this cluster",
    "tabs_textReusePassage_comparePassages": "compare text reuse passages",
    "tabs_textReuseClusterSize_closeUp": "text reuse cluster size  - close-up view",
    "tabs_textReuseClusterLexicalOverlap_closeUp": "lexical overlap  - close-up view",
    "tabs_textReuseClusterDayDelta_closeUp": "Time span in days  - close-up view",
    "tabs_newspaper_overview": "newspaper",
    "tabs_topic_overview": "topic",
    "tabs_partner_overview": "provider",
    "tabs_accessRight_overview": "access right",
    "tabs_copyright_overview": "copyright status",
    "tabs_language_overview": "language",
    "tabs_type_overview": "item type",
    "tabs_sourceType_overview": "source type",
    "tabs_sourceMedium_overview": "source medium",
    "tabs_country_overview": "country of publication",
    "tabs_person_overview": "person",
    "tabs_persons_overview": "person",
    "tabs_location_overview": "location",
    "tabs_locations_overview": "location",
    "tabs_organisation_overview": "organisation",
    "tabs_organisations_overview": "organisation",
    "tabs_newsagencies_overview": "news agency",
    "tabs_nag_overview": "news agency",
    "itemStatsEmpty": "No results apparently",
    "itemStats": "<b class='number'>{count}</b> {searchIndex}",
    "itemStatsFiltered": "<b class='number'>{count}</b> {searchIndex} using current search filters"
  }
}
</i18n>
