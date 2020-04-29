<template>
  <div class="job-item">
    <h2 class='sans p-0 m-0' style="font-size: 1rem">
      <span class="text-white"> {{ $t(`jobs.type.${item.type}`) }}</span>
    </h2>
    <div class="date small-caps">{{
      $d(item.creationDate, 'precise')
    }} (#{{item.id}})</div>
    <div>
      <blockquote v-if="hasSearchQuery" class="pl-2 my-1 border-left">
        <search-query-summary class="m-0"
          :search-query='{ filters: jobSearchFilters}' />
      </blockquote>
      <blockquote v-else-if="item.extra.collection" class="pl-2 my-1 border-left">
        <h3 class="text-white font-weight-bold sans p-0 m-0">
          <router-link v-if="item.extra.collection.status !== 'DEL'" :to="{ name: 'collection',
            params: {
              collection_uid: item.extra.collection.id
            }
          }" v-html="item.extra.collection.name" />
          <span v-else>
            <del  v-html="item.extra.collection.name"></del> ({{ $t('collection.deleted') }})
          </span>
        </h3>
        <span style="line-height:0.8" v-html="item.extra.collection.description" />
      </blockquote>
      <blockquote v-else v-html="item.description" class="pl-2 my-1 border-left small">
      </blockquote>

      <div>
        <span class='small-caps'>{{ $t(`jobs.status.${item.status}`) }}</span>
        <span class='text-white' v-if="item.isActive()"> {{ percentage }} %</span>
      </div>
      <div class="p-2 position-relative" v-if="item.isRunning()">
        <b-progress
          :value="percentage"
          variant="info"
          animated
          height="4px"/>
      </div>
    </div>
    <b-button-group v-if="isExportable || hasSearchQuery">
      <b-button
        v-if="isExportable"
        variant="outline-success" class="mt-2" size="sm"
        v-on:click="onExport()">
        <div class="d-flex align-items-center">
          <div>
            {{ $t('actions.downloadCsv') }}
          </div>
          <div class="d-flex dripicons dripicons-download ml-2" />
        </div>
      </b-button>
      <b-button
        :to="searchPageLink"
        v-if="hasSearchQuery"
        variant="outline-primary" class="mt-2" size="sm">
        <div class="d-flex align-items-center">
          <div>
            {{ $t('actions.searchMore') }}
          </div>
          <div class="d-flex dripicons dripicons-search ml-2" />
        </div>
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import Job from '@/models/Job';
import SearchQuery from '@/models/SearchQuery';
import { CommonQueryParameters } from '@/router/util';
import SearchQuerySummary from '@/components/modules/SearchQuerySummary';

export default {
  props: {
    item: {
      type: Job,
    },
  },
  computed: {
    jobSearchFilters() {
      const sq = this.item.getSearchQueryHash();
      if (!sq.length) {
        return [];
      }
      try {
        return SearchQuery.deserialize(sq).filters;
      } catch(err) {
        console.warn('Unable to deserialize job searchquery hash, skipping. Error received:', err);
        return [];
      }
    },
    isExportable() {
      return this.item.isExportable();
    },
    hasSearchQuery() {
      return this.jobSearchFilters.length;
    },
    searchPageLink() {
      return {
        name: 'search',
        query: {
          [CommonQueryParameters.SearchFilters]: this.item.getSearchQueryHash(),
        },
      };
    },
    percentage() {
      return this.item.getProgressAsPercentage();
    },
  },
  methods: {
    onExport(){
      console.info('onExport');
    }
  },
  components: {
    SearchQuerySummary,
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.sass";
.job{
  color: $clr-grey-400;
}
blockquote, h3, h3 a{
  font-size: 0.9rem;
  color: white;
}
.bg-dark h2{
  color: inherit;
}
</style>
<i18n>
  {
    "en": {
      "no-jobs-yet": "Here you will find notifications about your newly created collections and recent downloads.",
      "jobs": {
        "type": {
          "EXP": "export search results as csv",
          "DCO": "Deleting a collection",
          "IDX": "Indexing collection items",
          "store_collectable_items": "Indexing collection items",
          "TES": "Echo (TEST)",
          "test": "Echo (TEST)",
          "BCQ": "Saving items in your collection",
          "execute_solr_query": "Saving items in your collection"
        },
        "status": {
          "DON": "done",
          "RUN": "progress",
          "ERR": "error",
          "STO": "stopped",
          "RIP": "removed"
        }
      }
    }
  }
</i18n>
