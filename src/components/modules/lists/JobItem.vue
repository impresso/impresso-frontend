<template>
  <div class="JobItem" :class="className">
    <h2 class="sans mt-2 mb-1 font-weight-medium font-size-inherit">
      <span
        v-html="
          $t(`jobs_type_${item.type}`, {
            total: item.extra.total > -1 ? $n(item.extra.total) : ''
          })
        "
      />
      <span v-if="item.extra.collection?.name">: {{ item.extra.collection.name }} </span>&nbsp;
      <span class="small-caps ml-2" :class="[item.status]">{{
        $t(`jobs_status_${item.status}`)
      }}</span>
    </h2>
    <div class="date">
      {{ $d(item.creationDate, 'precise') }}
      (#{{ item.id }})
    </div>
    <blockquote v-if="item.extra.collection?.name" class="pl-2 my-1 border-left">
      <span>
        <router-link
          class="text-white text-decoration-underline"
          v-if="item.extra.collection.name && item.extra.collection.status !== 'DEL'"
          :to="{ name: 'collection', params: { collection_uid: item.extra.collection.id } }"
        >
          {{ item.extra.collection.name }}
        </router-link>
      </span>
      <span v-html="item.extra.collection.description" class="small" />
    </blockquote>
    <blockquote v-else-if="hasSearchQuery" class="pl-2 mt-1 mb-2 border-left">
      <span v-html="item.description" class="small" />

      &nbsp;
      <button
        class="btn btn-xs text-white btn-outline-white d-inline-flex align-items-center"
        @click="gotoSearchPage"
      >
        {{ $t('actions.searchMore') }}<Icon name="search" :scale="0.5" :stroke-width="2" />
      </button>
    </blockquote>
    <div class="text-white number" v-if="item.isRunning()">&nbsp;{{ percentage }} %</div>
    <div class="p-2 position-relative" v-if="item.isRunning()">
      <div class="progress">
        <div
          class="progress-bar bg-success progress-bar-animated"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="percentage"
          :style="`width: ${percentage}%; height: 4px;`"
        ></div>
      </div>
    </div>
    <b-button
      v-if="props.item.isExportable()"
      variant="outline-success"
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
    <b-button v-if="item.status === 'RUN'" size="sm" variant="outline-white" @click="stopJob">
      Stop</b-button
    >
  </div>
</template>
<script setup lang="ts">
/**
 * Model value is used to control the visibility of the panel.
 */
import { getAuthHeaders } from '@/util/auth'
import Job from '@/models/Job'
import Icon from '@/components/base/Icon.vue'
import { MIDDLELAYER_MEDIA_URL, getAuthenticationToken, jobs as jobsService } from '@/services'
import { computed } from 'vue'
import router from '@/router'
import type { PropType } from 'vue'

const props = defineProps({
  item: {
    type: Object as PropType<Job>,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})
const percentage = computed(() => {
  return Math.round((props.item.progress || 0) * 100)
})
const hasSearchQuery = computed(() => {
  return !!props.item.extra.query
})

const gotoSearchPage = () => {
  router.push({
    name: 'search',
    query: {
      sq: props.item.extra.sq
    }
  })
}
const stopJob = async () => {
  console.info('[JobItem] stopJob requested for:', props.item.id)
  const result = await jobsService.patch(props.item.id, { status: 'stop' })
  console.info('[JobItem] stopJob result:', result)
}
const onExport = () => {
  const today = new Date().toISOString().split('T').shift()
  const anchor = document.createElement('a')
  document.body.appendChild(anchor)
  const headers = new Headers(getAuthHeaders(getAuthenticationToken()))
  fetch(`${MIDDLELAYER_MEDIA_URL}/jobs/${props.item.id}`, { headers })
    .then(res => res.blob())
    .then(blobby => {
      const objectUrl = window.URL.createObjectURL(blobby)
      anchor.href = objectUrl
      anchor.download = `export-${today}-${props.item.id}.zip`
      anchor.click()
      window.URL.revokeObjectURL(objectUrl)
    })
}
</script>

<style scoped>
.date {
  font-size: var(--impresso-font-size-smaller);
  opacity: 0.65;
}
span.RUN {
  background-color: var(--clr-grey-200);
  color: white;
  padding: 0 4px;
  border-radius: 2px;
}
span.DON {
  background-color: var(--success);
  color: white;
  padding: 0 4px;
  border-radius: 2px;
}
.progress {
  height: 4px;
}
</style>
<i18n lang="json">
{
  "en": {
    "no-jobs-yet": "Here you will find notifications about your newly created collections and recent downloads.",
    "jobs_type_ITR": "sync collection to related text reuse passages",
    "jobs_type_EXP": "export search results as csv",
    "jobs_type_DCO": "Deleting a collection",
    "jobs_type_IDX": "Indexing {total} collection items",
    "jobs_type_store_collectable_items": "Indexing collection items",
    "jobs_type_TES": "Echo (TEST)",
    "jobs_type_RTR": "Remove text reuse passages from your collection",
    "jobs_type_test": "Echo (TEST)",
    "jobs_type_BCQ": "Saving {total} item(s) in your collection",
    "jobs_type_RDX": "Remove {total} item(s) from your collection",
    "jobs_type_BCT": "Add {total} item(s) to your collection from Text Reuse",
    "jobs_type_UUB": "Update permissions",
    "jobs_status_DON": "done",
    "jobs_status_RUN": "in progress",
    "jobs_status_ERR": "error",
    "jobs_status_STO": "stopped",
    "jobs_status_RIP": "removed"
  }
}
</i18n>
