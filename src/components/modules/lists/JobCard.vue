<template>
  <article class="JobCard" :data-status="visualStatus" :aria-busy="isBusy">
    <div class="JobCard__row d-flex align-items-center justify-content-between">
      <span class="JobCard__status d-inline-flex align-items-center">
        <span
          class="small-caps status-pill"
          :class="[`status-${item.status}`, { 'text-white': item.status !== 'RUN' }]"
          :title="
            $t(`jobs_status_${item.status}_title`, $t(`jobs_status_${item.status}`) as string)
          "
        >
          {{ displayStatusLabel }}
        </span>
      </span>
      <TimeAgo :date="item.creationDate" class="JobCard__time small-caps" />
    </div>

    <h2 class="sans font-weight-medium font-size-inherit text-white JobCard__title">
      <span
        v-html="
          $t(`jobs_type_${item.type}`, {
            total: item.extra.total > -1 ? $n(item.extra.total) : ''
          })
        "
      />
      <span v-if="item.extra.collection?.name">: {{ item.extra.collection.name }}</span>
    </h2>

    <blockquote v-if="item.extra.collection?.name" class="JobCard__quote pl-2 my-1 border-left">
      <span>
        <router-link
          class="text-white text-decoration-underline"
          v-if="item.extra.collection.name && item.extra.collection.status !== 'DEL'"
          :to="{ name: 'collection', params: { collection_id: item.extra.collection.id } }"
        >
          {{ item.extra.collection.name }}
        </router-link>
      </span>
      <span v-html="item.extra.collection.description" class="small text-white" />
    </blockquote>
    <blockquote v-else-if="hasDescription" class="JobCard__quote pl-2 mt-1 mb-2 border-left">
      <span v-html="renderedDescription" class="small text-white" />
    </blockquote>

    <div v-if="showProgress" class="mt-1">
      <div class="d-flex justify-content-between align-items-center">
        <span v-if="progressLabel" class="small text-white">{{ progressLabel }}</span>
        <span class="text-white number ms-auto">{{ percentage }}%</span>
      </div>
      <div class="p-2 position-relative">
        <div class="progress">
          <div
            class="progress-bar JobCard__progress-bar"
            :class="{ 'progress-bar-animated progress-bar-striped': !isStoppingLocal }"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="percentage"
            :style="`width: ${percentage}%; height: 4px;`"
          />
        </div>
      </div>
    </div>

    <div
      v-if="actionState || hasSearchQuery"
      class="mt-2 d-flex align-items-center JobCard__actions"
    >
      <b-button
        v-if="actionState"
        :variant="actionState.variant"
        size="sm"
        :disabled="actionState.disabled"
        class="JobCard__action-btn"
        :class="actionState.buttonClass"
        @click="actionState.onClick"
      >
        <span
          v-if="actionState.spinner"
          class="spinner-border spinner-border-sm mr-1"
          role="status"
          aria-hidden="true"
        />
        <span>{{ actionState.label }}</span>
        <span v-if="actionState.icon" :class="actionState.icon" />
      </b-button>
      <b-button
        v-if="hasSearchQuery"
        size="sm"
        variant="outline-white"
        class="JobCard__action-btn"
        @click="onGotoSearchPage"
      >
        <span>{{ $t('actions.searchMore') }}</span>
        <Icon name="search" :scale="0.5" :stroke-width="2" />
      </b-button>
      <span v-if="downloadError" class="small text-danger ml-2">
        {{ $t('actions.downloadFailed') }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import Job from '@/models/Job'
import Icon from '@/components/base/Icon.vue'
import { useJobsStore } from '@/stores/jobs'
import { getAuthHeaders } from '@/util/auth'
import { getAuthenticationToken } from '@/services'
import router from '@/router'
import TimeAgo from '@/components/TimeAgo.vue'

const BasePath = import.meta.env.VITE_USE_PROXY_MIDDLEWARE
  ? ''
  : import.meta.env.VITE_MIDDLELAYER_API

const props = defineProps({
  item: {
    type: Object as PropType<Job>,
    required: true
  }
})

const jobsStore = useJobsStore()
const isDownloading = ref(false)
const downloadError = ref(false)

const percentage = computed(() => Math.round((props.item.progress || 0) * 100))
const isStoppingLocal = computed(() => jobsStore.isStopping(props.item.id))
const hasSearchQuery = computed(() => !!(props.item.extra.query || props.item.extra.sq))
const renderedDescription = computed(() => props.item.description)
const hasDescription = computed(() => !!renderedDescription.value.trim())

const isBusy = computed(
  () => props.item.isRunning() || isStoppingLocal.value || isDownloading.value
)

const showProgress = computed(
  () => props.item.isRunning() || (isStoppingLocal.value && !props.item.isTerminal())
)

const visualStatus = computed(() => {
  if (isStoppingLocal.value && props.item.isRunning()) return 'STOPPING'
  if (isDownloading.value && props.item.isDone()) return 'DOWNLOADING'
  return props.item.status
})

/**
 * Progress line is for operational detail only (backend message). Status
 * words like "in progress" / "cancelling" live on the badge so we don't
 * repeat the same phrase three times on one card.
 */
const progressLabel = computed(() => {
  if (isStoppingLocal.value) return ''
  const msg = props.item.extra.message
  return msg && typeof msg === 'string' && msg.trim().length ? msg : ''
})

const displayStatusLabel = computed(() => {
  if (isStoppingLocal.value && props.item.isRunning()) return 'cancelling'
  if (isDownloading.value && props.item.isDone()) return 'downloading'
  return statusLabel(props.item.status)
})

function statusLabel(status: string) {
  switch (status) {
    case 'RUN':
      return 'in progress'
    case 'DON':
      return 'done'
    case 'STO':
      return 'cancelled'
    case 'RIP':
      return 'removed'
    case 'ERR':
      return 'failed'
    default:
      return status.toLowerCase()
  }
}

interface ActionState {
  label: string
  variant: string
  disabled: boolean
  spinner: boolean
  buttonClass?: string
  icon?: string
  onClick: () => void
}

const actionState = computed<ActionState | null>(() => {
  const job = props.item
  if (job.isRunning()) {
    // Once Stop is pressed the badge says "cancelling" — hide the button.
    if (isStoppingLocal.value) return null
    return {
      label: 'Stop',
      variant: 'outline-secondary',
      buttonClass: 'JobCard__action-btn--stop',
      disabled: false,
      spinner: false,
      onClick: onStop
    }
  }
  if (job.isDone() && job.isExportType()) {
    return {
      label: 'Download',
      variant: 'outline-success',
      disabled: isDownloading.value,
      spinner: isDownloading.value,
      icon: isDownloading.value ? undefined : 'dripicons dripicons-download',
      onClick: isDownloading.value ? () => {} : onExport
    }
  }
  if (job.isStopped() || job.isRemoved()) {
    return null
  }
  if (job.isFailed()) {
    return {
      label: 'Failed',
      variant: 'outline-danger',
      disabled: true,
      spinner: false,
      onClick: () => {}
    }
  }
  return null
})

function onGotoSearchPage() {
  router.push({ name: 'search', query: { sq: props.item.extra.sq } })
}

async function onStop() {
  try {
    await jobsStore.stopJob(props.item.id)
  } catch (error) {
    console.warn('[JobCard] stopJob failed:', error)
  }
}

async function onExport() {
  downloadError.value = false
  isDownloading.value = true
  const today = new Date().toISOString().split('T').shift()
  const anchor = document.createElement('a')
  document.body.appendChild(anchor)
  const headers = new Headers(getAuthHeaders(getAuthenticationToken()))
  const jobUrl = `${BasePath}${import.meta.env.VITE_MIDDLELAYER_API_PATH.replace(/\/+$/, '')}/media/jobs/${props.item.id}`
  try {
    const res = await fetch(jobUrl, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    anchor.href = objectUrl
    anchor.download = `export-${today}-${props.item.id}.zip`
    anchor.click()
    window.URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.warn('[JobCard] onExport failed:', error)
    downloadError.value = true
  } finally {
    document.body.removeChild(anchor)
    isDownloading.value = false
  }
}
</script>

<style scoped>
.JobCard {
  --accent: var(--clr-grey-400);
  display: block;
  padding: var(--spacing-3);
  color: var(--impresso-color-white);
  transition: background-color 0.12s ease-out;
}

.JobCard[data-status='RUN'],
.JobCard[data-status='STOPPING'] {
  --accent: var(--impresso-color-yellow);
}
.JobCard[data-status='DON'],
.JobCard[data-status='DOWNLOADING'] {
  --accent: var(--success);
}
.JobCard[data-status='STO'],
.JobCard[data-status='RIP'] {
  --accent: var(--clr-grey-400);
}
.JobCard[data-status='ERR'] {
  --accent: var(--warning);
}

.JobCard__row {
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.JobCard__status {
  gap: var(--spacing-2);
}

.status-pill {
  padding: 0 6px;
  border-radius: 3px;
  white-space: nowrap;
}
.status-pill.status-RUN {
  background-color: var(--impresso-color-yellow);
  color: var(--impresso-color-black);
}
.status-pill.status-DON {
  background-color: var(--success);
}
.status-pill.status-STO,
.status-pill.status-RIP {
  background-color: var(--clr-grey-300);
}
.status-pill.status-ERR {
  background-color: var(--danger);
}

.JobCard__time {
  color: var(--clr-grey-400);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.JobCard__actions {
  gap: var(--spacing-2);
}

.JobCard__actions :deep(.JobCard__action-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  padding: 0.25rem 0.75rem;
  min-height: 1.875rem;
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: var(--bs-font-sans-serif);
  font-weight: 450;
  font-variation-settings: 'wght' 450;
  text-transform: none;
  letter-spacing: normal;
  white-space: nowrap;
}

.JobCard__actions :deep(.JobCard__action-btn--stop),
.JobCard__actions :deep(.JobCard__action-btn--stop:disabled) {
  color: var(--impresso-color-yellow);
  border-color: var(--impresso-color-yellow);
  opacity: 1;
}

.JobCard__actions :deep(.JobCard__action-btn--stop:hover:not(:disabled)),
.JobCard__actions :deep(.JobCard__action-btn--stop:focus:not(:disabled)) {
  background-color: var(--impresso-color-yellow);
  border-color: var(--impresso-color-yellow);
  color: var(--impresso-color-black);
}

.JobCard__title {
  margin: 0 0 var(--spacing-1);
  line-height: inherit;
  overflow-wrap: anywhere;
}

.JobCard__quote {
  border-color: var(--impresso-clr-tertiary) !important;
}

.progress {
  height: 4px;
}

.JobCard__progress-bar {
  background-color: var(--impresso-color-yellow);
}

@media (prefers-reduced-motion: reduce) {
  .JobCard {
    transition: none !important;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "jobs_type_EXP": "Export search results as CSV",
    "jobs_type_EXC": "Export collection as CSV",
    "jobs_type_ITR": "Sync collection to text reuse passages",
    "jobs_type_DCO": "Deleting a collection",
    "jobs_type_IDX": "Indexing {total} collection items",
    "jobs_type_TES": "Echo (TEST)",
    "jobs_type_test": "Echo (TEST)",
    "jobs_type_BCQ": "Saving {total} item(s) in your collection",
    "jobs_type_RDX": "Remove {total} item(s) from your collection",
    "jobs_type_BCT": "Add {total} item(s) from Text Reuse",
    "jobs_type_UUB": "Update permissions",
    "jobs_status_DON": "done",
    "jobs_status_RUN": "in progress",
    "jobs_status_ERR": "failed",
    "jobs_status_STO": "cancelled",
    "jobs_status_RIP": "removed",
    "jobs_status_DON_title": "Ready to download",
    "jobs_status_RUN_title": "This task is currently running",
    "jobs_status_ERR_title": "This task failed to complete",
    "jobs_status_STO_title": "You cancelled this task",
    "jobs_status_RIP_title": "This task's result was removed",
    "actions.searchMore": "Open in search",
    "actions.downloadFailed": "Download failed, please retry"
  }
}
</i18n>
