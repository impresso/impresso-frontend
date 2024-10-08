<template>
  <div class="job-item">
    <h2 class="sans p-0 m-0" style="font-size: 1rem">
      <span
        >{{
          $t(`jobs.type.${item.type}`, {
            total: item.extra.total > -1 ? $n(item.extra.total) : ''
          })
        }}&nbsp;</span
      >
      <router-link
        class="text-white text-decoration-underline"
        v-if="item.extra.collection.name && item.extra.collection.status !== 'DEL'"
        :to="{
          name: 'collection',
          params: {
            collection_uid: item.extra.collection.id
          }
        }"
        >{{ item.extra.collection.name }}</router-link
      >
    </h2>
    <div class="date small-caps">{{ $d(item.creationDate, 'precise') }} (#{{ item.id }})</div>
    <div>
      <blockquote v-if="hasSearchQuery" class="pl-2 my-1 border-left">
        <search-query-summary class="m-0" :search-query="{ filters: jobSearchFilters }" />
      </blockquote>
      <blockquote v-else-if="item.extra.collection" class="pl-2 my-1 border-left">
        <span style="line-height: 0.8" v-html="item.extra.collection.description" />
      </blockquote>
      <blockquote v-else v-html="item.description" class="pl-2 my-1 border-left small"></blockquote>

      <div>
        <span class="small-caps" :class="[item.status]">{{
          $t(`jobs.status.${item.status}`)
        }}</span>
        <span class="text-white" v-if="item.isActive()">&nbsp;{{ percentage }} %</span>
      </div>
      <div class="p-2 position-relative" v-if="item.isRunning()">
        <div class="progress">
          <div
            class="progress-bar bg-info progress-bar-animated"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="percentage"
            :style="`width: ${percentage}%; height: 4px;`"
          ></div>
        </div>
      </div>
    </div>
    <b-button-group v-if="isExportable || hasSearchQuery">
      <b-button
        v-if="isExportable"
        variant="outline-success"
        class="mt-2"
        size="sm"
        v-on:click="onExport()"
      >
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
        variant="outline-primary"
        class="mt-2"
        size="sm"
      >
        <div class="d-flex align-items-center">
          <div>
            {{ $t('actions.searchMore') }}
          </div>
          <div class="d-flex dripicons dripicons-search ml-2" />
        </div>
      </b-button>
    </b-button-group>
    <b-button v-if="item.status === 'RUN'" size="sm" variant="outline-tertiary" @click="stopJob">
      Stop</b-button
    >
  </div>
</template>

<script>
import Job from '@/models/Job'
import SearchQuery from '@/models/SearchQuery'
import { CommonQueryParameters } from '@/router/util'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary.vue'
import { MIDDLELAYER_MEDIA_URL, getAuthenticationBearer, jobs as jobsService } from '@/services'

export default {
  props: {
    item: {
      type: Job
    }
  },
  computed: {
    jobMediaUrl() {
      return `${MIDDLELAYER_MEDIA_URL}/jobs/${this.item.id}`
    },
    jobSearchFilters() {
      const sq = this.item.getSearchQueryHash()
      if (!sq.length) {
        return []
      }
      try {
        return SearchQuery.deserialize(sq).filters
      } catch (err) {
        console.warn('Unable to deserialize job searchquery hash, skipping. Error received:', err)
        return []
      }
    },
    isExportable() {
      return this.item.isExportable()
    },
    hasSearchQuery() {
      return this.jobSearchFilters.length
    },
    searchPageLink() {
      return {
        name: 'search',
        query: {
          [CommonQueryParameters.SearchFilters]: this.item.getSearchQueryHash()
        }
      }
    },
    percentage() {
      return this.item.getProgressAsPercentage()
    }
  },
  methods: {
    onExport() {
      const today = new Date().toISOString().split('T').shift()
      const anchor = document.createElement('a')
      document.body.appendChild(anchor)
      const headers = new Headers()
      headers.append('Authorization', `Bearer ${getAuthenticationBearer()}`)
      fetch(this.jobMediaUrl, { headers })
        .then(res => res.blob())
        .then(blobby => {
          const objectUrl = window.URL.createObjectURL(blobby)
          anchor.href = objectUrl
          anchor.download = `export-${today}-${this.item.id}.zip`
          anchor.click()
          window.URL.revokeObjectURL(objectUrl)
        })
    },
    async stopJob() {
      console.debug('stopJob', this.item.id)
      const result = await jobsService.patch(this.item.id, { status: 'stop' })
      console.debug('stopJob result', result)
    }
  },
  components: {
    SearchQuerySummary
  }
}
</script>

<style lang="scss" scoped>
.job {
  color: #c6ccd2;
}
blockquote,
h3,
h3 a {
  font-size: 0.9rem;
  color: white;
}
.bg-dark h2 {
  color: inherit;
}

span.DON {
  background-color: var(--success);
  color: white;
  padding: 0 4px;
  border-radius: 2px;
}
</style>
<i18n lang="json">
{
  "en": {
    "no-jobs-yet": "Here you will find notifications about your newly created collections and recent downloads.",
    "jobs": {
      "type": {
        "ITR": "sync collection to related text reuse passages",
        "EXP": "export search results as csv",
        "DCO": "Deleting a collection",
        "IDX": "Indexing {total} collection items",
        "store_collectable_items": "Indexing collection items",
        "TES": "Echo (TEST)",
        "test": "Echo (TEST)",
        "RDX": "Remove {total} item(s) from your collection",
        "BCQ": "Saving {total} item(s) in your collection",
        "RDX": "Remove {total} item(s) from your collection",
        "execute_solr_query": "Saving items in your collection",
        "BCT": "Add {total} item(s) to your collection from Text Reuse"
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
