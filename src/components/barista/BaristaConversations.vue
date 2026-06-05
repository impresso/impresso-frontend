<template>
  <div class="BaristaConversations">
    <ListOfFindResponseItems
      :service="baristaConversationsService"
      :params="listParams"
      :fetch-items-when-visible="props.fetchItemsWhenVisible"
      :list-is-empty-message="$t('no conversations')"
      :error-loading-items-message="$t('error loading conversations')"
      items-class="p-0"
    >
      <template #header="{ total }">
        <div
          class="px-2 py-1 small text-muted"
          v-html="$t('numbers.itemsGeneric', { n: $n(total) }, total)"
        />
      </template>
      <template #default="{ items }">
        <button
          v-for="conv in items"
          :key="conv.baristaSessionId"
          type="button"
          class="list-group-item list-group-item-action d-flex flex-column align-items-start border-0 border-bottom"
          @click="selectConversation(conv.baristaSessionId)"
        >
          <span class="text-truncate w-100">{{ conv.label }}</span>

          <TimeAgo :date="conv.dateLastModified" class="text-muted BaristaConversationsDate" />
        </button>
      </template>
    </ListOfFindResponseItems>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import { useBaristaStore } from '@/stores/barista'
import { baristaConversations as baristaConversationsService } from '@/services'
import type { ServiceFindParams } from '@/services/types'
import { relativeTime } from '@/util/time'
import TimeAgo from '../TimeAgo.vue'

export type BaristaConversationsProps = {
  fetchItemsWhenVisible?: boolean
}

const props = withDefaults(defineProps<BaristaConversationsProps>(), {
  fetchItemsWhenVisible: true
})

const baristaStore = useBaristaStore()

const listParams = computed<ServiceFindParams>(() => ({
  query: {
    limit: 20,
    offset: 0
  }
}))

async function selectConversation(sessionId: string) {
  await baristaStore.loadConversation(sessionId)
}
</script>

<i18n lang="json">
{
  "en": {
    "conversations": "Conversations",
    "no conversations": "No conversations yet",
    "error loading conversations": "Could not load conversations"
  }
}
</i18n>

<style>
.BaristaConversations {
  max-height: 420px;
  min-height: 200px;
  overflow: auto;
  font-variation-settings: 'wght' 450;
  text-rendering: optimizeLegibility;
}

.BaristaConversationsDate {
  font-size: 0.75em;
}
</style>
