<template lang="html">
  <div class="mb-4">
    <base-title-bar>
      {{$t(`label.${facet.type}.title`)}}
      <div slot="options">
        <b-button v-show="filtered" size="sm" variant="outline-primary" @click="resetFilterType">
          {{ $t(`label.${facet.type}.clear`) }}
        </b-button>
      </div>
      <div slot="description">
        <span v-if="filtered">
          {{$t(`label.${facet.type}.filtered`)}}
        </span>
        <span v-else>
          <span v-if="selectedIds.length">
            <span v-html="$t(`label.${facet.type}.selected`, {count: selectedIds.length})" />
            <b-button size="sm" variant="outline-primary" @click="applyFilter">
              {{ $t(`label.${facet.type}.apply`) }}
            </b-button>
          </span>
          <span v-else>
            {{$t(`label.${facet.type}.description`)}}
          </span>
        </span>
      </div>
    </base-title-bar>
    <div v-for="(filter, index) in included" :key="index" class="bg-light border p-2">
      <filter-monitor v-if='index === included.length - 1' :store="store" :filter="filter" :type="facet.type" :operators="facet.operators"
        :items-to-add="selectedItems"
        @filter-applied="clearSelectedItems"/>
      <filter-monitor v-else :filter="filter" :store="store" :type="facet.type" :operators="facet.operators" />
    </div>
    <div v-for="(filter, index) in excluded" :key="index" class="bg-light border p-2">
      <filter-monitor :store="store" :filter="filter" :type="facet.type" :operators="facet.operators" />
    </div>


    <filter-facet-bucket v-for="bucket in unfiltered" :key="bucket.val"
      :bucket="bucket"
      :type="facet.type"
      @toggle-bucket="toggleBucket"/>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/times';
import Icon from 'vue-awesome/components/Icon';
import BaseTitleBar from './../base/BaseTitleBar';
import FilterFacetBucket from './FilterFacetBucket';
import FilterMonitor from './FilterMonitor';

export default {
  data: () => ({
    selectedIds: [],
    selectedItems: [],
    operators: ['or', 'and'],
  }),
  props: {
    store: {
      type: String,
      default: 'search',
    },
    facet: {
      type: Object,
    },
  },
  computed: {
    currentStore() {
      if (this.store === 'searchImages') {
        return this.$store.state.searchImages;
      }
      return this.$store.state.search;
    },
    filtered() {
      return this.currentStore.search.filtersIndex[this.facet.type];
    },
    included() {
      if (!this.filtered) {
        return [];
      }
      const included = this.currentStore.search
        .filtersIndex[this.facet.type]
        .filter(d => d.context !== 'exclude');
      // enrich included filter with matching buckets.
      included.forEach((filter) => {
        filter.items.forEach((d, i) => {
          const bucket = this.facet.buckets.find(b => b.val === d.uid);

          if (bucket && filter.items[i]) {
            filter.items[i].count = bucket.count;
          }
        });
      });
      return included;
    },
    includedIds() {
      return this.included.reduce((acc, filter) => acc.concat(filter.qh), []);
    },
    excluded() {
      if (!this.filtered) {
        return [];
      }
      return this.filtered.filter(d => d.context === 'exclude');
    },
    /**
     * List facet buckets NOT included in a filter
     * @return {Array} array of buckets
     */
    unfiltered() {
      if (!this.filtered || !this.included) {
        return this.facet.buckets;
      }
      return this.facet.buckets.filter(b => this.includedIds.indexOf(b.val) === -1);
    },
  },
  methods: {
    toggleBucket(bucket) {
      const idx = this.selectedIds.indexOf(bucket.val);
      if (idx !== -1 && !bucket.checked) { // remove.
        this.selectedIds.splice(idx, 1);
        this.selectedItems.splice(idx, 1);
        bucket.checked = false;
      } else if (idx === -1 && bucket.checked) { // add.
        bucket.checked = true;
        this.selectedIds.push(bucket.val);
        if (bucket.item) {
          this.selectedItems.push({
            checked: true,
            ...bucket.item,
            count: bucket.count,
          });
        } else {
          this.selectedItems.push(bucket);
        }
      } // nothing else matters
    },
    clearSelectedItems() {
      this.selectedIds = [];
      this.selectedItems = [];
    },
    applyFilter() {
      console.log('submit', this.facet.type, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.facet.type,
        ids: this.selectedIds,
      });
      this.clearSelectedItems();
    },
    updateFilter(filter) {
      this.$emit('update-filter', filter);
    },
    resetFilterType() {
      this.clearSelectedItems();
      this.$emit('reset-filter', this.facet.type);
    },
  },
  components: {
    BaseTitleBar,
    Icon,
    FilterFacetBucket,
    FilterMonitor,
  },
};
</script>

<style scoped lang="less">
</style>
<i18n>
{
  "en": {
    "label": {
      "topic": {
        "title": "filter by topic",
        "filtered": "results are filtered when:",
        "selected": "filter results if <b>one of {count} selected</b> topic applies",
        "description": "check one or more topics to filter results",
        "apply": "apply",
        "clear": "reset"
      },
      "collection": {
        "title": "filter by collection",
        "filtered": "results are filtered when:",
        "selected": "filter results if <b>one of {count} selected</b> collection applies",
        "description": "check one or more collection to filter results",
        "apply": "apply",
        "clear": "reset"
      },
      "newspaper": {
        "title": "filter by newspaper titles",
        "filtered": "results are filtered when:",
        "selected": "filter results if they appear in <b>one of {count} selected</b> newspapers",
        "description": "check one or more newspaper to filter results",
        "clear": "reset",
        "apply": "apply"
      },
      "language": {
        "title": "filter by language of articles",
        "filtered": "results are filtered when:",
        "selected": "filter results if they are written in <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply",
        "clear": "reset"
      }
    }
  }
}
</i18n>
