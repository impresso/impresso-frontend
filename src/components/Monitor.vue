<template lang="html">
  <div v-if="isActive" class="monitor drop-shadow bg-light" v-on:click.stop :class="{'invisible': isDragging}"
  draggable="true"
  v-on:dragstart="dragstart($event)"
  v-on:dragend="dragend($event)"
  v-bind:style="transformStyle"
  >
    <div class="d-flex my-2 align-items-center border-bottom">
      <b-tabs pills class="px-2" style="flex-grow:1">
        <template slot="tabs">
          <b-nav-item v-for="t in tabs" :key="t" v-on:click="switchTab(t)" :class="{'active': t === tab}">
            <span v-html="$t(`tabs.${t}`)"/>
          </b-nav-item>
        </template>
      </b-tabs>
      <div class="pr-3">
        <span class="dripicons-move mr-2"/>
        <span class="dripicons-cross" v-on:click="fadeOut"/>
      </div>
    </div>

    <div v-if="tab === 'currentSearch'" class="pt-2">
      <search-pills />
    </div>
    <div v-if="tab === 'selectedItem'" class="pt-2">
      <div v-if="isItemSelected">
        <div class="mx-2">
          <!--  title -->
          <h2 class="mx-2">
            <item-label :item="item" :type="type" />
            <span class="small-caps">{{ type }}</span>
          </h2>
          <!--  timeline vis -->
          <div v-if="itemTimelineDomain.length && !monitor.isPendingTimeline" style='position:relative'>
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
          <b-form-group class="mx-3">
            <b-form-checkbox v-model="applyCurrentSearchFilters" v-bind:value="true">
              {{ $t('labels.applyCurrentSearchFilters') }} <br/> <span v-html="statsLabel"/>
            </b-form-checkbox>
          </b-form-group>
        </div>
        <div v-if="monitor.isPending" v-html="$t('loading')" />
        <div v-else >
          <div class="text-center m-2">
            <b-button size="sm" variant="outline-primary" @click="applyFilter">{{ $t('actions.addToCurrentFilters') }}</b-button>
          </div>

          <!-- detailed label -->
          <div v-if="['person', 'location'].indexOf(type) !== -1">
            <wikidata-block :item="item" v-if="item.wikidataId" class="p-2"/>
            <div class="m-2" v-else>{{ item }}</div>
          </div>
          <div v-else class="m-2" style="max-height: 150px; overflow: scroll">
            <item-label :item="item" :type="type" detailed/>
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
import SearchPills from './SearchPills';
import Timeline from './modules/Timeline';
import WikidataBlock from './modules/WikidataBlock';
import ItemLabel from './modules/lists/ItemLabel';


export default {
  data: () => ({
    isDragging: false,
    position: {},
    transformStyle: {},
    tabs: ['selectedItem', 'currentSearch'],
    tab: 'selectedItem',
  }),
  methods: {
    dragstart({ x, y }) {
      this.isDragging = true;
      if (isNaN(this.position.x)) {
        this.position = { x, y };
      }
    },
    dragend({ x, y }) {
      this.isDragging = false;
      this.transformStyle = {
        transform: `translate(${x - this.position.x}px,${y - this.position.y}px)`,
      };
    },
    switchTab(tab) {
      this.tab = tab;
    },
    fadeOut() {
      return this.$store.dispatch('monitor/SET_IS_ACTIVE', false);
    },
    applyFilter() {
      return this.$store.dispatch('search/ADD_FILTER_TO_CURRENT_SEARCH', {
        type: this.type,
        q: [this.item.uid],
        items: [this.item],
        checked: true,
      });
    },
  },
  computed: {
    monitor() {
      return this.$store.state.monitor;
    },
    type() {
      return this.$store.state.monitor.type;
    },
    item() {
      return this.$store.state.monitor.item;
    },
    itemTimeline() {
      return this.$store.state.monitor.timeline;
    },
    itemTimelineDomain() {
      if (!this.$store.state.monitor.timeline.length) {
        return [];
      }
      return [
        this.$store.state.monitor.timeline[0].t,
        this.$store.state.monitor.timeline[this.$store.state.monitor.timeline.length - 1].t,
      ];
    },
    isItemSelected() {
      return !!this.$store.state.monitor.item;
    },
    isActive() {
      return this.$store.state.monitor.isActive;
    },
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
    statsLabel() {
      if (!this.itemTimelineDomain.length) {
        return this.$t('itemStatsEmpty');
      }
      return this.$t('itemStats', {
        count: this.$n(this.monitor.itemCountRelated),
        from: this.itemTimelineDomain[0],
        to: this.itemTimelineDomain[1],
      });
    },
    applyCurrentSearchFilters: {
      get() {
        return this.$store.state.monitor.applyCurrentSearchFilters;
      },
      set(val) {
        this.$store.dispatch('monitor/SET_APPLY_CURRENT_SEARCH_FILTERS', val);
        this.$store.dispatch('monitor/LOAD_ITEM_TIMELINE');
      },
    },
  },
  components: {
    SearchPills,
    Timeline,
    WikidataBlock,
    ItemLabel,
  },
  // - removed: added "x" close button in component
  // mounted() {
  //   document.addEventListener('click', this.fadeOut);
  //   document.addEventListener('touchstart', this.fadeOut);
  // },
};
</script>

<style lang="scss" scoped>
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
        "applyCurrentSearchFilters": "apply current search filters"
      },
      "itemStatsEmpty": "No results apparently",
      "itemStats": "{count} results from {from} to {to}"
    }
  }
</i18n>
