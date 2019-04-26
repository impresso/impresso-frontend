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
          <span v-if="selectedIds.length" v-html="$t(`label.${facet.type}.selected`, {count: selectedIds.length})" />
          <span v-else>
            {{$t(`label.${facet.type}.description`)}}
          </span>
        </span>
      </div>
      <!--
      <b-button v-on:click="removeFilter" class="float-right" variant="link" size="sm" v-show="facet.touched">
        <icon name="times" />
      </b-button> -->
    </base-title-bar>
    <div v-for="(filter, index) in included" :key="index" class="bg-light border p-2">
      <div v-for="(item, idx) in filter.items" :key="idx">
        <b-form-checkbox v-model="item.checked" @change="toggleFilterItem($event, filter, item.uid)">
          <span v-if="facet.type === 'topic'" v-html="item.htmlExcerpt"></span>
          <span v-if="facet.type === 'newspaper'">{{ item.name }}</span>
          <span v-if="facet.type === 'language'">{{ $t(`languages.${item.uid}`) }}</span>
        </b-form-checkbox>
      </div>

      <div v-if="filter.shadowItems.length">
        <div v-for="item in filter.shadowItems">
          <span v-if="facet.type === 'topic'" v-html="item.htmlExcerpt"></span>
          <span v-if="facet.type === 'newspaper'">{{ item.name }}</span>
          <span v-if="facet.type === 'language'">{{ $t(`languages.${item.uid}`) }}</span>
        </div>
      </div>

      <b-button v-if="filter.touched || filter.shadowItems.length" block size="sm" variant="outline-primary" @click="updateFilter(filter)">
        {{
          $t(`label.${facet.type}.update`, {
            added: filter.shadowItems.length,
            removed: filter.items.length - filter.q.length  
          })
        }}
      </b-button>

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

export default {
  data: () => ({
    selectedIds: [],
    selectedItems: [],
    operators: ['or', 'and', 'not'],
  }),
  props: ['facet'],
  computed: {
    filtered() {
      return this.$store.state.search.search.filtersIndex[this.facet.type];
    },
    included() {
      if (!this.filtered) {
        return [];
      }
      const included = this.filtered.filter(d => d.context !== 'exclude');

      included.forEach((filter) => {
        filter.q.forEach((d, i) => {
          // enrich included filter with matching buckets.
          const bucket = this.facet.buckets.find(b => b.val === d);

          if (bucket && filter.items[i]) {
            filter.items[i].count = bucket.count;
            filter.items[i].checked = true;
            filter.items[i].pristine = true;
          }
        });
      });
      return included;
    },
    includedIds() {
      return this.included.reduce((acc, filter) => acc.concat(filter.q), []);
    },
    // excluded() {
    //   if (!this.filtered) {
    //     return [];
    //   }
    //   return this.filtered.find(filter => filter.context === 'exclude');
    // },
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
      console.log('@toggleBucket', bucket);

      if (bucket.operator === 'or') {
        if (this.included.length) {
          if (bucket.checked) {
            this.included[0].addShadowItem(bucket.item);
          } else {
            this.included[0].removeShadowItem(bucket.item);
          }
        }
      }
      // htere is no active filters.
      const idx = this.selectedIds.indexOf(bucket.val);
      if (idx !== -1 && !bucket.checked) { // remove.
        this.selectedIds.splice(idx, 1);
        this.selectedItems.splice(idx, 1);
        bucket.checked = false;
      } else if (idx === -1 && bucket.checked) { // add.
        bucket.checked = true;
        this.selectedIds.push(bucket.val);
        this.selectedItems.push(bucket);
      } // nothing else matters
    },
    toggleFilterItem(checked, filter, itemUid) {
      if (!filter.hash) {
        console.log('storing hash somewhere');
        filter.hash = filter.getHash();
      }
      filter.q = filter.items
        .filter(d => (d.uid === itemUid ? checked : d.checked))
        .map(d => d.uid);
      filter.touched = filter.getHash() !== filter.hash;
      console.log('toggleFilterItem', filter.touched, filter.q);
    },
    applyFilter() {
      console.log('submit', this.facet.type, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.facet.type,
        ids: this.selectedIds,
      });
    },
    updateFilter(filter) {
      this.$emit('update-filter', filter);
    },
    resetFilterType() {
      this.$emit('reset-filter', this.facet.type);
    },
  },
  components: {
    BaseTitleBar,
    Icon,
    FilterFacetBucket,
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
        "update": "appply changes (added: {added}, removed: {removed})",
        "clear": "reset"
      },
      "newspaper": {
        "title": "filter by newspaper titles",
        "selected": "filter results if they appear in <b>one of {count} selected</b> newspapers",
        "description": "check one or more newspaper to filter results",
        "clear": "reset"
      },
      "language": {
        "title": "filter by language of articles",
        "selected": "filter results if they are written in <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply",
        "clear": "reset"
      }
    }
  },
  "nl": {
    "label": {
      "newspaper": "Krant",
      "language": "Taal"
    }
  }
}
</i18n>
