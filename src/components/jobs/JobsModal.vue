<template>
  <Modal
    :show="isVisible"
    :title="$t('title')"
    modalClass="JobsModal"
    bodyClass="p-0 mt-2 border-top"
    @close="emit('dismiss')"
    hide-footer
  >
    <ListOfFindResponseItems
      ref="listRef"
      :service="jobsService"
      :params="listParams"
      :listIsEmptyMessage="$t('noJobsYet')"
      :fetchItemsWhenVisible="false"
    >
      <template #default="{ items }">
        <div v-if="items.length" class="list-group list-group-flush">
          <JobItem
            v-for="item in items"
            :key="item.id"
            :item="toJob(item)"
            class="job list-group-item px-3 py-2"
            style="border-color: var(--clr-grey-200) !important"
          />
        </div>
      </template>
    </ListOfFindResponseItems>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import type { ListOfFindResponseItemsExposed } from '@/components/ListOfFindResponseItems.vue'
import JobItem from '@/components/modules/lists/JobItem.vue'
import Job from '@/models/Job'
import { jobs as jobsService } from '@/services'

export interface JobsModalProps {
  isVisible?: boolean
}

const props = withDefaults(defineProps<JobsModalProps>(), {
  isVisible: false
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const listRef = ref<ListOfFindResponseItemsExposed>()

const listParams = {
  query: {
    limit: 10,
    offset: 0
  }
}

function toJob(raw: any): Job {
  return new Job({
    ...raw,
    extra: {
      ...raw.extra,
      sq: raw.extra?.query_hash ?? ''
    },
    progress: raw.extra?.progress ?? 0
  })
}

watch(
  () => props.isVisible,
  visible => {
    if (visible) {
      listRef.value?.refresh()
    }
  }
)
</script>

<i18n lang="json">
{
  "en": {
    "title": "Background jobs",
    "noJobsYet": "No jobs yet."
  }
}
</i18n>
