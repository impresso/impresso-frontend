<template>
  <div v-if="isActive" class="monitor drop-shadow bg-light" v-on:click.stop>
  <!-- <div v-if="isActive" class="monitor drop-shadow bg-light" v-on:click.stop :class="{'invisible': isDragging}"
  draggable="true"
  v-on:dragstart="dragstart($event)"
  v-on:dragend="dragend($event)"
  v-bind:style="transformStyle"
  > -->
    <div class="d-flex my-2 align-items-center">
      <b-tabs pills class="px-2" style="flex-grow:1">
        <template v-slot:tabs-end>
          <b-nav-item v-for="t in tabs" :key="t" v-on:click="switchTab(t)" :class="{'active': t === tab}">
            <span v-html="$t(`tabs.${t}`)"/>
            <span class="pl-1" v-if="subtitle" v-html="subtitle"/>
          </b-nav-item>
        </template>
      </b-tabs>
      <div class="pr-3">
        <span class="dripicons-cross" v-on:click="fadeOut"/>
      </div>
    </div>

    <div v-if="tab === 'selectedItem'" class="pt-2">
      <div v-if="isItemSelected">
        <div class="mx-2">
          <!--  title -->
          <h2 class="mx-2">
            <item-label :item="item" :type="type" />
            <span class="small-caps pl-2">{{ type }}</span>
          </h2>
          <!--  timeline vis -->
          <div style="min-height: 80px">
            <div v-if="itemTimelineDomain.length && !monitor.isPendingTimeline" style='position:relative;'>
              <timeline class='bg-light pb-2'
                :values="itemTimeline"
                :domain="itemTimelineDomain">
                <div slot-scope="tooltipScope">
                  <div v-if="tooltipScope.tooltip.item">
                    {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
                    <b>{{ tooltipScope.tooltip.item.w }}</b> {{ monitor.groupBy }}
                    <!-- <br />
                    <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
                    &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
                    ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
                    </span> -->
                  </div>
                </div>
              </timeline>

            </div>
          </div>
          <!-- {{ path }}
          {{ searchQueryId }}
          {{ searchQueryFilters }} -->
          <div class="mx-3">
            <b-form-group class="m-0">
              <b-form-checkbox v-model="applyCurrentSearchFilters">
                <span v-html="$t('labels.applyCurrentSearchFilters', { count: countActiveFilters })"/>
              </b-form-checkbox>
            </b-form-group>
              <p class="ml-1">
                <ellipsis  v-bind:initialHeight="70">
                  <span v-html="statsLabel"/>
                  <search-query-summary v-if="applyCurrentSearchFilters" class="pl-2 border-left border-tertiary" :search-query='searchQuery' />
                </ellipsis>
              </p>
          </div>
        </div>
        <div v-if="monitor.isPending" class="text-center m-3" v-html="$t('loading')" />
        <div v-else >
          <div class="text-center m-2" v-if="filterModificationsEnabled">
            <b-button size="sm" class="mr-1" variant="outline-primary" @click="applyFilter('include')">{{ $t('actions.addToCurrentFilters') }}</b-button>
            <b-button size="sm" class="ml-1" variant="outline-primary" @click="applyFilter('exclude')">{{ $t('actions.removeFromCurrentFilters') }}</b-button>
          </div>

          <!-- detailed label -->
          <div class="mx-3">
            <div v-if="['person', 'location'].indexOf(type) !== -1">
              <wikidata-block :item="item" v-if="item.wikidataId" class="p-2"/>
              <div class="m-2" v-else>{{ item }}</div>
            </div>
            <div v-else class="m-2" style="max-height: 150px; overflow: scroll">
              <item-label :item="item" :type="type" detailed/>
            </div>
          </div>

          <!-- button url  -->
          <div class="text-center m-2" v-if="detailsUrl">
            <router-link class="btn btn-primary btn-sm" :to="detailsUrl">
              {{ $t('actions.more') }}
            </router-link>
          </div>
        </div>
      </div>
      <div v-else>there is no selection.</div>

    </div>
  </div>
</template>

<script>
import Ellipsis from './modules/Ellipsis';
import Timeline from './modules/Timeline';
import WikidataBlock from './modules/WikidataBlock';
import ItemLabel from './modules/lists/ItemLabel';
import SearchQuerySummary from './modules/SearchQuerySummary';
import SearchQuery from '../models/SearchQuery';

/**
 * @typedef {import('@/models').Filter} Filter
 */

/**
 * Display info about the current selected item.
 * Trigger from inside a component:
       ```
       this.$store.dispatch('monitor/ACTIVATE', {
          item: {...},
          type: '...facet type...',
          filters: [...],
          filtersUpdatedCallback: filters => {
            // ...update filters
          }
        })
       ```
  * Cfr src/components/modules/ItemSelector.vue
  */

export default {
  data: () => ({
    isDragging: false,
    position: {},
    transformStyle: {},
    tabs: ['selectedItem'], // 'currentSearch'],
    tab: 'selectedItem',
  }),
  methods: {
    /**
     * @param {{ x: number, y: number }} param
     */
    dragstart({ x, y }) {
      this.isDragging = true;
      if (isNaN(this.position.x)) {
        this.position = { x, y };
      }
    },
    /**
     * @param {{ x: number, y: number }} param
     */
    dragend({ x, y }) {
      this.isDragging = false;
      this.transformStyle = {
        transform: `translate(${x - this.position.x}px,${y - this.position.y}px)`,
      };
    },
    /**
     * @param {string} tab
     */
    switchTab(tab) {
      this.tab = tab;
    },
    /**
     * @returns {any}
     */
    fadeOut() {
      return this.$store.dispatch('monitor/SET_IS_ACTIVE', false);
    },
    /**
     * @param {string} context
     */
    async applyFilter(context = 'include') {
      console.info('applyFilter() \n- context:', context);

      const newFilter = {
        type: this.type,
        q: this.item.uid,
        items: [this.item],
        context
      }

      const isAlreadyIncluded = this.searchQueryFilters.find(({ type, q, context }) => {
        const isQsame = Array.isArray(q)
          ? q.length === 1 && q[0] === newFilter.q
          : q === newFilter.q
        return type === newFilter.type
          && context === newFilter.context
          && isQsame
      })

      if (!isAlreadyIncluded) {
        const updatedFilters = [...this.searchQueryFilters].concat(newFilter)
        await this.$store.dispatch('monitor/UPDATE_FILTERS', updatedFilters);
      }

      // this.$eventBus.$emit(this.$eventBus.ADD_FILTER_TO_SEARCH_QUERY, {
      //   searchQueryId: this.searchQueryId,
      //   filter: {
      //     type: this.type,
      //     q: [this.item.uid],
      //     items: [this.item],
      //     context,
      //     checked: true,
      //   },
      // });
      this.fadeOut();
    },
  },
  computed: {
    /** @returns {any} */
    monitor() { return this.$store.state.monitor },
    /** @returns {string} */
    type() { return this.$store.state.monitor.type },
    /** @returns {object} */
    item() {
      return this.$store.state.monitor.item;
    },
    /** @returns {any[]} */
    itemTimeline() {
      return this.$store.state.monitor.timeline;
    },
    /** @returns {[number, number] | []} */
    itemTimelineDomain() {
      if (!this.$store.state.monitor.timeline.length) {
        return [];
      }
      return [
        this.$store.state.monitor.timeline[0].t,
        this.$store.state.monitor.timeline[this.$store.state.monitor.timeline.length - 1].t,
      ];
    },
    /** @returns {number} */
    countActiveFilters() {
      return this.searchQuery.countActiveFilters();
    },
    /** @returns {SearchQuery} */
    searchQuery() {
      return new SearchQuery({ filters: this.searchQueryFilters })
      // return this.$store.getters['monitor/getCurrentSearchQuery'];
    },
    /** @returns {Filter[]} */
    searchQueryFilters() {
      return this.$store.getters['monitor/getCurrentSearchFilters'];
    },
    /** @returns {string} */
    searchQueryFiltersLabel() {
      if (this.itemTimelineDomain.length !== 2) {
        return this.$t('actions.loading').toString()
      }
      const [from, to] = this.itemTimelineDomain;
      return this.$t('itemStatsFiltered', {
        count: this.countActiveFilters,
        from,
        to,
      }).toString()
    },
    /** @returns {boolean} */
    isItemSelected() {
      return !!this.$store.state.monitor.item;
    },
    /** @returns {boolean} */
    isActive() {
      return this.$store.state.monitor.isActive;
    },
    /** @returns {object} */
    detailsUrl() {
      if (this.type === 'newspaper') {
        return {
          name: 'newspaper',
          params: {
            newspaper_uid: this.item.uid,
          },
        };
      } else if (this.type === 'topic') {
        return {
          name: 'topic',
          params: {
            topic_uid: this.item.uid,
          },
        };
      // @ts-ignore
      } else if (this.$helpers.isEntity(this.type)) {
        return {
          name: 'entity',
          params: {
            entity_id: this.item.uid,
          },
        };
      }
      return null;
    },
    /** @returns {string | undefined} */
    path() {
      return this.$route.name;
    },
    /** @returns {string} */
    statsLabel() {
      if (this.monitor.isPendingTimeline) {
        return this.$t('actions.loading').toString()
      }
      let key = 'itemStats';

      if (!this.itemTimelineDomain.length) {
        key = 'itemStatsEmpty';
      } else if (this.applyCurrentSearchFilters && this.countActiveFilters) {
        key = 'itemStatsFiltered';
      }
      return this.$t(key, {
        count: this.$n(this.monitor.itemCountRelated),
        from: this.itemTimelineDomain[0],
        to: this.itemTimelineDomain[1],
      }).toString()
    },
    applyCurrentSearchFilters: {
      /** @returns {boolean} */
      get() {
        return this.$store.state.monitor.applyCurrentSearchFilters;
      },
      /** @param {boolean} val */
      set(val) {
        this.$store.dispatch('monitor/SET_APPLY_CURRENT_SEARCH_FILTERS', val);
        this.$store.dispatch('monitor/LOAD_ITEM_TIMELINE');
      },
    },
    /** @returns {boolean} */
    filterModificationsEnabled() {
      return !this.$store.state.monitor.disableFilterModification
    },
    /** @returns {string} */
    subtitle() {
      return this.$store.state.monitor.subtitle
    }
  },
  components: {
    Timeline,
    WikidataBlock,
    ItemLabel,
    SearchQuerySummary,
    Ellipsis,
  },
  // - removed: added "x" close button in component
  // mounted() {
  //   document.addEventListener('click', this.fadeOut);
  //   document.addEventListener('touchstart', this.fadeOut);
  // },
};
</script>

<style lang="scss">
  .monitor {
    border: 1px solid #343a40;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    margin-left: -200px;
    margin-top: -175px;
    pointer-events: auto;

    h2 {
      font-size: inherit;
    }
  }
</style>
<i18n>
  {
    "en": {
      "tabs": {
        "currentSearch": "current search",
        "selectedItem": "current selection"
      },
      "labels": {
        "applyCurrentSearchFilters": "apply current search filters ({count} filters)"
      },
      "itemStatsEmpty": "No results apparently",
      "itemStats": "<b class='number'>{count}</b> results in total (from {from} to {to})",
      "itemStatsFiltered": "<b class='number'>{count}</b> results from {from} to {to}, within current search:"
    }
  }
</i18n>
