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
      <template #header />

      <template #loading="{ isLoading }">
        <div v-if="isLoading" class="BaristaConversations__skeleton" aria-busy="true">
          <span class="sr-only">{{ $t('loading') }}</span>
          <div v-for="n in 4" :key="n" class="BaristaConversations__skeletonItem">
            <span class="BaristaConversations__skeletonLine" />
            <span class="BaristaConversations__skeletonLine is-short" />
          </div>
        </div>
      </template>
      <template #default="{ items }">
        <button
          v-for="conv in items"
          :key="conv.baristaSessionId"
          type="button"
          class="BaristaConversations__item"
          :class="{ 'is-active': conv.baristaSessionId === baristaStore.sessionId }"
          :aria-current="conv.baristaSessionId === baristaStore.sessionId ? 'true' : undefined"
          @click="selectConversation(conv.baristaSessionId)"
        >
          <span class="BaristaConversations__label">{{ conv.label }}</span>
          <TimeAgo :date="conv.dateLastModified" class="BaristaConversationsDate" />
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
    "loading": "Loading conversations",
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

.BaristaConversations .layout-header {
  display: none;
}
.BaristaConversations__item {
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  width: 100%;
  padding: 0.5rem 0.5rem 0.5625rem 0.75rem;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.BaristaConversations__item:hover {
  background-color: var(--impresso-color-paper);
}
.BaristaConversations__item:focus-visible {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: -2px;
}
.BaristaConversations__item.is-active {
  background-color: var(--impresso-color-paper);
}
.BaristaConversations__item.is-active::before {
  content: '';
  position: absolute;
  top: 0.5rem;
  bottom: 0.5rem;
  left: 0;
  width: 2px;
  border-radius: 1px;
  background-color: var(--clr-grey-200);
}
.BaristaConversations__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  color: var(--impresso-color-black);
}
.BaristaConversations__item.is-active .BaristaConversations__label {
  font-variation-settings: 'wght' 550;
}
.BaristaConversationsDate {
  font-size: 0.75rem;
  color: var(--clr-grey-300);
}
/* delayed so a fast response never flashes a placeholder */
.BaristaConversations__skeleton {
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: BaristaConversations_fadeIn 0.2s ease 0.25s forwards;
}
.BaristaConversations__skeletonItem {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.625rem 0.5rem 0.6875rem 0.75rem;
}
.BaristaConversations__skeletonLine {
  display: block;
  width: 72%;
  height: 0.625rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--clr-grey-800);
  animation: BaristaConversations_pulse 1.4s ease-in-out infinite;
}
.BaristaConversations__skeletonLine.is-short {
  width: 32%;
  height: 0.5rem;
}
@keyframes BaristaConversations_fadeIn {
  to {
    opacity: 1;
  }
}
@keyframes BaristaConversations_pulse {
  50% {
    opacity: 0.55;
  }
}
@media (prefers-reduced-motion: reduce) {
  .BaristaConversations__item {
    transition: none;
  }
  .BaristaConversations__skeletonLine {
    animation: none;
  }
}
</style>
