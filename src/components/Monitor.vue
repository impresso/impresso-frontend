<template lang="html">
  <div v-if="isActive" class="monitor drop-shadow p-2 bg-light" v-on:click.stop :class="{'invisible': isDragging}"
  draggable="true"
  v-on:dragstart="dragstart($event)"
  v-on:dragend="dragend($event)"
  v-bind:style="transformStyle"
  >
    <b-tabs pills class="border-bottom">
      <template slot="tabs">
        <b-nav-item v-for="t in tabs" :key="t" v-on:click="switchTab(t)" :class="{'active': t === tab}">
          <span v-html="$t(`tabs.${t}`)"/>
        </b-nav-item>
      </template>
    </b-tabs>
    <div v-if="tab === 'currentSearch'" class="mx-2 pt-2">
      <search-pills />
    </div>
    <div v-if="tab === 'selectedItem'" class="mx-2 pt-2">
      <div v-if="isItemSelected">
        <h2>{{ item.name || item.uid }} <span class="small-caps">{{ type }}</span></h2>
        <div v-html="statsLabel"/>


        <!--  timeline vis -->
        <div v-if="itemTimelineDomain.length && !monitor.isPendingTimeline" style='position:relative'>
          <timeline class='bg-light pb-2'
            :values="itemTimeline"
            :domain="itemTimelineDomain">
            <div slot-scope="tooltipScope">
              <div v-if="tooltipScope.tooltip.item">
                {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
                <b>{{ tooltipScope.tooltip.item.w }}</b>
                <!-- <br />
                <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
                &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
                ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
                </span> -->
              </div>
            </div>
          </timeline>
          <b-form-group class="mx-3">
            <b-form-checkbox v-model="applyCurrentSearchFilters" v-bind:value="true">
              {{ $t('labels.applyCurrentSearchFilters') }}
            </b-form-checkbox>
          </b-form-group>
        </div>

        <div v-if="monitor.isPending" v-html="$t('loading')" />
        <div v-else>{{ monitor.item }} </div>
      </div>
      <div v-else>there is no selection.</div>

    </div>
  </div>
</template>

<script>
import SearchPills from './SearchPills';
import Timeline from './modules/Timeline';

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
    applyCurrentSearchFilters: {
      get() {
        return this.$store.state.monitor.applyCurrentSearchFilters;
      },
      set(val) {
        this.$store.dispatch('monitor/SET_APPLY_CURRENT_SEARCH_FILTERS', val);
        this.$store.dispatch('monitor/LOAD_ITEM_TIMELINE');
      },
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
  },
  components: {
    SearchPills,
    Timeline,
  },
  mounted() {
    document.addEventListener('click', this.fadeOut);
    document.addEventListener('touchstart', this.fadeOut);
  },
};
</script>

<style lang="scss" scoped>
  .monitor {
    border: 1px solid black;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    margin-left: -200px;
    margin-top: -175px;
    pointer-events: auto;
    &.invisible {
      opacity: 0.15;
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
