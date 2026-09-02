<template>
  <BDropdown
    ref="dropdownRef"
    right
    class="TasksDropdownPreview px-2"
    @shown="onShown"
    @hidden="onHidden"
  >
    <template v-slot:button-content>
      <span class="TasksDropdownPreview__toggle-icon dripicons-cloud-download" aria-hidden="true" />
      <span class="TasksDropdownPreview__toggle-label ml-1">{{ $t('label') }}</span>
      <transition name="TasksDropdownPreview__bounce">
        <span
          v-if="!isOpen && unreadCount > 0"
          class="TasksDropdownPreview__badge"
          :title="$t('unreadTitle', { n: unreadCount })"
        >
          {{ unreadCount }}
        </span>
      </transition>
    </template>
    <template v-slot:button-icon>
      <Icon name="chevron" :scale="0.75" :stroke-width="2" />
    </template>

    <div class="TasksDropdownPreview__panel">
      <div v-if="!visibleJobs.length" class="TasksDropdownPreview__empty text-center text-white">
        <span class="dripicons-inbox" aria-hidden="true" />
        <p class="mb-0 text-white">{{ $t('empty') }}</p>
      </div>

      <ul v-else class="TasksDropdownPreview__list">
        <li v-for="job in visibleJobs" :key="job.id" class="TasksDropdownPreview__row border-bottom">
          <JobCard :item="job" />
        </li>
      </ul>

      <footer v-if="hasMore" class="TasksDropdownPreview__footer text-center small-caps text-white">
        {{ $t('viewingLast', { visible: visibleJobs.length, total: totalExports }) }}
      </footer>
    </div>
  </BDropdown>
</template>

<script setup lang="ts">
/**
 * TasksDropdownPreview - a fast, standalone dropdown wired to the same
 * jobs store as the legacy tasks dropdown. Renders the latest N export
 * jobs with no pagination so the panel is instant.
 *
 * The toggle button shows an unread-count badge (jobs updated since the
 * user last closed the dropdown) instead of auto-opening the panel.
 *
 * On show:
 * - triggers a background refresh (non-blocking - the last cached list
 *   is shown immediately)
 *
 * While any job is running the store is polled every few seconds, so
 * both the badge and an open panel stay live even if websocket events
 * don't come through (e.g. flaky dev proxy).
 */
import { computed, onUnmounted, ref, watch } from 'vue'
import BDropdown from '@/components/legacy/bootstrap/BDropdown.vue'
import Icon from '@/components/base/Icon.vue'
import JobCard from '@/components/modules/lists/JobCard.vue'
import { useJobsStore } from '@/stores/jobs'
import { useSettingsStore } from '@/stores/settings'

export interface TasksDropdownPreviewProps {
  /** Maximum number of jobs to render. Defaults to 4. */
  maxItems?: number
  /** If true, show every job type instead of only exports. */
  includeAllTypes?: boolean
}

const props = withDefaults(defineProps<TasksDropdownPreviewProps>(), {
  maxItems: 4,
  includeAllTypes: false
})

const emit = defineEmits<{
  (e: 'shown'): void
  (e: 'hidden'): void
}>()

const jobsStore = useJobsStore()
const settingsStore = useSettingsStore()
const dropdownRef = ref<{ show: () => void; hide: () => void } | null>(null)
const isOpen = ref(false)

const EXPORT_TYPES = new Set(['EXP', 'EXC'])

const filteredJobs = computed(() => {
  if (props.includeAllTypes) return jobsStore.items
  return jobsStore.items.filter(job => EXPORT_TYPES.has(job.type))
})

const visibleJobs = computed(() => {
  return [...filteredJobs.value]
    .sort((a, b) => b.lastModifiedDate.getTime() - a.lastModifiedDate.getTime())
    .slice(0, props.maxItems)
})

/**
 * Jobs newer than the last one the user has seen. Keyed on job *id*
 * (not a timestamp) so the bubble appears once per new export/task and
 * never re-triggers on progress ticks - and it's immune to clock/timezone
 * skew between the server's creation dates and the client. Server job ids
 * are monotonic, so "newer" == "higher id".
 */
const unreadCount = computed(() => {
  const lastSeenId = settingsStore.lastSeenJobId
  return filteredJobs.value.filter(job => job.id > lastSeenId).length
})

/** Remember the newest job currently shown so it stops counting as unread. */
function markJobsSeen() {
  const maxId = filteredJobs.value.reduce((max, job) => Math.max(max, job.id), 0)
  settingsStore.updateLastSeenJobId(maxId)
}

const totalExports = computed(() => filteredJobs.value.length)
const hasMore = computed(() => totalExports.value > visibleJobs.value.length)

/**
 * Poll the server while any job is running, so progress and completion
 * show up without reopening the dropdown even if websocket delivery fails.
 */
const hasActiveJobs = computed(() => jobsStore.items.some(job => job.isRunning()))
let pollTimer: ReturnType<typeof setInterval> | null = null

watch(
  hasActiveJobs,
  active => {
    if (active && pollTimer == null) {
      pollTimer = setInterval(() => {
        void jobsStore.loadJobs({ page: 1, limit: Math.max(props.maxItems, 4) })
      }, 5000)
    } else if (!active && pollTimer != null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (pollTimer != null) clearInterval(pollTimer)
})

/**
 * On open we trigger a background refresh so the user always sees fresh
 * data, but we never wait for it.
 */
function onShown() {
  isOpen.value = true
  emit('shown')
  markJobsSeen()
  void jobsStore.loadJobs({ page: 1, limit: Math.max(props.maxItems, 4) })
}

function onHidden() {
  // The legacy BDropdown emits `hidden` immediately on mount (its isOpen
  // watcher runs with `immediate: true` while closed). Ignore that so the
  // read-marker isn't reset - and the badge cleared - before the user has
  // ever opened the panel.
  if (!isOpen.value) return
  isOpen.value = false
  // Capture any job that arrived while the panel was open.
  markJobsSeen()
  emit('hidden')
}

defineExpose({
  show: () => dropdownRef.value?.show(),
  hide: () => dropdownRef.value?.hide()
})
</script>

<style scoped>
.TasksDropdownPreview__toggle-icon {
  display: inline-block;
  position: relative;
  top: 0.25em;
}
.TasksDropdownPreview__toggle-label {
  color: var(--impresso-color-white);
}
.TasksDropdownPreview__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 6px;
  border-radius: var(--impresso-border-radius-xl);
  background: var(--warning);
  color: var(--impresso-color-black);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.TasksDropdownPreview__panel {
  position: relative;
  width: 350px;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--clr-grey-100);
  color: var(--impresso-color-white);
  font-size: 1rem;
  border-radius: var(--impresso-border-radius-xs);
}

.TasksDropdownPreview__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  max-height: 300px;
}

@media (min-height: 600px) {
  .TasksDropdownPreview__list {
    max-height: 550px;
  }
}

.TasksDropdownPreview__row {
  display: block;
  border-color: var(--clr-grey-200) !important;
}

.TasksDropdownPreview__empty {
  padding: var(--spacing-4) var(--spacing-3);
  font-size: 0.95rem;
}

.TasksDropdownPreview__empty [class^='dripicons-'] {
  display: block;
  margin: 0 auto var(--spacing-2);
  font-size: 1.5rem;
  opacity: 0.75;
}

.TasksDropdownPreview__footer {
  padding: var(--spacing-2) var(--spacing-3);
  border-top: 1px solid var(--clr-grey-200);
  font-size: var(--impresso-font-size-smallcaps);
}

.TasksDropdownPreview__bounce-enter-active,
.TasksDropdownPreview__bounce-leave-active {
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.15s ease;
}
.TasksDropdownPreview__bounce-enter-from,
.TasksDropdownPreview__bounce-leave-to {
  transform: scale(0);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .TasksDropdownPreview__bounce-enter-active,
  .TasksDropdownPreview__bounce-leave-active {
    animation: none !important;
    transition: none !important;
  }
}
</style>

<style>
/* Remove BootstrapVue's legacy dropdown menu padding & background */
.TasksDropdownPreview .dropdown-menu {
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  min-width: 350px;
  margin-top: 0 !important;
}
</style>

<i18n lang="json">
{
  "en": {
    "label": "Tasks",
    "empty": "No recent exports. Your downloads will appear here.",
    "viewingLast": "showing last {visible} of {total}",
    "unreadTitle": "{n} task update(s) since you last checked"
  }
}
</i18n>
