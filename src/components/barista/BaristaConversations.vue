<template>
  <div class="BaristaConversations">
    <ListOfFindResponseItems
      :service="conversationsService"
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
          class="list-group-item list-group-item-action small d-flex flex-column align-items-start border-0 border-bottom"
          @click="selectConversation(conv.baristaSessionId)"
        >
          <span class="text-truncate w-100">{{ conv.label }}</span>
          <span class="text-muted BaristaConversationsDate">{{
            relativeTime(conv.dateLastModified)
          }}</span>
        </button>
      </template>
    </ListOfFindResponseItems>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import { useBaristaStore } from '@/stores/barista'
import type {
  BaristaConversation,
  BaristaConversationsFindResult
} from '@/services/types/baristaConversations'
import type { ServiceFindParams } from '@/services/types'
import { relativeTime } from '@/util/time'

interface PaginatedFindResult<T> {
  data: T[]
  pagination: {
    total: number
    offset: number
    limit: number
  }
}

export type BaristaConversationsProps = {
  fetchItemsWhenVisible?: boolean
}

const props = withDefaults(defineProps<BaristaConversationsProps>(), {
  fetchItemsWhenVisible: true
})

const baristaStore = useBaristaStore()

const listParams = computed<ServiceFindParams>(() => ({
  query: {
    limit: 5,
    offset: 0
  }
}))

const conversationsService: any = {
  path: 'barista-conversations',
  async find(params?: ServiceFindParams): Promise<PaginatedFindResult<BaristaConversation>> {
    const result = (await baristaStore.getConversations(params)) as BaristaConversationsFindResult

    return {
      data: result.data,
      pagination: {
        total: result.total,
        offset: result.skip ?? params?.query?.offset ?? 0,
        limit: result.limit ?? params?.query?.limit ?? 5
      }
    }
  }
}

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

<style scoped>
.BaristaConversations {
  max-height: 420px;
  min-height: 200px;
  overflow: auto;
}

.BaristaConversationsDate {
  font-size: 0.75em;
}
</style>
